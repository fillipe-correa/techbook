package com.techbook.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "livros")
@Data
public class Livro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idLivro; // Nome exato da documentação (PK)

    private String titulo;
    private String autor;
    private String categoria;

    private Integer quantidadeDisponivel;


    // métodos
    public boolean verificarDisponibilidade() {
        return this.quantidadeDisponivel != null && this.quantidadeDisponivel > 0;
    }

    public void atualizarStatus(Integer novaQuantidade) {
        this.quantidadeDisponivel = novaQuantidade;
    }
}