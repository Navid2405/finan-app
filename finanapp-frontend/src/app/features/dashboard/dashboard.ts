import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LayoutService } from '../../core/services/layout.service';
import { NotificacionService } from '../../core/services/notificacion.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private router = inject(Router);
  layoutService = inject(LayoutService);
  notificacionService = inject(NotificacionService);

  irACrear(tipo: 'INGRESO' | 'GASTO'): void {
    this.router.navigate(['/transacciones'], { queryParams: { nuevo: tipo } });
  }

  irANotificaciones(): void {
    this.router.navigate(['/notificaciones']);
  }
}
