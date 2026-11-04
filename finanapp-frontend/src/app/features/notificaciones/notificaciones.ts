import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FiltroNotificacion, Notificacion } from '../../core/models/notificacion.model';
import { NotificacionService } from '../../core/services/notificacion.service';

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './notificaciones.html',
  styleUrl: './notificaciones.css',
})
export class NotificacionesComponent {
  notificacionService = inject(NotificacionService);
  private router = inject(Router);

  filtroActual = signal<FiltroNotificacion>('TODAS');
  busqueda = signal<string>('');
  toast = signal<{ mensaje: string; tipo: 'exito' | 'error' | 'info' } | null>(null);
  modalConfirmarLimpiar = signal<boolean>(false);

  // Lista de notificaciones filtradas por pestaña y término de búsqueda
  notificacionesFiltradas = computed(() => {
    const lista = this.notificacionService.notificaciones();
    const filtro = this.filtroActual();
    const q = this.busqueda().trim().toLowerCase();

    return lista.filter((n) => {
      // 1. Filtro por categoría
      if (filtro === 'NO_LEIDAS' && n.leida) return false;
      if (filtro === 'DEUDA' && n.tipo !== 'DEUDA') return false;
      if (filtro === 'AHORRO' && n.tipo !== 'AHORRO') return false;
      if (filtro === 'SISTEMA' && n.tipo !== 'SISTEMA' && n.tipo !== 'CONSEJO') return false;

      // 2. Filtro por búsqueda
      if (q) {
        const enTitulo = n.titulo.toLowerCase().includes(q);
        const enMensaje = n.mensaje.toLowerCase().includes(q);
        return enTitulo || enMensaje;
      }

      return true;
    });
  });

  cambiarFiltro(filtro: FiltroNotificacion): void {
    this.filtroActual.set(filtro);
  }

  marcarLeida(id: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.notificacionService.marcarComoLeida(id);
  }

  marcarTodas(): void {
    this.notificacionService.marcarTodasComoLeidas();
    this.mostrarToast('Todas las alertas fueron marcadas como leídas', 'exito');
  }

  eliminar(id: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.notificacionService.eliminarNotificacion(id);
    this.mostrarToast('Notificación eliminada', 'info');
  }

  abrirConfirmacionLimpiar(): void {
    this.modalConfirmarLimpiar.set(true);
  }

  cerrarConfirmacionLimpiar(): void {
    this.modalConfirmarLimpiar.set(false);
  }

  confirmarLimpiarTodas(): void {
    this.notificacionService.limpiarTodas();
    this.modalConfirmarLimpiar.set(false);
    this.mostrarToast('Bandeja de notificaciones vaciada', 'info');
  }

  sincronizarAlertas(): void {
    this.notificacionService.sincronizar();
    this.mostrarToast('Alertas sincronizadas con tus deudas y metas', 'exito');
  }

  ejecutarAccion(ruta?: string, notifId?: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (notifId) {
      this.notificacionService.marcarComoLeida(notifId);
    }
    if (ruta) {
      this.router.navigate([ruta]);
    }
  }

  formatearFechaRelativa(fechaIso: string): string {
    try {
      const fecha = new Date(fechaIso);
      const ahora = new Date();
      const diffMs = ahora.getTime() - fecha.getTime();
      const diffMin = Math.floor(diffMs / (1000 * 60));
      const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMin < 1) return 'Ahora mismo';
      if (diffMin < 60) return `Hace ${diffMin} min`;
      if (diffHoras < 24 && ahora.getDate() === fecha.getDate()) {
        return `Hoy, ${fecha.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`;
      }
      if (diffDias === 1) return 'Ayer';
      if (diffDias < 7) return `Hace ${diffDias} días`;

      return fecha.toLocaleDateString('es-CO', {
        day: '2-digit',
        month: 'short',
      });
    } catch {
      return '';
    }
  }

  mostrarToast(mensaje: string, tipo: 'exito' | 'error' | 'info'): void {
    this.toast.set({ mensaje, tipo });
    setTimeout(() => {
      this.toast.set(null);
    }, 3000);
  }
}
