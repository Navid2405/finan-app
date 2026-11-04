import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoriaService } from '../../core/services/categoria.service';
import { CategoriaResponse } from '../../core/models/categoria.model';
import { TipoTransaccionModel } from '../../core/models/tipo-transaccion.model';
import { LayoutService } from '../../core/services/layout.service';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './categorias.html',
  styleUrl: './categorias.css',
})
export class Categorias implements OnInit {
  private fb = inject(FormBuilder);
  private categoriaService = inject(CategoriaService);
  layoutService = inject(LayoutService);

  readonly TipoTransaccion = TipoTransaccionModel;

  // Estados de datos y carga
  cargando = signal<boolean>(false);
  guardando = signal<boolean>(false);
  eliminando = signal<boolean>(false);
  errorMensaje = signal<string | null>(null);
  modalError = signal<string | null>(null);
  exitoMensaje = signal<string | null>(null);

  // Lista y filtros
  listaCategorias = signal<CategoriaResponse[]>([]);
  filtroActivo = signal<'TODOS' | 'INGRESO' | 'GASTO'>('TODOS');
  terminoBusqueda = signal<string>('');

  // Modales
  modalAbierto = signal<boolean>(false);
  categoriaEnEdicion = signal<CategoriaResponse | null>(null);
  categoriaAEliminar = signal<CategoriaResponse | null>(null);
  modalEliminarAbierto = signal<boolean>(false);

  // Listas de emojis sugeridos
  readonly emojisGastos = [
    '🍔', '🛒', '🚗', '🏠', '💡', '🎮',
    '💊', '👕', '✈️', '📚', '🐾', '🎁',
    '☕', '📱', '⛽', '🛠️', '🎬', '🏋️',
    '🍕', '🚌', '🍿', '🏥', '💈', '📦'
  ];

  readonly emojisIngresos = [
    '💵', '💼', '📈', '🎁', '🏠', '💰',
    '🪙', '🏆', '🤝', '🛍️', '💻', '🏦',
    '💳', '✨', '💎', '💸', '🎯', '🥇'
  ];

