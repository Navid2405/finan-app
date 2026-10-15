import {inject, Injectable, signal} from '@angular/core'
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AuthModel} from '../models/auth.model';
import {AuthModelResponse} from '../models/auth.model';
import {tap} from 'rxjs/operators';
import {environment} from '../../../environments/environment';
import {UsuarioModel, UsuarioResponse} from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})

export class AuthService{
  private http=inject(HttpClient);

  private conectado = signal(
    localStorage.getItem('token') !== null
  );
  public conectadoRead = this.conectado.asReadonly();

  login(authRequest:AuthModel):Observable<AuthModelResponse>{
    return this.http.post<AuthModelResponse>(`${environment.apiUrl}/auth/login`, authRequest).pipe(
      tap((response)=> {
        this.conectado.set(true);
        localStorage.setItem('token', response.token);
        localStorage.setItem('usuario', response.usuarioResponseDto.nombre);
        }

      )
    );
  }

  logout(){
    localStorage.removeItem('token');
    this.conectado.set(false);
  }

  registro(usuarioRequest:UsuarioModel):Observable<UsuarioResponse>{
    return this.http.post<UsuarioResponse>(`${environment.apiUrl}/usuario`, usuarioRequest).pipe(
      tap((response)=> {
        localStorage.setItem('usuarioNuevo', response.nombre);
        localStorage.setItem('usuarioNuevoEmail', response.email);

        }

      )
    );
  }
}
