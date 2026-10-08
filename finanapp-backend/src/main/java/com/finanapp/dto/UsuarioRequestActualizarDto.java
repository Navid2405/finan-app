package com.finanapp.dto;

import jakarta.validation.constraints.Size;

public record UsuarioRequestActualizarDto(
        @Size(max = 100, message ="El nombre no puede tener mas de 100 caracteres")
        String nombre,
        @Size(max = 60, message ="La ocupacion no puede tener mas de 60 caracteres")
        String ocupacion
) {
}
