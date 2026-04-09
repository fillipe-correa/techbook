package techbook.dto;

import jakarta.validation.constraints.NotNull;

public record ReservaRequest(
        @NotNull Long clienteId,
        @NotNull Long livroId
) {
}
