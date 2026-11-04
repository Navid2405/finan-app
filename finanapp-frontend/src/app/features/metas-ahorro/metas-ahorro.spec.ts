import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';

import { MetasAhorroComponent } from './metas-ahorro';
import { MetaAhorroService } from '../../core/services/meta-ahorro.service';
import { CategoriaService } from '../../core/services/categoria.service';
import { EstadoMetaModel } from '../../core/models/estado-meta.model';
import { MetaAhorroResponse } from '../../core/models/meta-ahorro.model';
import { TipoTransaccionModel } from '../../core/models/tipo-transaccion.model';

describe('MetasAhorroComponent', () => {
  let component: MetasAhorroComponent;
  let fixture: ComponentFixture<MetasAhorroComponent>;
  let mockMetaService: any;
  let mockCategoriaService: any;

  const mockMetas: MetaAhorroResponse[] = [
    {
      id: 1,
      usuarioId: 1,
      titulo: 'Fondo de Emergencia',
      montoObjetivo: 2000000,
      montoAcumulado: 1000000,
      fechaLimite: '2026-12-31',
      estado: EstadoMetaModel.EN_PROGRESO,
    },
    {
      id: 2,
      usuarioId: 1,
      titulo: 'Nuevo Celular',
      montoObjetivo: 1500000,
      montoAcumulado: 1500000,
      fechaLimite: '2026-11-30',
      estado: EstadoMetaModel.COMPLETADA,
    },
  ];

  beforeEach(async () => {
    mockMetaService = {
      obtenerMetas: () => of(mockMetas),
      crearMeta: (req: any) =>
        of({
          id: 3,
          usuarioId: 1,
          montoAcumulado: 0,
          estado: EstadoMetaModel.EN_PROGRESO,
          ...req,
        }),
      actualizarMeta: (id: number, req: any) =>
        of({
          ...mockMetas[0],
          ...req,
        }),
      eliminarMeta: (id: number) => of(void 0),
      crearAporte: (req: any) =>
        of({
          id: 10,
          metaId: req.metaId,
          monto: req.monto,
          fecha: req.fecha || '2026-11-04',
          nota: req.nota,
        }),
      retirarDinero: (req: any) =>
        of({
          ...mockMetas[0],
          montoAcumulado: mockMetas[0].montoAcumulado - req.montoRetiro,
        }),
      obtenerHistorialAportes: (metaId: number) =>
        of([
          {
            id: 10,
            metaId,
            monto: 500000,
            fecha: '2026-11-01',
            nota: 'Primer abono',
          },
        ]),
    };

    mockCategoriaService = {
      obtenerCategorias: (tipo?: any) =>
        of([
          {
            id: 1,
            usuarioId: null,
            nombre: 'Ahorro',
            tipoTransaccion: TipoTransaccionModel.GASTO,
            icono: '💰',
          },
        ]),
    };

    await TestBed.configureTestingModule({
      imports: [MetasAhorroComponent],
      providers: [
        provideHttpClient(),
        { provide: MetaAhorroService, useValue: mockMetaService },
        { provide: CategoriaService, useValue: mockCategoriaService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MetasAhorroComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('debe crearse y cargar las metas correctamente', () => {
    expect(component).toBeTruthy();
    expect(component.listaMetas().length).toBe(2);
  });

  it('debe calcular métricas de ahorro global', () => {
    expect(component.totalAhorradoGlobal()).toBe(2500000);
    expect(component.totalObjetivoGlobal()).toBe(3500000);
    expect(component.conteoEnProgreso()).toBe(1);
    expect(component.conteoCompletadas()).toBe(1);
    expect(component.porcentajeGlobalAhorrado()).toBe(71);
  });

  it('debe filtrar metas por estado', () => {
    component.cambiarFiltroEstado('EN_PROGRESO');
    expect(component.metasFiltradas().length).toBe(1);
    expect(component.metasFiltradas()[0].estado).toBe(EstadoMetaModel.EN_PROGRESO);

    component.cambiarFiltroEstado('COMPLETADA');
    expect(component.metasFiltradas().length).toBe(1);
    expect(component.metasFiltradas()[0].estado).toBe(EstadoMetaModel.COMPLETADA);

    component.cambiarFiltroEstado('TODAS');
    expect(component.metasFiltradas().length).toBe(2);
  });

  it('debe filtrar metas por término de búsqueda', () => {
    component.terminoBusqueda.set('emergencia');
    expect(component.metasFiltradas().length).toBe(1);
    expect(component.metasFiltradas()[0].titulo).toBe('Fondo de Emergencia');
  });

  it('debe abrir modal para crear meta y validar formulario', () => {
    component.abrirModalCrear();
    expect(component.modalAbierto()).toBe(true);
    expect(component.metaEnEdicion()).toBeNull();
    expect(component.metaForm.valid).toBe(false);
  });

  it('debe registrar una nueva meta de ahorro', () => {
    component.abrirModalCrear();
    component.metaForm.setValue({
      titulo: 'Viaje a Medellín',
      montoObjetivo: 800000,
      fechaLimite: '2026-12-25',
    });

    component.guardarMeta();
    expect(component.modalAbierto()).toBe(false);
    expect(component.listaMetas().some((m) => m.titulo === 'Viaje a Medellín')).toBe(true);
  });

  it('debe abonar a una meta de ahorro', () => {
    const meta = component.listaMetas()[0];
    component.abrirModalAporte(meta);
    expect(component.modalAporteAbierto()).toBe(true);
    expect(component.metaParaAporte()?.id).toBe(meta.id);

    component.aporteForm.setValue({
      monto: 200000,
      categoriaId: 1,
      metodoPago: 'Nequi',
      fecha: '2026-11-04',
      nota: 'Aporte quincena',
    });

    component.guardarAporte();
    expect(component.modalAporteAbierto()).toBe(false);
    const metaActualizada = component.listaMetas().find((m) => m.id === meta.id);
    expect(metaActualizada?.montoAcumulado).toBe(1200000);
  });

  it('debe retirar dinero de una meta', () => {
    const meta = component.listaMetas()[0];
    component.abrirModalRetiro(meta);
    expect(component.modalRetiroAbierto()).toBe(true);

    component.retiroForm.setValue({
      montoRetiro: 100000,
      categoriaId: 1,
      metodoPago: 'Efectivo',
      fecha: '2026-11-04',
      descripcion: 'Retiro parcial',
    });

    component.guardarRetiro();
    expect(component.modalRetiroAbierto()).toBe(false);
    const metaActualizada = component.listaMetas().find((m) => m.id === meta.id);
    expect(metaActualizada?.montoAcumulado).toBe(900000);
  });

  it('debe abrir historial de aportes', () => {
    const meta = component.listaMetas()[0];
    component.abrirModalHistorial(meta);
    expect(component.modalHistorialAbierto()).toBe(true);
    expect(component.historialAportes().length).toBe(1);
  });

  it('debe eliminar una meta', () => {
    const meta = component.listaMetas()[0];
    component.abrirConfirmarEliminar(meta);
    expect(component.modalEliminarAbierto()).toBe(true);

    component.confirmarEliminar();
    expect(component.modalEliminarAbierto()).toBe(false);
    expect(component.listaMetas().some((m) => m.id === meta.id)).toBe(false);
  });
});
