import type {TipoTransaccionModel} from './tipo-transaccion.model';

export interface CategoriaModel{
  nombre:string,
  tipoTransaccion:TipoTransaccionModel,
  icono:string
}

export interface CategoriaResponse{
  nombre:string
  id:number,
  usuarioId:number| null,
  tipoTransaccion:TipoTransaccionModel,
  icono:string
}

export interface ActualizarCategoria {
  nombre: string,
  tipo: TipoTransaccionModel,
  icono: string
}
