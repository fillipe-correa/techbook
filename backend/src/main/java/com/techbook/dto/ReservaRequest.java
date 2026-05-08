package com.techbook.dto;

public record ReservaRequest(
    Long clienteId,
    Long livroId
) {
}
