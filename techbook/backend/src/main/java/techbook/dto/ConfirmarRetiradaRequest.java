package techbook.dto;

import jakarta.validation.constraints.NotNull;

public record ConfirmarRetiradaRequest(
        @NotNull Long reservaId,
        @NotNull Long administradorId
) {
}
