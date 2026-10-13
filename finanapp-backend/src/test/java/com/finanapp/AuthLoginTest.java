package com.finanapp;
import com.finanapp.dto.AuthLoginRequestDto;
import com.finanapp.dto.AuthLoginResponseDto;
import com.finanapp.model.Usuario;
import com.finanapp.repository.UsuarioRepository;
import com.finanapp.service.AuthLoginService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.test.util.ReflectionTestUtils;
import java.time.Instant;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
@ExtendWith(MockitoExtension.class)
public class AuthLoginTest {

    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtEncoder jwtEncoder;
    @InjectMocks
    private AuthLoginService authLoginService;
    private Usuario usuario;
    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(authLoginService, "expiracionEnSegundos", 120L);
        usuario = Usuario.builder()
                .id(1L)
                .email("carlos@example.com")
                .passwordHash("hashEncriptado")
                .activo(true)
                .build();
    }
    @Test
    @DisplayName("Debe iniciar sesión exitosamente y retornar token JWT")
    void login_Exitoso() {
        AuthLoginRequestDto request = new AuthLoginRequestDto("carlos@example.com", "claveSegura123");
        Jwt jwtMock = mock(Jwt.class);
        when(jwtMock.getTokenValue()).thenReturn("mocked.jwt.token");
        when(usuarioRepository.findByEmail("carlos@example.com")).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("claveSegura123", "hashEncriptado")).thenReturn(true);
        when(jwtEncoder.encode(any(JwtEncoderParameters.class))).thenReturn(jwtMock);
        AuthLoginResponseDto response = authLoginService.login(request);
        assertNotNull(response);
        assertEquals("mocked.jwt.token", response.token());
        assertEquals("Bearer", response.tipo());
    }
    @Test
    @DisplayName("Debe lanzar BadCredentialsException si el email no existe")
    void login_EmailNoExiste_LanzaExcepcion() {
        AuthLoginRequestDto request = new AuthLoginRequestDto("noexiste@example.com", "clave");
        when(usuarioRepository.findByEmail("noexiste@example.com")).thenReturn(Optional.empty());
        assertThrows(BadCredentialsException.class, () -> authLoginService.login(request));
    }
    @Test
    @DisplayName("Debe lanzar BadCredentialsException si la contraseña no coincide")
    void login_PasswordIncorrecto_LanzaExcepcion() {
        AuthLoginRequestDto request = new AuthLoginRequestDto("carlos@example.com", "claveIncorrecta");
        when(usuarioRepository.findByEmail("carlos@example.com")).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("claveIncorrecta", "hashEncriptado")).thenReturn(false);
        assertThrows(BadCredentialsException.class, () -> authLoginService.login(request));
    }
    @Test
    @DisplayName("Debe lanzar BadCredentialsException si el usuario está inactivo")
    void login_UsuarioInactivo_LanzaExcepcion() {
        usuario.setActivo(false);
        AuthLoginRequestDto request = new AuthLoginRequestDto("carlos@example.com", "claveSegura123");
        when(usuarioRepository.findByEmail("carlos@example.com")).thenReturn(Optional.of(usuario));
        assertThrows(BadCredentialsException.class, () -> authLoginService.login(request));
    }

}
