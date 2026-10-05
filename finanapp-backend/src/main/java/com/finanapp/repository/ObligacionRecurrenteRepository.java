package com.finanapp.repository;

import com.finanapp.model.ObligacionRecurrente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ObligacionRecurrenteRepository extends JpaRepository<ObligacionRecurrente, Long> {


    List<ObligacionRecurrente> findByUsuarioId(Long usuarioId);

    List<ObligacionRecurrente> findByUsuarioIdAndActivaTrue(Long usuarioId);
}
