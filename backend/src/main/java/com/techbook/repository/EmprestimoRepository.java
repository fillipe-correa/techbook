package com.techbook.repository;

import com.techbook.model.Emprestimo;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmprestimoRepository extends JpaRepository<Emprestimo, Long> {

    List<Emprestimo> findByClienteIdOrderByIdDesc(Long clienteId);
}
