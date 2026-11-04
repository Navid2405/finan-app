import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ActualizarTransaccion,
  BalanceDiario,
  TransaccionModel,
  TransaccionResponse,
} from '../models/transaccion.model';

@Injectable({
  providedIn: 'root',
})
export class TransaccionService {
  private http = inject(HttpClient);

  obtenerTransacciones(fechaInicio?: string, fechaFin?: string): Observable<TransaccionResponse[]> {
    let params = new HttpParams();
    if (fechaInicio) {
      params = params.append('fechaInicio', fechaInicio);
    }
    if (fechaFin) {
      params = params.append('fechaFin', fechaFin);
    }
    return this.http.get<TransaccionResponse[]>(`${environment.apiUrl}/transaccion/usuario`, {
      params,
    });
  }

  crearTransaccion(request: TransaccionModel): Observable<TransaccionResponse> {
    return this.http.post<TransaccionResponse>(`${environment.apiUrl}/transaccion`, request);
  }

  actualizarTransaccion(id: number, request: ActualizarTransaccion): Observable<TransaccionResponse> {
    return this.http.patch<TransaccionResponse>(
      `${environment.apiUrl}/transaccion/${id}`,
      request
    );
  }

  eliminarTransaccion(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/transaccion/${id}`);
  }

  obtenerBalance(fecha?: string): Observable<BalanceDiario> {
    let params = new HttpParams();
    if (fecha) {
      params = params.append('fecha', fecha);
    }
    return this.http.get<BalanceDiario>(`${environment.apiUrl}/transaccion/usuario/balance`, {
      params,
    });
  }
}
