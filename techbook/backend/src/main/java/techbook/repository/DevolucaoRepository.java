package techbook.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import techbook.model.Devolucao;

public interface DevolucaoRepository extends JpaRepository<Devolucao, Long> {
}
