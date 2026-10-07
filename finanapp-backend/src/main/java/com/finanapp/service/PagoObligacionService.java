package com.finanapp.service;

import com.finanapp.dto.PagoObligacionRequestDto;
import com.finanapp.dto.PagoObligacionResponseDto;
import com.finanapp.model.*;
import com.finanapp.repository.*;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@AllArgsConstructor
public class PagoObligacionService {
    private final PagoObligacionRepository pagoObligacionRepository;
    private final ObligacionRecurrenteRepository obligacionRecurrenteRepository;
    private final UsuarioRepository usuarioRepository;
    private final CategoriaRepository categoriaRepository;
    private final TransaccionRepository transaccionRepository;

//crear pago para una obligacion o deuda (CREATE)
    @Transactional
    public PagoObligacionResponseDto crearPago (Long usuarioId, PagoObligacionRequestDto requestDto){
        ObligacionRecurrente obligacion = obligacionRecurrenteRepository.findById(requestDto.obligacionId())
                .orElseThrow(() -> new RuntimeException("No se encontro obligacion con el id: "+ requestDto.obligacionId()));

        Usuario usuario= usuarioRepository.findById(usuarioId)
                .orElseThrow(()-> new RuntimeException("No se encontro al usuario con Id: " + usuarioId));

        Categoria categoria= categoriaRepository.findById(requestDto.categoriaId())
                .orElseThrow(()->new RuntimeException("Categoria no encontrada con id: " + requestDto.categoriaId()));

        if (!usuario.isActivo()){
            throw new RuntimeException("El usuario no puede realoizar esta accion");
        }
        if (!obligacion.isActiva()) {
            throw new RuntimeException("La obligación se encuentra inactiva");
        }

        if (  categoria.getUsuario() != null && !categoria.getUsuario().getId().equals(usuario.getId()) ){
            throw new RuntimeException("No se puede acceder a esta categoria o no existe");
        }
        LocalDate fechaPago= (requestDto.fechaPago() != null) ? requestDto.fechaPago() : LocalDate.now() ;

        Transaccion transaccion = Transaccion.builder()
                .usuario(usuario)
                .categoria(categoria)
                .tipoTransaccion(TipoTransaccion.GASTO)
                .monto(requestDto.montoPagado())
                .metodoPago(requestDto.metodoPago())
                .descripcion("Pago cuota: " + obligacion.getNombre())
                .fecha(fechaPago)
                .build();

        Transaccion transaccionGuardada = transaccionRepository.save(transaccion);

        PagoObligacion pago= PagoObligacion.builder()
                .obligacion(obligacion)
                .transaccion(transaccionGuardada)
                .montoPagado(requestDto.montoPagado())
                .fechaPago(fechaPago)
                .build();



        BigDecimal nuevoSaldo = obligacion.getSaldoPendiente().subtract(requestDto.montoPagado());

        if (nuevoSaldo.compareTo(BigDecimal.ZERO) <= 0) {
            obligacion.setSaldoPendiente(BigDecimal.ZERO);
            switch (obligacion.getFrecuencia()) {
                case DIARIA -> obligacion.setProximoVencimiento(obligacion.getProximoVencimiento().plusDays(1));
                case SEMANAL -> obligacion.setProximoVencimiento(obligacion.getProximoVencimiento().plusWeeks(1));
                case QUINCENAL -> obligacion.setProximoVencimiento(obligacion.getProximoVencimiento().plusDays(15));
                case MENSUAL -> obligacion.setProximoVencimiento(obligacion.getProximoVencimiento().plusMonths(1));
            }
        } else {
            obligacion.setSaldoPendiente(nuevoSaldo);
        }

        PagoObligacion nuevoPago = pagoObligacionRepository.save(pago);
        return PagoObligacionResponseDto.fromEntity(nuevoPago);
    }

    //Obtener todo el historial de pago de un usuario por obligacion
    @Transactional(readOnly = true)
    public List<PagoObligacionResponseDto> obtnerHistorialPagosPorObligacion(Long usuarioId, Long obligacionId){
        ObligacionRecurrente obligacion = obligacionRecurrenteRepository.findById(obligacionId)
                .orElseThrow(() -> new RuntimeException("No se encontro obligacion con el id: " + obligacionId));


        Usuario usuario= usuarioRepository.findById(usuarioId)
                .orElseThrow(()-> new RuntimeException("No se encontro al usuario con Id: " + usuarioId));

        if (!usuario.isActivo()){
            throw new RuntimeException("El usuario no puede realoizar esta accion");
        }

        if (!obligacion.getUsuario().getId().equals(usuario.getId())) {
            throw new RuntimeException("Acceso denegado");
        }
        List<PagoObligacion> pagos = pagoObligacionRepository.findByObligacionId(obligacionId);

        return pagos.stream().map(PagoObligacionResponseDto ::fromEntity).toList();
    }



}
