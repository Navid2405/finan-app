import type {TipoTransaccionModel} from './tipo-transaccion.model';
export interface TransaccionModel{
  categoriaId:number
  monto:number,
  descripcion:string,
  metodoPago:string,
  fecha:string,
}

export interface ActualizarTransaccion {
  descripcion:string,
  monto:number,
  metodoPago:string,
  fecha:string,
  tipoTransaccion:TipoTransaccionModel
}

export interface TransaccionResponse{
  id:number,
  usuarioId:number,
  categoriaId:number,
  categoriaNombre: string,
  tipo:TipoTransaccionModel,
  monto:number,
  descripcion:string,
  metodoPago:string,
  fecha:string,
  creadoEn:string
}

export interface BalanceDiario{
  fecha:string,
  ingresos:number,
  gastos:number,
  saldo:number,
  movimientos:number
}
