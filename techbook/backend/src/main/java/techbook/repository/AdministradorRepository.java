package techbook.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import techbook.model.Administrador;

public interface AdministradorRepository extends JpaRepository<Administrador, Long> {
}
