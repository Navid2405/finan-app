package com.finanapp.controller;

import com.finanapp.dto.BalanceDiarioDto;
import com.finanapp.dto.TransaccionRequestActualizarDto;
import com.finanapp.dto.TransaccionRequestDto;
import com.finanapp.dto.TransaccionResponseDto;
import com.finanapp.model.Transaccion;
import com.finanapp.service.TransaccionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.hibernate.annotations.Fetch;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/transaccion")
public class TransaccionController {

    private final TransaccionService transaccionService;

    @PostMapping
    @ResponseStatus(HttpStatus.ACCEPTED)
    public TransaccionResponseDto crearTransaccion( @Valid @RequestBody TransaccionRequestDto transaccionRequestDto,
                                                    @AuthenticationPrincipal Jwt jwt){
        Long usuarioId = Long.valueOf(jwt.getSubject());
        return transaccionService.crearTransaccion(usuarioId,transaccionRequestDto);
    }


    @GetMapping("/usuario")
    @ResponseStatus(HttpStatus.OK)
    public List<TransaccionResponseDto> obtenerTransaccionPorUsuario(@RequestParam(required = false) LocalDate fechaInicio,
                                                                     @RequestParam(required = false) LocalDate fechaFin,
                                                                     @AuthenticationPrincipal Jwt jwt){
        Long usuarioId = Long.valueOf(jwt.getSubject());
        return transaccionService.obtenerTransaccionesDeUsuario(usuarioId, fechaInicio, fechaFin);
    }

    @DeleteMapping("/{transaccionId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminarTransaccion(@PathVariable Long transaccionId,
                                    @AuthenticationPrincipal Jwt jwt){
        Long usuarioId = Long.valueOf(jwt.getSubject());
        transaccionService.eliminarTransaccion(usuarioId, transaccionId);
    }

    @PatchMapping("/{categoriaId}")
    @ResponseStatus(HttpStatus.OK)
    public TransaccionResponseDto actualizarTransaccion(@PathVariable Long categoriaId, @RequestBody TransaccionRequestActualizarDto actualizarDto,
                                                        @AuthenticationPrincipal Jwt jwt){
        Long usuarioId = Long.valueOf(jwt.getSubject());
        return transaccionService.actualizarTransaccion(usuarioId,categoriaId, actualizarDto);
    }

    @GetMapping("/usuario/balance")
    @ResponseStatus(HttpStatus.OK)
    public BalanceDiarioDto obtenerBalance(@RequestParam(required = false) LocalDate fecha, @AuthenticationPrincipal Jwt jwt) {
        Long usuarioId = Long.valueOf(jwt.getSubject());
        return transaccionService.balanceDiario(usuarioId, fecha);
    }
}
