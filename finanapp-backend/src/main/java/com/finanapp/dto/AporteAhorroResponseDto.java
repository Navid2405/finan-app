package com.finanapp.dto;

import com.finanapp.model.AporteAhorro;

import java.math.BigDecimal;
import java.time.LocalDate;

public record AporteAhorroResponseDto(
        Long id,
        Long metaId,
        BigDecimal monto,
        LocalDate fecha,
        String nota
) {

    public static AporteAhorroResponseDto fromEntity(AporteAhorro aporte){
        return new AporteAhorroResponseDto(
                aporte.getId(),
                aporte.getMeta().getId(),
                aporte.getMonto(),
                aporte.getFecha(),
                aporte.getNota()
        );
    }
}
