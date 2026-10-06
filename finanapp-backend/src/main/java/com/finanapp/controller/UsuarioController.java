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

    @GetMapping("/{usuarioId}")
    @ResponseStatus(HttpStatus.OK)
    public UsuarioResponseDto buscarPorId(@PathVariable Long usuarioId,
                                          @AuthenticationPrincipal Jwt jwt){

        validarAcceso(usuarioId, jwt);
        return usuarioService.obtenerPorId(usuarioId);
    }

    @DeleteMapping("/{usuarioId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void desactivarUsuario(@PathVariable Long usuarioId, @AuthenticationPrincipal Jwt jwt){

        validarAcceso(usuarioId, jwt);
        usuarioService.desacativarUsuario(usuarioId);
    }

    @PatchMapping("/{usuarioId}")
    @ResponseStatus(HttpStatus.OK)
    public UsuarioResponseDto actualizarUsuario(@PathVariable Long usuarioId,@RequestBody UsuarioRequestActualizarDto actualizarDto,
                                                @AuthenticationPrincipal Jwt jwt){
        validarAcceso(usuarioId,jwt);
        return usuarioService.actualizarUsuario(usuarioId, actualizarDto );
    }

    private void validarAcceso(Long usuarioId, Jwt jwt){
        if (!jwt.getSubject().equals(String.valueOf(usuarioId))){
            throw new org.springframework.web.server.ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Acceso denegado");
        }
    }
}
