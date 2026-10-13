package com.finanapp;
import com.finanapp.dto.BalanceDiarioDto;
import com.finanapp.dto.TransaccionRequestDto;
import com.finanapp.dto.TransaccionResponseDto;
import com.finanapp.exception.BadRequestException;
import com.finanapp.exception.ForbiddenActionException;
import com.finanapp.model.Categoria;
import com.finanapp.model.TipoTransaccion;
import com.finanapp.model.Transaccion;
import com.finanapp.model.Usuario;
import com.finanapp.repository.CategoriaRepository;
import com.finanapp.repository.PagoObligacionRepository;
import com.finanapp.repository.TransaccionRepository;
import com.finanapp.repository.UsuarioRepository;
import com.finanapp.service.TransaccionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
@ExtendWith(MockitoExtension.class)
public class TransaccionTest {
    @Mock
    private TransaccionRepository transaccionRepository;
    @Mock
    private CategoriaRepository categoriaRepository;
    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private PagoObligacionRepository pagoRepository;
    @InjectMocks
    private TransaccionService transaccionService;
    private Usuario usuario;
    private Categoria categoria;
    @BeforeEach
    void setUp() {
        usuario = Usuario.builder().id(1L).nombre("Carlos").activo(true).build();
        categoria = Categoria.builder().id(10L).nombre("Gasolina").tipo(TipoTransaccion.GASTO).usuario(usuario).build();
    }
    @Test
    @DisplayName("Debe registrar una transacción exitosamente con el tipo de su categoría")
    void crearTransaccion_Exitoso() {
        TransaccionRequestDto request = new TransaccionRequestDto(
                10L, new BigDecimal("25000.00"), "Tanqueada de moto", "Efectivo", LocalDate.now()
        );
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(categoriaRepository.findById(10L)).thenReturn(Optional.of(categoria));
        when(transaccionRepository.save(any(Transaccion.class))).thenAnswer(i -> {
            Transaccion t = i.getArgument(0);
            t.setId(100L);
            return t;
        });
        TransaccionResponseDto response = transaccionService.crearTransaccion(1L, request);
        assertNotNull(response);
        assertEquals(new BigDecimal("25000.00"), response.monto());
        assertEquals(TipoTransaccion.GASTO, response.tipo());
        verify(transaccionRepository).save(any(Transaccion.class));
    }
    @Test
    @DisplayName("Debe prohibir transacción si la categoría pertenece a otro usuario")
    void crearTransaccion_CategoriaAjena_LanzaForbidden() {
        Usuario otroUsuario = Usuario.builder().id(2L).build();
        Categoria categoriaAjena = Categoria.builder().id(20L).usuario(otroUsuario).build();
        TransaccionRequestDto request = new TransaccionRequestDto(
                20L, new BigDecimal("10000.00"), "Otro gasto", "Efectivo", LocalDate.now()
        );
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(categoriaRepository.findById(20L)).thenReturn(Optional.of(categoriaAjena));
        assertThrows(ForbiddenActionException.class, () -> transaccionService.crearTransaccion(1L, request));
        verify(transaccionRepository, never()).save(any(Transaccion.class));
    }
    @Test
    @DisplayName("Debe impedir eliminar una transacción si está vinculada al pago de una deuda")
    void eliminarTransaccion_EsPagoDeDeuda_LanzaBadRequest() {
        Transaccion transaccion = Transaccion.builder().id(50L).usuario(usuario).build();
        when(transaccionRepository.findById(50L)).thenReturn(Optional.of(transaccion));
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(pagoRepository.existsByTransaccionId(50L)).thenReturn(true);
        assertThrows(BadRequestException.class, () -> transaccionService.eliminarTransaccion(1L, 50L));
        verify(transaccionRepository, never()).delete(any());
    }
    @Test
    @DisplayName("Debe calcular el balance diario restando gastos de ingresos")
    void balanceDiario_CalculoCorrecto() {
        LocalDate hoy = LocalDate.now();
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(transaccionRepository.sumarMontoPorUsuarioFechaYTipo(1L, hoy, TipoTransaccion.INGRESO))
                .thenReturn(new BigDecimal("80000.00"));
        when(transaccionRepository.sumarMontoPorUsuarioFechaYTipo(1L, hoy, TipoTransaccion.GASTO))
                .thenReturn(new BigDecimal("30000.00"));
        when(transaccionRepository.countByUsuarioIdAndFecha(1L, hoy)).thenReturn(4L);
        BalanceDiarioDto balance = transaccionService.balanceDiario(1L, hoy);
        assertNotNull(balance);
        assertEquals(new BigDecimal("80000.00"), balance.ingresos());
        assertEquals(new BigDecimal("30000.00"), balance.gastos());
        assertEquals(new BigDecimal("50000.00"), balance.saldo());
        assertEquals(4, balance.movimientos());
    }
}
