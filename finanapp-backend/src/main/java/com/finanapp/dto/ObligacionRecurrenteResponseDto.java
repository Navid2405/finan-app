package com.finanapp.dto;

import com.finanapp.model.EstadoObligacion;
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
        BigDecimal saldoPendiente,
        Frecuencia frecuencia,
        Integer fechaLimitePago,
        LocalDate proximoVencimiento,
        EstadoObligacion estado,
        boolean activa


) {

    public static EstadoObligacion calcularEstado(BigDecimal saldoPendiente, LocalDate proximoVencimiento){
        if (saldoPendiente.compareTo(BigDecimal.ZERO)<=0){
            return EstadoObligacion.PAGADA;
        }
        if (LocalDate.now().isAfter(proximoVencimiento)){
            return EstadoObligacion.VENCIDA;
        }
        return EstadoObligacion.PENDIENTE;
    }

    public static ObligacionRecurrenteResponseDto fromEntity(ObligacionRecurrente obligacion){
        return new ObligacionRecurrenteResponseDto(
                obligacion.getId(),
                obligacion.getUsuario().getId(),
                obligacion.getNombre(),
                obligacion.getMonto(),
                obligacion.getSaldoPendiente(),
                obligacion.getFrecuencia(),
                obligacion.getDiaLimitePago(),
                obligacion.getProximoVencimiento(),
                calcularEstado(obligacion.getSaldoPendiente(), obligacion.getProximoVencimiento()),
                obligacion.isActiva()
        );

    }
}
