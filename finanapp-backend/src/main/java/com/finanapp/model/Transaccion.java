package com.finanapp.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Data
@Builder
@Table(name = "transacciones")
@NoArgsConstructor
@AllArgsConstructor
public class Transaccion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "categoria_id")
    private Categoria categoria;

    @NotNull(message = "El tipo de transaccion no puede estar vacio")
    @Column(name = "tipo", nullable = false)
    @Enumerated(EnumType.STRING)
    private TipoTransaccion tipoTransaccion;

    @NotNull(message = "El monto no puede estar vacio")
    @Positive
    @Column(nullable = false, precision = 12, scale = 2  )
    private BigDecimal monto;

    @NotBlank(message = "La descripcion no puede estar vacia")
    @Column(nullable = false, length = 100)
    private String descripcion;

    @NotBlank(message = "El metodo de pago no puede estar vacio")
    @Column(name = "metodo_pago", nullable = false)
    private String metodoPago;

    @Column(nullable = false)
    private LocalDate fecha;

    @Column(name = "creado_en")
    private LocalDateTime creadoEn;

    @PrePersist
    protected void create() {
        this.creadoEn = LocalDateTime.now();
        if (this.fecha == null) {
            this.fecha = LocalDate.now();
        }
    }
}
