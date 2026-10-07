package com.finanapp.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public record AporteAhorroRequestDto(
        @NotNull(message = "El id de la meta es obligatorio")
        Long metaId,

        @NotNull(message = "El monto a abonar no puede estar vacio")
        @Positive(message = "El monto debe ser mayor a 0")
        BigDecimal monto,

        LocalDate fecha,
        String nota
) {
}
