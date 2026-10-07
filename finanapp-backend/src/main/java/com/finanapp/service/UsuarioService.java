package com.finanapp.service;

import com.finanapp.dto.UsuarioRequestActualizarDto;
import com.finanapp.dto.UsuarioRequestDto;
import com.finanapp.dto.UsuarioResponseDto;
import com.finanapp.model.Usuario;
import com.finanapp.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioService {
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;


    // Crear usuario (CREATE)
    @Transactional
    public UsuarioResponseDto crearUsuario(UsuarioRequestDto usuarioRequestDto){
        if (usuarioRepository.existsByTelefono(usuarioRequestDto.telefono())) {
            throw new RuntimeException("El teléfono ya está registrado.");
        }
        if (usuarioRepository.existsByEmail(usuarioRequestDto.email())) {
            throw new RuntimeException("El email ya está registrado.");
        }
        Usuario nuevoUsuario = Usuario.builder()
                .nombre(usuarioRequestDto.nombre()).
                telefono(usuarioRequestDto.telefono())
                .email(usuarioRequestDto.email())
                .passwordHash(passwordEncoder.encode(usuarioRequestDto.password()))
                .ocupacion(usuarioRequestDto.ocupacion())
                .activo(true)
                .build();


        Usuario usuarioGuardado = usuarioRepository.save(nuevoUsuario);


        return UsuarioResponseDto.fromEntity(usuarioGuardado);
    }

    // Buscar usuario por id (READ)
    @Transactional(readOnly = true)
    public UsuarioResponseDto obtenerPorId(Long id){
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(()-> new RuntimeException("Usuario no encontrado con Id" + id));
        return UsuarioResponseDto.fromEntity(usuario);
    }

    /* Eliminar (DELETE), En este caso no usamos delete, yua que siendo una app de manejo financiero se borraria
    todo el historial del usuario, por esta razon solo la desactivamos.*/
    @Transactional
    public void desactivarUsuario(Long id){
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(()-> new RuntimeException("Usuario no encontrado con Id" + id));

        usuario.setActivo(false);
        usuarioRepository.save(usuario);

    }

    //Actualizar usuario (UPDATE)

    @Transactional
    public UsuarioResponseDto actualizarUsuario(Long id, UsuarioRequestActualizarDto actualizarRequest){
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(()-> new RuntimeException("Usuario no encontrado con Id" + id));

        boolean cambios = false;
        if (actualizarRequest.nombre()!= null && !actualizarRequest.nombre().isBlank()){
            usuario.setNombre(actualizarRequest.nombre());
            cambios=true;
        }
        if (actualizarRequest.ocupacion()!= null && !actualizarRequest.ocupacion().isBlank()){
            usuario.setOcupacion(actualizarRequest.ocupacion());
            cambios = true;
        }
        if (!cambios){
            throw new RuntimeException("Campos vacios, no se puede actualizar");
        }

        usuarioRepository.save(usuario);
        return UsuarioResponseDto.fromEntity(usuario);
    }


}
