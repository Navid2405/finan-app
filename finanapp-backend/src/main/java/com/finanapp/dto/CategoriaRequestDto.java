package com.finanapp.dto;

import com.finanapp.model.TipoTransaccion;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CategoriaRequestDto(
    @NotBlank(message = "El nombre no puede estar vacio")
    String nombre,
    @NotNull(message = "el tipo de transaccion no puede estar vacio")
    TipoTransaccion tipoTransaccion,

    @NotBlank(message = "El icono no puede estar vacio")
    String icono

) {
}
