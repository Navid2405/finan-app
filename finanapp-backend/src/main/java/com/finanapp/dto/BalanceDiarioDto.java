package com.finanapp.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record BalanceDiarioDto(
        LocalDate fecha,
        BigDecimal ingresos,
        BigDecimal gastos,
        BigDecimal saldo,
        int movimientos
) {

}
