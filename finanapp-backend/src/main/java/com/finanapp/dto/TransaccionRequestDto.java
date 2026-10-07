package com.finanapp.dto;


import jakarta.validation.constraints.NotNull;

import javax.swing.*;
import java.math.BigDecimal;
import java.time.LocalDate;

public record TransaccionRequestDto(

        @NotNull(message = "El id de la categoria es obligattorio")
        Long categoriaId,
        @NotNull(message = "el monto no puede estar vacio")
        BigDecimal monto,
        String descripcion,
        String metodoPago,
        LocalDate fecha



) {
}
