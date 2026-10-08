package com.finanapp.service;

import com.finanapp.dto.AporteAhorroRequestDto;
import com.finanapp.dto.AporteAhorroResponseDto;
import com.finanapp.dto.MetaAhorroResponseDto;
import com.finanapp.dto.RetiroAhorroRequestDto;
import com.finanapp.exception.BadRequestException;
import com.finanapp.exception.ForbiddenActionException;
import com.finanapp.exception.ResourceNotFoundException;
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
public class AporteAhorroService {

    private final UsuarioRepository usuarioRepository;
    private final AporteAhorroRepository aporteRepository;
    private final MetaAhorroRepository metaRepository;
    private final CategoriaRepository categoriaRepository;
    private final TransaccionRepository transaccionRepository;

//Crear aporte a un ahorro unico
    @Transactional
    public AporteAhorroResponseDto crearAporte(Long usuarioId, AporteAhorroRequestDto requestDto) {
        MetasAhorro meta = metaRepository.findById(requestDto.metaId())
                .orElseThrow(()-> new ResourceNotFoundException("No se encontro el ahorro o cajita con id: " + requestDto.metaId()));


        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontro al usuario con id: " + usuarioId));

        Categoria categoria = categoriaRepository.findById(requestDto.categoriaId())
                .orElseThrow(()-> new ResourceNotFoundException("No se encontro categoria con id: " + requestDto.categoriaId()));


        if (!usuario.isActivo()) {
            throw new BadRequestException("El usuario no puede realizar esta accion");
        }

        if (meta.getEstado() == EstadoMeta.CANCELADA){
            throw new BadRequestException("No se le puede abonar a este ahorro");
        }

        if (!usuario.getId().equals(meta.getUsuario().getId())){
            throw new ForbiddenActionException("No puedes realizar esta accion");
        }

        if (categoria.getUsuario() != null && !categoria.getUsuario().getId().equals(usuario.getId()) ){
            throw new ForbiddenActionException("No se puede acceder a esta categoria o no existe");
        }

        String descripcionTransaccion = (requestDto.nota() != null && !requestDto.nota().isBlank())
                ? requestDto.nota() : "Aporte a meta: " + meta.getTitulo();

        LocalDate fecha = (requestDto.fecha()!= null)? requestDto.fecha() : LocalDate.now();

        AporteAhorro nuevoAporte = AporteAhorro.builder()
                .meta(meta)
                .monto(requestDto.monto())
                .fecha(fecha)
                .nota(requestDto.nota())
                .build();

        Transaccion transaccion = Transaccion.builder()
                .usuario(usuario)
                .categoria(categoria)
                .tipoTransaccion(TipoTransaccion.GASTO)
                .monto(nuevoAporte.getMonto())
                .descripcion(descripcionTransaccion)
                .metodoPago(requestDto.metodoPago())
                .fecha(fecha)
                .build();

        transaccionRepository.save(transaccion);


        BigDecimal acumuladoActual = meta.getMontoAcumulado() != null ? meta.getMontoAcumulado() : BigDecimal.ZERO;
        BigDecimal nuevoAcumulado = acumuladoActual.add(nuevoAporte.getMonto());
        meta.setMontoAcumulado(nuevoAcumulado);

        if(meta.getMontoAcumulado().compareTo(meta.getMontoObjetivo()) >=0){
            meta.setEstado(EstadoMeta.COMPLETADA);
        }

        metaRepository.save(meta);
        AporteAhorro aporteGuardado = aporteRepository.save(nuevoAporte);
        return AporteAhorroResponseDto.fromEntity(aporteGuardado);
    }


    //retirar dinero de ahorro
    @Transactional
    public MetaAhorroResponseDto retirarDinero (Long usuarioId, RetiroAhorroRequestDto requestDto){
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontro al usuario con id: " + usuarioId));

        MetasAhorro meta = metaRepository.findById(requestDto.metaId())
                .orElseThrow(()-> new ResourceNotFoundException("No se encontro el ahorro o cajita con id: " + requestDto.metaId()));

        Categoria categoria = categoriaRepository.findById(requestDto.categoriaId())
                .orElseThrow(()-> new ResourceNotFoundException("No se encontro categoria con id: " + requestDto.categoriaId()));

        if (!usuario.isActivo()) {
            throw new BadRequestException("El usuario no puede realizar esta accion");
        }

        if (meta.getEstado() == EstadoMeta.CANCELADA){
            throw new BadRequestException("No se puede retirar de un ahorro cancelado");
        }
        if (!usuario.getId().equals(meta.getUsuario().getId())){
            throw new ForbiddenActionException("No puedes realizar esta accion");
        }

        if (  categoria.getUsuario() != null && !categoria.getUsuario().getId().equals(usuario.getId()) ){
            throw new ForbiddenActionException("No se puede acceder a esta categoria o no existe");
        }

        BigDecimal acumuladoActual = meta.getMontoAcumulado() != null ? meta.getMontoAcumulado() : BigDecimal.ZERO;

        if (requestDto.montoRetiro().compareTo(acumuladoActual)>0){
            throw new BadRequestException("Saldo insuficiente");
        }

        String descripcionRetiro = (requestDto.descripcion() != null && !requestDto.descripcion().isBlank())
                ? requestDto.descripcion() : "Retiro de meta: " + meta.getTitulo();

        LocalDate fecha = (requestDto.fecha() != null) ? requestDto.fecha() : LocalDate.now();

        Transaccion transaccion = Transaccion.builder()
                .usuario(usuario)
                .categoria(categoria)
                .tipoTransaccion(TipoTransaccion.INGRESO)
                .monto(requestDto.montoRetiro())
                .descripcion(descripcionRetiro)
                .metodoPago(requestDto.metodoPago())
                .fecha(fecha)
                .build();

        transaccionRepository.save(transaccion);

        BigDecimal nuevoAcumulado = acumuladoActual.subtract(transaccion.getMonto());
        meta.setMontoAcumulado(nuevoAcumulado);

        if (meta.getMontoAcumulado().compareTo(meta.getMontoObjetivo())<0){
            meta.setEstado(EstadoMeta.EN_PROGRESO);
        }

        MetasAhorro metaActualizada = metaRepository.save(meta);
        return MetaAhorroResponseDto.fromEntity(metaActualizada);

    }

    // obtener historial de aportes por ahorro
    @Transactional(readOnly = true)
    public List<AporteAhorroResponseDto> obtenerHistorial(Long usuarioId ,Long metaId){
        MetasAhorro meta= metaRepository.findById(metaId)
                .orElseThrow(()-> new ResourceNotFoundException("No se encontro la meta con id: " + metaId));

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontro al usuario con id: " + usuarioId));

        if (!usuario.isActivo()) {
            throw new BadRequestException("El usuario no puede realizar esta accion");
        }

        if (!meta.getUsuario().getId().equals(usuario.getId())){
            throw new ForbiddenActionException("No puedes obtener el historial de esta meta");
        }

        List<AporteAhorro> historialAportes = aporteRepository.findByMetaIdOrderByFechaDesc(metaId);

        return historialAportes.stream().map(AporteAhorroResponseDto::fromEntity).toList();
    }
}
