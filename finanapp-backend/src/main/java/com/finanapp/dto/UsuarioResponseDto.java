package com.finanapp.dto;

import com.finanapp.model.Usuario;

import java.time.LocalDateTime;

public record UsuarioResponseDto(
        Long id,
        String nombre,
        String telefono,
        String email,
        String passwordHash,
        String ocupacion,
        LocalDateTime creadoEn,
        boolean activo
        ) {
    public static UsuarioResponseDto fromEntity(Usuario usuario){
        return new UsuarioResponseDto(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getTelefono(),
                usuario.getEmail(),
                usuario.getPasswordHash(),
                usuario.getOcupacion(),
                usuario.getCreadoEn(),
                usuario.isActivo()
        );
    }

}