  // Formulario reactivo
  categoriaForm = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
    tipoTransaccion: [TipoTransaccionModel.GASTO, [Validators.required]],
    icono: ['🏷️', [Validators.required]],
  });

  // Categorías filtradas por pestaña y término de búsqueda
  categoriasFiltradas = computed(() => {
    let cats = this.listaCategorias();
    const filtro = this.filtroActivo();

    if (filtro !== 'TODOS') {
      cats = cats.filter((c) => c.tipoTransaccion === filtro);
    }

    const query = this.terminoBusqueda().trim().toLowerCase();
    if (query) {
      cats = cats.filter((c) => c.nombre.toLowerCase().includes(query));
    }

    return cats;
  });

  // Contadores
  totalCount = computed(() => this.listaCategorias().length);
  gastosCount = computed(
    () => this.listaCategorias().filter((c) => c.tipoTransaccion === TipoTransaccionModel.GASTO).length
  );
  ingresosCount = computed(
    () => this.listaCategorias().filter((c) => c.tipoTransaccion === TipoTransaccionModel.INGRESO).length
  );

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.errorMensaje.set(null);
    this.categoriaService.obtenerCategorias().subscribe({
      next: (data) => {
        this.listaCategorias.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        this.errorMensaje.set('No se pudieron cargar las categorías. Por favor, reintenta.');
      },
    });
  }

  cambiarFiltro(nuevoFiltro: 'TODOS' | 'INGRESO' | 'GASTO'): void {
    this.filtroActivo.set(nuevoFiltro);
  }

  actualizarBusqueda(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.terminoBusqueda.set(target.value);
  }

  limpiarBusqueda(): void {
    this.terminoBusqueda.set('');
  }

  // Apertura y control del Modal de Creación / Edición
  abrirModalCrear(): void {
    this.categoriaEnEdicion.set(null);
    const tipoDefecto =
      this.filtroActivo() === 'INGRESO'
        ? TipoTransaccionModel.INGRESO
        : TipoTransaccionModel.GASTO;
    const iconoDefecto = tipoDefecto === TipoTransaccionModel.INGRESO ? '💰' : '🏷️';

    this.categoriaForm.reset({
      nombre: '',
      tipoTransaccion: tipoDefecto,
      icono: iconoDefecto,
    });
    this.modalError.set(null);
    this.modalAbierto.set(true);
  }

  abrirModalEditar(cat: CategoriaResponse): void {
    this.categoriaEnEdicion.set(cat);
    this.categoriaForm.reset({
      nombre: cat.nombre,
      tipoTransaccion: cat.tipoTransaccion,
      icono: cat.icono || '🏷️',
    });
    this.modalError.set(null);
    this.modalAbierto.set(true);
  }

  cerrarModal(): void {
    this.modalAbierto.set(false);
    this.modalError.set(null);
    this.categoriaEnEdicion.set(null);
  }

  seleccionarTipo(tipo: TipoTransaccionModel): void {
    this.categoriaForm.patchValue({ tipoTransaccion: tipo });
    // Si el icono es el icono por defecto anterior, actualizarlo al adecuado
    const iconoActual = this.categoriaForm.get('icono')?.value;
    if (iconoActual === '🏷️' && tipo === TipoTransaccionModel.INGRESO) {
      this.categoriaForm.patchValue({ icono: '💰' });
    } else if (iconoActual === '💰' && tipo === TipoTransaccionModel.GASTO) {
      this.categoriaForm.patchValue({ icono: '🏷️' });
    }
  }

  seleccionarIcono(icono: string): void {
    this.categoriaForm.patchValue({ icono });
  }

  guardarCategoria(): void {
    if (this.categoriaForm.invalid) {
      this.categoriaForm.markAllAsTouched();
      return;
    }

    const { nombre, tipoTransaccion, icono } = this.categoriaForm.value;
    const nombreLimpio = (nombre || '').trim();
    const iconoFinal = (icono || '').trim() || '🏷️';
    const tipoFinal = tipoTransaccion || TipoTransaccionModel.GASTO;

    if (!nombreLimpio) {
      this.modalError.set('El nombre de la categoría es obligatorio.');
      return;
    }

    this.guardando.set(true);
    this.modalError.set(null);

    const editando = this.categoriaEnEdicion();

    if (editando) {
      // Actualizar
      this.categoriaService
        .actualizarCategoria(editando.id, {
          nombre: nombreLimpio,
          tipo: tipoFinal,
          icono: iconoFinal,
        })
        .subscribe({
          next: (catActualizada) => {
            this.listaCategorias.update((list) =>
              list.map((c) => (c.id === editando.id ? catActualizada : c))
            );
            this.guardando.set(false);
            this.cerrarModal();
            this.mostrarExito('¡Categoría actualizada exitosamente!');
          },
          error: (err) => {
            this.guardando.set(false);
            const msg =
              err.error?.mensaje ||
              err.error?.error ||
              'No se pudo actualizar la categoría. Revisa los datos.';
            this.modalError.set(msg);
          },
        });
    } else {
      // Crear nueva
      this.categoriaService
        .crearCategoria({
          nombre: nombreLimpio,
          tipoTransaccion: tipoFinal,
          icono: iconoFinal,
        })
        .subscribe({
          next: (nuevaCat) => {
            this.listaCategorias.update((list) => [nuevaCat, ...list]);
            this.guardando.set(false);
            this.cerrarModal();
            this.mostrarExito('¡Categoría creada exitosamente!');
          },
          error: (err) => {
            this.guardando.set(false);
            const msg =
              err.error?.mensaje ||
              err.error?.error ||
              'No se pudo crear la categoría. Revisa los datos.';
            this.modalError.set(msg);
          },
        });
    }
  }

  // Confirmación y eliminación
  abrirConfirmarEliminar(cat: CategoriaResponse): void {
    this.categoriaAEliminar.set(cat);
    this.modalEliminarAbierto.set(true);
  }

  cerrarConfirmarEliminar(): void {
    this.modalEliminarAbierto.set(false);
    this.categoriaAEliminar.set(null);
  }

  confirmarEliminar(): void {
    const cat = this.categoriaAEliminar();
    if (!cat) return;

    this.eliminando.set(true);
    this.categoriaService.eliminarCategoria(cat.id).subscribe({
      next: () => {
        this.listaCategorias.update((list) => list.filter((c) => c.id !== cat.id));
        this.eliminando.set(false);
        this.cerrarConfirmarEliminar();
        this.mostrarExito('Categoría eliminada.');
      },
      error: (err) => {
        this.eliminando.set(false);
        const msg =
          err.error?.mensaje ||
          err.error?.error ||
          'No se pudo eliminar la categoría.';
        this.errorMensaje.set(msg);
        this.cerrarConfirmarEliminar();
      },
    });
  }

  private mostrarExito(mensaje: string): void {
    this.exitoMensaje.set(mensaje);
    setTimeout(() => {
      if (this.exitoMensaje() === mensaje) {
        this.exitoMensaje.set(null);
      }
    }, 3500);
  }
}
