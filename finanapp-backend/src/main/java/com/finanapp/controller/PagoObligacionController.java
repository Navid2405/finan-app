package com.finanapp.controller;

import com.finanapp.dto.PagoObligacionRequestDto;
import com.finanapp.dto.PagoObligacionResponseDto;
import com.finanapp.service.PagoObligacionService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/api/pagos")
public class PagoObligacionController {

    private final PagoObligacionService pagoObligacionService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PagoObligacionResponseDto crearPago (@Valid@RequestBody PagoObligacionRequestDto requestDto){
        return pagoObligacionService.crearPago(requestDto);
    }

    @GetMapping("/obligaciones/{obligacionId}")
    @ResponseStatus(HttpStatus.OK)
    public List<PagoObligacionResponseDto> obtenerHistorialPagoObligacion (@PathVariable long obligacionId){
        return pagoObligacionService.obtnerHistorialPagosPorObligacion(obligacionId);
    }
}
