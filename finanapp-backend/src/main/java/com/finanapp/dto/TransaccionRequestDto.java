package com.finanapp.dto;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TransaccionRequestDto(

        @NotNull(message = "El id de la categoria es obligattorio")
        Long categoriaId,
        @NotNull(message = "el monto no puede estar vacio")
        @Positive(message = "El monto debe ser positivo")
        BigDecimal monto,
        String descripcion,
        @NotBlank(message = "El metodo de pago es obligatorio")
        String metodoPago,
        @PastOrPresent(message = "La fecha no puede ser posterior a hoy")
        LocalDate fecha



) {
}
