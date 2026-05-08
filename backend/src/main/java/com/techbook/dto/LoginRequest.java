package com.techbook.dto;

public record LoginRequest(
    String email,
    String senha
) {
}
