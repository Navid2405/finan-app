package com.finanapp.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jdk.jfr.Enabled;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.engine.profile.Fetch;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "obligaciones_recurrentes")
public class ObligacionRecurrente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @NotBlank(message = "El nombre no puede estar vacio")
    @Column(length = 50, nullable = false)
    private String nombre;

    @NotNull(message = "El monto no puede estar vacio")
    @Positive
    @Column(name = "monto_estimado",nullable = false, precision = 12, scale = 2)
    private BigDecimal monto;

    @Column(name = "saldo_pendiente", nullable = false, precision = 12, scale = 2)
    private BigDecimal saldoPendiente;

    @NotNull(message = "La frecuencia no puede estar vacia")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, name = "frecuencia")
    private Frecuencia frecuencia;

    @NotNull(message = "El estado no puede estar vacia")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, name = "estado")
    private EstadoObligacion estado;

    @Positive
    @Column(nullable = false, name = "dia_limite_pago")
    private Integer diaLimitePago;

    @Column(nullable = false)
    private LocalDate proximoVencimiento;

    @Column(nullable = false)
    private boolean activa;
}
