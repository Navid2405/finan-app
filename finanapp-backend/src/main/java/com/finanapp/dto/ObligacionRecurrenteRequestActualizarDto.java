package com.finanapp.dto;

import com.finanapp.model.Frecuencia;
import jakarta.validation.constraints.*;


import java.math.BigDecimal;
import java.time.LocalDate;

public record ObligacionRecurrenteRequestActualizarDto(
        @Size(max = 50, message ="El nombre no puede tener mas de 50 caracteres")
        String nombre,

        @Positive(message = "El monto debe ser positivo")
        BigDecimal monto,

        Frecuencia frecuencia,
        @Min(1)
        @Max(31)
        Integer diaLimitePago,

        LocalDate proximoVencimiento

) {
}
