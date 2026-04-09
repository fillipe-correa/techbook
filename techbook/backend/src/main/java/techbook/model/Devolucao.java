package techbook.model;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

import java.time.LocalDate;

@Entity
@Table(name = "devolucoes")
public class Devolucao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "emprestimo_id")
    private Emprestimo emprestimo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "administrador_id")
    private Administrador administrador;

    private LocalDate dataDevolucao;

    @Enumerated(EnumType.STRING)
    private EstadoLivro estadoLivro;

    @Enumerated(EnumType.STRING)
    private DevolucaoStatus status;

    public void registrarDevolucao() {
        this.dataDevolucao = LocalDate.now();
        this.status = this.estadoLivro == EstadoLivro.BOM
                ? DevolucaoStatus.FINALIZADA
                : DevolucaoStatus.COM_OCORRENCIA;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Emprestimo getEmprestimo() {
        return emprestimo;
    }

    public void setEmprestimo(Emprestimo emprestimo) {
        this.emprestimo = emprestimo;
    }

    public Administrador getAdministrador() {
        return administrador;
    }

    public void setAdministrador(Administrador administrador) {
        this.administrador = administrador;
    }

    public LocalDate getDataDevolucao() {
        return dataDevolucao;
    }

    public void setDataDevolucao(LocalDate dataDevolucao) {
        this.dataDevolucao = dataDevolucao;
    }

    public EstadoLivro getEstadoLivro() {
        return estadoLivro;
    }

    public void setEstadoLivro(EstadoLivro estadoLivro) {
        this.estadoLivro = estadoLivro;
    }

    public DevolucaoStatus getStatus() {
        return status;
    }

    public void setStatus(DevolucaoStatus status) {
        this.status = status;
    }
}
