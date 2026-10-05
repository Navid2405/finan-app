package com.finanapp.model;

import jakarta.persistence.*;
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
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "pagos_obligacion")
public class PagoObligacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "obligacion_id")
    private ObligacionRecurrente obligacion;

    @ManyToOne
    @JoinColumn(name = "transaccion_id")
    private Transaccion transaccion;

    @NotNull(message = "El monto no puede estar vacio")
    @Positive
    @Column(name = "monto_pagado",nullable = false, precision = 12, scale = 2)
    private BigDecimal montoPagado;

    @Column(nullable = false, name = "fecha_pago")
    private LocalDate fechaPago;




}
