package com.finanapp.service;

import com.finanapp.dto.MetaAhorroRequestActualizarDto;
import com.finanapp.dto.MetaAhorroRequestDto;
import com.finanapp.dto.MetaAhorroResponseDto;
import com.finanapp.exception.BadRequestException;
import com.finanapp.exception.ForbiddenActionException;
import com.finanapp.exception.ResourceNotFoundException;
import com.finanapp.model.EstadoMeta;
import com.finanapp.model.MetasAhorro;
import com.finanapp.model.Usuario;
import com.finanapp.repository.MetaAhorroRepository;
import com.finanapp.repository.UsuarioRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@AllArgsConstructor
public class MetaAhorroService {

    private final MetaAhorroRepository metaRepository;
    private final UsuarioRepository usuarioRepository;


    //Crear meta o cajita de ahorro

    @Transactional
    public MetaAhorroResponseDto crearMeta(Long usuarioId, MetaAhorroRequestDto requestDto) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontro al usuario con id: " + usuarioId));

        if (!usuario.isActivo()) {
            throw new BadRequestException("El usuario no puede realizar esta accion");
        }


        MetasAhorro nuevaMeta = MetasAhorro.builder()
                .usuario(usuario)
                .titulo(requestDto.titulo())
                .montoObjetivo(requestDto.montoObjetivo())
                .montoAcumulado(BigDecimal.ZERO)
                .fechaLimite(requestDto.fechaLimite())
                .estado(EstadoMeta.EN_PROGRESO)
                .build();

        MetasAhorro metaGuardad = metaRepository.save(nuevaMeta);
        return MetaAhorroResponseDto.fromEntity(metaGuardad);
    }

    //Obtener metas de un usuario

    @Transactional(readOnly = true)
    public List<MetaAhorroResponseDto> obtenerMetasPorUsuarioId(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontro al usuario con id: " + usuarioId));

        if (!usuario.isActivo()) {
            throw new BadRequestException("El usuario no puede realizar esta accion");
        }

        List<MetasAhorro> metasUsuario = metaRepository.findByUsuarioId(usuarioId);

        return metasUsuario.stream().map(MetaAhorroResponseDto::fromEntity).toList();
    }

    //Enocntrar por id y estado

    @Transactional(readOnly = true)
    public List<MetaAhorroResponseDto> obtenerMetasPorIdyEstado(Long usuarioId, EstadoMeta estadoMeta) {

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontro al usuario con id: " + usuarioId));

        if (!usuario.isActivo()) {
            throw new BadRequestException("El usuario no puede realizar esta accion");
        }

        List<MetasAhorro> metasusuario = metaRepository.findByUsuarioIdAndEstado(usuarioId, estadoMeta);

        return metasusuario.stream().map(MetaAhorroResponseDto::fromEntity).toList();
    }


    //Obtner totoal ahorrado de un usuario
    @Transactional(readOnly = true)
    public BigDecimal totalAhorrado(Long usuarioId, EstadoMeta estadoMeta) {

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontro al usuario con id: " + usuarioId));

        if (!usuario.isActivo()) {
            throw new BadRequestException("El usuario no puede realizar esta accion");
        }

        BigDecimal total = metaRepository.sumarTotalAhorradoPorUsuario(usuarioId, estadoMeta);

        return total;
    }

    // soft delete, desactivar caja de ahorro o meta
    @Transactional
    public void eliminarMeta ( Long usuarioId ,Long metaId){
        MetasAhorro meta = metaRepository.findById(metaId)
                .orElseThrow(()-> new ResourceNotFoundException("No se encontro la meta con id: " + metaId));

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontro al usuario con id: " + usuarioId));

        if (!usuario.isActivo()) {
            throw new BadRequestException("El usuario no puede realizar esta accion");
        }

        if (!meta.getUsuario().getId().equals(usuario.getId())){
            throw new ForbiddenActionException("No puedes eliminar esta meta");
        }

        meta.setEstado(EstadoMeta.CANCELADA);

    }

    // actualizar caja de ahorro o meta
    @Transactional
    public MetaAhorroResponseDto actualizarMeta(Long usuarioId ,Long metaId, MetaAhorroRequestActualizarDto requestDto){

        MetasAhorro meta= metaRepository.findById(metaId)
                .orElseThrow(()-> new ResourceNotFoundException("No existe el ahorro o meta con id: " + metaId));
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontro al usuario con id: " + usuarioId));

        if (!usuario.isActivo()) {
            throw new BadRequestException("El usuario no puede realizar esta accion");
        }

        if (!meta.getUsuario().getId().equals(usuario.getId())){
            throw new ForbiddenActionException("No puedes modificar esta meta");
        }

        boolean cambios = false;

        if (requestDto.titulo() != null && !requestDto.titulo().isBlank()){
            meta.setTitulo(requestDto.titulo());
            cambios = true;
        }

        if (requestDto.fechaLimite() != null){
            meta.setFechaLimite(requestDto.fechaLimite());
            cambios = true;
        }

        if (requestDto.montoObjetivo() != null){
            meta.setMontoObjetivo(requestDto.montoObjetivo());

            if (requestDto.montoObjetivo().compareTo(meta.getMontoAcumulado()) <= 0){
                meta.setEstado(EstadoMeta.COMPLETADA);
            }

            if (requestDto.montoObjetivo().compareTo(meta.getMontoAcumulado()) > 0){
                meta.setEstado(EstadoMeta.EN_PROGRESO);
            }
            cambios = true;
        }

        if (!cambios){
            throw  new BadRequestException("No hay campos para modificar");
        }

        return MetaAhorroResponseDto.fromEntity(meta);
    }
}