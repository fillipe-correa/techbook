(function () {
  const app = window.TechBookApp;
  const page = document.body.dataset.page;

  renderAuthArea();
  activateMenu();
  bindSupportForm();
  bindLoginForm();
  bindSignupForm();
  renderAccountPage();
  renderFeaturedBooks();

function renderAuthArea() {
  const container = document.getElementById("authArea");
  if (!container) return;

  const session = app.getSession();

  if (!session) {
    container.innerHTML = `
      <a class="perfil" href="login.html">
        <img src="img/PERFIL 2.svg" alt="" class="login-icon">
        ENTRAR
      </a>
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
    if (!grid) return;
    try {
      const livros = await app.request("/livros");
      if (!livros.length) {
        grid.innerHTML = "<p>Nenhum livro cadastrado ainda.</p>";
        return;
      }
      grid.innerHTML = livros.slice(0, 3).map(cardTemplate).join("");
    } catch (error) {
      grid.innerHTML = `<p>${app.escapeHtml(error.message)}</p>`;
    }
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

// ==========================================
// FORMULÁRIO DE SUPORTE (EMAILJS)
// ==========================================

  function bindSupportForm() {
    const form = document.getElementById("supportForm");
    if (!form) return;

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const name = document.getElementById("supportName").value;
      const email = document.getElementById("supportEmail").value;
      const topic = document.getElementById("supportTopic").value;
      const message = document.getElementById("supportMessage").value;

      const feedback = document.getElementById("supportFeedback");

    // ==========================================
    // VALIDAÇÃO
    // ==========================================

      if (!topic) {
        feedback.textContent = "Selecione o assunto.";
        feedback.style.color = "red";
        return;
      }

      // ==========================================
      // CONFIGURAÇÃO DO EMAILJS
      // ==========================================
      
        emailjs.init("gD86YoOWcfxgKD7xW"); // Public Key */

        const serviceID = "service_fnv1mq6";
        const templateID = "template_s6tckwd";

      // ==========================================
      // ENVIO DO E-MAIL
      // ==========================================

        emailjs.send(serviceID, templateID, {
          from_name: name,
          from_email: email,
          subject: topic,
          message: message
        })

    // ==========================================
    // SUCESSO NO ENVIO
    // ==========================================

        .then(() => {
          feedback.textContent = "Mensagem enviada com sucesso!";
          feedback.style.color = "green";
          form.reset();
        })

    // ==========================================
    // ERRO NO ENVIO
    // ==========================================
    
        .catch((error) => {
          console.error(error);

          feedback.textContent = "Erro ao enviar.";
          feedback.style.color = "red";
        });
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

      try {
        const client = await app.request("/clientes/login", {
          method: "POST",
          body: {
            email,
            senha: password
          }
        });
        if (!client) {
          feedback.textContent = "Cliente não encontrado. Use um e-mail já cadastrado ou crie uma conta.";
          return;
        }

        app.setSession({ id: client.id, nome: client.nome, email: client.email });
        window.location.href = "minhas-reservas.html";
      } catch (error) {
        feedback.textContent = error.message;
      }
    });
  }

async function renderAccountPage() {
  if (page !== "account") return;

  const root = document.getElementById("accountRoot");
  if (!root) return;

  const session = app.getSession();

  if (!session) {
    window.location.href = "login.html";
    return;
  }

  root.innerHTML = `
    <section class="reservation-layout">
      <aside class="profile-menu">
        <a class="active" href="minha-conta.html">Seus dados</a>
        <a href="minhas-reservas.html">Minhas reservas</a>
        <button type="button" id="profileLogoutButton">Sair</button>
      </aside>

      <section class="reservation-panel">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Área do cliente</p>
            <h1>Seus dados</h1>
          </div>
        </div>

        <form id="profileForm" class="account-data-form">
          <div class="account-fields">
            <label>
              <span>Nome completo</span>
              <input type="text" id="profileName" placeholder="Nome completo" required>
            </label>
            <label>
              <span>CPF</span>
              <input type="text" id="profileCpf" placeholder="CPF" required>
            </label>
            <label>
              <span>E-mail</span>
              <input type="email" id="profileEmail" placeholder="E-mail" required>
            </label>
            <label>
              <span>Confirmar e-mail</span>
              <input type="email" id="profileEmailConfirm" placeholder="Confirmar e-mail" required>
            </label>
            <label>
              <span>Telefone</span>
              <input type="text" id="profilePhone" placeholder="DDD e número de telefone" required>
            </label>
          </div>

          <button class="button primary" type="submit">Salvar dados</button>
          <p class="feedback" id="profileFeedback"></p>
        </form>
      </section>
    </section>
  `;

  document.getElementById("profileLogoutButton").addEventListener("click", () => {
    app.clearSession();
    window.location.href = "index.html";
  });

  try {
    const client = await app.request(`/clientes/${session.id}`);

    document.getElementById("profileName").value = client.nome || "";
    document.getElementById("profileCpf").value = client.cpf || "";
    document.getElementById("profileEmail").value = client.email || "";
    document.getElementById("profileEmailConfirm").value = client.email || "";
    document.getElementById("profilePhone").value = client.telefone || "";

    bindProfileForm(session.id);
  } catch (error) {
    document.getElementById("profileFeedback").textContent = error.message;
  }
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

      const senha = document.getElementById("signupPassword").value;
      const confirmarSenha = document.getElementById("signupPasswordConfirm").value;

      if (senha !== confirmarSenha) {
        feedback.textContent = "As senhas precisam ser iguais.";
        feedback.style.color = "red";
        return;
      }


      const payload = {
        nome: document.getElementById("signupName").value.trim(),
        cpf: document.getElementById("signupCpf").value.trim(),
        email,
        telefone: document.getElementById("signupPhone").value.trim(),
        senha: senha
      };

      try {
        const client = await app.request("/clientes", { method: "POST", body: payload });
        app.setSession({ id: client.id, nome: client.nome, email: client.email });
        window.location.href = "minhas-reservas.html";
      } catch (error) {
        feedback.textContent = error.message;
      }
    });
  }

  function bindProfileForm(clientId) {
    const form = document.getElementById("profileForm");
    if (!form) return;

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = document.getElementById("profileEmail").value.trim();
      const emailConfirm = document.getElementById("profileEmailConfirm").value.trim();
      const feedback = document.getElementById("profileFeedback");

      if (email !== emailConfirm) {
        feedback.textContent = "Os e-mails precisam ser iguais.";
        return;
      }

      const payload = {
        nome: document.getElementById("profileName").value.trim(),
        cpf: document.getElementById("profileCpf").value.trim(),
        email,
        telefone: document.getElementById("profilePhone").value.trim()
      };

      try {
        const client = await app.request(`/clientes/${clientId}`, { method: "PUT", body: payload });
        app.setSession({ id: client.id, nome: client.nome, email: client.email });
        feedback.textContent = "Dados atualizados com sucesso.";
      } catch (error) {
        feedback.textContent = error.message;
      }
    });
  }

})();

// Mostra ou oculta a senha
function togglePassword(button) {
  const group = button.closest(".password-group");
  const input = group.querySelector("input");
  const icon = button.querySelector("img");

  if (input.type === "password") {
    input.type = "text";
    icon.src = "img/olho-aberto.svg";
    icon.alt = "Ocultar senha";
  } else {
    input.type = "password";
    icon.src = "img/olho-fechado.svg";
    icon.alt = "Mostrar senha";
  }
}

// Permite apenas números nos campos CPF e telefone
function onlyNumbers(id) {
  const input = document.getElementById(id);
  if (!input) return;

  input.addEventListener("input", function () {
    this.value = this.value.replace(/\D/g, "");
  });
}

onlyNumbers("signupCpf");
onlyNumbers("signupPhone");
