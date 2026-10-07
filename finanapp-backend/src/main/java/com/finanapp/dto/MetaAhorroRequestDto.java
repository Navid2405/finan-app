package com.finanapp.dto;

import com.finanapp.model.EstadoMeta;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public record MetaAhorroRequestDto(
        @NotBlank(message = "El titulo no puede estar vacio")
        String titulo,
        @NotNull(message = "El monto objetivo no puede estar vacio")
        @Positive(message = "El monto debe ser positivo")
        BigDecimal montoObjetivo,

        @FutureOrPresent(message = "La fecha no puede ser del pasado")
        LocalDate fechaLimite

) {
}
