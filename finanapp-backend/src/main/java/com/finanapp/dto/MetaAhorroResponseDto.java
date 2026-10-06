package com.finanapp.dto;

import com.finanapp.model.EstadoMeta;
import com.finanapp.model.MetasAhorro;

import java.math.BigDecimal;
import java.time.LocalDate;

public record MetaAhorroResponseDto(
        Long id,
        Long usuarioId,
        String titulo,
        BigDecimal montoObjetivo,
        BigDecimal montoAcumulado,
        LocalDate fechaLimite,
        EstadoMeta estado
) {

    public static MetaAhorroResponseDto fromEntity(MetasAhorro meta){
        return new MetaAhorroResponseDto(
                meta.getId(),
                meta.getUsuario().getId(),
                meta.getTitulo(),
                meta.getMontoObjetivo(),
                meta.getMontoAcumulado(),
                meta.getFechaLimite(),
                meta.getEstado()
        );
    }


}
