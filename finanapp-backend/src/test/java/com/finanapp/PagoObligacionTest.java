package com.finanapp;

import com.finanapp.dto.PagoObligacionRequestDto;
import com.finanapp.dto.PagoObligacionResponseDto;
import com.finanapp.exception.BadRequestException;
import com.finanapp.model.*;
import com.finanapp.repository.*;
import com.finanapp.service.PagoObligacionService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentMatchers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PagoObligacionTest {

    @Mock
    private PagoObligacionRepository pagoObligacionRepository;
    @Mock
    private ObligacionRecurrenteRepository obligacionRecurrenteRepository;
    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private CategoriaRepository categoriaRepository;
    @Mock
    private TransaccionRepository transaccionRepository;
    @InjectMocks
    private PagoObligacionService pagoObligacionService;
    private Usuario usuario;
    private ObligacionRecurrente obligacion;
    private Categoria categoria;
    @BeforeEach
    void setUp() {
        usuario = Usuario.builder().id(1L).activo(true).build();
        obligacion = ObligacionRecurrente.builder()
                .id(2L)
                .usuario(usuario)
                .nombre("Paga Diario")
                .monto(new BigDecimal("50000.00"))
                .saldoPendiente(new BigDecimal("50000.00"))
                .frecuencia(Frecuencia.DIARIA)
                .estado(EstadoObligacion.PENDIENTE)
                .proximoVencimiento(LocalDate.now())
                .activa(true)
                .build();
        categoria = Categoria.builder().id(3L).tipo(TipoTransaccion.GASTO).usuario(usuario).build();
    }
    @Test
    @DisplayName("Debe registrar un abono parcial y reducir el saldo pendiente")
    void crearPago_AbonoParcial_Exitoso() {
        PagoObligacionRequestDto request = new PagoObligacionRequestDto(
                2L,
                "Efectivo",
                3L,
                new BigDecimal("20000.00"),
                LocalDate.now()
        );
        when(obligacionRecurrenteRepository.findById(2L)).thenReturn(Optional.of(obligacion));
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(categoriaRepository.findById(3L)).thenReturn(Optional.of(categoria));
        when(pagoObligacionRepository.save(any(PagoObligacion.class))).thenAnswer(i -> {
            PagoObligacion p = i.getArgument(0);
            p.setId(10L);
            return p;
        });
        PagoObligacionResponseDto response = pagoObligacionService.crearPago(1L, request);
        assertNotNull(response);
        assertEquals(new BigDecimal("20000.00"), response.montoPagado());
        assertEquals(new BigDecimal("30000.00"), obligacion.getSaldoPendiente());
        assertEquals(EstadoObligacion.PENDIENTE, obligacion.getEstado());
        verify(transaccionRepository).save(any(Transaccion.class));
    }
    @Test
    @DisplayName("Debe marcar la obligación como PAGADA cuando se liquida todo el saldo")
    void crearPago_PagoTotal_PasaAPagada() {
        PagoObligacionRequestDto request = new PagoObligacionRequestDto(
                2L,
                "Efectivo",
                3L,
                new BigDecimal("50000.00"),
                LocalDate.now()
        );
        when(obligacionRecurrenteRepository.findById(2L)).thenReturn(Optional.of(obligacion));
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(categoriaRepository.findById(3L)).thenReturn(Optional.of(categoria));
        when(pagoObligacionRepository.save(any(PagoObligacion.class))).thenAnswer(i -> i.getArgument(0));
        pagoObligacionService.crearPago(1L, request);
        assertEquals(BigDecimal.ZERO, obligacion.getSaldoPendiente());
        assertEquals(EstadoObligacion.PAGADA, obligacion.getEstado());
    }
    @Test
    @DisplayName("Debe rechazar el pago si el monto supera el saldo restante")
    void crearPago_MontoMayorASaldo_LanzaBadRequest() {
        PagoObligacionRequestDto request = new PagoObligacionRequestDto(
                2L,
                "Efectivo",
                3L,
                new BigDecimal("60000.00"),
                LocalDate.now()
        );
        when(obligacionRecurrenteRepository.findById(2L)).thenReturn(Optional.of(obligacion));
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(categoriaRepository.findById(3L)).thenReturn(Optional.of(categoria));
        assertThrows(BadRequestException.class, () -> pagoObligacionService.crearPago(1L, request));
        verify(transaccionRepository, never()).save(any());
        verify(pagoObligacionRepository, never()).save(any());
    }
}
