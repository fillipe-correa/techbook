(function () {
  const app = window.TechBookApp;
  const page = document.body.dataset.page;

  if (page === "catalog") {
    initCatalog();
  }

  if (page === "book") {
    initBookDetail();
  }

  if (page === "reservations") {
    initReservations();
  }

  async function initCatalog() {
    const books = await app.request("/livros");
    const grid = document.getElementById("catalogGrid");
    const count = document.getElementById("catalogCount");
    const searchInput = document.getElementById("searchInput");
    const categoryFilter = document.getElementById("categoryFilter");
    const searchButton = document.getElementById("searchButton");

    const authors = [...new Set(books.map((book) => book.autor))].sort();
    authors.forEach((author) => {
      categoryFilter.insertAdjacentHTML("beforeend", `<option value="${app.escapeHtml(author)}">${app.escapeHtml(author)}</option>`);
    });

    function render() {
      const term = searchInput.value.trim().toLowerCase();
      const author = categoryFilter.value;
      const filtered = books.filter((book) => {
        const matchesTerm = !term || [book.titulo, book.autor, book.categoria].some((item) => item.toLowerCase().includes(term));
        const matchesAuthor = !author || book.autor === author;
        return matchesTerm && matchesAuthor;
      });

      grid.innerHTML = filtered.map((book) => `
        <article class="book-card">
          <img class="book-cover" src="${app.escapeHtml(book.imagemUrl)}" alt="${app.escapeHtml(book.titulo)}">
          <h3>${app.escapeHtml(book.titulo)}</h3>
          <p>${app.escapeHtml(book.autor)}</p>
          <p>${app.escapeHtml(book.categoria)}</p>
          <p>${book.quantidadeDisponivel} exemplar(es) disponível(eis)</p>
          <a class="button primary" href="livro.html?id=${book.id}">Reservar</a>
        </article>
      `).join("");
      count.textContent = `${filtered.length} título(s)`;
    }

    searchInput.addEventListener("input", render);
    categoryFilter.addEventListener("change", render);
    searchButton.addEventListener("click", render);
    render();
  }

  async function initBookDetail() {
    const detail = document.getElementById("bookDetail");
    const bookId = new URLSearchParams(window.location.search).get("id");
    const book = await app.request(`/livros/${bookId}`);
    const session = app.getSession();
    const reservations = session ? await app.request(`/clientes/${session.id}/reservas`) : [];
    const activeReservation = reservations.find((item) => item.livro.id === Number(bookId) && item.status === "PENDENTE");

    detail.innerHTML = `
      <section class="book-panel">
        <img class="book-cover" src="${app.escapeHtml(book.imagemUrl)}" alt="${app.escapeHtml(book.titulo)}">
        <div>
          <p class="eyebrow">${app.escapeHtml(book.categoria)}</p>
          <h1>${app.escapeHtml(book.titulo)}</h1>
          <p>${app.escapeHtml(book.autor)}</p>
          <div class="book-actions">
            ${session ? renderReservationButtons(book, activeReservation) : '<a class="button primary" href="login.html">Entrar para reservar</a>'}
          </div>
          <p><strong>Disponibilidade:</strong> ${book.quantidadeDisponivel} exemplar(es).</p>
          <p><strong>Status:</strong> ${app.escapeHtml(book.status)}</p>
          <div class="description">
            <h2>Descrição</h2>
            <p>${app.escapeHtml(book.descricao)}</p>
          </div>
        </div>
      </section>
    `;

    const reserveButton = document.getElementById("reserveButton");
    if (reserveButton) {
      reserveButton.addEventListener("click", async () => {
        try {
          await app.request("/reservas", { method: "POST", body: { clienteId: session.id, livroId: book.id } });
          window.location.reload();
        } catch (error) {
          alert(error.message);
        }
      });
    }

    const cancelButton = document.getElementById("cancelReservationButton");
    if (cancelButton) {
      cancelButton.addEventListener("click", async () => {
        await app.request(`/reservas/${activeReservation.id}/cancelar`, { method: "PATCH" });
        window.location.reload();
      });
    }
  }

  function renderReservationButtons(book, reservation) {
    if (reservation) {
      return `
        <span class="status-chip success">Reservado</span>
        <button class="button ghost" id="cancelReservationButton" type="button">Cancelar reserva</button>
      `;
    }

    return book.quantidadeDisponivel > 0
      ? '<button class="button primary" id="reserveButton" type="button">Reservar</button>'
      : '<span class="status-chip neutral">Livro indisponível no momento</span>';
  }

  async function initReservations() {
    const session = app.getSession();
    if (!session) {
      window.location.href = "login.html";
      return;
    }

    const reservations = await app.request(`/clientes/${session.id}/reservas`);
    const loans = await app.request(`/clientes/${session.id}/emprestimos`);
    const reservationList = document.getElementById("reservationList");
    const loanList = document.getElementById("loanList");
    const logoutButton = document.getElementById("logoutButton");

    logoutButton.addEventListener("click", () => {
      app.clearSession();
      window.location.href = "index.html";
    });

    reservationList.innerHTML = `
      <h2>Reservas</h2>
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
  }

  function reservationCard(item, isReservation) {
    const book = item.livro;
    const statusClass = item.status === "PENDENTE" ? "success" : item.status === "ATRASADO" ? "alert" : "neutral";
    const action = isReservation && item.status === "PENDENTE"
      ? `<button class="button ghost" data-cancel-reservation="${item.id}" type="button">Cancelar reserva</button>`
      : "";
    const subtitle = isReservation
      ? `Retirar na TechBook até ${app.formatDate(item.prazoRetirada)}`
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
