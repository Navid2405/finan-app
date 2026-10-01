package com.finanapp.repository;


import com.finanapp.model.Categoria;
import com.finanapp.model.TipoTransaccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria,Long> {

    List<Categoria> findByTipo(TipoTransaccion tipo);

    List<Categoria> findByIdUsuarioOrUsuarioIsNull(Long usuarioId);
}
