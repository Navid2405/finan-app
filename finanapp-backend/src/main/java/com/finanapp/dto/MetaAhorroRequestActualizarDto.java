package com.finanapp.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record MetaAhorroRequestActualizarDto(
        String titulo,
        BigDecimal montoObjetivo,
        LocalDate fechaLimite
) {
}
