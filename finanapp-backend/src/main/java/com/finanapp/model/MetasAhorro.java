package com.finanapp.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "metas_ahorro")
public class MetasAhorro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @NotBlank(message = "El titulo no puede estar vacio")
    @Column(nullable = false, length = 100)
    private String titulo;

    @NotNull(message = "El monto objetivo no puede estar vacio")
    @Positive(message = "El valor debe ser mayor a 0")
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal montoObjetivo;

    @Column( precision = 12, scale = 2)
    private BigDecimal montoAcumulado;

    @Column(nullable = false)
    private LocalDate fechaLimite;

    @NotNull(message = "El estado no puede estar vacio")
    @Enumerated(EnumType.STRING)
    @Column(name = "estado")
    private EstadoMeta estado;




}
