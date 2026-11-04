import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { PerfilComponent } from './perfil';
import { UsuarioService } from '../../core/services/usuario.service';
import { AuthService } from '../../core/services/auth.service';
import { UsuarioResponse } from '../../core/models/usuario.model';
import { signal } from '@angular/core';

describe('PerfilComponent', () => {
  let component: PerfilComponent;
  let fixture: ComponentFixture<PerfilComponent>;
  let usuarioServiceMock: any;
  let authServiceMock: any;
  let router: Router;

  const mockUsuario: UsuarioResponse = {
    id: 1,
    nombre: 'Carlos Gómez',
    email: 'carlos@ejemplo.com',
    telefono: '3001234567',
    ocupacion: 'Comerciante Independiente',
    creadoEn: '2026-10-28T09:00:00',
    activo: true,
  };

  beforeEach(async () => {
    localStorage.clear();

    const perfilSignal = signal<UsuarioResponse | null>(mockUsuario);

    usuarioServiceMock = {
      perfil: perfilSignal,
      obtenerPerfil: vi.fn().mockReturnValue(of(mockUsuario)),
      actualizarPerfil: vi.fn().mockReturnValue(
        of({ ...mockUsuario, nombre: 'Carlos Andrés Gómez', ocupacion: 'Transportador' })
      ),
      desactivarCuenta: vi.fn().mockReturnValue(of(undefined)),
    };

    authServiceMock = {
      logout: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [PerfilComponent],
      providers: [
        provideRouter([]),
        { provide: UsuarioService, useValue: usuarioServiceMock },
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PerfilComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    await fixture.whenStable();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debe cargar los datos del perfil al inicializarse', () => {
    expect(usuarioServiceMock.obtenerPerfil).toHaveBeenCalled();
    expect(component.cargando()).toBe(false);
  });

  it('debe calcular las iniciales correctamente', () => {
    expect(component.obtenerIniciales('Carlos Gómez')).toBe('CG');
    expect(component.obtenerIniciales('Navid')).toBe('NA');
    expect(component.obtenerIniciales('')).toBe('US');
  });

  it('debe abrir y cerrar el modal de edición con los datos actuales', () => {
    component.abrirModalEditar();
    expect(component.modalEditar()).toBe(true);
    expect(component.formNombre()).toBe('Carlos Gómez');
    expect(component.formOcupacion()).toBe('Comerciante Independiente');

    component.cerrarModalEditar();
    expect(component.modalEditar()).toBe(false);
  });

  it('debe permitir seleccionar una sugerencia de ocupación', () => {
    component.seleccionarOcupacion('Conductor / Repartidor');
    expect(component.formOcupacion()).toBe('Conductor / Repartidor');
  });

  it('debe validar campos obligatorios al guardar la edición', () => {
    component.abrirModalEditar();

    // Nombre vacío
    component.formNombre.set('');
    component.guardarEdicion();
    expect(component.formError()).toContain('El nombre completo es obligatorio');

    // Nombre muy corto
    component.formNombre.set('Ab');
    component.guardarEdicion();
    expect(component.formError()).toContain('al menos 3 caracteres');

    // Ocupación vacía
    component.formNombre.set('Carlos Valderrama');
    component.formOcupacion.set('');
    component.guardarEdicion();
    expect(component.formError()).toContain('ocupación o actividad económica es obligatoria');
  });

  it('debe actualizar el perfil satisfactoriamente', () => {
    component.abrirModalEditar();
    component.formNombre.set('Carlos Andrés Gómez');
    component.formOcupacion.set('Transportador');

    component.guardarEdicion();

    expect(usuarioServiceMock.actualizarPerfil).toHaveBeenCalledWith({
      nombre: 'Carlos Andrés Gómez',
      ocupacion: 'Transportador',
    });
    expect(component.modalEditar()).toBe(false);
    expect(component.toast()?.tipo).toBe('exito');
  });

  it('debe manejar errores al actualizar el perfil', () => {
    usuarioServiceMock.actualizarPerfil.mockReturnValue(
      throwError(() => ({ error: { mensaje: 'Error del servidor' } }))
    );

    component.abrirModalEditar();
    component.formNombre.set('Nuevo Nombre');
    component.formOcupacion.set('Nueva Ocupacion');

    component.guardarEdicion();

    expect(component.formError()).toBe('Error del servidor');
    expect(component.guardando()).toBe(false);
  });

  it('debe abrir y cerrar el modal de confirmación de desactivación', () => {
    component.abrirModalDesactivar();
    expect(component.modalConfirmarDesactivar()).toBe(true);

    component.cerrarModalDesactivar();
    expect(component.modalConfirmarDesactivar()).toBe(false);
  });

  it('debe desactivar la cuenta, cerrar sesión y redirigir al login', () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    component.confirmarDesactivar();

    expect(usuarioServiceMock.desactivarCuenta).toHaveBeenCalled();
    expect(authServiceMock.logout).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/auth/login'], {
      queryParams: { desactivada: 'true' },
    });
  });

  it('debe cerrar la sesión al pulsar cerrarSesion', () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    component.cerrarSesion();

    expect(authServiceMock.logout).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/auth/login']);
  });
});
