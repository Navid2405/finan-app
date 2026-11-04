export type TipoNotificacion = 'DEUDA' | 'AHORRO' | 'TRANSACCION' | 'SISTEMA' | 'CONSEJO';
export type PrioridadNotificacion = 'ALTA' | 'MEDIA' | 'BAJA';

export interface Notificacion {
  id: string;
  titulo: string;
  mensaje: string;
  tipo: TipoNotificacion;
  prioridad: PrioridadNotificacion;
  fecha: string;
  leida: boolean;
  rutaAccion?: string;
  textoAccion?: string;
  icono?: string;
}

export type FiltroNotificacion = 'TODAS' | 'NO_LEIDAS' | 'DEUDA' | 'AHORRO' | 'SISTEMA';
