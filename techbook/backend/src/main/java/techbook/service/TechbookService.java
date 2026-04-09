package techbook.service;

import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import techbook.dto.ClienteRequest;
import techbook.dto.ConfirmarRetiradaRequest;
import techbook.dto.DashboardResponse;
import techbook.dto.DevolucaoRequest;
import techbook.dto.LivroRequest;
import techbook.dto.ReservaRequest;
import techbook.exception.BusinessException;
import techbook.model.Administrador;
import techbook.model.Cliente;
import techbook.model.Devolucao;
import techbook.model.Emprestimo;
import techbook.model.EmprestimoStatus;
import techbook.model.EstadoLivro;
import techbook.model.Livro;
import techbook.model.Reserva;
import techbook.model.ReservaStatus;
import techbook.repository.AdministradorRepository;
import techbook.repository.ClienteRepository;
import techbook.repository.DevolucaoRepository;
import techbook.repository.EmprestimoRepository;
import techbook.repository.LivroRepository;
import techbook.repository.ReservaRepository;

import java.util.List;

@Service
public class TechbookService {

    private final LivroRepository livroRepository;
    private final ClienteRepository clienteRepository;
    private final AdministradorRepository administradorRepository;
    private final ReservaRepository reservaRepository;
    private final EmprestimoRepository emprestimoRepository;
    private final DevolucaoRepository devolucaoRepository;

    public TechbookService(
            LivroRepository livroRepository,
            ClienteRepository clienteRepository,
            AdministradorRepository administradorRepository,
            ReservaRepository reservaRepository,
            EmprestimoRepository emprestimoRepository,
            DevolucaoRepository devolucaoRepository
    ) {
        this.livroRepository = livroRepository;
        this.clienteRepository = clienteRepository;
        this.administradorRepository = administradorRepository;
        this.reservaRepository = reservaRepository;
        this.emprestimoRepository = emprestimoRepository;
        this.devolucaoRepository = devolucaoRepository;
    }

    public List<Livro> listarLivros(String busca) {
        if (busca == null || busca.isBlank()) {
            return livroRepository.findAll();
        }
        return livroRepository.findByTituloContainingIgnoreCaseOrAutorContainingIgnoreCaseOrCategoriaContainingIgnoreCase(
                busca, busca, busca
        );
    }

    public Livro buscarLivro(Long id) {
        return livroRepository.findById(id).orElseThrow(() -> new BusinessException("Livro nao encontrado."));
    }

    @Transactional
    public Livro salvarLivro(LivroRequest request, Long id) {
        Livro livro = id == null ? new Livro() : buscarLivro(id);
        livro.setTitulo(request.titulo());
        livro.setAutor(request.autor());
        livro.setCategoria(request.categoria());
        livro.setDescricao(request.descricao());
        livro.setImagemUrl(request.imagemUrl());
        livro.setQuantidadeTotal(request.quantidadeTotal());
        livro.setQuantidadeDisponivel(Math.min(request.quantidadeDisponivel(), request.quantidadeTotal()));
        livro.atualizarStatus();
        return livroRepository.save(livro);
    }

    @Transactional
    public void removerLivro(Long id) {
        Livro livro = buscarLivro(id);
        livroRepository.delete(livro);
    }

    public List<Cliente> listarClientes() {
        return clienteRepository.findAll();
    }

    @Transactional
    public Cliente cadastrarCliente(ClienteRequest request) {
        Cliente cliente = new Cliente();
        cliente.setNome(request.nome());
        cliente.setEmail(request.email());
        cliente.setTelefone(request.telefone());
        cliente.setCpf(request.cpf());
        return clienteRepository.save(cliente);
    }

    public List<Reserva> listarReservas() {
        expirarReservasPendentes();
        return reservaRepository.findAll();
    }

    public List<Reserva> listarReservasDoCliente(Long clienteId) {
        expirarReservasPendentes();
        return reservaRepository.findByClienteIdOrderByDataReservaDesc(clienteId);
    }

    @Transactional
    public Reserva criarReserva(ReservaRequest request) {
        expirarReservasPendentes();
        Cliente cliente = clienteRepository.findById(request.clienteId())
                .orElseThrow(() -> new BusinessException("Cliente nao encontrado."));
        Livro livro = buscarLivro(request.livroId());

        long emprestimosAtivos = emprestimoRepository.countByClienteIdAndStatusIn(
                cliente.getId(),
                List.of(EmprestimoStatus.ATIVO, EmprestimoStatus.ATRASADO)
        );

        if (emprestimosAtivos >= 3) {
            throw new BusinessException("Limite de emprestimos atingido. Realize a devolucao para novos emprestimos.");
        }

        if (!livro.verificarDisponibilidade()) {
            throw new BusinessException("Livro indisponivel no momento.");
        }

        livro.setQuantidadeDisponivel(livro.getQuantidadeDisponivel() - 1);
        livro.atualizarStatus();

        Reserva reserva = new Reserva();
        reserva.setCliente(cliente);
        reserva.setLivro(livro);
        reserva.criarReserva();

        livroRepository.save(livro);
        return reservaRepository.save(reserva);
    }

