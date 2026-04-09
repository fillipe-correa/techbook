package techbook.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import techbook.model.Cliente;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {
}
