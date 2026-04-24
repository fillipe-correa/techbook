package com.techbook.dto;

public record DevolucaoRequest(
    Long emprestimoId,
    Long administradorId,
    String estadoLivro
) {
}
