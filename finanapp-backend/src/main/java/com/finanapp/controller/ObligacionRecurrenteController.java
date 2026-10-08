package com.finanapp.controller;

import com.finanapp.dto.*;
import com.finanapp.service.ObligacionRecurrenteService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/obligaciones")
@RequiredArgsConstructor
public class ObligacionRecurrenteController {


    private final ObligacionRecurrenteService obligacionRecurrenteService;
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ObligacionRecurrenteResponseDto crearObligacion(@Valid @RequestBody ObligacionRecurrenteRequestDto obligacionRecurrenteRequestDto,
                                                           @AuthenticationPrincipal Jwt jwt){
        Long usuarioId= Long.valueOf(jwt.getSubject());
        return obligacionRecurrenteService.crearObligacion(usuarioId, obligacionRecurrenteRequestDto);
    }

    @GetMapping("/usuario")
    @ResponseStatus(HttpStatus.OK)
    public List<ObligacionRecurrenteResponseDto> obtenerTodasObligaciones (@AuthenticationPrincipal Jwt jwt){

        Long usuarioId= Long.valueOf(jwt.getSubject());
        return obligacionRecurrenteService.obtenerObligaciones(usuarioId);
    }

    @GetMapping("/usuario/activas")
    @ResponseStatus(HttpStatus.OK)
    public List<ObligacionRecurrenteResponseDto> obtenerObligacionesActivas (@AuthenticationPrincipal Jwt jwt){
        Long usuarioId= Long.valueOf(jwt.getSubject());
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

    @GetMapping("/usuario/cuota-seguridad")
    @ResponseStatus(HttpStatus.OK)
    public CuotaSeguridadResponseDto cuotaSeguridad(@AuthenticationPrincipal Jwt jwt){
        Long usuarioId= Long.valueOf(jwt.getSubject());
        BigDecimal cuota =obligacionRecurrenteService.obtenerCuotaDiariaSeguridad(usuarioId);
        return new CuotaSeguridadResponseDto(cuota != null ? cuota : BigDecimal.ZERO);
    }

}
