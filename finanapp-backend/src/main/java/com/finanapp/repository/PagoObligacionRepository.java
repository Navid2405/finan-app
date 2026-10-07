package com.finanapp.repository;

import com.finanapp.model.PagoObligacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PagoObligacionRepository extends JpaRepository<PagoObligacion, Long> {

    List<PagoObligacion> findByObligacionId(Long obligacionId);

    boolean existsByTransaccionId(Long transaccionId);
}
