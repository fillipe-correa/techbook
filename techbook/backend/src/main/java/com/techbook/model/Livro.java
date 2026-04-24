package com.techbook.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "livros")
@Data
public class Livro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titulo;
    private String autor;
    private String categoria;
    private Integer edicao;
    private String isbn;
    private boolean disponivel = true; // Para o controle de empréstimos
}