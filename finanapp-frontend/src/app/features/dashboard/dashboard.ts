import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MetaAhorroResponse } from '../../core/models/meta-ahorro.model';
import { CuotaSeguridad } from '../../core/models/obligacion.model';
import { BalanceDiario, TransaccionResponse } from '../../core/models/transaccion.model';
import { LayoutService } from '../../core/services/layout.service';
import { MetaAhorroService } from '../../core/services/meta-ahorro.service';
import { NotificacionService } from '../../core/services/notificacion.service';
import { ObligacionService } from '../../core/services/obligacion.service';
import { TransaccionService } from '../../core/services/transaccion.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private router = inject(Router);
  layoutService = inject(LayoutService);
  notificacionService = inject(NotificacionService);
  private transaccionService = inject(TransaccionService);
  private obligacionService = inject(ObligacionService);
  private metaAhorroService = inject(MetaAhorroService);

  cargando = signal<boolean>(true);
  balance = signal<BalanceDiario | null>(null);
  cuotaSeguridad = signal<CuotaSeguridad | null>(null);
  metaDestacada = signal<MetaAhorroResponse | null>(null);
  transaccionesRecientes = signal<TransaccionResponse[]>([]);
  nombreUsuario = signal<string>(localStorage.getItem('usuario') || 'Usuario');

  // Porcentaje calculado de la meta destacada
  porcentajeAhorro = computed(() => {
    const meta = this.metaDestacada();
    if (!meta || !meta.montoObjetivo || meta.montoObjetivo <= 0) return 0;
    const pct = Math.round(((meta.montoAcumulado || 0) / meta.montoObjetivo) * 100);
    return Math.min(100, Math.max(0, pct));
  });

  ngOnInit(): void {
    this.cargarDatosDashboard();
  }

  cargarDatosDashboard(): void {
    this.cargando.set(true);

    forkJoin({
      balance: this.transaccionService
        .obtenerBalance()
        .pipe(
          catchError(() =>
            of({ fecha: '', ingresos: 0, gastos: 0, saldo: 0, movimientos: 0 })
          )
        ),
      cuota: this.obligacionService
        .obtenerCuotaSeguridad()
        .pipe(catchError(() => of({ cuotaSeguridad: 0 }))),
      metas: this.metaAhorroService
        .obtenerMetas()
        .pipe(catchError(() => of([]))),
      transacciones: this.transaccionService
        .obtenerTransacciones()
        .pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ balance, cuota, metas, transacciones }) => {
        this.balance.set(balance);
        this.cuotaSeguridad.set(cuota);

        // Meta activa destacada: primera meta en progreso o con saldo restante
        if (Array.isArray(metas) && metas.length > 0) {
          const activa = metas.find(
            (m) => m.estado === 'EN_PROGRESO' || (m.montoAcumulado < m.montoObjetivo)
          );
          this.metaDestacada.set(activa || metas[0]);
        } else {
          this.metaDestacada.set(null);
        }

        // Tomar las 5 transacciones más recientes ordenadas por fecha/id
        if (Array.isArray(transacciones)) {
          const ordenadas = [...transacciones].sort((a, b) => {
            const dateDiff = new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
            return dateDiff !== 0 ? dateDiff : b.id - a.id;
          });
          this.transaccionesRecientes.set(ordenadas.slice(0, 5));
        } else {
          this.transaccionesRecientes.set([]);
        }

        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
      },
    });
  }

  irACrear(tipo: 'INGRESO' | 'GASTO'): void {
    this.router.navigate(['/transacciones'], { queryParams: { nuevo: tipo } });
  }

  irANotificaciones(): void {
    this.router.navigate(['/notificaciones']);
  }
}
