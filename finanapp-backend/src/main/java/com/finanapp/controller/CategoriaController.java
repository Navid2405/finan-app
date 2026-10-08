package com.finanapp.controller;

import com.finanapp.dto.CategoriaRequestActualizarDto;
import com.finanapp.dto.CategoriaRequestDto;
import com.finanapp.dto.CategoriaResponseDto;
import com.finanapp.model.TipoTransaccion;
import com.finanapp.service.CategoriaService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categoria")
@AllArgsConstructor
public class CategoriaController {
    private final CategoriaService categoriaService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CategoriaResponseDto crearCategoria (@Valid @RequestBody CategoriaRequestDto requestDto,
                                                @AuthenticationPrincipal Jwt jwt){
        Long usuarioId = Long.valueOf(jwt.getSubject());
        return categoriaService.crearCategoria(usuarioId,requestDto);
    }

    @GetMapping("/listar")
    @ResponseStatus(HttpStatus.OK)
    public List<CategoriaResponseDto> obtenerCategorias(@RequestParam (required = false) TipoTransaccion tipo, @AuthenticationPrincipal Jwt jwt){
        Long usuarioId = Long.valueOf(jwt.getSubject());
        return categoriaService.obtenerCategorias(usuarioId, tipo);
    }

    @DeleteMapping("/eliminar/{categoriaId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminarCategoria (@PathVariable Long categoriaId, @AuthenticationPrincipal Jwt jwt){
        Long usuarioId = Long.valueOf(jwt.getSubject());
        categoriaService.eliminarCategoria( categoriaId, usuarioId);
    }

    @PatchMapping("/actualizar/{categoriaId}")
    @ResponseStatus(HttpStatus.OK)
    public CategoriaResponseDto actualizarCategoria(@PathVariable Long categoriaId,@Valid @RequestBody CategoriaRequestActualizarDto actualizarDto,
                                                    @AuthenticationPrincipal Jwt jwt){
        Long usuarioId = Long.valueOf(jwt.getSubject());
        return categoriaService.actualizarCategoria(usuarioId, categoriaId, actualizarDto);
    }
}
