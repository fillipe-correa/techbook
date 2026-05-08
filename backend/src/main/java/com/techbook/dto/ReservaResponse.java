package com.techbook.dto;

import java.time.LocalDate;

public record ReservaResponse(
    Long id,
    LocalDate dataReserva,
    LocalDate prazoRetirada,
    String status,
    UsuarioResponse cliente,
    LivroResponse livro
) {
}
