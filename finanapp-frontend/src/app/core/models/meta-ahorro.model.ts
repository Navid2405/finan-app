import type {EstadoMetaModel} from './estado-meta.model';

export interface MetaAhorroModel{
  titulo:string,
  montoObjetivo:number,
  fechaLimite:string
}

export interface ActualizarMetaAhorro{
  titulo:string,
  montoObjetivo:number,
  fechaLimite:string
}

export interface MetaAhorroResponse{
  id:number,
  usuarioId:number,
  titulo:string,
  montoObjetivo:number,
  montoAcumulado:number,
  fechaLimite:string,
  estado:EstadoMetaModel
}

export interface TotalAhorrado{
  totalAhorrado:number
}
