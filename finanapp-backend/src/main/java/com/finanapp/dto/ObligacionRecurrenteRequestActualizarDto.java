package com.finanapp.dto;

import com.finanapp.model.Frecuencia;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import org.springframework.cglib.core.Local;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ObligacionRecurrenteRequestActualizarDto(
        @NotBlank(message = "El nombre no puede estar vacio")
        String nombre,
        @NotNull(message = "el monto no puede estar vacio")
        @Positive(message = "El monto debe ser positivo")
        BigDecimal monto,
        @NotNull(message = "La frecuencia no puede estar vacia")
        Frecuencia frecuencia,
        Integer diaLimitePago,
        @NotNull(message = "La fecha no puede limite no puede estar vacia")
        LocalDate proximoVencimiento

) {
}
