package techbook.controller;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import techbook.dto.LivroRequest;
import techbook.model.Livro;
import techbook.service.TechbookService;

import java.util.List;

@RestController
@RequestMapping("/api/livros")
public class LivroController {

    private final TechbookService service;

    public LivroController(TechbookService service) {
        this.service = service;
    }

    @GetMapping
    public List<Livro> listar(@RequestParam(required = false) String busca) {
        return service.listarLivros(busca);
    }

    @GetMapping("/{id}")
    public Livro buscar(@PathVariable Long id) {
        return service.buscarLivro(id);
    }

    @PostMapping
    public Livro criar(@Valid @RequestBody LivroRequest request) {
        return service.salvarLivro(request, null);
    }

    @PutMapping("/{id}")
    public Livro atualizar(@PathVariable Long id, @Valid @RequestBody LivroRequest request) {
        return service.salvarLivro(request, id);
    }

    @DeleteMapping("/{id}")
    public void remover(@PathVariable Long id) {
        service.removerLivro(id);
    }
}
