package com.techbook.dto;

public record UsuarioResponse(
    Long id,
    String nome,
    String email,
    String telefone,
    String cpf
) {
}
