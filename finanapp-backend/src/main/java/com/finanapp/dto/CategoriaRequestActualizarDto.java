package com.finanapp.dto;

import com.finanapp.model.TipoTransaccion;
import jakarta.validation.constraints.Size;

public record CategoriaRequestActualizarDto (
        @Size(max = 100, message ="El nombre no puede tener mas de 100 caracteres")
        String nombre,
        TipoTransaccion tipo,
        @Size(max = 100, message ="El nombre no puede tener mas de 100 caracteres")
        String icono
){
}
