package com.finanapp.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name="usuarios")
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El nombre no puede estar vacio")
    @Column(nullable = false, length = 100)
    private String nombre;

    @NotBlank(message = "El telefono no puede estar vacio")
    @Column(nullable = false, length = 20, unique = true)
    private String telefono;

    @Email
    @NotBlank(message = "El email no puede estar vacio")
    @Column(nullable = false, length = 100, unique = true)
    private String email;

    @NotBlank(message = "La contraseña no puede estar vacia")
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @NotBlank(message = "La ocupacion no puede estar vacia")
    @Column(nullable = false, length = 60)
    private String ocupacion;

    @Column(nullable = false)
    private boolean activo;

    @Column(name = "creado_en")
    private LocalDateTime creadoEn;

    @PrePersist
    protected void create() {
        this.creadoEn = LocalDateTime.now();
        if (!this.activo) {
            this.activo = true;
        }
    }
}
