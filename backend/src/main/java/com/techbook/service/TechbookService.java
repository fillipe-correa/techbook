package com.techbook.service;

import com.techbook.dto.BookRequest;
import com.techbook.dto.ClienteRequest;
import com.techbook.dto.ConfirmarRetiradaRequest;
import com.techbook.dto.DashboardResponse;
import com.techbook.dto.DevolucaoRequest;
import com.techbook.dto.EmprestimoResponse;
import com.techbook.dto.LivroResponse;
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
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class TechbookService {

    private static final int PRAZO_RETIRADA_DIAS = 3;
    private static final int PRAZO_EMPRESTIMO_DIAS = 14;
    private static final int PRAZO_RENOVACAO_DIAS = 7;
    private static final String IMAGEM_PADRAO = "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80";

    private final LivroRepository livroRepository;
    private final UsuarioRepository usuarioRepository;
    private final ReservaRepository reservaRepository;
    private final EmprestimoRepository emprestimoRepository;

    public TechbookService(
        LivroRepository livroRepository,
        UsuarioRepository usuarioRepository,
        ReservaRepository reservaRepository,
        EmprestimoRepository emprestimoRepository
    ) {
        this.livroRepository = livroRepository;
        this.usuarioRepository = usuarioRepository;
        this.reservaRepository = reservaRepository;
        this.emprestimoRepository = emprestimoRepository;
    }

    @Transactional(readOnly = true)
    public List<LivroResponse> listarLivros() {
        return livroRepository.findAll().stream()
            .sorted(Comparator.comparing(Livro::getId))
            .map(this::toLivroResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public LivroResponse buscarLivro(Long id) {
        return toLivroResponse(buscarLivroEntidade(id));
    }

    public LivroResponse criarLivro(BookRequest request) {
        Livro livro = new Livro();
        aplicarLivro(livro, request);
        return toLivroResponse(livroRepository.save(livro));
    }

    public LivroResponse atualizarLivro(Long id, BookRequest request) {
        Livro livro = buscarLivroEntidade(id);
        aplicarLivro(livro, request);
        return toLivroResponse(livroRepository.save(livro));
    }

    public void excluirLivro(Long id) {
        Livro livro = buscarLivroEntidade(id);
        boolean possuiReserva = reservaRepository.findAll().stream()
            .anyMatch(reserva -> reserva.getLivro().getId().equals(id) && !"CANCELADA".equals(reserva.getStatus()));
        boolean possuiEmprestimo = emprestimoRepository.findAll().stream()
            .anyMatch(emprestimo -> emprestimo.getLivro().getId().equals(id) && !"DEVOLVIDO".equals(calcularStatusEmprestimo(emprestimo)));

        if (possuiReserva || possuiEmprestimo) {
            throw new IllegalStateException("Nao e possivel excluir um livro com reservas ou emprestimos associados.");
        }

        livroRepository.delete(livro);
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponse> listarClientes() {
        return usuarioRepository.findAll().stream()
            .sorted(Comparator.comparing(Usuario::getId))
            .map(this::toUsuarioResponse)
            .toList();
    }

    public UsuarioResponse criarCliente(ClienteRequest request) {
        validarCliente(request, null);
        Usuario usuario = new Usuario();
        usuario.setNome(request.nome().trim());
        usuario.setEmail(request.email().trim().toLowerCase());
        usuario.setTelefone(request.telefone().trim());
        usuario.setCpf(request.cpf().trim());
        return toUsuarioResponse(usuarioRepository.save(usuario));
    }

    @Transactional(readOnly = true)
    public List<ReservaResponse> listarReservas() {
        return reservaRepository.findAll().stream()
            .sorted(Comparator.comparing(Reserva::getId).reversed())
            .map(this::toReservaResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<ReservaResponse> listarReservasDoCliente(Long clienteId) {
        garantirCliente(clienteId);
        return reservaRepository.findByClienteIdOrderByIdDesc(clienteId).stream()
            .map(this::toReservaResponse)
            .toList();
    }

    public ReservaResponse criarReserva(ReservaRequest request) {
        if (request == null || request.clienteId() == null || request.livroId() == null) {
            throw new IllegalArgumentException("Cliente e livro sao obrigatorios para criar a reserva.");
        }

        Usuario cliente = garantirCliente(request.clienteId());
        Livro livro = buscarLivroEntidade(request.livroId());

        if (livro.getQuantidadeDisponivel() <= 0) {
            throw new IllegalStateException("Nao ha exemplares disponiveis para reserva.");
        }

        boolean jaPossuiReservaPendente = reservaRepository.findByClienteIdOrderByIdDesc(cliente.getId()).stream()
            .anyMatch(reserva -> reserva.getLivro().getId().equals(livro.getId()) && "PENDENTE".equals(reserva.getStatus()));
        if (jaPossuiReservaPendente) {
            throw new IllegalStateException("Este cliente ja possui uma reserva pendente para este livro.");
        }

        Reserva reserva = new Reserva();
        reserva.setCliente(cliente);
        reserva.setLivro(livro);
        reserva.setDataReserva(LocalDate.now());
        reserva.setPrazoRetirada(LocalDate.now().plusDays(PRAZO_RETIRADA_DIAS));
        reserva.setStatus("PENDENTE");
        return toReservaResponse(reservaRepository.save(reserva));
    }

    public ReservaResponse cancelarReserva(Long reservaId) {
        Reserva reserva = buscarReserva(reservaId);
        if (!"PENDENTE".equals(reserva.getStatus())) {
            throw new IllegalStateException("Somente reservas pendentes podem ser canceladas.");
        }

        reserva.setStatus("CANCELADA");
        return toReservaResponse(reservaRepository.save(reserva));
    }

    @Transactional(readOnly = true)
    public List<EmprestimoResponse> listarEmprestimos() {
        return emprestimoRepository.findAll().stream()
            .map(this::sincronizarStatusEmMemoria)
            .sorted(Comparator.comparing(Emprestimo::getId).reversed())
            .map(this::toEmprestimoResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<EmprestimoResponse> listarEmprestimosDoCliente(Long clienteId) {
        garantirCliente(clienteId);
        return emprestimoRepository.findByClienteIdOrderByIdDesc(clienteId).stream()
            .map(this::sincronizarStatusEmMemoria)
            .map(this::toEmprestimoResponse)
            .toList();
    }

    public EmprestimoResponse confirmarRetirada(ConfirmarRetiradaRequest request) {
        if (request == null || request.reservaId() == null) {
            throw new IllegalArgumentException("Informe a reserva para confirmar a retirada.");
        }

        Reserva reserva = buscarReserva(request.reservaId());
        if (!"PENDENTE".equals(reserva.getStatus())) {
            throw new IllegalStateException("A retirada so pode ser confirmada para reservas pendentes.");
        }

        Livro livro = reserva.getLivro();
        if (livro.getQuantidadeDisponivel() <= 0) {
            throw new IllegalStateException("Nao ha estoque disponivel para concluir o emprestimo.");
        }

        livro.setQuantidadeDisponivel(livro.getQuantidadeDisponivel() - 1);
        livroRepository.save(livro);

        reserva.setStatus("RETIRADA_CONFIRMADA");
        reservaRepository.save(reserva);

        Emprestimo emprestimo = new Emprestimo();
        emprestimo.setCliente(reserva.getCliente());
        emprestimo.setLivro(livro);
        emprestimo.setReserva(reserva);
        emprestimo.setAdministradorId(request.administradorId() == null ? 1L : request.administradorId());
        emprestimo.setDataEmprestimo(LocalDate.now());
        emprestimo.setDataDevolucaoPrevista(LocalDate.now().plusDays(PRAZO_EMPRESTIMO_DIAS));
        emprestimo.setStatus("ATIVO");
        emprestimo.setRenovado(false);
        return toEmprestimoResponse(emprestimoRepository.save(emprestimo));
    }

    public EmprestimoResponse renovarEmprestimo(Long emprestimoId) {
        Emprestimo emprestimo = buscarEmprestimo(emprestimoId);
        String status = calcularStatusEmprestimo(emprestimo);

        if (!"ATIVO".equals(status)) {
            throw new IllegalStateException("Somente emprestimos ativos podem ser renovados.");
        }
        if (emprestimo.isRenovado()) {
            throw new IllegalStateException("Este emprestimo ja foi renovado.");
        }

        emprestimo.setDataDevolucaoPrevista(emprestimo.getDataDevolucaoPrevista().plusDays(PRAZO_RENOVACAO_DIAS));
        emprestimo.setRenovado(true);
        emprestimo.setStatus("ATIVO");
        return toEmprestimoResponse(emprestimoRepository.save(emprestimo));
    }

    public EmprestimoResponse registrarDevolucao(DevolucaoRequest request) {
        if (request == null || request.emprestimoId() == null) {
            throw new IllegalArgumentException("Informe o emprestimo para registrar a devolucao.");
        }

        Emprestimo emprestimo = buscarEmprestimo(request.emprestimoId());
        String statusAtual = calcularStatusEmprestimo(emprestimo);
        if ("DEVOLVIDO".equals(statusAtual)) {
            throw new IllegalStateException("Este emprestimo ja foi devolvido.");
        }

        Livro livro = emprestimo.getLivro();
        livro.setQuantidadeDisponivel(Math.min(livro.getQuantidadeTotal(), livro.getQuantidadeDisponivel() + 1));
        livroRepository.save(livro);

        emprestimo.setAdministradorId(request.administradorId() == null ? emprestimo.getAdministradorId() : request.administradorId());
        emprestimo.setStatus("DEVOLVIDO");
        return toEmprestimoResponse(emprestimoRepository.save(emprestimo));
    }

    @Transactional(readOnly = true)
    public DashboardResponse buscarDashboard() {
        List<Livro> livros = livroRepository.findAll();
        List<Reserva> reservas = reservaRepository.findAll();
        List<Emprestimo> emprestimos = emprestimoRepository.findAll().stream()
            .map(this::sincronizarStatusEmMemoria)
            .toList();

        long ativos = emprestimos.stream().filter(item -> "ATIVO".equals(item.getStatus())).count();
        long atrasados = emprestimos.stream().filter(item -> "ATRASADO".equals(item.getStatus())).count();
        long reservasPendentes = reservas.stream().filter(item -> "PENDENTE".equals(item.getStatus())).count();
        long disponiveis = livros.stream().filter(item -> item.getQuantidadeDisponivel() > 0).count();

        return new DashboardResponse(
            livros.size(),
            ativos,
            atrasados,
            usuarioRepository.count(),
            reservasPendentes,
            disponiveis,
            livros.size() - disponiveis
        );
    }

    private void aplicarLivro(Livro livro, BookRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Dados do livro nao informados.");
        }

        String titulo = textoObrigatorio(request.titulo(), "titulo");
        String autor = textoObrigatorio(request.autor(), "autor");
        String categoria = textoObrigatorio(request.categoria(), "categoria");
        String descricao = textoObrigatorio(request.descricao(), "descricao");
        Integer quantidadeTotal = inteiroMinimo(request.quantidadeTotal(), "quantidade total", 1);
        Integer quantidadeDisponivel = inteiroMinimo(request.quantidadeDisponivel(), "quantidade disponivel", 0);

        if (quantidadeDisponivel > quantidadeTotal) {
            throw new IllegalArgumentException("A quantidade disponivel nao pode ser maior que a quantidade total.");
        }

        livro.setTitulo(titulo);
        livro.setAutor(autor);
        livro.setCategoria(categoria);
        livro.setDescricao(descricao);
        livro.setImagemUrl(textoOpcional(request.imagemUrl(), IMAGEM_PADRAO));
        livro.setIsbn(textoOpcional(request.isbn(), "ISBN-PENDENTE"));
        livro.setQuantidadeTotal(quantidadeTotal);
        livro.setQuantidadeDisponivel(quantidadeDisponivel);
    }

    private void validarCliente(ClienteRequest request, Long idAtual) {
        if (request == null) {
            throw new IllegalArgumentException("Dados do cliente nao informados.");
        }

        String email = textoObrigatorio(request.email(), "email").toLowerCase();
        String cpf = textoObrigatorio(request.cpf(), "cpf");

        usuarioRepository.findByEmailIgnoreCase(email)
            .filter(usuario -> !usuario.getId().equals(idAtual))
            .ifPresent(usuario -> {
                throw new IllegalStateException("Ja existe um cliente cadastrado com este e-mail.");
            });

        usuarioRepository.findByCpf(cpf)
            .filter(usuario -> !usuario.getId().equals(idAtual))
            .ifPresent(usuario -> {
                throw new IllegalStateException("Ja existe um cliente cadastrado com este CPF.");
            });
    }

    private String textoObrigatorio(String valor, String campo) {
        if (valor == null || valor.trim().isBlank()) {
            throw new IllegalArgumentException("Informe o campo " + campo + ".");
        }
        return valor.trim();
    }

    private String textoOpcional(String valor, String padrao) {
        return valor == null || valor.trim().isBlank() ? padrao : valor.trim();
    }

    private Integer inteiroMinimo(Integer valor, String campo, int minimo) {
        if (valor == null || valor < minimo) {
            throw new IllegalArgumentException("O campo " + campo + " deve ser maior ou igual a " + minimo + ".");
        }
        return valor;
    }

    private Usuario garantirCliente(Long clienteId) {
        return usuarioRepository.findById(clienteId)
            .orElseThrow(() -> new IllegalArgumentException("Cliente nao encontrado."));
    }

    private Livro buscarLivroEntidade(Long id) {
        return livroRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Livro nao encontrado."));
    }

    private Reserva buscarReserva(Long id) {
        return reservaRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Reserva nao encontrada."));
    }

    private Emprestimo buscarEmprestimo(Long id) {
        return emprestimoRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Emprestimo nao encontrado."));
    }

    private Emprestimo sincronizarStatusEmMemoria(Emprestimo emprestimo) {
        String novoStatus = calcularStatusEmprestimo(emprestimo);
        emprestimo.setStatus(novoStatus);
        return emprestimo;
    }

    private String calcularStatusEmprestimo(Emprestimo emprestimo) {
        if ("DEVOLVIDO".equals(emprestimo.getStatus())) {
            return "DEVOLVIDO";
        }
        if (emprestimo.getDataDevolucaoPrevista() != null && emprestimo.getDataDevolucaoPrevista().isBefore(LocalDate.now())) {
            return "ATRASADO";
        }
        return "ATIVO";
    }

    private LivroResponse toLivroResponse(Livro livro) {
        return new LivroResponse(
            livro.getId(),
            livro.getTitulo(),
            livro.getAutor(),
            livro.getCategoria(),
            livro.getDescricao(),
            livro.getImagemUrl(),
            livro.getIsbn(),
            livro.getQuantidadeTotal(),
            livro.getQuantidadeDisponivel(),
            livro.getQuantidadeDisponivel() > 0 ? "DISPONIVEL" : "INDISPONIVEL"
        );
    }

    private UsuarioResponse toUsuarioResponse(Usuario usuario) {
        return new UsuarioResponse(
            usuario.getId(),
            usuario.getNome(),
            usuario.getEmail(),
            usuario.getTelefone(),
            usuario.getCpf()
        );
    }

    private ReservaResponse toReservaResponse(Reserva reserva) {
        return new ReservaResponse(
            reserva.getId(),
            reserva.getDataReserva(),
            reserva.getPrazoRetirada(),
            reserva.getStatus(),
            toUsuarioResponse(reserva.getCliente()),
            toLivroResponse(reserva.getLivro())
        );
    }

    private EmprestimoResponse toEmprestimoResponse(Emprestimo emprestimo) {
        return new EmprestimoResponse(
            emprestimo.getId(),
            emprestimo.getReserva() == null ? null : emprestimo.getReserva().getId(),
            emprestimo.getAdministradorId(),
            emprestimo.getDataEmprestimo(),
            emprestimo.getDataDevolucaoPrevista(),
            calcularStatusEmprestimo(emprestimo),
            emprestimo.isRenovado(),
            toUsuarioResponse(emprestimo.getCliente()),
            toLivroResponse(emprestimo.getLivro())
        );
    }
}
