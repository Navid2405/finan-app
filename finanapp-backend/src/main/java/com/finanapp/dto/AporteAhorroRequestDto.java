package com.finanapp.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record AporteAhorroRequestDto(
        Long metaId,
        BigDecimal monto,
        LocalDate fecha,
        String nota
) {
}
