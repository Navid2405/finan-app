import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LayoutService } from '../../../core/services/layout.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {
  authService = inject(AuthService);
  layoutService = inject(LayoutService);
  private router = inject(Router);

  nombreUsuario = signal<string>(localStorage.getItem('usuario') || 'Usuario');

  navegarYCerrar(): void {
    this.layoutService.cerrar();
  }

  cerrarSesion(): void {
    this.layoutService.cerrar();
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
