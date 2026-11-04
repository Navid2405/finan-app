import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { Dashboard } from './dashboard';
import { TransaccionService } from '../../core/services/transaccion.service';
import { ObligacionService } from '../../core/services/obligacion.service';
import { MetaAhorroService } from '../../core/services/meta-ahorro.service';
import { NotificacionService } from '../../core/services/notificacion.service';
import { BalanceDiario, TransaccionResponse } from '../../core/models/transaccion.model';
import { CuotaSeguridad } from '../../core/models/obligacion.model';
import { MetaAhorroResponse } from '../../core/models/meta-ahorro.model';
import { EstadoMetaModel } from '../../core/models/estado-meta.model';
import { TipoTransaccionModel } from '../../core/models/tipo-transaccion.model';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
  let router: Router;

  const mockBalance: BalanceDiario = {
    fecha: '2026-11-04',
    ingresos: 150000,
    gastos: 65000,
    saldo: 85000,
    movimientos: 4,
  };

  const mockCuotaSeguridad: CuotaSeguridad = {
    cuotaSeguridad: 12500,
  };

  const mockMetas: MetaAhorroResponse[] = [
    {
      id: 1,
      usuarioId: 1,
      titulo: 'Fondo de Emergencia',
      montoObjetivo: 200000,
      montoAcumulado: 100000,
      fechaLimite: '2026-12-31',
      estado: EstadoMetaModel.EN_PROGRESO,
    },
  ];

  const mockTransacciones: TransaccionResponse[] = [
    {
      id: 1,
      usuarioId: 1,
      categoriaId: 1,
      categoriaNombre: 'Ventas del día',
      tipo: TipoTransaccionModel.INGRESO,
      monto: 100000,
      descripcion: 'Venta de mercancía',
      metodoPago: 'EFECTIVO',
      fecha: '2026-11-04',
      creadoEn: '2026-11-04T08:00:00',
    },
    {
      id: 2,
      usuarioId: 1,
      categoriaId: 2,
      categoriaNombre: 'Alimentación',
      tipo: TipoTransaccionModel.GASTO,
      monto: 15000,
      descripcion: 'Almuerzo corriente',
      metodoPago: 'EFECTIVO',
      fecha: '2026-11-04',
      creadoEn: '2026-11-04T12:00:00',
    },
  ];

  beforeEach(async () => {
    localStorage.clear();
    localStorage.setItem('usuario', 'Navid');

    const mockTransaccionService = {
      obtenerBalance: vi.fn().mockReturnValue(of(mockBalance)),
      obtenerTransacciones: vi.fn().mockReturnValue(of(mockTransacciones)),
    };

    const mockObligacionService = {
      obtenerCuotaSeguridad: vi.fn().mockReturnValue(of(mockCuotaSeguridad)),
      obtenerObligaciones: vi.fn().mockReturnValue(of([])),
    };

    const mockMetaService = {
      obtenerMetas: vi.fn().mockReturnValue(of(mockMetas)),
    };

    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        provideRouter([]),
        { provide: TransaccionService, useValue: mockTransaccionService },
        { provide: ObligacionService, useValue: mockObligacionService },
        { provide: MetaAhorroService, useValue: mockMetaService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
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

  it('debe cargar los datos del balance, cuota, metas y transacciones en ngOnInit', () => {
    expect(component.balance()).toEqual(mockBalance);
    expect(component.cuotaSeguridad()).toEqual(mockCuotaSeguridad);
    expect(component.metaDestacada()?.titulo).toBe('Fondo de Emergencia');
    expect(component.transaccionesRecientes().length).toBe(2);
    expect(component.cargando()).toBe(false);
  });

  it('debe calcular el porcentaje de ahorro de la meta destacada correctamente', () => {
    // 100.000 / 200.000 = 50%
    expect(component.porcentajeAhorro()).toBe(50);
  });

  it('debe limitar y ordenar las transacciones más recientes a un máximo de 5', () => {
    const diezTransacciones: TransaccionResponse[] = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      usuarioId: 1,
      categoriaId: 1,
      categoriaNombre: 'Cat ' + i,
      tipo: TipoTransaccionModel.INGRESO,
      monto: 1000 * (i + 1),
      descripcion: 'Tx ' + i,
      metodoPago: 'EFECTIVO',
      fecha: `2026-11-0${(i % 9) + 1}`,
      creadoEn: '2026-11-04T00:00:00',
    }));

    const txService = TestBed.inject(TransaccionService);
    vi.spyOn(txService, 'obtenerTransacciones').mockReturnValue(of(diezTransacciones));

    component.cargarDatosDashboard();

    expect(component.transaccionesRecientes().length).toBe(5);
  });

  it('debe navegar a la creación de ingreso', () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    component.irACrear('INGRESO');
    expect(navigateSpy).toHaveBeenCalledWith(['/transacciones'], {
      queryParams: { nuevo: 'INGRESO' },
    });
  });

  it('debe navegar a la creación de gasto', () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    component.irACrear('GASTO');
    expect(navigateSpy).toHaveBeenCalledWith(['/transacciones'], {
      queryParams: { nuevo: 'GASTO' },
    });
  });

  it('debe navegar al módulo de notificaciones', () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    component.irANotificaciones();
    expect(navigateSpy).toHaveBeenCalledWith(['/notificaciones']);
  });
});
