package com.finanapp.dto;

import com.finanapp.model.TipoTransaccion;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PagoObligacionRequestDto(
        @NotNull(message = "El id del usuario no puede estar vacio")
        Long usuarioId,
        @NotBlank(message = "El metodo de pago no puede estar vacio")
        String metodoPago,

        @NotNull(message = "El id de la transaccion no puede estar vacia")
        Long transaccionId,
        @NotNull(message = "El monto no puede estar vacio")
        @Positive(message = "El monto debe ser positivo")
        BigDecimal montoPagado,

        LocalDate fechaPago
) {
}
