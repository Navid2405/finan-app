package com.finanapp.repository;

import com.finanapp.model.TipoTransaccion;
import com.finanapp.model.Transaccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;


@Repository
public interface TransaccionRepository extends JpaRepository<Transaccion, Long> {

    List<Transaccion> findByUsuarioIdAndFechaOrderByCreadoEnDesc(Long usuarioId, LocalDate fecha);
    List<Transaccion> findByUsuarioIdOrderByFechaDescCreadoEnDesc(Long usuarioId);
    List<Transaccion> findByUsuarioIdAndFechaBetweenOrderByFechaDescCreadoEnDesc(
            Long usuarioId, LocalDate fechaInicio, LocalDate fechaFin);
    @Query("SELECT COALESCE(SUM(t.monto), 0) FROM Transaccion t " +
            "WHERE t.usuario.id = :usuarioId AND t.fecha = :fecha AND t.tipoTransaccion = :tipo")
    BigDecimal sumarMontoPorUsuarioFechaYTipo(
            @Param("usuarioId") Long usuarioId,
            @Param("fecha") LocalDate fecha,
            @Param("tipo") TipoTransaccion tipo
    );


    long countByUsuarioIdAndFecha(Long usuarioId, LocalDate fecha);
}
