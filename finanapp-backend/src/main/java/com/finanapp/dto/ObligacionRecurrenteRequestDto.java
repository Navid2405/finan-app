package com.finanapp.dto;

import com.finanapp.model.Frecuencia;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ObligacionRecurrenteRequestDto(

        @NotBlank(message = "El nombre no puede estar vacio")
        String nombre,
        @NotNull(message = "el monto no puede estar vacio")
        @Positive(message = "El monto debe ser positivo")
        BigDecimal monto,

        @NotNull(message = "La frecuencia no puede estar vacia")
        Frecuencia frecuencia,

        @Min(1)
        @Max(31)
        Integer diaLimitePago,

        @NotNull(message = "La fecha no puede limite no puede estar vacia")
        LocalDate proximoVencimiento
) {
}
