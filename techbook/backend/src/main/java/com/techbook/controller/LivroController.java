package com.techbook.controller;

import com.techbook.model.Livro;
import com.techbook.service.LivroService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/livros") // Rota para acessar os livros
public class LivroController {

    @Autowired
    private LivroService livroService; // O Controller agora "conversa" com o Service

    @GetMapping
    public List<Livro> listar() {
        return livroService.buscarTodos();
    }

    @PostMapping
    public Livro criar(@RequestBody Livro livro) {
        return livroService.cadastrar(livro);
    }

    @GetMapping("/{id}")
    public Livro buscar(@PathVariable Long id) {
        return livroService.buscarPorId(id);
    }

    @DeleteMapping("/{id}")
    public void remover(@PathVariable Long id) {
        livroService.excluir(id);
    }
}