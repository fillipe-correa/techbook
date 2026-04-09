package techbook.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ClienteRequest(
        @NotBlank String nome,
        @Email String email,
        @NotBlank String telefone,
        @NotBlank String cpf
) {
}
