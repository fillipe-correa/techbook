package com.techbook.dto;

public record ClienteRequest(
    String nome,
    String email,
    String telefone,
    String cpf
) {
}
