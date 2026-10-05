package com.finanapp.dto;

import com.finanapp.model.Frecuencia;
import com.finanapp.model.ObligacionRecurrente;
import com.finanapp.model.Usuario;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ObligacionRecurrenteResponseDto(
        Long id,
        Long usuarioId,
        String nombre,
        BigDecimal monto,
        Frecuencia frecuencia,
        Integer fechaLimitePago,
        LocalDate proximoVencimiento,
        boolean activa
) {

    public static ObligacionRecurrenteResponseDto fromEntity(ObligacionRecurrente obligacion){
        return new ObligacionRecurrenteResponseDto(
                obligacion.getId(),
                obligacion.getUsuario().getId(),
                obligacion.getNombre(),
                obligacion.getMonto(),
                obligacion.getFrecuencia(),
                obligacion.getDiaLimitePago(),
                obligacion.getProximoVencimiento(),
                obligacion.isActiva()
        );

    }
}
