package com.finanapp.repository;

import com.finanapp.model.TipoTransaccion;
import com.finanapp.model.Transaccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import javax.swing.text.html.Option;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransaccionRepository extends JpaRepository<Transaccion, Long> {

    List<Transaccion> findByUsuarioIdAndFechaOrderByCreadoEnDesc(Long usuarioId, LocalDate fecha);

    @Query("SELECT COALESCE(SUM(t.monto), 0) FROM Transaccion t " +
            "WHERE t.usuario.id = :usuarioId AND t.fecha = :fecha AND t.tipoTransaccion = :tipo")
    BigDecimal sumarMontoPorUsuarioFechaYTipo(
            @Param("usuarioId") Long usuarioId,
            @Param("fecha") LocalDate fecha,
            @Param("tipo") TipoTransaccion tipo
    );

    long countByUsuarioIdAndFecha(Long usuarioId, LocalDate fecha);
}
