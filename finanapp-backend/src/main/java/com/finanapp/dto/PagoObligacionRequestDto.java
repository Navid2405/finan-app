package com.finanapp.dto;

import com.finanapp.model.TipoTransaccion;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PagoObligacionRequestDto(
        @NotNull(message = "El id del usuario no puede estar vacio")
        Long usuarioId,
        @NotNull(message = "La obligqcion no puede estar vacia ")
        Long obligacionId,
        @NotNull(message = "El metodo de pago no puede estar vacio")
        String metodoPago,
        @NotNull(message = "El id de la categoria no puede estar vacio")
        Long categoriaId,
        @NotNull(message = "El monto no puede estar vacio")
        @Positive(message = "El monto debe ser positivo")
        BigDecimal montoPagado,
        LocalDate fechaPago
) {
}
