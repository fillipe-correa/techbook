package com.techbook.controller;

import com.techbook.model.Livro;
import com.techbook.repository.LivroRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/livros") // Seguindo o padrão de API da doc
public class LivroController {

    @Autowired
    private LivroRepository repository;

    @GetMapping
    public List<Livro> listarTodos() {
        return repository.findAll();
    }

    @PostMapping
    public Livro cadastrar(@RequestBody Livro livro) {
        return repository.save(livro);
    }
}