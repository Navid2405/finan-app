package com.finanapp.controller;

import com.finanapp.dto.ObligacionRecurrenteRequestActualizarDto;
import com.finanapp.dto.ObligacionRecurrenteRequestDto;
import com.finanapp.dto.ObligacionRecurrenteResponseDto;
import com.finanapp.service.ObligacionRecurrenteService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/obligaciones")
@RequiredArgsConstructor
public class ObligacionRecurrenteController {


    private final ObligacionRecurrenteService obligacionRecurrenteService;
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ObligacionRecurrenteResponseDto crearObligacion(@Valid @RequestBody ObligacionRecurrenteRequestDto obligacionRecurrenteRequestDto){
        return obligacionRecurrenteService.crearObligacion(obligacionRecurrenteRequestDto);
    }

    @GetMapping("/usuario/{usuarioId}")
    @ResponseStatus(HttpStatus.OK)
    public List<ObligacionRecurrenteResponseDto> obtenerTodasObligaciones (@PathVariable Long usuarioId){
        return obligacionRecurrenteService.obtenerObligaciones(usuarioId);
    }

    @GetMapping("/usuario/{usuarioId}/activas")
    @ResponseStatus(HttpStatus.OK)
    public List<ObligacionRecurrenteResponseDto> obtenerObligacionesActivas (@PathVariable Long usuarioId){
        return obligacionRecurrenteService.obtenerObligacionesActivas(usuarioId);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void desactivarObligacion (@PathVariable Long id){
        obligacionRecurrenteService.desactivarObligacion(id);
    }

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public ObligacionRecurrenteResponseDto actualizarObligacion(@PathVariable Long id,@Valid @RequestBody ObligacionRecurrenteRequestActualizarDto actualizarDto){
        return  obligacionRecurrenteService.actualizarObligacion(id, actualizarDto);
    }




}
