import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';

import { Obligaciones } from './obligaciones';
import { ObligacionService } from '../../core/services/obligacion.service';
import { CategoriaService } from '../../core/services/categoria.service';
import { EstadoObligacionModel } from '../../core/models/estado-obligacion.model';
import { FrecuenciaModel } from '../../core/models/frecuencia.model';
import { ObligacionResponse } from '../../core/models/obligacion.model';
import { TipoTransaccionModel } from '../../core/models/tipo-transaccion.model';

describe('Obligaciones', () => {
  let component: Obligaciones;
  let fixture: ComponentFixture<Obligaciones>;
  let mockObligacionService: any;
  let mockCategoriaService: any;

  const mockObligaciones: ObligacionResponse[] = [
    {
      id: 1,
      usuarioId: 1,
      nombre: 'Arriendo',
      monto: 800000,
      saldoPendiente: 400000,
      frecuencia: FrecuenciaModel.MENSUAL,
      diaLimitePago: 5,
      proximoVencimiento: '2026-11-05',
      estado: EstadoObligacionModel.PENDIENTE,
      activa: true,
    },
    {
      id: 2,
      usuarioId: 1,
      nombre: 'Internet',
      monto: 100000,
      saldoPendiente: 0,
      frecuencia: FrecuenciaModel.MENSUAL,
      diaLimitePago: 10,
      proximoVencimiento: '2026-11-10',
      estado: EstadoObligacionModel.PAGADA,
      activa: true,
    },
    {
      id: 3,
      usuarioId: 1,
      nombre: 'Tarjeta de Crédito',
      monto: 350000,
      saldoPendiente: 350000,
      frecuencia: FrecuenciaModel.MENSUAL,
      diaLimitePago: 2,
      proximoVencimiento: '2026-11-02',
      estado: EstadoObligacionModel.VENCIDA,
      activa: true,
    },
  ];

  beforeEach(async () => {
    mockObligacionService = {
      obtenerObligaciones: () => of(mockObligaciones),
      obtenerCuotaSeguridad: () => of({ cuotaSeguridad: 15000 }),
      crearObligacion: (req: any) =>
        of({
          id: 4,
          usuarioId: 1,
          saldoPendiente: req.monto,
          estado: EstadoObligacionModel.PENDIENTE,
          activa: true,
          ...req,
        }),
      actualizarObligacion: (id: number, req: any) =>
        of({
          ...mockObligaciones[0],
          ...req,
        }),
      desactivarObligacion: (id: number) => of(void 0),
      crearPago: (req: any) =>
        of({
          id: 201,
          obligacionId: req.obligacionId,
          transaccionId: 999,
          montoPagado: req.montoPagado,
          fechaPago: req.fechaPago || '2026-11-04',
        }),
      obtenerHistorialPagos: (obId: number) =>
        of([
          {
            id: 200,
            obligacionId: obId,
            transaccionId: 998,
            montoPagado: 400000,
            fechaPago: '2026-11-01',
          },
        ]),
    };

    mockCategoriaService = {
      obtenerCategorias: (tipo?: any) =>
        of([
          {
            id: 1,
            usuarioId: null,
            nombre: 'Servicios',
            tipoTransaccion: TipoTransaccionModel.GASTO,
            icono: '💡',
          },
        ]),
    };

    await TestBed.configureTestingModule({
      imports: [Obligaciones],
      providers: [
        provideHttpClient(),
        { provide: ObligacionService, useValue: mockObligacionService },
        { provide: CategoriaService, useValue: mockCategoriaService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Obligaciones);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('debe crearse y cargar datos correctamente', () => {
    expect(component).toBeTruthy();
    expect(component.listaObligaciones().length).toBe(3);
    expect(component.cuotaSeguridad()).toBe(15000);
  });

  it('debe calcular métricas de deuda pendiente', () => {
    expect(component.totalDeudaPendiente()).toBe(750000);
    expect(component.conteoPendientes()).toBe(1);
    expect(component.conteoPagadas()).toBe(1);
    expect(component.conteoVencidas()).toBe(1);
  });

  it('debe filtrar obligaciones por estado', () => {
    component.cambiarFiltroEstado('PENDIENTE');
    expect(component.obligacionesFiltradas().length).toBe(1);
    expect(component.obligacionesFiltradas()[0].estado).toBe(EstadoObligacionModel.PENDIENTE);

    component.cambiarFiltroEstado('PAGADA');
    expect(component.obligacionesFiltradas().length).toBe(1);
    expect(component.obligacionesFiltradas()[0].estado).toBe(EstadoObligacionModel.PAGADA);

    component.cambiarFiltroEstado('TODAS');
    expect(component.obligacionesFiltradas().length).toBe(3);
  });

  it('debe filtrar obligaciones por nombre', () => {
    component.terminoBusqueda.set('arriendo');
    expect(component.obligacionesFiltradas().length).toBe(1);
    expect(component.obligacionesFiltradas()[0].nombre).toBe('Arriendo');
  });

  it('debe abrir modal para crear y validar campos obligatorios', () => {
    component.abrirModalCrear();
    expect(component.modalAbierto()).toBe(true);
    expect(component.obligacionEnEdicion()).toBeNull();
    expect(component.obligacionForm.valid).toBe(false);
  });

  it('debe registrar una nueva obligación', () => {
    component.abrirModalCrear();
    component.obligacionForm.setValue({
      nombre: 'Gimnasio',
      monto: 90000,
      frecuencia: FrecuenciaModel.MENSUAL,
      proximoVencimiento: '2026-11-20',
      diaLimitePago: 20,
    });

    component.guardarObligacion();
    expect(component.modalAbierto()).toBe(false);
    expect(component.listaObligaciones().some((o) => o.nombre === 'Gimnasio')).toBe(true);
  });

  it('debe abrir modal de pago y registrar un abono', () => {
    const ob = component.listaObligaciones()[0]; // Arriendo (saldo 400.000)
    component.abrirModalPago(ob);
    expect(component.modalPagoAbierto()).toBe(true);
    expect(component.obligacionAPagar()?.id).toBe(ob.id);

    component.pagoForm.setValue({
      montoPagado: 200000,
      categoriaId: 1,
      metodoPago: 'Nequi',
      fechaPago: '2026-11-04',
    });

    component.guardarPago();
    expect(component.modalPagoAbierto()).toBe(false);
    const obActualizada = component.listaObligaciones().find((o) => o.id === ob.id);
    expect(obActualizada?.saldoPendiente).toBe(200000);
  });

  it('debe abrir historial de pagos', () => {
    const ob = component.listaObligaciones()[0];
    component.abrirModalHistorial(ob);
    expect(component.modalHistorialAbierto()).toBe(true);
    expect(component.historialPagos().length).toBe(1);
  });

  it('debe desactivar una obligación', () => {
    const ob = component.listaObligaciones()[0];
    component.abrirConfirmarDesactivar(ob);
    expect(component.modalDesactivarAbierto()).toBe(true);

    component.confirmarDesactivar();
    expect(component.modalDesactivarAbierto()).toBe(false);
    expect(component.listaObligaciones().some((o) => o.id === ob.id)).toBe(false);
  });
});
