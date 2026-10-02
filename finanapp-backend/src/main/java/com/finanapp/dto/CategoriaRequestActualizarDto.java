package com.finanapp.dto;

import com.finanapp.model.TipoTransaccion;

public record CategoriaRequestActualizarDto (
        String nombre,
        TipoTransaccion tipo,
        String icono
){
}
