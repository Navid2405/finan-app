import {inject, Injectable, signal} from '@angular/core'
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {CategoriaModel, ActualizarCategoria, CategoriaResponse} from '../models/categoria.model';
import {TipoTransaccionModel} from '../models/tipo-transaccion.model';

@Injectable(
  {
    providedIn:'root'
  }
)


export class CategoriaService{
  private http = inject(HttpClient);

  obtenerCategorias(tipo?:TipoTransaccionModel):Observable<CategoriaResponse[]>{
    let queryParams = new HttpParams();
    if (tipo){
      queryParams = queryParams.append('tipo', tipo);
    }
    return this.http.get<CategoriaResponse[]>(`${environment.apiUrl}/categoria/listar`, {params: queryParams});
  }

  crearCategoria(categoriaRequest:CategoriaModel):Observable<CategoriaResponse>{
    return this.http.post<CategoriaResponse>(`${environment.apiUrl}/categoria`,categoriaRequest);
  }

  actualizarCategoria(idCategoria:number, reuestActualizar:ActualizarCategoria):Observable<CategoriaResponse>{
    return this.http.patch<CategoriaResponse>(`${environment.apiUrl}/categoria/actualizar/${idCategoria}`, reuestActualizar);
  }

  eliminarCategoria(idCategoria:number):Observable<void>{
    return this.http.delete<void>(`${environment.apiUrl}/categoria/eliminar/${idCategoria}`);

  }
}
