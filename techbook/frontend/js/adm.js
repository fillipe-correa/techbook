(function () {
  const app = window.TechBookApp;
  let selectedBookId = null;

  document.getElementById("refreshDashboard").addEventListener("click", loadDashboard);
  document.getElementById("loanForm").addEventListener("submit", submitLoanForm);
  document.getElementById("returnForm").addEventListener("submit", submitReturnForm);
  document.getElementById("bookForm").addEventListener("submit", submitBookForm);
  document.getElementById("deleteBookButton").addEventListener("click", deleteSelectedBook);

  loadDashboard();

  async function loadDashboard() {
    const [dashboard, loans, users, books, reservations] = await Promise.all([
      app.request("/administracao/dashboard"),
      app.request("/emprestimos"),
      app.request("/clientes"),
      app.request("/livros"),
      app.request("/reservas")
    ]);

    document.getElementById("metricBooks").textContent = dashboard.totalLivros;
    document.getElementById("metricLoans").textContent = dashboard.emprestimosAtivos;
    document.getElementById("metricLate").textContent = dashboard.atrasados;
    document.getElementById("metricUsers").textContent = dashboard.usuarios;
    document.getElementById("metricReservations").textContent = dashboard.reservasPendentes;
    document.getElementById("metricAvailableBooks").textContent = dashboard.livrosDisponiveis;
    document.getElementById("metricUnavailableBooks").textContent = dashboard.livrosIndisponiveis;

    renderReservationTable(reservations);
    renderLoanTable(loans);
    renderReturnHistory(loans.filter((loan) => loan.status === "DEVOLVIDO"));
    renderLateList(loans.filter((loan) => loan.status === "ATRASADO"));
    renderUsers(users);
    renderBooks(books);
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
        document.getElementById("loanReservationId").value = button.dataset.fillReservation;
        document.getElementById("loanReservationId").focus();
      });
    });
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

    container.innerHTML = loans.map((loan) => `
      <div class="status-item">
        <strong>${app.escapeHtml(loan.cliente.nome)}</strong>
        <p>${app.escapeHtml(loan.livro.titulo)} • devolução prevista em ${app.formatDate(loan.dataDevolucaoPrevista)}</p>
      </div>
    `).join("");
  }

  function renderUsers(users) {
    document.getElementById("userTable").innerHTML = users.map((user) => `
      <tr>
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

  function fillBookForm(book) {
    document.getElementById("bookId").value = book.id;
    document.getElementById("bookTitle").value = book.titulo;
    document.getElementById("bookAuthor").value = book.autor;
    document.getElementById("bookCategory").value = book.categoria;
    document.getElementById("bookTotal").value = book.quantidadeTotal;
    document.getElementById("bookAvailable").value = book.quantidadeDisponivel;
    document.getElementById("bookImage").value = book.imagemUrl;
    document.getElementById("bookDescription").value = book.descricao;
  }

  async function submitLoanForm(event) {
    event.preventDefault();
    await app.request("/emprestimos/confirmar-retirada", {
      method: "POST",
      body: {
        reservaId: Number(document.getElementById("loanReservationId").value),
        administradorId: Number(document.getElementById("loanAdminId").value)
      }
    });
    event.target.reset();
    document.getElementById("loanAdminId").value = 1;
    loadDashboard();
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
    document.getElementById("returnAdminId").value = 1;
    loadDashboard();
  }

  async function submitBookForm(event) {
    event.preventDefault();
    const payload = {
      titulo: document.getElementById("bookTitle").value.trim(),
      autor: document.getElementById("bookAuthor").value.trim(),
      categoria: document.getElementById("bookCategory").value.trim(),
      quantidadeTotal: Number(document.getElementById("bookTotal").value),
      quantidadeDisponivel: Number(document.getElementById("bookAvailable").value),
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
    loadDashboard();
  }

  async function deleteSelectedBook() {
    if (!selectedBookId) {
      alert("Selecione um livro na tabela para excluir.");
      return;
    }
    await app.request(`/livros/${selectedBookId}`, { method: "DELETE" });
    document.getElementById("bookForm").reset();
    selectedBookId = null;
    loadDashboard();
  }
})();
