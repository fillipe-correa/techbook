package com.techbook.dto;

public record ConfirmarRetiradaRequest(
    Long reservaId,
    Long administradorId
) {
}
