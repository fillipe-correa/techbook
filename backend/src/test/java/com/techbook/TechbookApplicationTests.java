package com.techbook;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.techbook.dto.BookRequest;
import com.techbook.dto.ClienteRequest;
import com.techbook.dto.ConfirmarRetiradaRequest;
import com.techbook.dto.DevolucaoRequest;
import com.techbook.dto.EmprestimoResponse;
import com.techbook.dto.ReservaRequest;
import com.techbook.dto.ReservaResponse;
import com.techbook.dto.UsuarioResponse;
import com.techbook.model.Emprestimo;
import com.techbook.model.Livro;
import com.techbook.model.Reserva;
import com.techbook.model.Usuario;
import com.techbook.repository.EmprestimoRepository;
import com.techbook.repository.LivroRepository;
import com.techbook.repository.ReservaRepository;
import com.techbook.repository.UsuarioRepository;
import com.techbook.service.TechbookService;
import java.time.LocalDate;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class TechbookApplicationTests {

    @Autowired
    private TechbookService service;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private LivroRepository livroRepository;

    @Autowired
    private ReservaRepository reservaRepository;

    @Autowired
    private EmprestimoRepository emprestimoRepository;

    @BeforeEach
    void limparBanco() {
        emprestimoRepository.deleteAll();
        reservaRepository.deleteAll();
        livroRepository.deleteAll();
        usuarioRepository.deleteAll();
    }

    @Test
    void reservaLivroDisponivelComPrazoDeUmDia() {
        UsuarioResponse cliente = criarCliente("cliente1@techbook.local", "11111111111");
        Long livroId = criarLivro("Clean Code", 2).getId();

        ReservaResponse reserva = service.criarReserva(new ReservaRequest(cliente.id(), livroId));

        assertThat(reserva.status()).isEqualTo("PENDENTE");
        assertThat(reserva.dataReserva()).isEqualTo(LocalDate.now());
        assertThat(reserva.prazoRetirada()).isEqualTo(LocalDate.now().plusDays(1));
    }

    @Test
    void reservaVencidaExpiraAutomaticamente() {
        Usuario cliente = usuarioRepository.save(usuario("cliente2@techbook.local", "22222222222"));
        Livro livro = livroRepository.save(livro("Domain-Driven Design", 1));
        Reserva reserva = new Reserva();
        reserva.setCliente(cliente);
        reserva.setLivro(livro);
        reserva.setDataReserva(LocalDate.now().minusDays(3));
        reserva.setPrazoRetirada(LocalDate.now().minusDays(1));
        reserva.setStatus("PENDENTE");
        reserva = reservaRepository.save(reserva);

        int expiradas = service.expirarReservasVencidas();

        assertThat(expiradas).isEqualTo(1);
        assertThat(reservaRepository.findById(reserva.getId()).orElseThrow().getStatus()).isEqualTo("EXPIRADA");
    }

    @Test
    void retiradaRegistraEmprestimoComPrazoDeQuatorzeDias() {
        UsuarioResponse cliente = criarCliente("cliente3@techbook.local", "33333333333");
        Long livroId = criarLivro("Refactoring", 2).getId();
        ReservaResponse reserva = service.criarReserva(new ReservaRequest(cliente.id(), livroId));

        EmprestimoResponse emprestimo = service.confirmarRetirada(new ConfirmarRetiradaRequest(reserva.id(), 1L));

        assertThat(emprestimo.status()).isEqualTo("ATIVO");
        assertThat(emprestimo.dataEmprestimo()).isEqualTo(LocalDate.now());
        assertThat(emprestimo.dataDevolucaoPrevista()).isEqualTo(LocalDate.now().plusDays(14));
        assertThat(livroRepository.findById(livroId).orElseThrow().getQuantidadeDisponivel()).isEqualTo(1);
    }

    @Test
    void bloqueiaReservaQuandoClienteTemTresEmprestimosAtivos() {
        Usuario cliente = usuarioRepository.save(usuario("cliente4@techbook.local", "44444444444"));
        for (int i = 1; i <= 3; i++) {
            salvarEmprestimo(cliente, livroRepository.save(livro("Livro " + i, 1)), "ATIVO", false);
        }
        Livro novoLivro = livroRepository.save(livro("Quarto livro", 1));

        assertThatThrownBy(() -> service.criarReserva(new ReservaRequest(cliente.getId(), novoLivro.getId())))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("Limite de emprestimos atingido");
    }

    @Test
    void renovacaoSoAconteceUmaVezEAdicionaSeteDias() {
        Usuario cliente = usuarioRepository.save(usuario("cliente5@techbook.local", "55555555555"));
        Emprestimo emprestimo = salvarEmprestimo(cliente, livroRepository.save(livro("Arquitetura Limpa", 1)), "ATIVO", false);
        LocalDate prazoOriginal = emprestimo.getDataDevolucaoPrevista();

        EmprestimoResponse renovado = service.renovarEmprestimo(emprestimo.getId());

        assertThat(renovado.renovado()).isTrue();
        assertThat(renovado.dataDevolucaoPrevista()).isEqualTo(prazoOriginal.plusDays(7));
        assertThatThrownBy(() -> service.renovarEmprestimo(emprestimo.getId()))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("ja foi renovado");
    }

    @Test
    void devolucaoAtualizaStatusEDisponibilidade() {
        Usuario cliente = usuarioRepository.save(usuario("cliente6@techbook.local", "66666666666"));
        Livro livro = livroRepository.save(livro("Patterns of Enterprise Application Architecture", 1));
        livro.setQuantidadeDisponivel(0);
        livro = livroRepository.save(livro);
        Emprestimo emprestimo = salvarEmprestimo(cliente, livro, "ATIVO", false);

        EmprestimoResponse devolucao = service.registrarDevolucao(new DevolucaoRequest(emprestimo.getId(), 1L, "BOM"));

        assertThat(devolucao.status()).isEqualTo("DEVOLVIDO");
        assertThat(livroRepository.findById(livro.getId()).orElseThrow().getQuantidadeDisponivel()).isEqualTo(1);
    }

    @Test
    void emprestimoVencidoApareceComoAtrasado() {
        Usuario cliente = usuarioRepository.save(usuario("cliente7@techbook.local", "77777777777"));
        Emprestimo emprestimo = salvarEmprestimo(cliente, livroRepository.save(livro("Test-Driven Development", 1)), "ATIVO", false);
        emprestimo.setDataDevolucaoPrevista(LocalDate.now().minusDays(1));
        emprestimoRepository.save(emprestimo);

        assertThat(service.listarEmprestimos()).extracting(EmprestimoResponse::status).contains("ATRASADO");
    }

    private UsuarioResponse criarCliente(String email, String cpf) {
        return service.criarCliente(new ClienteRequest("Cliente Teste", email, "11999999999", cpf, "123456"));
    }

    private Livro criarLivro(String titulo, int quantidade) {
        return livroRepository.save(livro(titulo, quantidade));
    }

    private Usuario usuario(String email, String cpf) {
        Usuario usuario = new Usuario();
        usuario.setNome("Cliente Teste");
        usuario.setEmail(email);
        usuario.setTelefone("11999999999");
        usuario.setCpf(cpf);
        usuario.setSenha("123456");
        return usuario;
    }

    private Livro livro(String titulo, int quantidade) {
        Livro livro = new Livro();
        livro.setTitulo(titulo);
        livro.setAutor("Autor Teste");
        livro.setCategoria("Tecnologia");
        livro.setDescricao("Descricao de teste");
        livro.setImagemUrl("https://example.com/livro.jpg");
        livro.setIsbn("ISBN-" + titulo.replace(" ", "-"));
        livro.setQuantidadeTotal(quantidade);
        livro.setQuantidadeDisponivel(quantidade);
        return livro;
    }

    private Emprestimo salvarEmprestimo(Usuario cliente, Livro livro, String status, boolean renovado) {
        Emprestimo emprestimo = new Emprestimo();
        emprestimo.setCliente(cliente);
        emprestimo.setLivro(livro);
        emprestimo.setAdministradorId(1L);
        emprestimo.setDataEmprestimo(LocalDate.now());
        emprestimo.setDataDevolucaoPrevista(LocalDate.now().plusDays(14));
        emprestimo.setStatus(status);
        emprestimo.setRenovado(renovado);
        return emprestimoRepository.save(emprestimo);
    }
}
