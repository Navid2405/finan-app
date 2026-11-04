import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UsuarioResponse } from '../../core/models/usuario.model';
import { AuthService } from '../../core/services/auth.service';
import { UsuarioService } from '../../core/services/usuario.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class PerfilComponent implements OnInit {
  usuarioService = inject(UsuarioService);
  authService = inject(AuthService);
  private router = inject(Router);

  cargando = signal<boolean>(true);
  guardando = signal<boolean>(false);
  desactivando = signal<boolean>(false);

  // Modales
  modalEditar = signal<boolean>(false);
  modalConfirmarDesactivar = signal<boolean>(false);

  // Formulario de edición
  formNombre = signal<string>('');
  formOcupacion = signal<string>('');
  formError = signal<string | null>(null);

  // Toast
  toast = signal<{ mensaje: string; tipo: 'exito' | 'error' | 'info' } | null>(null);

  // Sugerencias de ocupaciones habituales
  ocupacionesSugeridas: string[] = [
    'Comerciante',
    'Conductor / Repartidor',
    'Independiente',
    'Vendedor ambulante',
    'Técnico / Artesano',
    'Estilista',
    'Constructor',
    'Freelancer',
  ];

  ngOnInit(): void {
    this.cargarDatosPerfil();
  }

  cargarDatosPerfil(): void {
    this.cargando.set(true);
    this.usuarioService.obtenerPerfil().subscribe({
      next: (usuario) => {
        this.cargando.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        this.mostrarToast('Error al cargar la información del perfil', 'error');
      },
    });
  }

  abrirModalEditar(): void {
    const usuario = this.usuarioService.perfil();
    if (usuario) {
      this.formNombre.set(usuario.nombre || '');
      this.formOcupacion.set(usuario.ocupacion || '');
    }
    this.formError.set(null);
    this.modalEditar.set(true);
  }

  cerrarModalEditar(): void {
    this.modalEditar.set(false);
    this.formError.set(null);
  }

  seleccionarOcupacion(ocupacion: string): void {
    this.formOcupacion.set(ocupacion);
  }

  guardarEdicion(): void {
    const nombre = this.formNombre().trim();
    const ocupacion = this.formOcupacion().trim();

    if (!nombre) {
      this.formError.set('El nombre completo es obligatorio');
      return;
    }
    if (nombre.length < 3) {
      this.formError.set('El nombre debe tener al menos 3 caracteres');
      return;
    }
    if (nombre.length > 100) {
      this.formError.set('El nombre no puede exceder 100 caracteres');
      return;
    }

    if (!ocupacion) {
      this.formError.set('La ocupación o actividad económica es obligatoria');
      return;
    }
    if (ocupacion.length > 60) {
      this.formError.set('La ocupación no puede exceder 60 caracteres');
      return;
    }

    this.guardando.set(true);
    this.formError.set(null);

    this.usuarioService
      .actualizarPerfil({
        nombre,
        ocupacion,
      })
      .subscribe({
        next: (usuarioActualizado) => {
          this.guardando.set(false);
          this.cerrarModalEditar();
          this.mostrarToast('Perfil actualizado correctamente', 'exito');
        },
        error: (err) => {
          this.guardando.set(false);
          const msg =
            err.error?.mensaje || err.error?.message || 'Error al actualizar el perfil';
          this.formError.set(msg);
        },
      });
  }

  abrirModalDesactivar(): void {
    this.modalConfirmarDesactivar.set(true);
  }

  cerrarModalDesactivar(): void {
    this.modalConfirmarDesactivar.set(false);
  }

  confirmarDesactivar(): void {
    this.desactivando.set(true);
    this.usuarioService.desactivarCuenta().subscribe({
      next: () => {
        this.desactivando.set(false);
        this.modalConfirmarDesactivar.set(false);
        this.authService.logout();
        this.router.navigate(['/auth/login'], {
          queryParams: { desactivada: 'true' },
        });
      },
      error: () => {
        this.desactivando.set(false);
        this.mostrarToast('No se pudo desactivar la cuenta. Intenta más tarde.', 'error');
      },
    });
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  obtenerIniciales(nombre?: string): string {
    if (!nombre) return 'US';
    const partes = nombre.trim().split(/\s+/);
    if (partes.length === 1) {
      return partes[0].substring(0, 2).toUpperCase();
    }
    return (partes[0][0] + partes[1][0]).toUpperCase();
  }

  formatearFechaRegistro(fechaIso?: string): string {
    if (!fechaIso) return 'Reciente';
    try {
      const fecha = new Date(fechaIso);
      return fecha.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return fechaIso;
    }
  }

  mostrarToast(mensaje: string, tipo: 'exito' | 'error' | 'info'): void {
    this.toast.set({ mensaje, tipo });
    setTimeout(() => {
      this.toast.set(null);
    }, 3000);
  }
}
