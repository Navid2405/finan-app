import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ActualizarUsuario, UsuarioResponse } from '../models/usuario.model';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private http = inject(HttpClient);

  perfil = signal<UsuarioResponse | null>(null);

  obtenerPerfil(): Observable<UsuarioResponse> {
    return this.http.get<UsuarioResponse>(`${environment.apiUrl}/usuario/perfil`).pipe(
      tap((usuario) => {
        this.perfil.set(usuario);
        if (usuario?.nombre) {
          localStorage.setItem('usuario', usuario.nombre);
        }
      })
    );
  }

  actualizarPerfil(request: ActualizarUsuario): Observable<UsuarioResponse> {
    return this.http
      .patch<UsuarioResponse>(`${environment.apiUrl}/usuario/actualizar`, request)
      .pipe(
        tap((usuario) => {
          this.perfil.set(usuario);
          if (usuario?.nombre) {
            localStorage.setItem('usuario', usuario.nombre);
          }
        })
      );
  }

  desactivarCuenta(): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/usuario/desactivar`);
  }
}
