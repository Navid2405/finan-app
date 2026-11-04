import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TransaccionService } from '../../core/services/transaccion.service';
import { CategoriaService } from '../../core/services/categoria.service';
import { LayoutService } from '../../core/services/layout.service';
import { TransaccionModel, TransaccionResponse } from '../../core/models/transaccion.model';
import { CategoriaResponse } from '../../core/models/categoria.model';
import { TipoTransaccionModel } from '../../core/models/tipo-transaccion.model';

@Component({
  selector: 'app-transacciones',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './transacciones.html',
  styleUrl: './transacciones.css',
})
export class Transacciones implements OnInit {
  private fb = inject(FormBuilder);
  private transaccionService = inject(TransaccionService);
  private categoriaService = inject(CategoriaService);
  private route = inject(ActivatedRoute);
  layoutService = inject(LayoutService);

  readonly TipoTransaccion = TipoTransaccionModel;

  // Estados de carga y feedback
  cargando = signal<boolean>(false);
  guardando = signal<boolean>(false);
  eliminando = signal<boolean>(false);
  errorMensaje = signal<string | null>(null);
  modalError = signal<string | null>(null);
  exitoMensaje = signal<string | null>(null);

  // Datos
  listaTransacciones = signal<TransaccionResponse[]>([]);
  listaCategorias = signal<CategoriaResponse[]>([]);

  // Filtros
  filtroTipo = signal<'TODOS' | 'INGRESO' | 'GASTO'>('TODOS');
  filtroPeriodo = signal<'TODOS' | 'HOY' | 'ESTE_MES' | 'RANGO'>('TODOS');
  terminoBusqueda = signal<string>('');
  fechaInicioRango = signal<string>('');
  fechaFinRango = signal<string>('');

  // Modales
  modalAbierto = signal<boolean>(false);
  modalEliminarAbierto = signal<boolean>(false);
  transaccionEnEdicion = signal<TransaccionResponse | null>(null);
  transaccionAEliminar = signal<TransaccionResponse | null>(null);
  tipoSeleccionado = signal<TipoTransaccionModel>(TipoTransaccionModel.GASTO);

  // Métodos de pago populares sugeridos
  readonly metodosPago = [
    'Efectivo',
    'Nequi',
    'Daviplata',
    'Tarjeta Débito',
    'Tarjeta Crédito',
    'Transferencia Bancaria',
  ];

  // Formulario reactivo
  transaccionForm = this.fb.group({
    categoriaId: [null as number | null, [Validators.required]],
    monto: [null as number | null, [Validators.required, Validators.min(1)]],
    metodoPago: ['Efectivo', [Validators.required]],
    fecha: [this.obtenerFechaHoy(), [Validators.required]],
    descripcion: ['', [Validators.maxLength(100)]],
  });

  // Categorías disponibles según el tipo de movimiento seleccionado en el modal
  categoriasPorTipoModal = computed(() => {
    return this.listaCategorias().filter(
      (c) => c.tipoTransaccion === this.tipoSeleccionado()
    );
  });

  // Transacciones filtradas por tipo, búsqueda y periodo
  transaccionesFiltradas = computed(() => {
    let resultado = this.listaTransacciones();

    // Filtro por Tipo (TODOS, INGRESO, GASTO)
    const tipo = this.filtroTipo();
    if (tipo !== 'TODOS') {
      resultado = resultado.filter((t) => t.tipo === tipo);
    }

    // Filtro por Búsqueda (descripción, categoría o método de pago)
    const query = this.terminoBusqueda().trim().toLowerCase();
    if (query) {
      resultado = resultado.filter(
        (t) =>
          (t.descripcion && t.descripcion.toLowerCase().includes(query)) ||
          (t.categoriaNombre && t.categoriaNombre.toLowerCase().includes(query)) ||
          (t.metodoPago && t.metodoPago.toLowerCase().includes(query))
      );
    }

    // Filtro por Periodo
    const periodo = this.filtroPeriodo();
    const hoyStr = this.obtenerFechaHoy();

    if (periodo === 'HOY') {
      resultado = resultado.filter((t) => t.fecha === hoyStr);
    } else if (periodo === 'ESTE_MES') {
      const mesActual = hoyStr.substring(0, 7); // YYYY-MM
      resultado = resultado.filter((t) => t.fecha && t.fecha.startsWith(mesActual));
    } else if (periodo === 'RANGO') {
      const inicio = this.fechaInicioRango();
      const fin = this.fechaFinRango();
      if (inicio && fin) {
        resultado = resultado.filter((t) => t.fecha >= inicio && t.fecha <= fin);
      } else if (inicio) {
        resultado = resultado.filter((t) => t.fecha >= inicio);
      } else if (fin) {
        resultado = resultado.filter((t) => t.fecha <= fin);
      }
    }

    return resultado;
  });

