package com.finanapp.repository;

import com.finanapp.model.EstadoObligacion;
import com.finanapp.model.ObligacionRecurrente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ObligacionRecurrenteRepository extends JpaRepository<ObligacionRecurrente, Long> {


    List<ObligacionRecurrente> findByUsuarioId(Long usuarioId);

    List<ObligacionRecurrente> findByUsuarioIdAndActivaTrue(Long usuarioId);

    List<ObligacionRecurrente> findByUsuarioIdAndEstado(Long usuarioId, EstadoObligacion estado);
    @Query(value = "SELECT COALESCE(SUM(saldo_pendiente / GREATEST(1, (proximo_vencimiento - CURRENT_DATE))), 0)\n" +
            "FROM obligaciones_recurrentes\n" +
            "WHERE usuario_id = :usuarioId AND activa = true AND saldo_pendiente > 0", nativeQuery = true)
    BigDecimal calcularCuotaDiariaDeSeguridad(Long usuarioId);


}
