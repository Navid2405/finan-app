import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { Transacciones } from './transacciones';
import { TransaccionService } from '../../core/services/transaccion.service';
import { CategoriaService } from '../../core/services/categoria.service';
import { TipoTransaccionModel } from '../../core/models/tipo-transaccion.model';
import { TransaccionResponse } from '../../core/models/transaccion.model';
import { CategoriaResponse } from '../../core/models/categoria.model';

describe('Transacciones', () => {
  let component: Transacciones;
  let fixture: ComponentFixture<Transacciones>;
  let mockTransaccionService: any;
  let mockCategoriaService: any;

  const mockCategorias: CategoriaResponse[] = [
    { id: 1, usuarioId: null, nombre: 'Comida', tipoTransaccion: TipoTransaccionModel.GASTO, icono: '🍔' },
    { id: 2, usuarioId: null, nombre: 'Salario', tipoTransaccion: TipoTransaccionModel.INGRESO, icono: '💵' },
  ];

  const mockTransacciones: TransaccionResponse[] = [
    {
      id: 101,
      usuarioId: 1,
      categoriaId: 1,
      categoriaNombre: 'Comida',
      tipo: TipoTransaccionModel.GASTO,
      monto: 25000,
      descripcion: 'Almuerzo ejecutivo',
      metodoPago: 'Efectivo',
      fecha: '2026-11-04',
      creadoEn: '2026-11-04T12:00:00',
    },
    {
      id: 102,
      usuarioId: 1,
      categoriaId: 2,
      categoriaNombre: 'Salario',
      tipo: TipoTransaccionModel.INGRESO,
      monto: 150000,
      descripcion: 'Pago quincena',
      metodoPago: 'Transferencia Bancaria',
      fecha: '2026-11-04',
      creadoEn: '2026-11-04T08:00:00',
    },
  ];

  beforeEach(async () => {
    mockTransaccionService = {
      obtenerTransacciones: () => of(mockTransacciones),
      crearTransaccion: (req: any) =>
        of({
          id: 103,
          usuarioId: 1,
          categoriaId: req.categoriaId,
          categoriaNombre: 'Comida',
          tipo: TipoTransaccionModel.GASTO,
          monto: req.monto,
          descripcion: req.descripcion,
          metodoPago: req.metodoPago,
          fecha: req.fecha,
          creadoEn: '2026-11-04T13:00:00',
        }),
      actualizarTransaccion: (id: number, req: any) =>
        of({
          id,
          usuarioId: 1,
          categoriaId: 1,
          categoriaNombre: 'Comida',
          tipo: req.tipoTransaccion,
          monto: req.monto,
          descripcion: req.descripcion,
          metodoPago: req.metodoPago,
          fecha: req.fecha,
          creadoEn: '2026-11-04T13:00:00',
        }),
      eliminarTransaccion: (id: number) => of(void 0),
    };

    mockCategoriaService = {
      obtenerCategorias: () => of(mockCategorias),
    };

    await TestBed.configureTestingModule({
      imports: [Transacciones],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: TransaccionService, useValue: mockTransaccionService },
        { provide: CategoriaService, useValue: mockCategoriaService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Transacciones);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('debe crearse y cargar datos correctamente', () => {
    expect(component).toBeTruthy();
    expect(component.listaTransacciones().length).toBe(2);
    expect(component.listaCategorias().length).toBe(2);
  });

  it('debe calcular métricas y balance neto', () => {
    expect(component.totalIngresos()).toBe(150000);
    expect(component.totalGastos()).toBe(25000);
    expect(component.balanceNeto()).toBe(125000);
  });

  it('debe filtrar transacciones por tipo', () => {
    component.cambiarFiltroTipo('GASTO');
    expect(component.transaccionesFiltradas().length).toBe(1);
    expect(component.transaccionesFiltradas()[0].tipo).toBe(TipoTransaccionModel.GASTO);

    component.cambiarFiltroTipo('INGRESO');
    expect(component.transaccionesFiltradas().length).toBe(1);
    expect(component.transaccionesFiltradas()[0].tipo).toBe(TipoTransaccionModel.INGRESO);

    component.cambiarFiltroTipo('TODOS');
    expect(component.transaccionesFiltradas().length).toBe(2);
  });

  it('debe filtrar transacciones por término de búsqueda', () => {
    component.terminoBusqueda.set('almuerzo');
    expect(component.transaccionesFiltradas().length).toBe(1);
    expect(component.transaccionesFiltradas()[0].id).toBe(101);
  });

  it('debe abrir modal de creación con tipo adecuado', () => {
    component.abrirModalCrear(TipoTransaccionModel.INGRESO);
    expect(component.modalAbierto()).toBe(true);
    expect(component.tipoSeleccionado()).toBe(TipoTransaccionModel.INGRESO);
    expect(component.transaccionEnEdicion()).toBeNull();
  });

  it('debe registrar un nuevo movimiento cuando el formulario es válido', () => {
    component.abrirModalCrear(TipoTransaccionModel.GASTO);
    component.transaccionForm.setValue({
      categoriaId: 1,
      monto: 30000,
      metodoPago: 'Nequi',
      fecha: '2026-11-04',
      descripcion: 'Cena',
    });

    component.guardarTransaccion();
    expect(component.modalAbierto()).toBe(false);
    expect(component.listaTransacciones().some((t) => t.id === 103)).toBe(true);
  });

  it('debe eliminar un movimiento', () => {
    const tx = component.listaTransacciones()[0];
    component.abrirConfirmarEliminar(tx);
    expect(component.modalEliminarAbierto()).toBe(true);

    component.confirmarEliminar();
    expect(component.modalEliminarAbierto()).toBe(false);
    expect(component.listaTransacciones().some((t) => t.id === tx.id)).toBe(false);
  });
});
