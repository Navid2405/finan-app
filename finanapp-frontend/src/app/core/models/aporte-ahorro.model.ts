export interface AporteAhorroModel{
  metaId:number,
  categoriaId:number,
  monto:number,
  metodoPago:string,
  fecha:string,
  nota:string
}
export interface AporteResponse{
  id:number,
  metaId:number,
  monto:number,
  fecha:string,
  nota:string
}

export interface RetiroAhorro{
  metaId:number,
  categoriaId:number,
  montoRetiro:number,
  metodoPago:string,
  descripcion:string,
  fecha:string
}
