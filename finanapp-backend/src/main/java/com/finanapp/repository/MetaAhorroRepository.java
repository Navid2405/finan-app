package com.finanapp.repository;

import com.finanapp.model.EstadoMeta;
import com.finanapp.model.MetasAhorro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface MetaAhorroRepository extends JpaRepository<MetasAhorro, Long> {


    List<MetasAhorro> findByUsuarioId(Long usuarioId);

    List<MetasAhorro> findByUsuarioIdAndEstado(Long usuarioId, EstadoMeta estado);

    @Query("SELECT COALESCE(SUM(m.montoAcumulado), 0) FROM MetasAhorro m " +
            "WHERE m.usuario.id = :usuarioId AND m.estado = :estado")
    BigDecimal sumarTotalAhorradoPorUsuario(Long usuarioId, EstadoMeta estado);
}
