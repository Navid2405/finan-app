import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';

import { Categorias } from './categorias';
import { CategoriaService } from '../../core/services/categoria.service';
import { TipoTransaccionModel } from '../../core/models/tipo-transaccion.model';
import { CategoriaResponse } from '../../core/models/categoria.model';

describe('Categorias', () => {
  let component: Categorias;
  let fixture: ComponentFixture<Categorias>;
  let mockCategoriaService: any;

  const mockCategorias: CategoriaResponse[] = [
    { id: 1, usuarioId: null, nombre: 'Comida', tipoTransaccion: TipoTransaccionModel.GASTO, icono: '🍔' },
    { id: 2, usuarioId: 1, nombre: 'Salario', tipoTransaccion: TipoTransaccionModel.INGRESO, icono: '💵' },
    { id: 3, usuarioId: 1, nombre: 'Transporte', tipoTransaccion: TipoTransaccionModel.GASTO, icono: '🚗' },
  ];

  beforeEach(async () => {
    mockCategoriaService = {
      obtenerCategorias: () => of(mockCategorias),
      crearCategoria: (req: any) => of({ id: 4, usuarioId: 1, ...req }),
      actualizarCategoria: (id: number, req: any) => of({ id, usuarioId: 1, nombre: req.nombre, tipoTransaccion: req.tipo, icono: req.icono }),
      eliminarCategoria: (id: number) => of(void 0),
    };

    await TestBed.configureTestingModule({
      imports: [Categorias],
      providers: [
        provideHttpClient(),
        { provide: CategoriaService, useValue: mockCategoriaService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Categorias);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create and load categories', () => {
    expect(component).toBeTruthy();
    expect(component.listaCategorias().length).toBe(3);
  });

  it('should filter categories by type', () => {
    component.cambiarFiltro('GASTO');
    expect(component.categoriasFiltradas().length).toBe(2);

    component.cambiarFiltro('INGRESO');
    expect(component.categoriasFiltradas().length).toBe(1);

    component.cambiarFiltro('TODOS');
    expect(component.categoriasFiltradas().length).toBe(3);
  });

  it('should filter categories by search term', () => {
    component.terminoBusqueda.set('Comida');
    expect(component.categoriasFiltradas().length).toBe(1);
    expect(component.categoriasFiltradas()[0].nombre).toBe('Comida');
  });

  it('should open modal and initialize form for new category', () => {
    component.abrirModalCrear();
    expect(component.modalAbierto()).toBe(true);
    expect(component.categoriaEnEdicion()).toBeNull();
    expect(component.categoriaForm.valid).toBe(false);
  });

  it('should create a new category when form is valid', () => {
    component.abrirModalCrear();
    component.categoriaForm.setValue({
      nombre: 'Freelance',
      tipoTransaccion: TipoTransaccionModel.INGRESO,
      icono: '💻'
    });

    component.guardarCategoria();
    expect(component.modalAbierto()).toBe(false);
    expect(component.listaCategorias().some(c => c.nombre === 'Freelance')).toBe(true);
  });
});
