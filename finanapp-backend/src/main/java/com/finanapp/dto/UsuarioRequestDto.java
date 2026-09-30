package com.finanapp.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UsuarioRequestDto(
        @NotBlank(message = "El nombre es obligatorio")
        String nombre,
        @NotBlank(message = "El teléfono es obligatorio")
        String telefono,
        @Email(message = "Email inválido")
        @NotBlank(message = "El email es obligatorio")
        String email,
        @NotBlank(message = "La contraseña es obligatoria")
        @Size(min = 8, message = "Mínimo 8 caracteres")
        String password,
        @NotBlank(message = "La ocupación es obligatoria")
        String ocupacion
) {

}
