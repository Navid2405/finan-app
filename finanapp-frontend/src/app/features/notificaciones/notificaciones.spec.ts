import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { NotificacionesComponent } from './notificaciones';
import { NotificacionService } from '../../core/services/notificacion.service';
import { ObligacionService } from '../../core/services/obligacion.service';
import { MetaAhorroService } from '../../core/services/meta-ahorro.service';
import { Notificacion } from '../../core/models/notificacion.model';

describe('NotificacionesComponent', () => {
  let component: NotificacionesComponent;
  let fixture: ComponentFixture<NotificacionesComponent>;
  let notificacionService: NotificacionService;
  let router: Router;

  const mockNotificaciones: Notificacion[] = [
    {
      id: 'deuda-1',
      titulo: 'Deuda Vencida: Préstamo Moto',
      mensaje: 'Saldo pendiente de $50.000',
      tipo: 'DEUDA',
      prioridad: 'ALTA',
      fecha: new Date().toISOString(),
      leida: false,
      rutaAccion: '/obligaciones',
      textoAccion: 'Pagar Deuda',
      icono: '🚨',
    },
    {
      id: 'ahorro-1',
      titulo: 'Meta Cumplida: Ahorro Vacaciones',
      mensaje: 'Has alcanzado los $200.000',
      tipo: 'AHORRO',
      prioridad: 'BAJA',
      fecha: new Date().toISOString(),
      leida: true,
      rutaAccion: '/ahorros',
      textoAccion: 'Ver Meta',
      icono: '🏆',
    },
    {
      id: 'sistema-1',
      titulo: 'Cuota Diaria de Seguridad',
      mensaje: 'Aparta $5.000 hoy',
      tipo: 'SISTEMA',
      prioridad: 'MEDIA',
      fecha: new Date().toISOString(),
      leida: false,
      rutaAccion: '/obligaciones',
      textoAccion: 'Ver Cuota',
      icono: '🛡️',
    },
  ];

  beforeEach(async () => {
    localStorage.clear();

    const mockObligacionService = {
      obtenerObligaciones: () => of([]),
      obtenerCuotaSeguridad: () => of({ cuotaSeguridad: 0 }),
    };

    const mockMetaService = {
      obtenerMetas: () => of([]),
    };

    await TestBed.configureTestingModule({
      imports: [NotificacionesComponent],
      providers: [
        provideRouter([]),
        { provide: ObligacionService, useValue: mockObligacionService },
        { provide: MetaAhorroService, useValue: mockMetaService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificacionesComponent);
    component = fixture.componentInstance;
    notificacionService = TestBed.inject(NotificacionService);
    router = TestBed.inject(Router);

    // Mockear la lista inicial de notificaciones
    notificacionService.notificaciones.set(mockNotificaciones);
    await fixture.whenStable();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debe listar todas las notificaciones por defecto', () => {
    expect(component.filtroActual()).toBe('TODAS');
    expect(component.notificacionesFiltradas().length).toBe(3);
  });

  it('debe filtrar notificaciones no leídas', () => {
    component.cambiarFiltro('NO_LEIDAS');
    const filtradas = component.notificacionesFiltradas();
    expect(filtradas.length).toBe(2);
    expect(filtradas.every((n) => !n.leida)).toBe(true);
  });

  it('debe filtrar por tipo DEUDA', () => {
    component.cambiarFiltro('DEUDA');
    const filtradas = component.notificacionesFiltradas();
    expect(filtradas.length).toBe(1);
    expect(filtradas[0].tipo).toBe('DEUDA');
  });

  it('debe filtrar por tipo AHORRO', () => {
    component.cambiarFiltro('AHORRO');
    const filtradas = component.notificacionesFiltradas();
    expect(filtradas.length).toBe(1);
    expect(filtradas[0].tipo).toBe('AHORRO');
  });

  it('debe filtrar por búsqueda de texto', () => {
    component.busqueda.set('moto');
    const filtradas = component.notificacionesFiltradas();
    expect(filtradas.length).toBe(1);
    expect(filtradas[0].titulo).toContain('Moto');
  });

  it('debe marcar una notificación como leída', () => {
    component.marcarLeida('deuda-1');
    const notif = notificacionService.notificaciones().find((n) => n.id === 'deuda-1');
    expect(notif?.leida).toBe(true);
  });

  it('debe marcar todas las notificaciones como leídas', () => {
    component.marcarTodas();
    const todasLeidas = notificacionService.notificaciones().every((n) => n.leida);
    expect(todasLeidas).toBe(true);
    expect(component.toast()?.tipo).toBe('exito');
  });

  it('debe eliminar una notificación individual', () => {
    component.eliminar('deuda-1');
    const existe = notificacionService.notificaciones().some((n) => n.id === 'deuda-1');
    expect(existe).toBe(false);
  });

  it('debe vaciar la bandeja al confirmar limpiar todas', () => {
    component.abrirConfirmacionLimpiar();
    expect(component.modalConfirmarLimpiar()).toBe(true);

    component.confirmarLimpiarTodas();
    expect(component.modalConfirmarLimpiar()).toBe(false);
    expect(notificacionService.notificaciones().length).toBe(0);
  });

  it('debe navegar al ejecutar acción de una notificación', () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    component.ejecutarAccion('/obligaciones', 'deuda-1');
    expect(navigateSpy).toHaveBeenCalledWith(['/obligaciones']);
    const notif = notificacionService.notificaciones().find((n) => n.id === 'deuda-1');
    expect(notif?.leida).toBe(true);
  });

  it('debe formatear fechas relativas correctamente', () => {
    const hoy = new Date().toISOString();
    const formateado = component.formatearFechaRelativa(hoy);
    expect(formateado).toBeTruthy();
  });
});
