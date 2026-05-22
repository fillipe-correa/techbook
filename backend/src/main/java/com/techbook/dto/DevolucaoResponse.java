package com.techbook.dto;

import java.time.LocalDate;

public record DevolucaoResponse(
    Long id,
    Long emprestimoId,
    LocalDate dataDevolucao,
    String estadoLivro,
    String statusDevolucao
) {
}
