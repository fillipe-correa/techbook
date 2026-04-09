package techbook.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record DevolucaoRequest(
        @NotNull Long emprestimoId,
        @NotNull Long administradorId,
        @NotBlank String estadoLivro
) {
}
