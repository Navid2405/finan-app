package com.finanapp.controller;

import com.finanapp.dto.AporteAhorroRequestDto;
import com.finanapp.dto.AporteAhorroResponseDto;
import com.finanapp.dto.MetaAhorroResponseDto;
import com.finanapp.dto.RetiroAhorroRequestDto;
import com.finanapp.service.AporteAhorroService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/aportes")
@AllArgsConstructor
public class AporteAhorroController {

    private final AporteAhorroService aporteService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AporteAhorroResponseDto crearAporte (@Valid @RequestBody AporteAhorroRequestDto requestDto,
                                                @AuthenticationPrincipal Jwt jwt){

        Long usuarioId = Long.valueOf(jwt.getSubject());
        return aporteService.crearAporte(usuarioId, requestDto);
    }

    @PostMapping("/retiro")
    @ResponseStatus(HttpStatus.OK)
    public MetaAhorroResponseDto retirarDinero (@Valid @RequestBody RetiroAhorroRequestDto requestDto,
                                                @AuthenticationPrincipal Jwt jwt){
        Long usuarioId = Long.valueOf(jwt.getSubject());
        return aporteService.retirarDinero(usuarioId, requestDto);
    }

    @GetMapping("/historial/{metaId}")
    @ResponseStatus(HttpStatus.OK)
    public List<AporteAhorroResponseDto> obtenerHistorial (@PathVariable Long metaId,
                                                           @AuthenticationPrincipal Jwt jwt){
        Long usuarioId = Long.valueOf(jwt.getSubject());
        return aporteService.obtenerHistorial(usuarioId , metaId);
    }
}
