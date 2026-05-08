package com.techbook.dto;

import java.time.LocalDate;

public record EmprestimoResponse(
    Long id,
    Long reservaId,
    Long administradorId,
    LocalDate dataEmprestimo,
    LocalDate dataDevolucaoPrevista,
    String status,
    boolean renovado,
    UsuarioResponse cliente,
    LivroResponse livro
) {
}
