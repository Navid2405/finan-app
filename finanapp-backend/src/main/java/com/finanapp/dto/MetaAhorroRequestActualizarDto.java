package com.finanapp.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record MetaAhorroRequestActualizarDto(
        @Size(max = 100, message ="El titulo no puede tener mas de 100 caracteres")
        String titulo,
        @Positive(message = "El monto debe ser positivo")
        BigDecimal montoObjetivo,
        @FutureOrPresent(message = "La fecha  no puede ser del pasado")
        LocalDate fechaLimite

) {
}
