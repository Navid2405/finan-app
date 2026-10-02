package com.finanapp.dto;

import com.finanapp.model.Categoria;
import com.finanapp.model.TipoTransaccion;

public record CategoriaResponseDto(
        Long Id,
        Long usuarioId,
        String nombre,
        TipoTransaccion tipoTransaccion,
        String icono
) {

    public static CategoriaResponseDto fromEntity(Categoria categoria){
        return new CategoriaResponseDto(
                categoria.getId(),
                categoria.getUsuario().getId(),
                categoria.getNombre(),
                categoria.getTipo(),
                categoria.getIcono()
        );
    }
}
