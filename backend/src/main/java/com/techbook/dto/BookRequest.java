package com.techbook.dto;

public record BookRequest(
    String titulo,
    String autor,
    String categoria,
    String descricao,
    String imagemUrl,
    String isbn,
    Integer quantidadeTotal,
    Integer quantidadeDisponivel
) {
}
