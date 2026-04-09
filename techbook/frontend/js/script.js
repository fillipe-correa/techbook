(function () {
  const app = window.TechBookApp;
  const page = document.body.dataset.page;

  renderAuthArea();
  activateMenu();
  bindSupportForm();
  bindLoginForm();
  bindSignupForm();
  renderFeaturedBooks();

  function renderAuthArea() {
    const container = document.getElementById("authArea");
    if (!container) return;

    const session = app.getSession();
    if (!session) {
      container.innerHTML = `
        <a class="ghost" href="login.html">Entrar</a>
        <a class="primary" href="cadastro.html">Criar conta</a>
      `;
      return;
    }

    container.innerHTML = `
      <a class="ghost" href="minhas-reservas.html">${session.nome}</a>
      <button class="primary" type="button" id="headerLogout">Sair</button>
    `;

    document.getElementById("headerLogout").addEventListener("click", () => {
      app.clearSession();
      window.location.href = "index.html";
    });
  }

  function activateMenu() {
    const current = {
      home: "index.html",
      about: "quemsomos.html",
      catalog: "catalogo.html",
      book: "catalogo.html",
      how: "comofunciona.html",
      support: "suporte.html"
    }[page];

    if (!current) return;
    document.querySelectorAll(".site-nav a").forEach((link) => {
      if (link.getAttribute("href") === current) {
        link.classList.add("active");
      }
    });
  }

  async function renderFeaturedBooks() {
    if (page !== "home") return;
    const grid = document.getElementById("featuredGrid");
    const livros = await app.request("/livros");
    grid.innerHTML = livros.slice(0, 3).map(cardTemplate).join("");
  }

  function cardTemplate(book) {
    return `
      <article class="book-card">
        <img class="book-cover" src="${app.escapeHtml(book.imagemUrl)}" alt="${app.escapeHtml(book.titulo)}">
        <h3>${app.escapeHtml(book.titulo)}</h3>
        <p>${app.escapeHtml(book.autor)}</p>
        <p>${app.escapeHtml(book.categoria)} • ${book.quantidadeDisponivel} disponível(eis)</p>
        <a class="button primary" href="livro.html?id=${book.id}">Ver detalhes</a>
      </article>
    `;
  }

  function bindSupportForm() {
    const form = document.getElementById("supportForm");
    if (!form) return;

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const topic = document.getElementById("supportTopic").value;
      const feedback = document.getElementById("supportFeedback");
      const messages = {
        indisponibilidade: "Livro indisponível no momento. Você pode aguardar disponibilidade futura ou buscar títulos similares.",
        limite: "Limite de empréstimos atingido. Realize a devolução para novos empréstimos.",
        reserva: "Sua solicitação sobre reserva foi registrada. Um administrador pode confirmar o status no painel.",
        tecnico: "Sistema temporariamente indisponível. Tente novamente mais tarde."
      };
      feedback.textContent = messages[topic];
      form.reset();
    });
  }

  function bindLoginForm() {
    const form = document.getElementById("loginForm");
    if (!form) return;

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = document.getElementById("loginEmail").value.trim().toLowerCase();
      const password = document.getElementById("loginPassword").value.trim();
      const feedback = document.getElementById("loginFeedback");

      if (!password) {
        feedback.textContent = "Informe a senha.";
        return;
      }

      const clients = await app.request("/clientes");
      const client = clients.find((item) => item.email.toLowerCase() === email);
      if (!client) {
        feedback.textContent = "Cliente não encontrado. Use um e-mail já cadastrado ou crie uma conta.";
        return;
      }

      app.setSession({ id: client.id, nome: client.nome, email: client.email });
      window.location.href = "minhas-reservas.html";
    });
  }

  function bindSignupForm() {
    const form = document.getElementById("signupForm");
    if (!form) return;

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = document.getElementById("signupEmail").value.trim();
      const emailConfirm = document.getElementById("signupEmailConfirm").value.trim();
      const feedback = document.getElementById("signupFeedback");

      if (email !== emailConfirm) {
        feedback.textContent = "Os e-mails precisam ser iguais.";
        return;
      }

      const payload = {
        nome: document.getElementById("signupName").value.trim(),
        cpf: document.getElementById("signupCpf").value.trim(),
        email,
        telefone: document.getElementById("signupPhone").value.trim()
      };

      const client = await app.request("/clientes", { method: "POST", body: payload });
      app.setSession({ id: client.id, nome: client.nome, email: client.email });
      window.location.href = "minhas-reservas.html";
    });
  }
})();
