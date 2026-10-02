package com.finanapp.service;


import com.finanapp.dto.TransaccionRequestActualizarDto;
import com.finanapp.dto.TransaccionRequestDto;
import com.finanapp.dto.TransaccionResponseDto;
import com.finanapp.dto.UsuarioResponseDto;
import com.finanapp.model.Categoria;
import com.finanapp.model.Transaccion;
import com.finanapp.model.Usuario;
import com.finanapp.repository.CategoriaRepository;
import com.finanapp.repository.TransaccionRepository;
import com.finanapp.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TransaccionService {

    private final TransaccionRepository transaccionRepository;
    private final CategoriaRepository categoriaRepository;
    private final UsuarioRepository usuarioRepository;

    // Crear Transaccion (CREATE)
    @Transactional
    public TransaccionResponseDto crearTransaccion(TransaccionRequestDto requestDto) {
        Usuario usuario = usuarioRepository.findById(requestDto.usuarioId()).
                orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + requestDto.usuarioId()));

        Categoria categoria = categoriaRepository.findById(requestDto.categoriaId()).
                orElseThrow(() -> new RuntimeException("Categoria no encontrada con ID: " + requestDto.categoriaId()));

        if (!usuario.isActivo()) {
            throw new RuntimeException("No se puede realizar con un usuario INACTIVO");
        }

        Transaccion nuevaTransaccion = Transaccion.builder()
                .usuario(usuario)
                .categoria(categoria)
                .tipoTransaccion(categoria.getTipo())
                .monto(requestDto.monto())
                .descripcion(requestDto.descripcion())
                .metodoPago(requestDto.metodoPago())
                .fecha(requestDto.fecha())
                .build();
        transaccionRepository.save(nuevaTransaccion);
        return TransaccionResponseDto.fromEntity(nuevaTransaccion);

    }

    // obtener transacciones por usuario (READ)
    @Transactional(readOnly = true)
    public List<TransaccionResponseDto> obtenerTransaccionesDeUsuario(Long usuarioId, LocalDate fecha) {

        LocalDate fechaFiltro = (fecha != null) ? fecha : LocalDate.now();

        if (!usuarioRepository.existsById(usuarioId)) {
            throw new RuntimeException("Usuario no encontrado con ID: " + usuarioId);
        }

        List<Transaccion> transacciones = transaccionRepository.findByUsuarioIdAndFechaOrderByCreadoEnDesc(usuarioId, fechaFiltro);

        return transacciones
                .stream()
                .map(TransaccionResponseDto::fromEntity)
                .toList();
    }

    //Eliminar traansaccion
    @Transactional
    public void eliminarTransaccion(Long id) {
        Transaccion transaccion = transaccionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaccion no encontrada con ID: " + id));

        transaccionRepository.delete(transaccion);
    }

    // Actualizar parcialmente una transaccion (UPDATE)
    @Transactional
    public TransaccionResponseDto actualizarTransaccion(Long id, TransaccionRequestActualizarDto requestActualizarDto) {
        Transaccion actTransaccion = transaccionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaccion no encontrada con ID: " + id));

        boolean cambios = false;

        if (requestActualizarDto.tipoTransaccion() != null) {
            actTransaccion.setTipoTransaccion(requestActualizarDto.tipoTransaccion());
            cambios = true;
        }

        if (requestActualizarDto.metodoPago() != null && !requestActualizarDto.metodoPago().isBlank()) {
            actTransaccion.setMetodoPago(requestActualizarDto.metodoPago());
            cambios = true;
        }

        if (requestActualizarDto.descripcion() != null && !requestActualizarDto.descripcion().isBlank()) {
            actTransaccion.setDescripcion(requestActualizarDto.descripcion());
            cambios = true;
        }

        if (requestActualizarDto.monto() != null && requestActualizarDto.monto().compareTo(BigDecimal.ZERO) > 0) {
            actTransaccion.setMonto(requestActualizarDto.monto());
            cambios = true;
        }

        if (requestActualizarDto.fecha() != null) {
            actTransaccion.setFecha(requestActualizarDto.fecha());
            cambios = true;
        }

        Transaccion transaccionGuardada = transaccionRepository.save(actTransaccion);
        return TransaccionResponseDto.fromEntity(transaccionGuardada);


    }

}

