package com.finanapp;
import com.finanapp.dto.AporteAhorroRequestDto;
import com.finanapp.dto.AporteAhorroResponseDto;
import com.finanapp.dto.MetaAhorroResponseDto;
import com.finanapp.dto.RetiroAhorroRequestDto;
import com.finanapp.exception.BadRequestException;
import com.finanapp.model.*;
import com.finanapp.repository.*;
import com.finanapp.service.AporteAhorroService;
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
public class AporteAhorroTest {

    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private AporteAhorroRepository aporteRepository;
    @Mock
    private MetaAhorroRepository metaRepository;
    @Mock
    private CategoriaRepository categoriaRepository;
    @Mock
    private TransaccionRepository transaccionRepository;
    @InjectMocks
    private AporteAhorroService aporteAhorroService;
    private Usuario usuario;
    private MetasAhorro meta;
    private Categoria categoria;
    @BeforeEach
    void setUp() {
        usuario = Usuario.builder().id(1L).activo(true).build();
        meta = MetasAhorro.builder()
                .id(5L)
                .usuario(usuario)
                .titulo("Reparación Moto")
                .montoObjetivo(new BigDecimal("100000.00"))
                .montoAcumulado(new BigDecimal("20000.00"))
                .estado(EstadoMeta.EN_PROGRESO)
                .build();
        categoria = Categoria.builder().id(8L).tipo(TipoTransaccion.GASTO).usuario(usuario).build();
    }
    @Test
    @DisplayName("Debe registrar aporte, incrementar acumulado y guardar transacción de gasto")
    void crearAporte_Exitoso() {
        AporteAhorroRequestDto request = new AporteAhorroRequestDto(
                5L, 8L, new BigDecimal("30000.00"),"Efectivo", LocalDate.now(),  "Aporte semana 1"
        );
        when(metaRepository.findById(5L)).thenReturn(Optional.of(meta));
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(categoriaRepository.findById(8L)).thenReturn(Optional.of(categoria));
        when(aporteRepository.save(any(AporteAhorro.class))).thenAnswer(i -> i.getArgument(0));
        AporteAhorroResponseDto response = aporteAhorroService.crearAporte(1L, request);
        assertNotNull(response);
        assertEquals(new BigDecimal("30000.00"), response.monto());
        assertEquals(new BigDecimal("50000.00"), meta.getMontoAcumulado());
        assertEquals(EstadoMeta.EN_PROGRESO, meta.getEstado());
        verify(transaccionRepository).save(any(Transaccion.class));
    }
    @Test
    @DisplayName("Debe marcar la meta como COMPLETADA si el aporte alcanza el monto objetivo")
    void crearAporte_AlcanzaObjetivo_MetaCompletada() {
        AporteAhorroRequestDto request = new AporteAhorroRequestDto(
                5L, 8L, new BigDecimal("80000.00"),"Efectivo", LocalDate.now(),  "Aporte final"
        );
        when(metaRepository.findById(5L)).thenReturn(Optional.of(meta));
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(categoriaRepository.findById(8L)).thenReturn(Optional.of(categoria));
        when(aporteRepository.save(any(AporteAhorro.class))).thenAnswer(i -> i.getArgument(0));
        aporteAhorroService.crearAporte(1L, request);
        assertEquals(new BigDecimal("100000.00"), meta.getMontoAcumulado());
        assertEquals(EstadoMeta.COMPLETADA, meta.getEstado());
    }
    @Test
    @DisplayName("Debe lanzar BadRequestException si el retiro supera el saldo acumulado")
    void retirarDinero_SaldoInsuficiente_LanzaExcepcion() {
        RetiroAhorroRequestDto request = new RetiroAhorroRequestDto(
                5L, 8L, new BigDecimal("50000.00"),  "Efectivo", "Retiro mayor al saldo",LocalDate.now()
        );
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(metaRepository.findById(5L)).thenReturn(Optional.of(meta));
        when(categoriaRepository.findById(8L)).thenReturn(Optional.of(categoria));
        assertThrows(BadRequestException.class, () -> aporteAhorroService.retirarDinero(1L, request));
        verify(transaccionRepository, never()).save(any(Transaccion.class));
    }
    @Test
    @DisplayName("Debe retirar dinero exitosamente y reducir el monto acumulado")
    void retirarDinero_Exitoso() {
        RetiroAhorroRequestDto request = new RetiroAhorroRequestDto(
                5L, 8L, new BigDecimal("10000.00"), "Efectivo", "Retiro para repuesto",LocalDate.now()
                );
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(metaRepository.findById(5L)).thenReturn(Optional.of(meta));
        when(categoriaRepository.findById(8L)).thenReturn(Optional.of(categoria));
        when(metaRepository.save(any(MetasAhorro.class))).thenReturn(meta);
        MetaAhorroResponseDto response = aporteAhorroService.retirarDinero(1L, request);
        assertNotNull(response);
        assertEquals(new BigDecimal("10000.00"), meta.getMontoAcumulado());
        verify(transaccionRepository).save(any(Transaccion.class));
    }

}
