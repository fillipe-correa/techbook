package techbook.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import techbook.model.Livro;

import java.util.List;

public interface LivroRepository extends JpaRepository<Livro, Long> {
    List<Livro> findByTituloContainingIgnoreCaseOrAutorContainingIgnoreCaseOrCategoriaContainingIgnoreCase(
            String titulo,
            String autor,
            String categoria
    );
}
