package com.techbook.dto;

public record LivroResponse(
    Long id,
    String titulo,
    String autor,
    String categoria,
    String descricao,
    String imagemUrl,
    String isbn,
    Integer quantidadeTotal,
    Integer quantidadeDisponivel,
    String status
) {
}
