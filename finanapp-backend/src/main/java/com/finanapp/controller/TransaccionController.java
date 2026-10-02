package com.finanapp.controller;

import com.finanapp.dto.TransaccionRequestActualizarDto;
import com.finanapp.dto.TransaccionRequestDto;
import com.finanapp.dto.TransaccionResponseDto;
import com.finanapp.model.Transaccion;
import com.finanapp.service.TransaccionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.hibernate.annotations.Fetch;
import org.springframework.http.HttpStatus;
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
    public TransaccionResponseDto crearTransaccion( @Valid @RequestBody TransaccionRequestDto transaccionRequestDto){
        return transaccionService.crearTransaccion(transaccionRequestDto);
    }


    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public List<TransaccionResponseDto> obtenerTransaccionPorUsuario(@PathVariable Long id, @RequestParam(required = false) LocalDate fecha){
        return transaccionService.obtenerTransaccionesDeUsuario(id, fecha);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminarTransaccion(@PathVariable Long id){
         transaccionService.eliminarTransaccion(id);
    }

    @PatchMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public TransaccionResponseDto actualizarTransaccion(@PathVariable Long id, @RequestBody TransaccionRequestActualizarDto actualizarDto){
        return transaccionService.actualizarTransaccion(id, actualizarDto);
    }
}
