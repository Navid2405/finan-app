package com.finanapp.dto;

import com.finanapp.model.TipoTransaccion;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import javax.swing.*;
import java.math.BigDecimal;
import java.time.LocalDate;

public record TransaccionRequestDto(

        @NotNull(message = "El id del usuario es obligtatorio")
        Long usuarioId,
        @NotNull(message = "El id de la categoria es obligtatorio")
        Long categoriaId,
        @NotBlank(message = "el monto no puede estar vacio")
        BigDecimal monto,
        String descripcion,
        String metodoPago,
        LocalDate fecha



) {
}
