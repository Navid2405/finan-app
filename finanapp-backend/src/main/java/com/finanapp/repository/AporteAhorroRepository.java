package com.finanapp.repository;

import com.finanapp.model.AporteAhorro;
import org.hibernate.query.criteria.JpaCoalesce;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface AporteAhorroRepository extends JpaRepository<AporteAhorro, Long> {


    List<AporteAhorro> findByMetaIdOrderByFechaDesc(Long metaId);

    @Query("SELECT COALESCE(SUM(a.monto), 0) FROM AporteAhorro a WHERE a.meta.id = :metaId")
    BigDecimal sumarTotalAportesPorMeta(Long metaId);
}
