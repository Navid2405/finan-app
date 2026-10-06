package com.finanapp.controller;

import com.finanapp.dto.AuthLoginRequestDto;
import com.finanapp.dto.AuthLoginResponseDto;
import com.finanapp.service.AuthLoginService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthLoginController {

    private final AuthLoginService authLoginService;

    @PostMapping("/login")
    public AuthLoginResponseDto login(@Valid @RequestBody AuthLoginRequestDto requestDto) {
        return authLoginService.login(requestDto);
    }

}
