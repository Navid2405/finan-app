package com.finanapp.service;

import com.finanapp.dto.AuthLoginRequestDto;
import com.finanapp.dto.AuthLoginResponseDto;
import com.finanapp.dto.UsuarioResponseDto;
import com.finanapp.exception.ResourceNotFoundException;
import com.finanapp.model.Usuario;
import com.finanapp.repository.UsuarioRepository;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class AuthLoginService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtEncoder jwtEncoder;

    @Value("${jwt.expiration-minutes:120}")
    private long expiracionEnSegundos;
    public AuthLoginResponseDto login (AuthLoginRequestDto requestDto){
        Usuario usuario = usuarioRepository.findByEmail(requestDto.email())
                .orElseThrow(()-> new BadCredentialsException("El email no existe"));

        if (!usuario.isActivo() || !passwordEncoder.matches(requestDto.password(), usuario.getPasswordHash())){
            throw new BadCredentialsException("Credencial invalida");
        }


        Instant ahora = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .subject(String.valueOf(usuario.getId()))
                .issuedAt(ahora)
                .expiresAt(ahora.plus(expiracionEnSegundos, ChronoUnit.MINUTES))
                .claim("email", usuario.getEmail())
                .build();

        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        String token = jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();

        return new AuthLoginResponseDto(token, "Bearer", expiracionEnSegundos * 60,
                UsuarioResponseDto.fromEntity(usuario));
    }




}
