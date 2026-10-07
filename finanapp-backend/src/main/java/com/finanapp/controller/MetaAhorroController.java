package com.finanapp.controller;

import com.finanapp.dto.MetaAhorroRequestActualizarDto;
import com.finanapp.dto.MetaAhorroRequestDto;
import com.finanapp.dto.MetaAhorroResponseDto;
import com.finanapp.model.EstadoMeta;
import com.finanapp.service.MetaAhorroService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("api/ahorros-metas")
@AllArgsConstructor
public class MetaAhorroController {

    private final MetaAhorroService metaService;


    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MetaAhorroResponseDto crearMeta (@Valid @RequestBody MetaAhorroRequestDto requestDto, @AuthenticationPrincipal Jwt jwt){
        Long usuarioId = Long.valueOf(jwt.getSubject());
        return metaService.crearMeta(usuarioId, requestDto);
    }

    @GetMapping("/metas")
    @ResponseStatus(HttpStatus.OK)
    public List<MetaAhorroResponseDto> obtenerMetasDeUsuario( @AuthenticationPrincipal Jwt jwt){
        Long usuarioId = Long.valueOf(jwt.getSubject());
        return metaService.obtenerMetasPorUsuarioId(usuarioId);
    }

    @GetMapping("/metas/" )
    @ResponseStatus(HttpStatus.OK)
    public List<MetaAhorroResponseDto> obtenerMetasPorIdYEstado (@AuthenticationPrincipal Jwt jwt,
                                                                 @RequestParam(defaultValue = "EN_PROGRESO") EstadoMeta estadoMeta){

        Long usuarioId = Long.valueOf(jwt.getSubject());
        return metaService.obtenerMetasPorIdyEstado(usuarioId, estadoMeta);
    }

    @GetMapping()
    @ResponseStatus(HttpStatus.OK)
    public BigDecimal totalAhorro(@AuthenticationPrincipal Jwt jwt,
                                  @RequestParam(defaultValue = "EN_PROGRESO") EstadoMeta estadoMeta) {
        Long usuarioId = Long.valueOf(jwt.getSubject());
        return  metaService.totalAhorrado(usuarioId, estadoMeta);
    }

    @PatchMapping("/{metaId}")
    @ResponseStatus(HttpStatus.OK)
    public MetaAhorroResponseDto actualizarMeta(@PathVariable Long metaId, @Valid@RequestBody MetaAhorroRequestActualizarDto requestDto,
                                                @AuthenticationPrincipal Jwt jwt){
        Long usuarioId = Long.valueOf(jwt.getSubject());
        return metaService.actualizarMeta(usuarioId ,metaId, requestDto);
    }

    @DeleteMapping("/{metaId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void desactivarMeta(@PathVariable Long metaId , @AuthenticationPrincipal Jwt jwt){
        Long usuarioId = Long.valueOf(jwt.getSubject());
        metaService.eliminarMeta(usuarioId, metaId);
    }


}
