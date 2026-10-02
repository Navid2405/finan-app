package com.finanapp.dto;

import com.finanapp.model.TipoTransaccion;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TransaccionRequestActualizarDto(
        String descripcion,
        BigDecimal monto,
        String metodoPago,
        LocalDate fecha,
        TipoTransaccion tipoTransaccion
) {


}