  // Métricas y totales calculados
  totalIngresos = computed(() => {
    return this.transaccionesFiltradas()
      .filter((t) => t.tipo === TipoTransaccionModel.INGRESO)
      .reduce((sum, t) => sum + Number(t.monto || 0), 0);
  });

  totalGastos = computed(() => {
    return this.transaccionesFiltradas()
      .filter((t) => t.tipo === TipoTransaccionModel.GASTO)
      .reduce((sum, t) => sum + Number(t.monto || 0), 0);
  });

  balanceNeto = computed(() => {
    return this.totalIngresos() - this.totalGastos();
  });

  ngOnInit(): void {
    this.cargarDatos();

    // Si viene con query param ?nuevo=INGRESO o ?nuevo=GASTO
    this.route.queryParams.subscribe((params) => {
      if (params['nuevo'] === 'INGRESO') {
        this.abrirModalCrear(TipoTransaccionModel.INGRESO);
      } else if (params['nuevo'] === 'GASTO') {
        this.abrirModalCrear(TipoTransaccionModel.GASTO);
      }
    });
  }

  cargarDatos(): void {
    this.cargando.set(true);
    this.errorMensaje.set(null);

    // Cargar categorías primero para asociar iconos y desplegar selectores
    this.categoriaService.obtenerCategorias().subscribe({
      next: (categorias) => {
        this.listaCategorias.set(categorias);
      },
      error: () => {
        // Silencioso o informativo
      },
    });

    // Cargar transacciones
    this.transaccionService.obtenerTransacciones().subscribe({
      next: (transacciones) => {
        this.listaTransacciones.set(transacciones);
        this.cargando.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        this.errorMensaje.set(
          err.error?.mensaje || 'No se pudieron cargar los movimientos. Intenta de nuevo.'
        );
      },
    });
  }

  obtenerIconoCategoria(categoriaId: number, tipoTransaccion: TipoTransaccionModel): string {
    const cat = this.listaCategorias().find((c) => c.id === categoriaId);
    if (cat && cat.icono) {
      return cat.icono;
    }
    return tipoTransaccion === TipoTransaccionModel.INGRESO ? '💰' : '🏷️';
  }

  formatearCOP(monto: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(monto);
  }

