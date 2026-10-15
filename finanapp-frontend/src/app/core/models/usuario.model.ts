export interface UsuarioModel{
  nombre:string,
  telefono:string,
  email:string,
  password:string,
  ocupacion:string
}

export interface ActualizarUsuario{

  nombre:string,
  ocupacion:string
}
export interface UsuarioResponse{
  id:number,
  nombre:string,
  telefono:string,
  email:string,
  ocupacion:string,
  creadoEn:string,
  activo:boolean
}
