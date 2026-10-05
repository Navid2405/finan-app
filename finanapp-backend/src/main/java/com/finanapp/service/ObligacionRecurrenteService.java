package com.finanapp.service;

import com.finanapp.dto.ObligacionRecurrenteRequestActualizarDto;
import com.finanapp.dto.ObligacionRecurrenteRequestDto;
import com.finanapp.dto.ObligacionRecurrenteResponseDto;
import com.finanapp.model.ObligacionRecurrente;
import com.finanapp.model.Usuario;
import com.finanapp.repository.ObligacionRecurrenteRepository;
import com.finanapp.repository.UsuarioRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@AllArgsConstructor
public class ObligacionRecurrenteService {

    private final ObligacionRecurrenteRepository obligacionRepository;
    private final UsuarioRepository usuarioRepository;

    // Crear obligacion de un usuario (CREATE)

    @Transactional
    public ObligacionRecurrenteResponseDto crearObligacion(ObligacionRecurrenteRequestDto requestObligacion){
        Usuario usuario = usuarioRepository.findById(requestObligacion.usuarioId())
                .orElseThrow(()-> new RuntimeException("No existe el  usuario con Id: " + requestObligacion.usuarioId()));

        if (!usuario.isActivo()){
            throw new RuntimeException("El usuario no puede realizar esta accion");
        }

        ObligacionRecurrente nuevaObligacion = ObligacionRecurrente.builder()
                .usuario(usuario)
                .nombre(requestObligacion.nombre())
                .monto(requestObligacion.monto())
                .frecuencia(requestObligacion.frecuencia())
                .diaLimitePago(requestObligacion.fechaLimitePago())
                .proximoVencimiento(requestObligacion.proximoVencimiento())
                .activa(true)
                .build();

        ObligacionRecurrente obligacionGuardada = obligacionRepository.save(nuevaObligacion);
        return ObligacionRecurrenteResponseDto.fromEntity(obligacionGuardada);
    }

    //Obtener todas las obligaciones de un usuario (READ)
    @Transactional(readOnly = true)
    public List<ObligacionRecurrenteResponseDto> obtenerObligaciones(Long usuarioId){
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(()-> new RuntimeException("No existe el  usuario con Id: " + usuarioId));

        if (!usuario.isActivo()){
            throw new RuntimeException("El usuario no puede realizar esta accion");
        }

        List<ObligacionRecurrente> obligacionesUsuario = obligacionRepository.findByUsuarioId(usuarioId);

        return obligacionesUsuario.stream()
                .map(ObligacionRecurrenteResponseDto::fromEntity)
                .toList();
    }

    // Obtener todos las obligaciones activas de un usuario (READ)
    @Transactional (readOnly = true)
    public List<ObligacionRecurrenteResponseDto> obtenerObligacionesActivas(Long usuarioId){
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(()-> new RuntimeException("No existe el  usuario con Id: " + usuarioId));

        if (!usuario.isActivo()){
            throw new RuntimeException("El usuario no puede realizar esta accion");
        }

        List<ObligacionRecurrente> obligacionesActivasUsuario = obligacionRepository.
                findByUsuarioIdAndActivaTrue(usuarioId);
        return obligacionesActivasUsuario.stream()
                .map(ObligacionRecurrenteResponseDto::fromEntity)
                .toList();
    }

    //Desactivar una obligacion (Soft Delete)
    @Transactional
    public void desactivarObligacion (Long obligacionId){
        ObligacionRecurrente obligacion = obligacionRepository.findById(obligacionId)
                .orElseThrow(()-> new RuntimeException("No se encontro la obligacion con id: " +obligacionId));

        obligacion.setActiva(false);

    }

    // ActualizarTransaccion
    @Transactional
    public ObligacionRecurrenteResponseDto actualizarObligacion(Long obligacionId, ObligacionRecurrenteRequestActualizarDto actualizarDto){
        ObligacionRecurrente obligacion = obligacionRepository.findById(obligacionId)
                .orElseThrow(()-> new RuntimeException("No se encontro la obligacion con id: " +obligacionId));


        boolean cambios = false;

        if ( actualizarDto.nombre() != null &&!actualizarDto.nombre().isBlank() ){
            obligacion.setNombre(actualizarDto.nombre());
            cambios = true;
        }

        if (actualizarDto.monto() != null && actualizarDto.monto().compareTo(BigDecimal.ZERO) >0){
            obligacion.setMonto(actualizarDto.monto());
            cambios = true;
        }

        if (actualizarDto.frecuencia() != null){
            obligacion.setFrecuencia(actualizarDto.frecuencia());
            cambios = true;
        }

        if (actualizarDto.diaLimitePago() != null){
            obligacion.setDiaLimitePago(actualizarDto.diaLimitePago());
            cambios = true;
        }

        if (actualizarDto.proximoVencimiento() != null){
            obligacion.setProximoVencimiento(actualizarDto.proximoVencimiento());
            cambios = true;
        }

        ObligacionRecurrente obligacionActualizada = obligacionRepository.save(obligacion);
        return ObligacionRecurrenteResponseDto.fromEntity(obligacionActualizada);
    }

}
