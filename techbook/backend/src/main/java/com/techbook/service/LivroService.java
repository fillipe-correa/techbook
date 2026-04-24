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


    public List<Livro> listarLivros() {
        return livroRepository.findAll();
    }


    public Livro cadastrarLivro(Livro livro) {
        return livroRepository.save(livro);
    }


    public Livro consultarPorId(Long id) {
        return livroRepository.findById(id).orElse(null);
    }


    public void removerLivro(Long id) {
        livroRepository.deleteById(id);
    }


    public boolean verificarDisponibilidade(Long id) {
        Livro livro = consultarPorId(id);
        return livro != null && livro.verificarDisponibilidade();
    }
}