    @Transactional
    public Reserva cancelarReserva(Long reservaId) {
        Reserva reserva = reservaRepository.findById(reservaId)
                .orElseThrow(() -> new BusinessException("Reserva nao encontrada."));

        if (reserva.getStatus() != ReservaStatus.PENDENTE) {
            throw new BusinessException("Somente reservas pendentes podem ser canceladas.");
        }

        liberarLivroDaReserva(reserva);
        reserva.cancelarReserva();
        return reservaRepository.save(reserva);
    }

    @Transactional
    public int expirarReservasPendentes() {
        List<Reserva> expiradas = reservaRepository.findByStatusAndPrazoRetiradaBefore(
                ReservaStatus.PENDENTE,
                java.time.LocalDate.now()
        );

        expiradas.forEach(reserva -> {
            liberarLivroDaReserva(reserva);
            reserva.expirarReserva();
        });

        reservaRepository.saveAll(expiradas);
        return expiradas.size();
    }

    public List<Emprestimo> listarEmprestimos() {
        atualizarAtrasos();
        return emprestimoRepository.findAll();
    }

    public List<Emprestimo> listarEmprestimosDoCliente(Long clienteId) {
        atualizarAtrasos();
        return emprestimoRepository.findByClienteIdOrderByDataEmprestimoDesc(clienteId);
    }

    @Transactional
    public Emprestimo confirmarRetirada(ConfirmarRetiradaRequest request) {
        Reserva reserva = reservaRepository.findById(request.reservaId())
                .orElseThrow(() -> new BusinessException("Reserva nao encontrada."));
        Administrador administrador = administradorRepository.findById(request.administradorId())
                .orElseThrow(() -> new BusinessException("Administrador nao encontrado."));

        if (reserva.getStatus() != ReservaStatus.PENDENTE) {
            throw new BusinessException("A reserva precisa estar pendente para confirmar a retirada.");
        }

        Emprestimo emprestimo = new Emprestimo();
        emprestimo.setCliente(reserva.getCliente());
        emprestimo.setLivro(reserva.getLivro());
        emprestimo.setAdministrador(administrador);
        emprestimo.setReserva(reserva);
        emprestimo.registrarEmprestimo();

        reserva.setStatus(ReservaStatus.RETIRADO);
        reservaRepository.save(reserva);
        return emprestimoRepository.save(emprestimo);
    }

    @Transactional
    public Emprestimo renovarEmprestimo(Long emprestimoId) {
        Emprestimo emprestimo = emprestimoRepository.findById(emprestimoId)
                .orElseThrow(() -> new BusinessException("Emprestimo nao encontrado."));

        if (emprestimo.isRenovado()) {
            throw new BusinessException("A renovacao pode ser realizada apenas uma vez.");
        }

        if (emprestimo.getStatus() == EmprestimoStatus.ATRASADO) {
            throw new BusinessException("Nao e possivel renovar um emprestimo atrasado.");
        }

        emprestimo.renovarEmprestimo();
        return emprestimoRepository.save(emprestimo);
    }

    @Transactional
    public Devolucao registrarDevolucao(DevolucaoRequest request) {
        Emprestimo emprestimo = emprestimoRepository.findById(request.emprestimoId())
                .orElseThrow(() -> new BusinessException("Emprestimo nao encontrado."));
        Administrador administrador = administradorRepository.findById(request.administradorId())
                .orElseThrow(() -> new BusinessException("Administrador nao encontrado."));

        Devolucao devolucao = new Devolucao();
        devolucao.setEmprestimo(emprestimo);
        devolucao.setAdministrador(administrador);
        devolucao.setEstadoLivro(EstadoLivro.valueOf(request.estadoLivro().toUpperCase()));
        devolucao.registrarDevolucao();

        emprestimo.setStatus(EmprestimoStatus.DEVOLVIDO);
        Livro livro = emprestimo.getLivro();
        livro.setQuantidadeDisponivel(livro.getQuantidadeDisponivel() + 1);
        livro.atualizarStatus();

        livroRepository.save(livro);
        emprestimoRepository.save(emprestimo);
        return devolucaoRepository.save(devolucao);
    }

    public DashboardResponse dashboard() {
        atualizarAtrasos();
        long totalLivros = livroRepository.count();
        long ativos = emprestimoRepository.countByStatus(EmprestimoStatus.ATIVO);
        long atrasados = emprestimoRepository.countByStatus(EmprestimoStatus.ATRASADO);
        long usuarios = clienteRepository.count();
        long reservasPendentes = reservaRepository.countByStatus(ReservaStatus.PENDENTE);
        long livrosDisponiveis = livroRepository.findAll().stream().filter(Livro::verificarDisponibilidade).count();
        long livrosIndisponiveis = totalLivros - livrosDisponiveis;
        return new DashboardResponse(
                totalLivros,
                ativos,
                atrasados,
                usuarios,
                reservasPendentes,
                livrosDisponiveis,
                livrosIndisponiveis
        );
    }

    private void atualizarAtrasos() {
        List<Emprestimo> emprestimos = emprestimoRepository.findAll();
        emprestimos.forEach(Emprestimo::verificarAtraso);
        emprestimoRepository.saveAll(emprestimos);
    }

    private void liberarLivroDaReserva(Reserva reserva) {
        Livro livro = reserva.getLivro();
        livro.setQuantidadeDisponivel(livro.getQuantidadeDisponivel() + 1);
        livro.atualizarStatus();
        livroRepository.save(livro);
    }
}
