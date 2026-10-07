package com.finanapp.service;

import com.finanapp.dto.AporteAhorroRequestDto;
import com.finanapp.dto.AporteAhorroResponseDto;
import com.finanapp.dto.MetaAhorroResponseDto;
import com.finanapp.dto.RetiroAhorroRequestDto;
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
                .orElseThrow(()-> new RuntimeException("No se encontro el ahorro o cajita con id: " + requestDto.metaId()));


        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("No se encontro al usuario con id: " + usuarioId));

        if (!usuario.isActivo()) {
            throw new RuntimeException("El usuario no puede realizar esta accion");
        }

        if (meta.getEstado() == EstadoMeta.CANCELADA){
            throw new RuntimeException("No se le puede abonar a este ahorro");
        }

        if (!usuario.getId().equals(meta.getUsuario().getId())){
            throw new RuntimeException("No puedes realizar esta accion");
        }

        LocalDate fecha = (requestDto.fecha()!= null)? requestDto.fecha() : LocalDate.now();
        AporteAhorro nuevoAporte = AporteAhorro.builder()
                .meta(meta)
                .monto(requestDto.monto())
                .fecha(fecha)
                .nota(requestDto.nota())
                .build();

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
                .orElseThrow(() -> new RuntimeException("No se encontro al usuario con id: " + usuarioId));

        MetasAhorro meta = metaRepository.findById(requestDto.metaId())
                .orElseThrow(()-> new RuntimeException("No se encontro el ahorro o cajita con id: " + requestDto.metaId()));

        Categoria categoria = categoriaRepository.findById(requestDto.categoriaId())
                .orElseThrow(()-> new RuntimeException("No se encontro categoria con id: " + requestDto.categoriaId()));

        if (!usuario.isActivo()) {
            throw new RuntimeException("El usuario no puede realizar esta accion");
        }

        if (meta.getEstado() == EstadoMeta.CANCELADA){
            throw new RuntimeException("No se puede retirar de un ahorro cancelado");
        }

        if (!usuario.getId().equals(meta.getUsuario().getId())){
            throw new RuntimeException("No puedes realizar esta accion");
        }

        BigDecimal acumuladoActual = meta.getMontoAcumulado() != null ? meta.getMontoAcumulado() : BigDecimal.ZERO;

        if (requestDto.montoRetiro().compareTo(acumuladoActual)>0){
            throw new RuntimeException("Saldo insuficiente");
        }

        LocalDate fecha = (requestDto.fecha() != null) ? requestDto.fecha() : LocalDate.now();

        Transaccion transaccion = Transaccion.builder()
                .usuario(usuario)
                .categoria(categoria)
                .tipoTransaccion(TipoTransaccion.GASTO)
                .monto(requestDto.montoRetiro())
                .descripcion(requestDto.descripcion())
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
    public List<AporteAhorroResponseDto> obtenerHistorial(Long metaId){
        MetasAhorro meta= metaRepository.findById(metaId)
                .orElseThrow(()-> new RuntimeException("No se encontro la meta con id: " + metaId));

        List<AporteAhorro> historialAportes = aporteRepository.findByMetaIdOrderByFechaDesc(metaId);

        return historialAportes.stream().map(AporteAhorroResponseDto::fromEntity).toList();
    }
}
