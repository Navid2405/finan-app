import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ActualizarObligacion,
  CuotaSeguridad,
  ObligacionModel,
  ObligacionResponse,
} from '../models/obligacion.model';
import { EstadoObligacionModel } from '../models/estado-obligacion.model';
import {
  PagoObligacionModel,
  PagoObligacionResponse,
} from '../models/pago-obligacion.model';

@Injectable({
  providedIn: 'root',
})
export class ObligacionService {
  private http = inject(HttpClient);

  obtenerObligaciones(): Observable<ObligacionResponse[]> {
    return this.http.get<ObligacionResponse[]>(`${environment.apiUrl}/obligaciones/usuario`);
  }

  obtenerObligacionesActivas(): Observable<ObligacionResponse[]> {
    return this.http.get<ObligacionResponse[]>(`${environment.apiUrl}/obligaciones/usuario/activas`);
  }

  crearObligacion(request: ObligacionModel): Observable<ObligacionResponse> {
    return this.http.post<ObligacionResponse>(`${environment.apiUrl}/obligaciones`, request);
  }

  actualizarObligacion(id: number, request: ActualizarObligacion): Observable<ObligacionResponse> {
    return this.http.patch<ObligacionResponse>(`${environment.apiUrl}/obligaciones/${id}`, request);
  }

  desactivarObligacion(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/obligaciones/${id}`);
  }

  obtenerPorEstado(estado: EstadoObligacionModel): Observable<ObligacionResponse[]> {
    return this.http.get<ObligacionResponse[]>(`${environment.apiUrl}/obligaciones/${estado}`);
  }

  obtenerCuotaSeguridad(): Observable<CuotaSeguridad> {
    return this.http.get<CuotaSeguridad>(`${environment.apiUrl}/obligaciones/usuario/cuota-seguridad`);
  }

  // Pagos de obligación
  crearPago(request: PagoObligacionModel): Observable<PagoObligacionResponse> {
    return this.http.post<PagoObligacionResponse>(`${environment.apiUrl}/pagos`, request);
  }

  obtenerHistorialPagos(obligacionId: number): Observable<PagoObligacionResponse[]> {
    return this.http.get<PagoObligacionResponse[]>(
      `${environment.apiUrl}/pagos/obligaciones/${obligacionId}`
    );
  }
}
