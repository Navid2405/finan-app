package com.finanapp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public record RetiroAhorroRequestDto(
        @NotNull(message = "El id de la meta no puede estar vacio")
        Long metaId,
        @NotNull(message = "Debes elegir una categoría para el gasto")
        Long categoriaId,
        @NotNull(message = "El monto a retirar no puede estar vacio")
        @Positive(message = "El monto debe ser mayor a cero")
        BigDecimal montoRetiro,
        @NotBlank(message = "El metodo de pago es obligatorio")
        String metodoPago,
        String descripcion,
        LocalDate fecha
) {



}
