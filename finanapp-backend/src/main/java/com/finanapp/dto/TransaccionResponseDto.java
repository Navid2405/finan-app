package com.finanapp.dto;

import com.finanapp.model.TipoTransaccion;
import com.finanapp.model.Transaccion;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record TransaccionResponseDto(
        Long id,
        Long usuarioId,
        Long categoriaId,
        String categoriaNombre,
        TipoTransaccion tipo,
        BigDecimal monto,
        String descripcion,
        String metodoPago,
        LocalDate fecha,
        LocalDateTime creadoEn


) {
    public static TransaccionResponseDto fromEntity(Transaccion transaccion){
        return new TransaccionResponseDto(
                transaccion.getId(),
                transaccion.getUsuario().getId(),
                transaccion.getCategoria().getId(),
                transaccion.getCategoria().getNombre(),
                transaccion.getTipoTransaccion(),
                transaccion.getMonto(),
                transaccion.getDescripcion(),
                transaccion.getMetodoPago(),
                transaccion.getFecha(),
                transaccion.getCreadoEn()

        );
    }
}
