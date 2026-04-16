(function () {
  const SESSION_KEY = "techbook-session";
  const LEGACY_STORAGE_KEY = "techbook-mock-db";
  const API_BASE = "http://localhost:8080/api";

  localStorage.removeItem(LEGACY_STORAGE_KEY);

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
      const payload = await response.json();
      return normalizeResponse(path, payload);
    } catch (error) {
      if (error instanceof Error && !/Failed to fetch|NetworkError|Load failed/i.test(error.message)) {
        throw error;
      }
      throw new Error("Não foi possível conectar ao backend. Integração preparada para API futura em /api.");
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

  function normalizeResponse(path, payload) {
    const cleanPath = path.split("?")[0];

    if (cleanPath === "/livros") {
      return Array.isArray(payload) ? payload.map(normalizeBook) : [];
    }
    if (cleanPath.startsWith("/livros/")) {
      return normalizeBook(payload);
    }
    if (cleanPath === "/clientes") {
      return Array.isArray(payload) ? payload.map(normalizeClient) : [];
    }
    if (cleanPath.endsWith("/reservas") || cleanPath === "/reservas") {
      return Array.isArray(payload) ? payload.map(normalizeReservation) : [];
    }
    if (cleanPath.endsWith("/emprestimos") || cleanPath === "/emprestimos") {
      return Array.isArray(payload) ? payload.map(normalizeLoan) : [];
    }
    if (cleanPath === "/administracao/dashboard") {
      return normalizeDashboard(payload);
    }
    return payload;
  }

  function normalizeBook(book = {}) {
    return {
      id: Number(book.id) || 0,
      titulo: book.titulo || "",
      autor: book.autor || "",
      categoria: book.categoria || "",
      descricao: book.descricao || "",
      imagemUrl: book.imagemUrl || book.imagem_url || "",
      quantidadeTotal: Number(book.quantidadeTotal ?? book.quantidade_total) || 0,
      quantidadeDisponivel: Number(book.quantidadeDisponivel ?? book.quantidade_disponivel) || 0,
      status: book.status || "INDISPONIVEL"
    };
  }

  function normalizeClient(client = {}) {
    return {
      id: Number(client.id ?? client.usuarioId ?? client.usuario_id) || 0,
      nome: client.nome || "",
      cpf: client.cpf || "",
      email: client.email || "",
      telefone: client.telefone || ""
    };
  }

  function normalizeReservation(reservation = {}) {
    return {
      id: Number(reservation.id) || 0,
      clienteId: Number(reservation.clienteId ?? reservation.cliente_id ?? reservation.cliente?.id) || 0,
      livroId: Number(reservation.livroId ?? reservation.livro_id ?? reservation.livro?.id) || 0,
      dataReserva: reservation.dataReserva || reservation.data_reserva || "",
      prazoRetirada: reservation.prazoRetirada || reservation.prazo_retirada || "",
      status: reservation.status || "",
      cliente: normalizeClient(reservation.cliente || {}),
      livro: normalizeBook(reservation.livro || {})
    };
  }

  function normalizeLoan(loan = {}) {
    return {
      id: Number(loan.id) || 0,
      clienteId: Number(loan.clienteId ?? loan.cliente_id ?? loan.cliente?.id) || 0,
      livroId: Number(loan.livroId ?? loan.livro_id ?? loan.livro?.id) || 0,
      administradorId: Number(loan.administradorId ?? loan.administrador_id ?? loan.administrador?.id) || 0,
      reservaId: Number(loan.reservaId ?? loan.reserva_id ?? loan.reserva?.id) || null,
      dataEmprestimo: loan.dataEmprestimo || loan.data_emprestimo || "",
      dataDevolucaoPrevista: loan.dataDevolucaoPrevista || loan.data_devolucao_prevista || "",
      status: loan.status || "",
      renovado: Boolean(loan.renovado),
      cliente: normalizeClient(loan.cliente || {}),
      livro: normalizeBook(loan.livro || {})
    };
  }

  function normalizeDashboard(dashboard = {}) {
    return {
      totalLivros: Number(dashboard.totalLivros) || 0,
      emprestimosAtivos: Number(dashboard.emprestimosAtivos) || 0,
      atrasados: Number(dashboard.atrasados) || 0,
      usuarios: Number(dashboard.usuarios) || 0,
      reservasPendentes: Number(dashboard.reservasPendentes) || 0,
      livrosDisponiveis: Number(dashboard.livrosDisponiveis) || 0,
      livrosIndisponiveis: Number(dashboard.livrosIndisponiveis) || 0
    };
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
