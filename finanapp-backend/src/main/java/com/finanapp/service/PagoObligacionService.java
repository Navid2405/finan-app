package com.finanapp.service;

import com.finanapp.dto.PagoObligacionRequestDto;
import com.finanapp.dto.PagoObligacionResponseDto;
import com.finanapp.model.ObligacionRecurrente;
import com.finanapp.model.PagoObligacion;
import com.finanapp.model.Transaccion;
import com.finanapp.model.Usuario;
import com.finanapp.repository.ObligacionRecurrenteRepository;
import com.finanapp.repository.PagoObligacionRepository;
import com.finanapp.repository.TransaccionRepository;
import com.finanapp.repository.UsuarioRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@AllArgsConstructor
public class PagoObligacionService {
    private final PagoObligacionRepository pagoObligacionRepository;
    private final ObligacionRecurrenteRepository obligacionRecurrenteRepository;
    private final UsuarioRepository usuarioRepository;
    private final TransaccionRepository transaccionRepository;

//crear pago para una obligacion o deuda (CREATE)
    @Transactional
    public PagoObligacionResponseDto crearPago (PagoObligacionRequestDto requestDto){
        ObligacionRecurrente obligacion = obligacionRecurrenteRepository.findById(requestDto.obligacionId())
                .orElseThrow(() -> new RuntimeException("No se encontro obligacion con el id: "+ requestDto.obligacionId()));

        Usuario usuario= usuarioRepository.findById(requestDto.usuarioId())
                .orElseThrow(()-> new RuntimeException("No se encontro al usuario con Id: " + requestDto.usuarioId()));

        Transaccion transaccion= transaccionRepository.findById(requestDto.transaccionId())
                .orElseThrow(()-> new RuntimeException("No se enocntro la transaccion con id: " +requestDto.transaccionId()));

        if (!usuario.isActivo()){
            throw new RuntimeException("El usuario no puede realoizar esta accion");
        }
        if (!obligacion.isActiva()) {
            throw new RuntimeException("La obligación se encuentra inactiva");
        }
        if (!obligacion.getUsuario().getId().equals(usuario.getId())) {
            throw new RuntimeException("Esta obligación no pertenece al usuario especificado");
        }
        LocalDate fechaPago= (requestDto.fechaPago() != null) ? requestDto.fechaPago() : LocalDate.now() ;

        PagoObligacion pago= PagoObligacion.builder()
                .obligacion(obligacion)
                .transaccion(transaccion)
                .montoPagado(requestDto.montoPagado())
                .fechaPago(fechaPago)
                .build();

        switch (obligacion.getFrecuencia()) {
            case DIARIA -> obligacion.setProximoVencimiento(obligacion.getProximoVencimiento().plusDays(1));
            case SEMANAL -> obligacion.setProximoVencimiento(obligacion.getProximoVencimiento().plusWeeks(1));
            case QUINCENAL -> obligacion.setProximoVencimiento(obligacion.getProximoVencimiento().plusDays(15));
            case MENSUAL -> obligacion.setProximoVencimiento(obligacion.getProximoVencimiento().plusMonths(1));
        }
        PagoObligacion nuevoPago = pagoObligacionRepository.save(pago);
        return PagoObligacionResponseDto.fromEntity(nuevoPago);
    }

    //Obtener todo el historial de pago de un usuario por obligacion
    @Transactional(readOnly = true)
    public List<PagoObligacionResponseDto> obtnerHistorialPagosPorObligacion(Long obligacionId){
        ObligacionRecurrente obligacion = obligacionRecurrenteRepository.findById(obligacionId)
                .orElseThrow(() -> new RuntimeException("No se encontro obligacion con el id: " + obligacionId));


        List<PagoObligacion> pagos = pagoObligacionRepository.findByObligacionId(obligacionId);

        return pagos.stream().map(PagoObligacionResponseDto ::fromEntity).toList();
    }



}
