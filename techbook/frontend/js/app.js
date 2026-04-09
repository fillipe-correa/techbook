(function () {
  const STORAGE_KEY = "techbook-mock-db";
  const SESSION_KEY = "techbook-session";
  const API_BASE = "http://localhost:8080/api";

  const initialDb = {
    administradores: [{ id: 1, nome: "Marina Gestora", login: "admin" }],
    clientes: [
      { id: 2, nome: "Gabriel Souza", email: "gabriel@techbook.com", telefone: "(11) 99876-1001", cpf: "458.698.870-10" },
      { id: 3, nome: "Edina Martins", email: "edina@techbook.com", telefone: "(11) 99876-1002", cpf: "458.698.870-11" },
      { id: 4, nome: "Daniel Lima", email: "daniel@techbook.com", telefone: "(11) 99876-1003", cpf: "458.698.870-12" }
    ],
    livros: [
      { id: 1, titulo: "Harry Potter e a Pedra Filosofal", autor: "J.K. Rowling", categoria: "Fantasia", descricao: "Harry descobre que é um bruxo e inicia sua jornada em Hogwarts.", imagemUrl: "https://covers.openlibrary.org/b/isbn/9788532530783-L.jpg", quantidadeTotal: 6, quantidadeDisponivel: 4, status: "DISPONIVEL" },
      { id: 2, titulo: "Harry Potter e a Câmara Secreta", autor: "J.K. Rowling", categoria: "Fantasia", descricao: "O segundo ano em Hogwarts traz novos segredos e perigos.", imagemUrl: "https://covers.openlibrary.org/b/isbn/9788532511669-L.jpg", quantidadeTotal: 5, quantidadeDisponivel: 5, status: "DISPONIVEL" },
      { id: 3, titulo: "Harry Potter e o Prisioneiro de Azkaban", autor: "J.K. Rowling", categoria: "Fantasia", descricao: "A fuga de Sirius Black muda o clima em Hogwarts.", imagemUrl: "https://covers.openlibrary.org/b/isbn/9788532512062-L.jpg", quantidadeTotal: 4, quantidadeDisponivel: 3, status: "DISPONIVEL" },
      { id: 4, titulo: "Dom Casmurro", autor: "Machado de Assis", categoria: "Romance", descricao: "Clássico brasileiro sobre memória, ciúme e narrativa.", imagemUrl: "https://covers.openlibrary.org/b/isbn/9788525412300-L.jpg", quantidadeTotal: 3, quantidadeDisponivel: 3, status: "DISPONIVEL" },
      { id: 5, titulo: "Clean Code", autor: "Robert C. Martin", categoria: "Tecnologia", descricao: "Boas práticas de desenvolvimento para código limpo e sustentável.", imagemUrl: "https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg", quantidadeTotal: 2, quantidadeDisponivel: 2, status: "DISPONIVEL" },
      { id: 6, titulo: "Entendendo Algoritmos", autor: "Aditya Bhargava", categoria: "Tecnologia", descricao: "Introdução visual e didática ao pensamento algorítmico.", imagemUrl: "https://covers.openlibrary.org/b/isbn/9788575225638-L.jpg", quantidadeTotal: 3, quantidadeDisponivel: 2, status: "DISPONIVEL" }
    ],
    reservas: [
      { id: 1, clienteId: 2, livroId: 1, dataReserva: today(), prazoRetirada: plusDays(1), status: "PENDENTE" }
    ],
    emprestimos: [
      { id: 1, clienteId: 4, livroId: 6, administradorId: 1, reservaId: null, dataEmprestimo: minusDays(4), dataDevolucaoPrevista: plusDays(10), status: "ATIVO", renovado: false },
      { id: 2, clienteId: 2, livroId: 3, administradorId: 1, reservaId: null, dataEmprestimo: minusDays(16), dataDevolucaoPrevista: minusDays(2), status: "ATRASADO", renovado: true }
    ],
    devolucoes: []
  };

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  function plusDays(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10);
  }

  function minusDays(days) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().slice(0, 10);
  }

  function loadDb() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialDb));
      return JSON.parse(JSON.stringify(initialDb));
    }
    return JSON.parse(raw);
  }

  function saveDb(db) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  }

  function updateBookStatus(book) {
    if (book.quantidadeDisponivel <= 0) {
      book.status = "INDISPONIVEL";
    } else if (book.quantidadeDisponivel < book.quantidadeTotal) {
      book.status = "RESERVADO";
    } else {
      book.status = "DISPONIVEL";
    }
  }

  function getBook(db, id) {
    return db.livros.find((item) => item.id === Number(id));
  }

  function getClient(db, id) {
    return db.clientes.find((item) => item.id === Number(id));
  }

  function enrichReservation(db, reservation) {
    return {
      ...reservation,
      cliente: getClient(db, reservation.clienteId),
      livro: getBook(db, reservation.livroId)
    };
  }

  function enrichLoan(db, loan) {
    return {
      ...loan,
      cliente: getClient(db, loan.clienteId),
      livro: getBook(db, loan.livroId)
    };
  }

  function expireReservations(db) {
    const now = today();
    db.reservas.forEach((reservation) => {
      if (reservation.status === "PENDENTE" && reservation.prazoRetirada < now) {
        reservation.status = "EXPIRADA";
        const book = getBook(db, reservation.livroId);
        book.quantidadeDisponivel += 1;
        updateBookStatus(book);
      }
    });
  }

  function applyFallback(method, path, body) {
    const db = loadDb();
    expireReservations(db);

    if (method === "GET" && path.startsWith("/livros")) {
      const parts = path.split("?")[0].split("/").filter(Boolean);
      if (parts.length === 1) {
        return db.livros;
      }
      return getBook(db, parts[1]);
    }

    if (method === "POST" && path === "/livros") {
      const nextId = Math.max(...db.livros.map((item) => item.id)) + 1;
      const livro = { id: nextId, ...body };
      updateBookStatus(livro);
      db.livros.push(livro);
      saveDb(db);
      return livro;
    }

    if (method === "PUT" && path.startsWith("/livros/")) {
      const id = Number(path.split("/").pop());
      const index = db.livros.findIndex((item) => item.id === id);
      db.livros[index] = { ...db.livros[index], ...body, id };
      updateBookStatus(db.livros[index]);
      saveDb(db);
      return db.livros[index];
    }

    if (method === "DELETE" && path.startsWith("/livros/")) {
      const id = Number(path.split("/").pop());
      db.livros = db.livros.filter((item) => item.id !== id);
      saveDb(db);
      return {};
    }

    if (method === "GET" && path === "/clientes") {
      return db.clientes;
    }

    if (method === "POST" && path === "/clientes") {
      const nextId = Math.max(...db.clientes.map((item) => item.id)) + 1;
      const client = { id: nextId, ...body };
      db.clientes.push(client);
      saveDb(db);
      return client;
    }

    if (method === "GET" && path.includes("/clientes/") && path.endsWith("/reservas")) {
      const clientId = Number(path.split("/")[2]);
      return db.reservas.filter((item) => item.clienteId === clientId).map((item) => enrichReservation(db, item));
    }

    if (method === "GET" && path.includes("/clientes/") && path.endsWith("/emprestimos")) {
      const clientId = Number(path.split("/")[2]);
      return db.emprestimos.filter((item) => item.clienteId === clientId).map((item) => enrichLoan(db, item));
    }

    if (method === "GET" && path === "/reservas") {
      return db.reservas.map((item) => enrichReservation(db, item));
    }

    if (method === "POST" && path === "/reservas") {
      const activeLoans = db.emprestimos.filter((item) => item.clienteId === body.clienteId && ["ATIVO", "ATRASADO"].includes(item.status)).length;
      if (activeLoans >= 3) {
        throw new Error("Limite de empréstimos atingido. Realize a devolução para novos empréstimos.");
      }

      const book = getBook(db, body.livroId);
      if (!book || book.quantidadeDisponivel <= 0) {
        throw new Error("Livro indisponível no momento.");
      }

      const nextId = (db.reservas.at(-1)?.id || 0) + 1;
      book.quantidadeDisponivel -= 1;
      updateBookStatus(book);
      const reservation = {
        id: nextId,
        clienteId: body.clienteId,
        livroId: body.livroId,
        dataReserva: today(),
        prazoRetirada: plusDays(1),
        status: "PENDENTE"
      };
      db.reservas.push(reservation);
      saveDb(db);
      return enrichReservation(db, reservation);
    }

    if (method === "PATCH" && path.endsWith("/cancelar")) {
      const reservationId = Number(path.split("/")[2]);
      const reservation = db.reservas.find((item) => item.id === reservationId);
      if (reservation && reservation.status === "PENDENTE") {
        reservation.status = "CANCELADA";
        const book = getBook(db, reservation.livroId);
        book.quantidadeDisponivel += 1;
        updateBookStatus(book);
        saveDb(db);
      }
      return enrichReservation(db, reservation);
    }

    if (method === "GET" && path === "/emprestimos") {
      db.emprestimos.forEach((loan) => {
        if (loan.status === "ATIVO" && loan.dataDevolucaoPrevista < today()) {
          loan.status = "ATRASADO";
        }
      });
      saveDb(db);
      return db.emprestimos.map((item) => enrichLoan(db, item));
    }

    if (method === "POST" && path === "/emprestimos/confirmar-retirada") {
      const reservation = db.reservas.find((item) => item.id === body.reservaId);
      if (!reservation || reservation.status !== "PENDENTE") {
        throw new Error("A reserva precisa estar pendente para confirmar a retirada.");
      }
      reservation.status = "RETIRADO";
      const nextId = (db.emprestimos.at(-1)?.id || 0) + 1;
      const loan = {
        id: nextId,
        clienteId: reservation.clienteId,
        livroId: reservation.livroId,
        administradorId: body.administradorId,
        reservaId: reservation.id,
        dataEmprestimo: today(),
        dataDevolucaoPrevista: plusDays(14),
        status: "ATIVO",
        renovado: false
      };
      db.emprestimos.push(loan);
      saveDb(db);
      return enrichLoan(db, loan);
    }

    if (method === "PATCH" && path.endsWith("/renovar")) {
      const loanId = Number(path.split("/")[2]);
      const loan = db.emprestimos.find((item) => item.id === loanId);
      if (!loan || loan.renovado || loan.status === "ATRASADO") {
        throw new Error("A renovação pode ser realizada apenas uma vez e não pode estar atrasada.");
      }
      loan.renovado = true;
      loan.dataDevolucaoPrevista = plusDays(7);
      saveDb(db);
      return enrichLoan(db, loan);
    }

    if (method === "POST" && path === "/emprestimos/devolucoes") {
      const loan = db.emprestimos.find((item) => item.id === body.emprestimoId);
      loan.status = "DEVOLVIDO";
      const book = getBook(db, loan.livroId);
      book.quantidadeDisponivel += 1;
      updateBookStatus(book);
      const nextId = (db.devolucoes.at(-1)?.id || 0) + 1;
      const retorno = {
        id: nextId,
        emprestimoId: loan.id,
        administradorId: body.administradorId,
        dataDevolucao: today(),
        estadoLivro: body.estadoLivro,
        status: body.estadoLivro === "BOM" ? "FINALIZADA" : "COM_OCORRENCIA"
      };
      db.devolucoes.push(retorno);
      saveDb(db);
      return retorno;
    }

    if (method === "GET" && path === "/administracao/dashboard") {
      const activeLoans = db.emprestimos.filter((item) => item.status === "ATIVO").length;
      const lateLoans = db.emprestimos.filter((item) => item.status === "ATRASADO").length;
      const availableBooks = db.livros.filter((item) => item.quantidadeDisponivel > 0).length;
      return {
        totalLivros: db.livros.length,
        emprestimosAtivos: activeLoans,
        atrasados: lateLoans,
        usuarios: db.clientes.length,
        reservasPendentes: db.reservas.filter((item) => item.status === "PENDENTE").length,
        livrosDisponiveis: availableBooks,
        livrosIndisponiveis: db.livros.length - availableBooks
      };
    }

    throw new Error("Operação não suportada no modo local.");
  }

  async function request(path, options = {}) {
    const method = options.method || "GET";
    const fetchOptions = {
      method,
      headers: { "Content-Type": "application/json", ...(options.headers || {}) }
    };

    if (options.body !== undefined) {
      fetchOptions.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(`${API_BASE}${path}`, fetchOptions);
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.erro || "Não foi possível concluir a operação.");
      }
      if (response.status === 204) {
        return null;
      }
      return await response.json();
    } catch (error) {
      if (error instanceof Error && !/Failed to fetch|NetworkError|Load failed/i.test(error.message)) {
        throw error;
      }
      return applyFallback(method, path, options.body);
    }
  }

  function getSession() {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  }

  function setSession(session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }

  function formatDate(value) {
    if (!value) return "-";
    return new Date(`${value}T00:00:00`).toLocaleDateString("pt-BR");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  window.TechBookApp = {
    request,
    getSession,
    setSession,
    clearSession,
    formatDate,
    escapeHtml
  };
})();
