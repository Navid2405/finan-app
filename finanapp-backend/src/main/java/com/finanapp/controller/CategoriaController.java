package com.finanapp.controller;

import com.finanapp.dto.CategoriaRequestActualizarDto;
import com.finanapp.dto.CategoriaRequestDto;
import com.finanapp.dto.CategoriaResponseDto;
import com.finanapp.model.TipoTransaccion;
import com.finanapp.service.CategoriaService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categoria")
@AllArgsConstructor
public class CategoriaController {
    private final CategoriaService categoriaService;

    @PostMapping
    @ResponseStatus(HttpStatus.ACCEPTED)
    public CategoriaResponseDto crearCategoria (@Valid @RequestBody CategoriaRequestDto requestDto){
        return categoriaService.crearCategoria(requestDto);
    }

    @GetMapping("/{categoriaId}")
    @ResponseStatus(HttpStatus.OK)
    public List<CategoriaResponseDto> obtenerCategorias(@PathVariable Long categoriaId, @RequestParam (required = false) TipoTransaccion tipo){
        return categoriaService.obtenerCategorias(categoriaId, tipo);
    }

    @DeleteMapping("/{categoriaId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminarCategoria ( @PathVariable Long categoriaId, @PathVariable Long usuarioId){
        categoriaService.eliminarCategoria( categoriaId, usuarioId);
    }

    @PatchMapping("/{categoriaId}")
    @ResponseStatus(HttpStatus.OK)
    public CategoriaResponseDto actualizarCategoria(@PathVariable Long categoriaId, @RequestBody CategoriaRequestActualizarDto actualizarDto){
        return categoriaService.actualizarCategoria(categoriaId, actualizarDto);
    }
}
