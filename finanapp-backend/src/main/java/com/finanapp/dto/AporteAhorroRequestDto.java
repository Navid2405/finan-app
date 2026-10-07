package com.finanapp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public record AporteAhorroRequestDto(
        @NotNull(message = "El id de la meta es obligatorio")
        Long metaId,

        @NotNull(message = "El id de la categoria es obligatorio")
        Long categoriaId,

        @NotNull(message = "El monto a abonar no puede estar vacio")
        @Positive(message = "El monto debe ser mayor a 0")
        BigDecimal monto,
        @NotBlank(message = "El metoodo de pago no puede estar vacio")
        String metodoPago,
        LocalDate fecha,
        String nota
) {
}
