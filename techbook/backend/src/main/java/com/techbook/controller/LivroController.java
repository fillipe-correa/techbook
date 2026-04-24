package com.techbook.controller;

import com.techbook.model.Livro;
import com.techbook.service.LivroService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/livros")
public class LivroController {

    @Autowired
    private LivroService livroService;

    @GetMapping
    public List<Livro> listar() {
        return livroService.listarLivros();
    }

    @PostMapping
    public Livro cadastrar(@RequestBody Livro livro) {
        return livroService.cadastrarLivro(livro);
    }

    @GetMapping("/{id}")
    public Livro consultar(@PathVariable Long id) {
        return livroService.consultarPorId(id);
    }

    @DeleteMapping("/{id}")
    public void remover(@PathVariable Long id) {
        livroService.removerLivro(id);
    }

    @GetMapping("/{id}/disponibilidade")
    public boolean verificarDisponibilidade(@PathVariable Long id) {
        return livroService.verificarDisponibilidade(id);
    }
}