package com.finanapp.dto;

import com.finanapp.model.Usuario;

import java.time.LocalDateTime;

public record UsuarioRespondeDto(
        Long id,
        String nombre,
        String telefono,
        String email,
        String passwordHash,
        String ocupacion,
        LocalDateTime creadoEn,
        boolean activo
        ) {
    public static UsuarioRespondeDto fromEntity(Usuario usuario){
        return new UsuarioRespondeDto(
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
