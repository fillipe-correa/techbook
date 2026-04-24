package com.techbook.service;

import com.techbook.model.Livro;
import com.techbook.repository.LivroRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class LivroService {

    @Autowired
    private LivroRepository livroRepository;

    // Listar todos os livros cadastrados
    public List<Livro> buscarTodos() {
        return livroRepository.findAll();
    }

    // Salvar um livro
    public Livro cadastrar(Livro livro) {
        return livroRepository.save(livro);
    }

    // Buscar um livro específico pelo ID
    public Livro buscarPorId(Long id) {
        return livroRepository.findById(id).orElse(null);
    }

    // Deletar um livro do sistema
    public void excluir(Long id) {
        livroRepository.deleteById(id);
    }
}