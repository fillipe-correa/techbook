package techbook.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import techbook.model.Emprestimo;
import techbook.model.EmprestimoStatus;

import java.util.List;

public interface EmprestimoRepository extends JpaRepository<Emprestimo, Long> {
    List<Emprestimo> findByClienteIdOrderByDataEmprestimoDesc(Long clienteId);
    long countByClienteIdAndStatusIn(Long clienteId, List<EmprestimoStatus> statuses);
    long countByStatus(EmprestimoStatus status);
}
