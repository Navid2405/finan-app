package com.finanapp.service;

import com.finanapp.dto.CategoriaRequestActualizarDto;
import com.finanapp.dto.CategoriaRequestDto;
import com.finanapp.dto.CategoriaResponseDto;
import com.finanapp.model.Categoria;
import com.finanapp.model.TipoTransaccion;
import com.finanapp.model.Usuario;
import com.finanapp.repository.CategoriaRepository;
import com.finanapp.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;
    private final UsuarioRepository usuarioRepository;

    //crear categoria (CREATE)
    @Transactional
    public CategoriaResponseDto crearCategoria(CategoriaRequestDto categoriaRequestDto){
        Usuario usuario = usuarioRepository.findById(categoriaRequestDto.usuarioId())
                .orElseThrow(() -> new RuntimeException("No se encontro al usuario con ID: " + categoriaRequestDto.usuarioId()));

        if (!usuario.isActivo()){
            throw new RuntimeException("El usuario no puede realizar esta accion");
        }

        Categoria categoria = Categoria.builder()
                .usuario(usuario)
                .nombre(categoriaRequestDto.nombre())
                .tipo(categoriaRequestDto.tipoTransaccion())
                .icono(categoriaRequestDto.icono())
                .build();

        Categoria nuevCategoria = categoriaRepository.save(categoria);
        return CategoriaResponseDto.fromEntity(nuevCategoria);
    }

    //obtener todas las categorias, globales y creadas por un usuario (READ)
    @Transactional(readOnly = true)
    public List<CategoriaResponseDto> obtenerCategorias (Long id, TipoTransaccion tipoTransaccion){

        List<Categoria> categorias = categoriaRepository.findByUsuarioIdOrUsuarioIsNull(id);

        if (tipoTransaccion != null){
            return categorias.stream()
                    .filter( c -> c.getTipo() == tipoTransaccion)
                    .map(CategoriaResponseDto::fromEntity).toList();
        }

        return categorias.stream().map(CategoriaResponseDto::fromEntity).toList();
    }

    //Eliminar una categoria creada por un usuario

    @Transactional
    public void eliminarCategoria(Long idCategoria, Long idUsuario){

        Categoria categoria = categoriaRepository.findById(idCategoria)
                .orElseThrow(()-> new RuntimeException("No se encontro categoria con el ID: " + idCategoria));

        if (categoria.getUsuario() == null){
            throw new RuntimeException("El usuario no puede eliminar categorias globales");
        }

        if (!categoria.getUsuario().getId().equals(idUsuario)){
            throw new RuntimeException("No puedes eliminar esta categoria");
        }



        categoriaRepository.delete(categoria);
    }

    //Actualizar categoria (UPDATE)
    @Transactional
    public CategoriaResponseDto actualizarCategoria(Long id, CategoriaRequestActualizarDto actualizarDto){
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(()-> new RuntimeException("No se encontro categoria con el ID: " + id));

        if (categoria.getUsuario() == null) {
            throw new RuntimeException("No se pueden modificar las categorías base del sistema.");
        }

        boolean cambios = false;

        if (actualizarDto.icono() != null && !actualizarDto.icono().isBlank()) {
            categoria.setIcono(actualizarDto.icono());
            cambios = true;
        }

        if (actualizarDto.nombre() != null && !actualizarDto.nombre().isBlank()) {
            categoria.setNombre(actualizarDto.nombre());
            cambios = true;
        }

        if (actualizarDto.tipo() != null) {
            categoria.setTipo(actualizarDto.tipo());
            cambios = true;
        }

        if (!cambios){
            throw new RuntimeException("No se han enviado campos validos para actualizar");
        }
        Categoria categoriaActualizada = categoriaRepository.save(categoria);
        return CategoriaResponseDto.fromEntity(categoriaActualizada);

    }
}
