import type {FrecuenciaModel} from './frecuencia.model';
import type {EstadoObligacionModel} from './estado-obligacion.model';

export interface ObligacionModel{
  nombre:string,
  monto:number,
  frecuencia:FrecuenciaModel,
  diaLimitePago:number,
  proximoVencimiento:string
}

export interface ActualizarObligacion{
  nombre:string,
  monto:number,
  frecuencia:FrecuenciaModel,
  diaLimitePago:number,
  proximoVencimiento:string
}


export interface ObligacionResponse{
  id:number,
  usuarioId:number,
  nombre:string,
  monto:number,
  saldoPendiente:number,
  frecuencia:FrecuenciaModel,
  diaLimitePago:number,
  proximoVencimiento:string,
  estado:EstadoObligacionModel,
  activa:boolean
}

export interface CuotaSeguridad{
  cuotaSeguridad:number
}
