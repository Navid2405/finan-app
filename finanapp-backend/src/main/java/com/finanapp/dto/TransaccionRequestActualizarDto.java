package com.finanapp.dto;

import com.finanapp.model.TipoTransaccion;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TransaccionRequestActualizarDto(
        @Size(max = 100, message = "La descripcion no puede tener mas de 100 caracteres")
        String descripcion,
        @Positive(message = "El monto debe ser positivo")
        BigDecimal monto,
        @Size(max = 50, message = "El metodo de pago puede tener mas de 50 caracteres")
        String metodoPago,
        @PastOrPresent(message = "La fecha no puede ser del futuro")
        LocalDate fecha,
        TipoTransaccion tipoTransaccion
) {


}
