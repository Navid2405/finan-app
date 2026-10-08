package com.finanapp.controller;

import com.finanapp.dto.UsuarioRequestActualizarDto;
import com.finanapp.dto.UsuarioRequestDto;
import com.finanapp.dto.UsuarioResponseDto;
import com.finanapp.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/usuario")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UsuarioResponseDto crearUsuario(@Valid @RequestBody UsuarioRequestDto usuarioRequestDto){
        return usuarioService.crearUsuario(usuarioRequestDto);
    }

    @GetMapping("/perfil")
    @ResponseStatus(HttpStatus.OK)
    public UsuarioResponseDto buscarPorId(@AuthenticationPrincipal Jwt jwt){

        Long usuarioId= Long.valueOf(jwt.getSubject());
        return usuarioService.obtenerPorId(usuarioId);
    }

    @DeleteMapping("/desactivar")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void desactivarUsuario(@AuthenticationPrincipal Jwt jwt){

        Long usuarioId= Long.valueOf(jwt.getSubject());
        usuarioService.desactivarUsuario(usuarioId);
    }

    @PatchMapping("/actualizar")
    @ResponseStatus(HttpStatus.OK)
    public UsuarioResponseDto actualizarUsuario(@Valid @RequestBody UsuarioRequestActualizarDto actualizarDto,
                                                @AuthenticationPrincipal Jwt jwt){
        Long usuarioId= Long.valueOf(jwt.getSubject());
        return usuarioService.actualizarUsuario(usuarioId, actualizarDto );
    }

}
