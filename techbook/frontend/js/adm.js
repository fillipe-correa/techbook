(function () {
  const app = window.TechBookApp;
  const PREFILL_RESERVATION_KEY = "techbook.admin.prefillReservationId";
  const EDIT_BOOK_KEY = "techbook.admin.editBookId";
  let selectedBookId = null;
  let pendingReservations = [];
  let cachedUsers = [];
  let cachedBooks = [];
  let cachedLateLoans = [];
  let loanPrefillApplied = false;
  let bookPrefillApplied = false;

  bindIfPresent("refreshDashboard", "click", loadDashboard);
  bindIfPresent("loanForm", "submit", submitLoanForm);
  bindIfPresent("returnForm", "submit", submitReturnForm);
  bindIfPresent("bookForm", "submit", submitBookForm);
  bindIfPresent("deleteBookButton", "click", deleteSelectedBook);
  bindIfPresent("editBookButton", "click", focusSelectedBook);
  bindIfPresent("bookSearchButton", "click", filterBooks);
  bindIfPresent("userSearchButton", "click", filterUsers);
  bindIfPresent("lateSearchButton", "click", filterLateLoans);
  bindIfPresent("userActionButton", "click", () => alert("A edição de usuários não está disponível nesta versão."));
  bindIfPresent("userDeleteButton", "click", () => alert("A exclusão de usuários não está disponível nesta versão."));

  loadDashboard();

  function bindIfPresent(id, eventName, handler) {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener(eventName, handler);
    }
  }

  function setTextIfPresent(id, value) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  }

  async function loadDashboard() {
    const [dashboard, loans, users, books, reservations] = await Promise.all([
      app.request("/administracao/dashboard"),
      app.request("/emprestimos"),
      app.request("/clientes"),
      app.request("/livros"),
      app.request("/reservas")
    ]);

    pendingReservations = reservations;
    cachedUsers = users;
    cachedBooks = books;
    cachedLateLoans = loans.filter((loan) => loan.status === "ATRASADO");

    maybeApplyLoanReservationPrefill();
    maybeApplyBookSelectionPrefill();

    setTextIfPresent("metricBooks", dashboard.totalLivros);
    setTextIfPresent("metricLoans", dashboard.emprestimosAtivos);
    setTextIfPresent("metricLate", dashboard.atrasados);
    setTextIfPresent("metricUsers", dashboard.usuarios);
    setTextIfPresent("metricReservations", dashboard.reservasPendentes);
    setTextIfPresent("metricAvailableBooks", dashboard.livrosDisponiveis);
    setTextIfPresent("metricUnavailableBooks", dashboard.livrosIndisponiveis);

    if (document.getElementById("reservationTable")) {
      renderReservationTable(reservations);
    }
    if (document.getElementById("loanTable")) {
      renderLoanTable(loans);
    }
    if (document.getElementById("returnHistory")) {
      renderReturnHistory(loans.filter((loan) => loan.status === "DEVOLVIDO"));
    }
    if (document.getElementById("lateList")) {
      renderLateList(cachedLateLoans);
    }
    if (document.getElementById("userTable")) {
      renderUsers(users);
    }
    if (document.getElementById("bookTable")) {
      renderBooks(books);
    }
  }

  function renderReservationTable(reservations) {
    const rows = reservations
      .sort((a, b) => b.id - a.id)
      .map((reservation) => `
        <tr>
          <td>${reservation.id}</td>
          <td>${app.escapeHtml(reservation.cliente.nome)}</td>
          <td>${app.escapeHtml(reservation.livro.titulo)}</td>
          <td>${app.formatDate(reservation.dataReserva)}</td>
          <td>${app.formatDate(reservation.prazoRetirada)}</td>
          <td>${app.escapeHtml(reservation.status)}</td>
          <td>
            ${reservation.status === "PENDENTE"
              ? `<button class="button primary small" type="button" data-fill-reservation="${reservation.id}">Usar na retirada</button>`
              : '<span class="inline-status">Sem ação</span>'}
          </td>
        </tr>
      `).join("");

    document.getElementById("reservationTable").innerHTML = rows || '<tr><td colspan="7">Nenhuma reserva encontrada.</td></tr>';

    document.querySelectorAll("[data-fill-reservation]").forEach((button) => {
      button.addEventListener("click", () => {
        fillLoanFormFromReservation(Number(button.dataset.fillReservation));
      });
    });
  }

  function fillLoanFormFromReservation(reservationId) {
    const reservation = pendingReservations.find((item) => item.id === reservationId);
    if (!reservation) {
      return;
    }

    if (!document.getElementById("loanReservationId")) {
      sessionStorage.setItem(PREFILL_RESERVATION_KEY, String(reservationId));
      window.location.href = "adm-reservas.html";
      return;
    }

    document.getElementById("loanReservationId").value = reservation.id;
    document.getElementById("loanClientName").value = reservation.cliente?.nome || "";
    document.getElementById("loanBookTitle").value = reservation.livro?.titulo || "";
    document.getElementById("loanBookCategory").value = reservation.livro?.categoria || "";
    if (document.getElementById("loanStartDate")) {
      document.getElementById("loanStartDate").value = "Gerado na confirmação da retirada";
    }
    if (document.getElementById("loanDueDate")) {
      document.getElementById("loanDueDate").value = "Prazo padrão de 14 dias";
    }
    if (document.getElementById("loanHelperText")) {
      document.getElementById("loanHelperText").textContent = `Reserva #${reservation.id} pronta para registrar a retirada de ${reservation.cliente?.nome || "cliente"}.`;
    }
    if (document.getElementById("emprestimos")) {
      document.getElementById("emprestimos").scrollIntoView({ behavior: "smooth", block: "start" });
    }
    document.getElementById("loanReservationId").focus();
  }

  function maybeApplyLoanReservationPrefill() {
    if (loanPrefillApplied || !document.getElementById("loanReservationId")) {
      return;
    }

    const storedReservationId = Number(sessionStorage.getItem(PREFILL_RESERVATION_KEY));
    if (!storedReservationId) {
      return;
    }

    loanPrefillApplied = true;
    sessionStorage.removeItem(PREFILL_RESERVATION_KEY);
    fillLoanFormFromReservation(storedReservationId);
  }

  function renderLoanTable(loans) {
    document.getElementById("loanTable").innerHTML = loans.map((loan) => `
      <tr>
        <td>${loan.id}</td>
        <td>${app.escapeHtml(loan.cliente.nome)}</td>
        <td>${app.escapeHtml(loan.livro.titulo)}</td>
        <td>${app.formatDate(loan.dataEmprestimo)}</td>
        <td>${app.formatDate(loan.dataDevolucaoPrevista)}</td>
        <td>${app.escapeHtml(loan.status)}</td>
        <td>${loan.renovado ? "Ja renovado" : "Disponivel"}</td>
        <td>
          ${loan.status === "ATIVO" && !loan.renovado
            ? `<button class="button ghost" type="button" data-renew-loan="${loan.id}">Renovar</button>`
            : '<span class="inline-status">Sem ação</span>'}
        </td>
      </tr>
    `).join("");

    document.querySelectorAll("[data-renew-loan]").forEach((button) => {
      button.addEventListener("click", async () => {
        try {
          await app.request(`/emprestimos/${button.dataset.renewLoan}/renovar`, { method: "PATCH" });
          loadDashboard();
        } catch (error) {
          alert(error.message);
        }
      });
    });
  }

  function renderReturnHistory(loans) {
    const container = document.getElementById("returnHistory");
    if (!loans.length) {
      container.innerHTML = '<div class="status-item">Nenhuma devolução registrada no momento.</div>';
      return;
    }

    container.innerHTML = loans.map((loan) => `
      <div class="status-item">
        <strong>${app.escapeHtml(loan.cliente.nome)}</strong>
        <p>${app.escapeHtml(loan.livro.titulo)} • empréstimo em ${app.formatDate(loan.dataEmprestimo)} • devolvido</p>
      </div>
    `).join("");
  }

  function renderLateList(loans) {
    const container = document.getElementById("lateList");
    if (!loans.length) {
      container.innerHTML = '<div class="status-item">Nenhum empréstimo atrasado no momento.</div>';
      return;
    }

    container.innerHTML = `
      <div class="status-row header">
        <span>ID. RESERVA</span>
        <span>CLIENTE</span>
        <span>LIVRO</span>
        <span>DT RESERVA</span>
        <span>PRAZO</span>
        <span>Status</span>
      </div>
      ${loans.map((loan) => `
        <div class="status-row item">
          <span>${loan.reservaId || loan.id}</span>
          <span>${app.escapeHtml(loan.cliente.nome)}</span>
          <span>${app.escapeHtml(loan.livro.titulo)}</span>
          <span>${app.formatDate(loan.dataEmprestimo)}</span>
          <span>${app.formatDate(loan.dataDevolucaoPrevista)}</span>
          <span class="status-badge overdue">${app.escapeHtml(loan.status)}</span>
        </div>
      `).join("")}
    `;
  }

  function renderUsers(users) {
    document.getElementById("userTable").innerHTML = users.map((user) => `
      <tr>
        <td><input type="radio" name="selectedUser" value="${user.id}"></td>
        <td>${user.id}</td>
        <td>${app.escapeHtml(user.nome)}</td>
        <td>${app.escapeHtml(user.cpf || "-")}</td>
        <td>${app.escapeHtml(user.email)}</td>
        <td>${app.escapeHtml(user.telefone)}</td>
      </tr>
    `).join("");
  }

  function renderBooks(books) {
    document.getElementById("bookTable").innerHTML = books.map((book) => `
      <tr>
        <td><input type="radio" name="selectedBook" value="${book.id}" ${selectedBookId === book.id ? "checked" : ""}></td>
        <td>${book.id}</td>
        <td>${app.escapeHtml(book.titulo)}</td>
        <td>${app.escapeHtml(book.autor)}</td>
        <td>${app.escapeHtml(book.categoria)}</td>
        <td>${book.quantidadeDisponivel}/${book.quantidadeTotal}</td>
        <td>${app.escapeHtml(book.status)}</td>
      </tr>
    `).join("");

    document.querySelectorAll('input[name="selectedBook"]').forEach((radio) => {
      radio.addEventListener("change", () => {
        selectedBookId = Number(radio.value);
        fillBookForm(books.find((book) => book.id === selectedBookId));
      });
    });
  }

  function filterUsers() {
    if (!document.getElementById("userSearchInput")) return;
    const term = document.getElementById("userSearchInput").value.trim().toLowerCase();
    const filtered = !term
      ? cachedUsers
      : cachedUsers.filter((user) => [user.nome, user.email, user.cpf, user.telefone].some((value) => String(value || "").toLowerCase().includes(term)));
    renderUsers(filtered);
  }

  function filterBooks() {
    if (!document.getElementById("bookSearchInput")) return;
    const term = document.getElementById("bookSearchInput").value.trim().toLowerCase();
    const filtered = !term
      ? cachedBooks
      : cachedBooks.filter((book) => [book.titulo, book.autor, book.categoria, book.status].some((value) => String(value || "").toLowerCase().includes(term)));
    renderBooks(filtered);
  }

  function filterLateLoans() {
    if (!document.getElementById("lateSearchInput")) return;
    const term = document.getElementById("lateSearchInput").value.trim().toLowerCase();
    const filtered = !term
      ? cachedLateLoans
      : cachedLateLoans.filter((loan) => [loan.id, loan.reservaId, loan.cliente.nome, loan.livro.titulo].some((value) => String(value || "").toLowerCase().includes(term)));
    renderLateList(filtered);
  }

  function fillBookForm(book) {
    if (!book || !document.getElementById("bookId")) {
      return;
    }
    document.getElementById("bookId").value = book.id;
    document.getElementById("bookDisplayId").value = book.id;
    document.getElementById("bookTitle").value = book.titulo;
    document.getElementById("bookAuthor").value = book.autor;
    document.getElementById("bookCategory").value = book.categoria;
    document.getElementById("bookTotal").value = book.quantidadeTotal;
    document.getElementById("bookAvailable").value = book.quantidadeDisponivel;
    document.getElementById("bookImage").value = book.imagemUrl;
    document.getElementById("bookDescription").value = book.descricao;
    if (document.getElementById("gestao")) {
      document.getElementById("gestao").scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function focusSelectedBook() {
    if (!selectedBookId) {
      alert("Selecione um livro na tabela para editar.");
      return;
    }
    if (!document.getElementById("bookForm")) {
      sessionStorage.setItem(EDIT_BOOK_KEY, String(selectedBookId));
      window.location.href = "adm-livros.html";
      return;
    }
    if (document.getElementById("gestao")) {
      document.getElementById("gestao").scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if (document.getElementById("bookTitle")) {
      document.getElementById("bookTitle").focus();
    }
  }

  function maybeApplyBookSelectionPrefill() {
    if (bookPrefillApplied || !document.getElementById("bookForm")) {
      return;
    }

    const storedBookId = Number(sessionStorage.getItem(EDIT_BOOK_KEY));
    if (!storedBookId) {
      return;
    }

    const book = cachedBooks.find((item) => item.id === storedBookId);
    if (!book) {
      sessionStorage.removeItem(EDIT_BOOK_KEY);
      return;
    }

    bookPrefillApplied = true;
    selectedBookId = storedBookId;
    sessionStorage.removeItem(EDIT_BOOK_KEY);
    fillBookForm(book);
  }

  async function submitLoanForm(event) {
    event.preventDefault();
    try {
      await app.request("/emprestimos/confirmar-retirada", {
        method: "POST",
        body: {
          reservaId: Number(document.getElementById("loanReservationId").value),
          administradorId: Number(document.getElementById("loanAdminId").value)
        }
      });
      event.target.reset();
      if (document.getElementById("loanAdminId")) {
        document.getElementById("loanAdminId").value = 1;
      }
      if (document.getElementById("loanClientName")) {
        document.getElementById("loanClientName").value = "";
      }
      if (document.getElementById("loanBookTitle")) {
        document.getElementById("loanBookTitle").value = "";
      }
      if (document.getElementById("loanBookCategory")) {
        document.getElementById("loanBookCategory").value = "";
      }
      if (document.getElementById("loanStartDate")) {
        document.getElementById("loanStartDate").value = "Automática na confirmação";
      }
      if (document.getElementById("loanDueDate")) {
        document.getElementById("loanDueDate").value = "Prazo padrão de 14 dias";
      }
      if (document.getElementById("loanHelperText")) {
        document.getElementById("loanHelperText").textContent = "Empréstimo / retirada registrado com sucesso.";
      }
      loadDashboard();
    } catch (error) {
      alert(error.message);
    }
  }

  async function submitReturnForm(event) {
    event.preventDefault();
    await app.request("/emprestimos/devolucoes", {
      method: "POST",
      body: {
        emprestimoId: Number(document.getElementById("returnLoanId").value),
        administradorId: Number(document.getElementById("returnAdminId").value),
        estadoLivro: document.getElementById("returnBookState").value
      }
    });
    event.target.reset();
    if (document.getElementById("returnAdminId")) {
      document.getElementById("returnAdminId").value = 1;
    }
    loadDashboard();
  }

  async function submitBookForm(event) {
    event.preventDefault();
    const total = Number(document.getElementById("bookTotal").value);
    const available = Number(document.getElementById("bookAvailable").value);

    if (available > total) {
      alert("A quantidade disponível não pode ser maior que a quantidade total.");
      return;
    }

    const payload = {
      titulo: document.getElementById("bookTitle").value.trim(),
      autor: document.getElementById("bookAuthor").value.trim(),
      categoria: document.getElementById("bookCategory").value.trim(),
      quantidadeTotal: total,
      quantidadeDisponivel: available,
      imagemUrl: document.getElementById("bookImage").value.trim(),
      descricao: document.getElementById("bookDescription").value.trim()
    };

    const id = document.getElementById("bookId").value;
    if (id) {
      await app.request(`/livros/${id}`, { method: "PUT", body: payload });
    } else {
      await app.request("/livros", { method: "POST", body: payload });
    }

    event.target.reset();
    selectedBookId = null;
    if (document.getElementById("bookDisplayId")) {
      document.getElementById("bookDisplayId").value = "";
    }
    loadDashboard();
  }

  async function deleteSelectedBook() {
    if (!selectedBookId) {
      alert("Selecione um livro na tabela para excluir.");
      return;
    }
    await app.request(`/livros/${selectedBookId}`, { method: "DELETE" });
    if (document.getElementById("bookForm")) {
      document.getElementById("bookForm").reset();
    }
    selectedBookId = null;
    if (document.getElementById("bookDisplayId")) {
      document.getElementById("bookDisplayId").value = "";
    }
    loadDashboard();
  }
})();
