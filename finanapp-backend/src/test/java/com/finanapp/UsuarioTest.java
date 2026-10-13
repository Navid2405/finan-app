package com.finanapp;

import com.finanapp.dto.UsuarioRequestActualizarDto;
import com.finanapp.dto.UsuarioRequestDto;
import com.finanapp.dto.UsuarioResponseDto;
import com.finanapp.exception.BadRequestException;
import com.finanapp.exception.DuplicateResourceException;
import com.finanapp.exception.ResourceNotFoundException;
import com.finanapp.model.Usuario;
import com.finanapp.repository.UsuarioRepository;
import com.finanapp.service.UsuarioService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.time.LocalDateTime;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
@ExtendWith(MockitoExtension.class)
public class UsuarioTest {

    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @InjectMocks
    private UsuarioService usuarioService;
    private Usuario usuarioMock;
    @BeforeEach
    void setUp() {
        usuarioMock = Usuario.builder()
                .id(1L)
                .nombre("Carlos Pérez")
                .telefono("3001234567")
                .email("carlos@example.com")
                .passwordHash("passwordEncriptado")
                .ocupacion("Mototaxista")
                .activo(true)
                .creadoEn(LocalDateTime.now())
                .build();
    }
    @Test
    @DisplayName("Debe crear un usuario exitosamente y encriptar la contraseña")
    void crearUsuario_Exitoso() {
        UsuarioRequestDto request = new UsuarioRequestDto(
                "Carlos Pérez", "3001234567", "carlos@example.com", "clave1234", "Mototaxista"
        );
        when(usuarioRepository.existsByTelefono("3001234567")).thenReturn(false);
        when(usuarioRepository.existsByEmail("carlos@example.com")).thenReturn(false);
        when(passwordEncoder.encode("clave1234")).thenReturn("passwordEncriptado");
        when(usuarioRepository.save(any(Usuario.class))).thenReturn(usuarioMock);
        UsuarioResponseDto resultado = usuarioService.crearUsuario(request);
        assertNotNull(resultado);
        assertEquals("Carlos Pérez", resultado.nombre());
        assertEquals("carlos@example.com", resultado.email());
        verify(passwordEncoder).encode("clave1234");
        verify(usuarioRepository).save(any(Usuario.class));
    }
    @Test
    @DisplayName("Debe lanzar excepción si el teléfono ya está registrado")
    void crearUsuario_TelefonoDuplicado_LanzaExcepcion() {
        UsuarioRequestDto request = new UsuarioRequestDto(
                "Carlos Pérez", "3001234567", "carlos@example.com", "clave1234", "Mototaxista"
        );
        when(usuarioRepository.existsByTelefono("3001234567")).thenReturn(true);
        assertThrows(DuplicateResourceException.class, () -> usuarioService.crearUsuario(request));
        verify(usuarioRepository, never()).save(any(Usuario.class));
    }
    @Test
    @DisplayName("Debe lanzar excepción si el email ya está registrado")
    void crearUsuario_EmailDuplicado_LanzaExcepcion() {
        UsuarioRequestDto request = new UsuarioRequestDto(
                "Carlos Pérez", "3001234567", "carlos@example.com", "clave1234", "Mototaxista"
        );
        when(usuarioRepository.existsByTelefono("3001234567")).thenReturn(false);
        when(usuarioRepository.existsByEmail("carlos@example.com")).thenReturn(true);
        assertThrows(DuplicateResourceException.class, () -> usuarioService.crearUsuario(request));
        verify(usuarioRepository, never()).save(any(Usuario.class));
    }
    @Test
    @DisplayName("Debe obtener usuario por ID exitosamente")
    void obtenerPorId_Exitoso() {
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuarioMock));
        UsuarioResponseDto resultado = usuarioService.obtenerPorId(1L);
        assertNotNull(resultado);
        assertEquals(1L, resultado.id());
    }
    @Test
    @DisplayName("Debe lanzar ResourceNotFoundException si el ID no existe")
    void obtenerPorId_NoExiste_LanzaExcepcion() {
        when(usuarioRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> usuarioService.obtenerPorId(99L));
    }
    @Test
    @DisplayName("Debe desactivar el usuario (Soft Delete)")
    void desactivarUsuario_Exitoso() {
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuarioMock));
        usuarioService.desactivarUsuario(1L);
        assertFalse(usuarioMock.isActivo());
        verify(usuarioRepository).save(usuarioMock);
    }
    @Test
    @DisplayName("Debe actualizar el usuario si se envían cambios válidos")
    void actualizarUsuario_Exitoso() {
        UsuarioRequestActualizarDto actualizarDto = new UsuarioRequestActualizarDto("Carlos Andrés", "Comerciante");
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuarioMock));
        when(usuarioRepository.save(any(Usuario.class))).thenReturn(usuarioMock);
        UsuarioResponseDto resultado = usuarioService.actualizarUsuario(1L, actualizarDto);
        assertNotNull(resultado);
        assertEquals("Carlos Andrés", usuarioMock.getNombre());
        assertEquals("Comerciante", usuarioMock.getOcupacion());
    }
    @Test
    @DisplayName("Debe lanzar BadRequestException si no se envían campos para actualizar")
    void actualizarUsuario_CamposVacios_LanzaExcepcion() {
        UsuarioRequestActualizarDto actualizarDto = new UsuarioRequestActualizarDto("", "   ");
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuarioMock));
        assertThrows(BadRequestException.class, () -> usuarioService.actualizarUsuario(1L, actualizarDto));
        verify(usuarioRepository, never()).save(any(Usuario.class));
    }
}
