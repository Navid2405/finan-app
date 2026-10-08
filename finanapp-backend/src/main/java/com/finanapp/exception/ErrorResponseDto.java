package com.finanapp.exception;

import java.time.LocalDateTime;
import java.util.List;

public record ErrorResponseDto(
        LocalDateTime timestamp,
        int status,
        String error,
        String mensaje,
        String path,
        List<String> detalles
) {
    public ErrorResponseDto(int status, String error, String mensaje, String path) {
        this(LocalDateTime.now(), status, error, mensaje, path, null);
    }
    public ErrorResponseDto(int status, String error, String mensaje, String path, List<String> detalles) {
        this(LocalDateTime.now(), status, error, mensaje, path, detalles);
    }
}
