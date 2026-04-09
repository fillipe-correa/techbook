package techbook.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record LivroRequest(
        @NotBlank String titulo,
        @NotBlank String autor,
        @NotBlank String categoria,
        @NotBlank String descricao,
        String imagemUrl,
        @NotNull @Min(1) Integer quantidadeTotal,
        @NotNull @Min(0) Integer quantidadeDisponivel
) {
}