  formatearFechaLegible(fechaStr: string): string {
    if (!fechaStr) return '';
    const hoyStr = this.obtenerFechaHoy();
    if (fechaStr === hoyStr) {
      return 'Hoy';
    }

    try {
      const [year, month, day] = fechaStr.split('-').map(Number);
      const fecha = new Date(year, month - 1, day);
      return fecha.toLocaleDateString('es-CO', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return fechaStr;
    }
  }

  cambiarFiltroTipo(nuevoTipo: 'TODOS' | 'INGRESO' | 'GASTO'): void {
    this.filtroTipo.set(nuevoTipo);
  }

  cambiarFiltroPeriodo(nuevoPeriodo: 'TODOS' | 'HOY' | 'ESTE_MES' | 'RANGO'): void {
    this.filtroPeriodo.set(nuevoPeriodo);
  }

  actualizarBusqueda(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.terminoBusqueda.set(target.value);
  }

  limpiarBusqueda(): void {
    this.terminoBusqueda.set('');
  }

  // Control del Modal
  abrirModalCrear(tipoDefault: TipoTransaccionModel = TipoTransaccionModel.GASTO): void {
    this.transaccionEnEdicion.set(null);
    this.tipoSeleccionado.set(tipoDefault);

    // Obtener la primera categoría disponible para ese tipo
    const cats = this.listaCategorias().filter((c) => c.tipoTransaccion === tipoDefault);
    const primeraCatId = cats.length > 0 ? cats[0].id : null;

    this.transaccionForm.reset({
      categoriaId: primeraCatId,
      monto: null,
      metodoPago: 'Efectivo',
      fecha: this.obtenerFechaHoy(),
      descripcion: '',
    });

    this.modalError.set(null);
    this.modalAbierto.set(true);
  }

  abrirModalEditar(tx: TransaccionResponse): void {
    this.transaccionEnEdicion.set(tx);
    this.tipoSeleccionado.set(tx.tipo);

    this.transaccionForm.reset({
      categoriaId: tx.categoriaId,
      monto: tx.monto,
      metodoPago: tx.metodoPago,
      fecha: tx.fecha,
      descripcion: tx.descripcion || '',
    });

    this.modalError.set(null);
    this.modalAbierto.set(true);
  }

  cerrarModal(): void {
    this.modalAbierto.set(false);
    this.modalError.set(null);
    this.transaccionEnEdicion.set(null);
  }

  cambiarTipoEnModal(tipo: TipoTransaccionModel): void {
    this.tipoSeleccionado.set(tipo);
    // Cambiar la categoría seleccionada a una válida para este nuevo tipo
    const cats = this.listaCategorias().filter((c) => c.tipoTransaccion === tipo);
    const actualCatId = this.transaccionForm.get('categoriaId')?.value;
    const catValida = cats.find((c) => c.id === actualCatId);

    if (!catValida && cats.length > 0) {
      this.transaccionForm.patchValue({ categoriaId: cats[0].id });
    } else if (cats.length === 0) {
      this.transaccionForm.patchValue({ categoriaId: null });
    }
  }

  seleccionarMetodoPago(metodo: string): void {
    this.transaccionForm.patchValue({ metodoPago: metodo });
  }

  guardarTransaccion(): void {
    if (this.transaccionForm.invalid) {
      this.transaccionForm.markAllAsTouched();
      return;
    }

    const { categoriaId, monto, metodoPago, fecha, descripcion } = this.transaccionForm.value;

    if (!categoriaId) {
      this.modalError.set('Debes seleccionar una categoría.');
      return;
    }

    if (!monto || monto <= 0) {
      this.modalError.set('El monto debe ser mayor a 0.');
      return;
    }

    const hoy = this.obtenerFechaHoy();
    if (fecha && fecha > hoy) {
      this.modalError.set('La fecha no puede ser futura.');
      return;
    }

    this.guardando.set(true);
    this.modalError.set(null);

    const txEditando = this.transaccionEnEdicion();

    if (txEditando) {
      // Edición / actualización parcial
      this.transaccionService
        .actualizarTransaccion(txEditando.id, {
          descripcion: (descripcion || '').trim(),
          monto: Number(monto),
          metodoPago: metodoPago || 'Efectivo',
          fecha: fecha || hoy,
          tipoTransaccion: this.tipoSeleccionado(),
        })
        .subscribe({
          next: (txActualizada) => {
            this.listaTransacciones.update((lista) =>
              lista.map((t) => (t.id === txEditando.id ? txActualizada : t))
            );
            this.guardando.set(false);
            this.cerrarModal();
            this.mostrarExito('¡Movimiento actualizado con éxito!');
          },
          error: (err) => {
            this.guardando.set(false);
            const msg =
              err.error?.mensaje ||
              err.error?.error ||
              'No se pudo actualizar el movimiento. Revisa los datos.';
            this.modalError.set(msg);
          },
        });
    } else {
      // Creación
      const nuevaTx: TransaccionModel = {
        categoriaId: Number(categoriaId),
        monto: Number(monto),
        metodoPago: metodoPago || 'Efectivo',
        fecha: fecha || hoy,
        descripcion: (descripcion || '').trim(),
      };

      this.transaccionService.crearTransaccion(nuevaTx).subscribe({
        next: (txCreada) => {
          this.listaTransacciones.update((lista) => [txCreada, ...lista]);
          this.guardando.set(false);
          this.cerrarModal();
          this.mostrarExito('¡Movimiento registrado con éxito!');
        },
        error: (err) => {
          this.guardando.set(false);
          const msg =
            err.error?.mensaje ||
            err.error?.error ||
            'No se pudo registrar el movimiento. Revisa los campos.';
          this.modalError.set(msg);
        },
      });
    }
  }

  // Eliminación de transacción
  abrirConfirmarEliminar(tx: TransaccionResponse): void {
    this.transaccionAEliminar.set(tx);
    this.modalEliminarAbierto.set(true);
  }

  cerrarConfirmarEliminar(): void {
    this.modalEliminarAbierto.set(false);
    this.transaccionAEliminar.set(null);
  }

  confirmarEliminar(): void {
    const tx = this.transaccionAEliminar();
    if (!tx) return;

    this.eliminando.set(true);
    this.transaccionService.eliminarTransaccion(tx.id).subscribe({
      next: () => {
        this.listaTransacciones.update((lista) => lista.filter((t) => t.id !== tx.id));
        this.eliminando.set(false);
        this.cerrarConfirmarEliminar();
        this.mostrarExito('Movimiento eliminado.');
      },
      error: (err) => {
        this.eliminando.set(false);
        const msg =
          err.error?.mensaje ||
          err.error?.error ||
          'No se pudo eliminar el movimiento.';
        this.errorMensaje.set(msg);
        this.cerrarConfirmarEliminar();
      },
    });
  }

  private obtenerFechaHoy(): string {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
