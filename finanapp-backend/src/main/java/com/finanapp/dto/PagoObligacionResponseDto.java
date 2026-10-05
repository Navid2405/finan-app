package com.finanapp.dto;

import com.finanapp.model.PagoObligacion;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PagoObligacionResponseDto(
        Long id,
        Long obligacionId,
        Long transaccionId,
        BigDecimal montoPagado,
        LocalDate fechaPago
) {

    public static PagoObligacionResponseDto fromEntity(PagoObligacion pago){
        return new PagoObligacionResponseDto(
                pago.getId(),
                pago.getObligacion().getId(),
                pago.getTransaccion().getId(),
                pago.getMontoPagado(),
                pago.getFechaPago()
        );
    }
}
