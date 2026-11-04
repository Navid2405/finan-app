import type {TipoTransaccionModel} from './tipo-transaccion.model';

export interface CategoriaModel {
  nombre: string;
  tipoTransaccion: TipoTransaccionModel;
  icono: string;
}

export interface CategoriaResponse {
  id: number;
  usuarioId: number | null;
  nombre: string;
  tipoTransaccion: TipoTransaccionModel;
  icono: string;
}

export interface ActualizarCategoria {
  nombre?: string;
  tipo?: TipoTransaccionModel;
  icono?: string;
}
