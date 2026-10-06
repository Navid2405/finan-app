package com.finanapp.dto;

import com.finanapp.model.EstadoMeta;

import java.math.BigDecimal;
import java.time.LocalDate;

public record MetaAhorroRequestDto(
        String titulo,
        BigDecimal montoObjetivo,
        BigDecimal montoAcumulado,
        LocalDate fechaLimite,
        EstadoMeta estado
) {
}
