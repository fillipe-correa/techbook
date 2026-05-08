(function () {

  // ==========================================
  // APP GLOBAL
  // ==========================================

  const app = window.TechBookApp;
  const page = document.body.dataset.page;

 
  // ==========================================
  // INICIALIZAÇÃO DAS PÁGINAS
  // ==========================================

  if (page === "catalog") {
    initCatalog();
  }

  if (page === "book") {
    initBookDetail();
  }

  if (page === "reservations") {
    initReservations();
  }

  // ==========================================
  // CATÁLOGO DE LIVROS
  // ==========================================
  
  async function initCatalog() {
    const grid = document.getElementById("catalogGrid");
    const count = document.getElementById("catalogCount");
    const searchInput = document.getElementById("searchInput");
    const categoryFilter = document.getElementById("categoryFilter");
    const searchButton = document.getElementById("searchButton");
    let books = [];

    try {
      books = await app.request("/livros");
    } catch (error) {
      grid.innerHTML = `<p>${app.escapeHtml(error.message)}</p>`;
      count.textContent = "0 título(s)";
      return;
    }

    const authors = [...new Set(books.map((book) => book.autor))].sort();
    authors.forEach((author) => {
      categoryFilter.insertAdjacentHTML("beforeend", `<option value="${app.escapeHtml(author)}">${app.escapeHtml(author)}</option>`);
    });

    // ==========================================
    // RENDERIZAÇÃO DOS LIVROS
    // ==========================================

    function render() {
      const term = searchInput.value.trim().toLowerCase();
      const author = categoryFilter.value;
      // A filtragem acontece 100% no cliente para manter a experiencia imediata no catalogo.
      const filtered = books.filter((book) => {
        const matchesTerm = !term || [book.titulo, book.autor, book.categoria].some((item) => item.toLowerCase().includes(term));
        const matchesAuthor = !author || book.autor === author;
        return matchesTerm && matchesAuthor;
      });

      if (!filtered.length) {
        grid.innerHTML = "<p>Nenhum livro cadastrado até o momento.</p>";
        count.textContent = "0 título(s)";
        return;
      }

      grid.innerHTML = filtered.map((book) => `
        <article class="book-card">
          <img class="book-cover" src="${app.escapeHtml(book.imagemUrl)}" alt="${app.escapeHtml(book.titulo)}">
          <h3>${app.escapeHtml(book.titulo)}</h3>
          <p>${app.escapeHtml(book.autor)}</p>
          <p>${app.escapeHtml(book.categoria)}</p>
          <p>${book.quantidadeReservavel} exemplar(es) liberado(s) para reserva</p>
          ${book.quantidadeReservavel > 0
            ? `<a class="button primary" href="livro.html?id=${book.id}">Reservar</a>`
            : `<span class="button primary disabled">Reservas esgotadas</span>`}
        </article>
      `).join("");
      count.textContent = `${filtered.length} título(s)`;
    }

    searchInput.addEventListener("input", render);
    categoryFilter.addEventListener("change", render);
    searchButton.addEventListener("click", render);
    render();
  }


  // ==========================================
  // DETALHES DO LIVRO
  // ==========================================

  async function initBookDetail() {
    const detail = document.getElementById("bookDetail");
    const bookId = new URLSearchParams(window.location.search).get("id");
    const session = app.getSession();
    let book;
    let reservations = [];

    try {
      book = await app.request(`/livros/${bookId}`);
      reservations = session ? await app.request(`/clientes/${session.id}/reservas`) : [];
    } catch (error) {
      detail.innerHTML = `<p>${app.escapeHtml(error.message)}</p>`;
      return;
    }

    const activeReservation = reservations.find((item) => item.livro.id === Number(bookId) && item.status === "PENDENTE");

    detail.innerHTML = `
      <section class="book-panel">
        <img class="book-cover" src="${app.escapeHtml(book.imagemUrl)}" alt="${app.escapeHtml(book.titulo)}">
        <div>
          <p class="eyebrow">${app.escapeHtml(book.categoria)}</p>
          <h1>${app.escapeHtml(book.titulo)}</h1>
          <p>${app.escapeHtml(book.autor)}</p>
          <div id="reservationFeedback"></div>
          <div class="book-actions">
            ${session ? renderReservationButtons(book, activeReservation) : '<a class="button primary" href="login.html">Entrar para reservar</a>'}
          </div>
          <p><strong>Estoque físico:</strong> ${book.quantidadeDisponivel} exemplar(es).</p>
          <p><strong>Disponível para reserva:</strong> ${book.quantidadeReservavel} exemplar(es).</p>
          <p><strong>Status:</strong> ${app.escapeHtml(book.status)}</p>
          <div class="description">
            <h2>Descrição</h2>
            <p>${app.escapeHtml(book.descricao)}</p>
          </div>
        </div>
      </section>
    `;

    // ==========================================
    // BOTÃO RESERVAR
    // ==========================================

    const reserveButton = document.getElementById("reserveButton");
    if (reserveButton) {
      reserveButton.addEventListener("click", async () => {
        reserveButton.disabled = true;
        reserveButton.textContent = "Reservando...";
        try {
          await app.request("/reservas", { method: "POST", body: { clienteId: session.id, livroId: book.id } });
          app.setFlashMessage("Reserva criada com sucesso. Agora voce pode acompanhar o prazo de retirada.");
          window.location.href = "minhas-reservas.html";
        } catch (error) {
          reserveButton.disabled = false;
          reserveButton.textContent = "Reservar";
          alert(error.message);
        }
      });
    }

    // ==========================================
    // CANCELAR RESERVA
    // ==========================================

    const cancelButton = document.getElementById("cancelReservationButton");
    if (cancelButton) {
      cancelButton.addEventListener("click", async () => {
        cancelButton.disabled = true;
        cancelButton.textContent = "Cancelando...";
        try {
          await app.request(`/reservas/${activeReservation.id}/cancelar`, { method: "PATCH" });
          app.setFlashMessage("Reserva cancelada. O livro voltou a ficar disponivel para novas reservas.");
          window.location.href = "minhas-reservas.html";
        } catch (error) {
          cancelButton.disabled = false;
          cancelButton.textContent = "Cancelar reserva";
          alert(error.message);
        }
      });
    }
  }

  function renderReservationButtons(book, reservation) {
    // O CTA muda conforme sessao, estoque e existencia de reserva pendente para o mesmo livro.
    if (reservation) {
      return `
        <span class="status-chip success">Reservado</span>
        <a class="button ghost" href="minhas-reservas.html">Ver minhas reservas</a>
        <button class="button ghost" id="cancelReservationButton" type="button">Cancelar reserva</button>
      `;
    }

    return book.quantidadeReservavel > 0
      ? '<button class="button primary" id="reserveButton" type="button">Reservar</button>'
      : '<span class="status-chip neutral">Reservas indisponiveis no momento</span>';
  }
  
  // ==========================================
  // MINHAS RESERVAS
  // ==========================================

  async function initReservations() {
    const session = app.getSession();
    if (!session) {
      window.location.href = "login.html";
      return;
    }

    const reservationList = document.getElementById("reservationList");
    const loanList = document.getElementById("loanList");
    const logoutButton = document.getElementById("logoutButton");
    const flash = app.consumeFlashMessage();

    logoutButton.addEventListener("click", () => {
      app.clearSession();
      window.location.href = "index.html";
    });

    try {
      const reservations = await app.request(`/clientes/${session.id}/reservas`);
      const loans = await app.request(`/clientes/${session.id}/emprestimos`);

      reservationList.innerHTML = `
        <h2>Reservas</h2>
        ${flash ? `<div class="inline-feedback ${app.escapeHtml(flash.type)}">${app.escapeHtml(flash.message)}</div>` : ""}
        ${reservations.length ? reservations.map((item) => reservationCard(item, true)).join("") : "<p>Nenhuma reserva cadastrada.</p>"}
      `;

      loanList.innerHTML = `
        <h2>Empréstimos</h2>
        ${loans.length ? loans.map((item) => reservationCard(item, false)).join("") : "<p>Nenhum empréstimo ativo para este cliente.</p>"}
      `;

      reservationList.querySelectorAll("[data-cancel-reservation]").forEach((button) => {
        button.addEventListener("click", async () => {
          await app.request(`/reservas/${button.dataset.cancelReservation}/cancelar`, { method: "PATCH" });
          window.location.reload();
        });
      });
    } catch (error) {
      reservationList.innerHTML = `<h2>Reservas</h2><p>${app.escapeHtml(error.message)}</p>`;
      loanList.innerHTML = `<h2>Empréstimos</h2><p>${app.escapeHtml(error.message)}</p>`;
    }
  }

  function reservationCard(item, isReservation) {
    const book = item.livro;
    const statusClass = item.status === "PENDENTE"
      ? "success"
      : item.status === "ATRASADO" || item.status === "EXPIRADA"
        ? "alert"
        : "neutral";
    const action = isReservation && item.status === "PENDENTE"
      ? `<button class="button ghost" data-cancel-reservation="${item.id}" type="button">Cancelar reserva</button>`
      : "";
    const subtitle = isReservation
      ? item.status === "EXPIRADA"
        ? `Prazo de retirada encerrado em ${app.formatDate(item.prazoRetirada)}`
        : `Retirar na TechBook até ${app.formatDate(item.prazoRetirada)}`
      : `Devolução prevista em ${app.formatDate(item.dataDevolucaoPrevista)}`;

    return `
      <article class="reservation-card">
        <img src="${app.escapeHtml(book.imagemUrl)}" alt="${app.escapeHtml(book.titulo)}">
        <div>
          <p class="eyebrow">${isReservation ? `Reserva #${item.id}` : `Empréstimo #${item.id}`}</p>
          <h3>${app.escapeHtml(book.titulo)}</h3>
          <p>${app.escapeHtml(book.autor)}</p>
          <p>${subtitle}</p>
          <div class="book-actions">
            <span class="status-chip ${statusClass}">${app.escapeHtml(item.status)}</span>
            ${action}
          </div>
        </div>
      </article>
    `;
  }
})();
