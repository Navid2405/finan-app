package com.finanapp.dto;

public record AuthLoginResponseDto(
        String token,
        String tipo,
        long expiracionEnMinutos,
        UsuarioResponseDto usuarioResponseDto
) {
}
