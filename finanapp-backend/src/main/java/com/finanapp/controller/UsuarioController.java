package com.finanapp.controller;

import com.finanapp.dto.UsuarioRequestActualizarDto;
import com.finanapp.dto.UsuarioRequestDto;
import com.finanapp.dto.UsuarioResponseDto;
import com.finanapp.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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

    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public UsuarioResponseDto buscarPorId(@PathVariable Long id){
        return usuarioService.obtenerPorId(id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void desactivarUsuario(@PathVariable Long id){
        usuarioService.desacativarUsuario(id);
    }

    @PatchMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public UsuarioResponseDto actualizarUsuario(@PathVariable Long id,@RequestBody UsuarioRequestActualizarDto actualizarDto){
        return usuarioService.actualizarUsuario(id, actualizarDto );
    }
}
