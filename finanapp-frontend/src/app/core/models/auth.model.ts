import type {UsuarioResponse} from './usuario.model';

export interface AuthModel {
  email:string,
  password:string
}

export interface AuthModelResponse {
  token:string,
  tipo:string,
  expiracionEnSegundos: number,
  usuarioResponseDto:UsuarioResponse
}
