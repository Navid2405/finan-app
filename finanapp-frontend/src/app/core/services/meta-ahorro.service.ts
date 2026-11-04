import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ActualizarMetaAhorro,
  MetaAhorroModel,
  MetaAhorroResponse,
  TotalAhorrado,
} from '../models/meta-ahorro.model';
import { EstadoMetaModel } from '../models/estado-meta.model';
import {
  AporteAhorroModel,
  AporteResponse,
  RetiroAhorro,
} from '../models/aporte-ahorro.model';

@Injectable({
  providedIn: 'root',
})
export class MetaAhorroService {
  private http = inject(HttpClient);

  obtenerMetas(): Observable<MetaAhorroResponse[]> {
    return this.http.get<MetaAhorroResponse[]>(`${environment.apiUrl}/ahorros-metas`);
  }

  obtenerMetasPorEstado(estado: EstadoMetaModel): Observable<MetaAhorroResponse[]> {
    const params = new HttpParams().append('estadoMeta', estado);
    return this.http.get<MetaAhorroResponse[]>(`${environment.apiUrl}/ahorros-metas/metas`, {
      params,
    });
  }

  obtenerTotalAhorrado(estado?: EstadoMetaModel): Observable<TotalAhorrado> {
    let params = new HttpParams();
    if (estado) {
      params = params.append('estadoMeta', estado);
    }
    return this.http.get<TotalAhorrado>(`${environment.apiUrl}/ahorros-metas/ahorrado`, {
      params,
    });
  }

  crearMeta(request: MetaAhorroModel): Observable<MetaAhorroResponse> {
    return this.http.post<MetaAhorroResponse>(`${environment.apiUrl}/ahorros-metas`, request);
  }

  actualizarMeta(id: number, request: ActualizarMetaAhorro): Observable<MetaAhorroResponse> {
    return this.http.patch<MetaAhorroResponse>(
      `${environment.apiUrl}/ahorros-metas/${id}`,
      request
    );
  }

  eliminarMeta(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/ahorros-metas/${id}`);
  }

  // Aportes y Retiros
  crearAporte(request: AporteAhorroModel): Observable<AporteResponse> {
    return this.http.post<AporteResponse>(`${environment.apiUrl}/aportes`, request);
  }

  retirarDinero(request: RetiroAhorro): Observable<MetaAhorroResponse> {
    return this.http.post<MetaAhorroResponse>(`${environment.apiUrl}/aportes/retiro`, request);
  }

  obtenerHistorialAportes(metaId: number): Observable<AporteResponse[]> {
    return this.http.get<AporteResponse[]>(`${environment.apiUrl}/aportes/historial/${metaId}`);
  }
}
