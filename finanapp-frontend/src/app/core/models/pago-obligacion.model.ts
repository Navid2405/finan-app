export interface PagoObligacionModel{
  obligacionId:number,
  categoriaId:number,
  metodoPago:string,
  montoPagado:number,
  fechaPago:string
}

export interface PagoObligacionResponse{
  id:number,
  obligacionId:number,
  transaccionId:number,
  montoPagado:number,
  fechaPago:string
}
