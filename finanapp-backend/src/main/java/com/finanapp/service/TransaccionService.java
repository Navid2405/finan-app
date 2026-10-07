package com.finanapp.service;


import com.finanapp.dto.*;
import com.finanapp.model.Categoria;
import com.finanapp.model.TipoTransaccion;
import com.finanapp.model.Transaccion;
import com.finanapp.model.Usuario;
import com.finanapp.repository.CategoriaRepository;
import com.finanapp.repository.PagoObligacionRepository;
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
    private final PagoObligacionRepository pagoRepository;

    // Crear Transaccion (CREATE)
    @Transactional
    public TransaccionResponseDto crearTransaccion(Long usuarioId,TransaccionRequestDto requestDto) {
        Usuario usuario = usuarioRepository.findById(usuarioId).
                orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + usuarioId));

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
    public void eliminarTransaccion(Long usuarioId, Long transaccionId) {
        Transaccion transaccion = transaccionRepository.findById(transaccionId)
                .orElseThrow(() -> new RuntimeException("Transaccion no encontrada con ID: " + transaccionId));
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(()-> new RuntimeException("No se encontro al usuario con Id: " + usuarioId));

        if (!usuario.isActivo()){
            throw new RuntimeException("No puede realizar esta accion");
        }

        if (!transaccion.getUsuario().getId().equals(usuario.getId())){
            throw new RuntimeException("Acceso denegado: No puedes eliminar esta transaccion");
        }
        if (pagoRepository.existsByTransaccionId(transaccionId)){
            throw new RuntimeException("No se puede eliminar esta transaccio. Es un registro contable de un pago ya realizado");
        }
        transaccionRepository.delete(transaccion);
    }

    // Actualizar parcialmente una transaccion (UPDATE)
    @Transactional
    public TransaccionResponseDto actualizarTransaccion(Long usuarioId ,Long transaccionId, TransaccionRequestActualizarDto requestActualizarDto) {
        Transaccion actTransaccion = transaccionRepository.findById(transaccionId)
                .orElseThrow(() -> new RuntimeException("Transaccion no encontrada con ID: " + transaccionId));

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(()-> new RuntimeException("No se encontro al usuario con Id: " + usuarioId));

        if (!usuario.isActivo()){
            throw new RuntimeException("No puede realizar esta accion");
        }

        if (!actTransaccion.getUsuario().getId().equals(usuario.getId())){
            throw new RuntimeException("Acceso denegado: No puedes modificar esta transaccion");
        }
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

    //Calculo de balance diario

    public BalanceDiarioDto balanceDiario(Long id, LocalDate fecha){
        Usuario usuario = usuarioRepository.findById(id).
                orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + id));

        LocalDate fechaCons = (fecha != null) ? fecha : LocalDate.now();

        BigDecimal ingresos = transaccionRepository.sumarMontoPorUsuarioFechaYTipo(id, fechaCons, TipoTransaccion.INGRESO);
        BigDecimal gastos = transaccionRepository.sumarMontoPorUsuarioFechaYTipo(id, fechaCons, TipoTransaccion.GASTO);

        BigDecimal balance = ingresos.subtract(gastos);

        int movimientos = (int) transaccionRepository.countByUsuarioIdAndFecha(id, fechaCons);

        return new BalanceDiarioDto(
          fechaCons,
          ingresos,
          gastos,
          balance,
          movimientos
        );
    }

}

