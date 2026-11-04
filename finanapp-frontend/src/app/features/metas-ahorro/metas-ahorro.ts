import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MetaAhorroService } from '../../core/services/meta-ahorro.service';
import { CategoriaService } from '../../core/services/categoria.service';
import { LayoutService } from '../../core/services/layout.service';
import {
  ActualizarMetaAhorro,
  MetaAhorroModel,
  MetaAhorroResponse,
} from '../../core/models/meta-ahorro.model';
import { EstadoMetaModel } from '../../core/models/estado-meta.model';
import {
  AporteAhorroModel,
  AporteResponse,
  RetiroAhorro,
} from '../../core/models/aporte-ahorro.model';
import { CategoriaResponse } from '../../core/models/categoria.model';
import { TipoTransaccionModel } from '../../core/models/tipo-transaccion.model';

@Component({
  selector: 'app-metas-ahorro',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './metas-ahorro.html',
  styleUrl: './metas-ahorro.css',
})
export class MetasAhorroComponent implements OnInit {
  private fb = inject(FormBuilder);
  private metaService = inject(MetaAhorroService);
  private categoriaService = inject(CategoriaService);
  layoutService = inject(LayoutService);

  readonly EstadoMeta = EstadoMetaModel;

  // Estados de carga y feedback
  cargando = signal<boolean>(false);
  guardando = signal<boolean>(false);
  abonando = signal<boolean>(false);
  retirando = signal<boolean>(false);
  eliminando = signal<boolean>(false);
  cargandoHistorial = signal<boolean>(false);

  errorMensaje = signal<string | null>(null);
  modalError = signal<string | null>(null);
  aporteModalError = signal<string | null>(null);
  retiroModalError = signal<string | null>(null);
  exitoMensaje = signal<string | null>(null);

  // Listas de datos
  listaMetas = signal<MetaAhorroResponse[]>([]);
  listaCategoriasGasto = signal<CategoriaResponse[]>([]);
  listaCategoriasIngreso = signal<CategoriaResponse[]>([]);
  historialAportes = signal<AporteResponse[]>([]);

  // Filtros
  filtroEstado = signal<'TODAS' | 'EN_PROGRESO' | 'COMPLETADA'>('TODAS');
  terminoBusqueda = signal<string>('');

  // Modales
  modalAbierto = signal<boolean>(false);
  modalAporteAbierto = signal<boolean>(false);
  modalRetiroAbierto = signal<boolean>(false);
  modalHistorialAbierto = signal<boolean>(false);
  modalEliminarAbierto = signal<boolean>(false);

  // Elementos activos
  metaEnEdicion = signal<MetaAhorroResponse | null>(null);
  metaParaAporte = signal<MetaAhorroResponse | null>(null);
  metaParaRetiro = signal<MetaAhorroResponse | null>(null);
  metaHistorial = signal<MetaAhorroResponse | null>(null);
  metaAEliminar = signal<MetaAhorroResponse | null>(null);

  // Métodos de pago
  readonly metodosPago = [
    'Efectivo',
    'Nequi',
    'Daviplata',
    'Tarjeta Débito',
    'Transferencia Bancaria',
  ];

  // Formulario Meta (Crear / Editar)
  metaForm = this.fb.group({
    titulo: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    montoObjetivo: [null as number | null, [Validators.required, Validators.min(1)]],
    fechaLimite: [this.obtenerFechaFuturaDefecto(), [Validators.required]],
  });

  // Formulario Aporte
  aporteForm = this.fb.group({
    monto: [null as number | null, [Validators.required, Validators.min(1)]],
    categoriaId: [null as number | null, [Validators.required]],
    metodoPago: ['Efectivo', [Validators.required]],
    fecha: [this.obtenerFechaHoy(), [Validators.required]],
    nota: ['', [Validators.maxLength(100)]],
  });

  // Formulario Retiro
  retiroForm = this.fb.group({
    montoRetiro: [null as number | null, [Validators.required, Validators.min(1)]],
    categoriaId: [null as number | null, [Validators.required]],
    metodoPago: ['Efectivo', [Validators.required]],
    fecha: [this.obtenerFechaHoy(), [Validators.required]],
    descripcion: ['', [Validators.maxLength(100)]],
  });

  // Metas filtradas
  metasFiltradas = computed(() => {
    let resultado = this.listaMetas();

    const estado = this.filtroEstado();
    if (estado !== 'TODAS') {
      resultado = resultado.filter((m) => m.estado === estado);
    }

    const query = this.terminoBusqueda().trim().toLowerCase();
    if (query) {
      resultado = resultado.filter((m) => m.titulo.toLowerCase().includes(query));
    }

    return resultado;
  });

  // Totales
  totalAhorradoGlobal = computed(() => {
    return this.listaMetas().reduce((sum, m) => sum + Number(m.montoAcumulado || 0), 0);
  });

  totalObjetivoGlobal = computed(() => {
    return this.listaMetas().reduce((sum, m) => sum + Number(m.montoObjetivo || 0), 0);
  });

  porcentajeGlobalAhorrado = computed(() => {
    const obj = this.totalObjetivoGlobal();
    if (obj <= 0) return 0;
    const porc = Math.round((this.totalAhorradoGlobal() / obj) * 100);
    return Math.min(100, Math.max(0, porc));
  });

  conteoEnProgreso = computed(
    () => this.listaMetas().filter((m) => m.estado === EstadoMetaModel.EN_PROGRESO).length
  );

  conteoCompletadas = computed(
    () => this.listaMetas().filter((m) => m.estado === EstadoMetaModel.COMPLETADA).length
  );

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando.set(true);
    this.errorMensaje.set(null);

    // Categorías de Gasto para abonos
    this.categoriaService.obtenerCategorias(TipoTransaccionModel.GASTO).subscribe({
      next: (cats) => this.listaCategoriasGasto.set(cats),
      error: () => {},
    });

    // Categorías de Ingreso para retiros
    this.categoriaService.obtenerCategorias(TipoTransaccionModel.INGRESO).subscribe({
      next: (cats) => this.listaCategoriasIngreso.set(cats),
      error: () => {},
    });

    // Cargar metas
    this.metaService.obtenerMetas().subscribe({
      next: (metas) => {
        this.listaMetas.set(metas);
        this.cargando.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        this.errorMensaje.set(
          err.error?.mensaje || 'No se pudieron cargar las metas de ahorro. Intenta de nuevo.'
        );
      },
    });
  }

  cambiarFiltroEstado(nuevoEstado: 'TODAS' | 'EN_PROGRESO' | 'COMPLETADA'): void {
    this.filtroEstado.set(nuevoEstado);
  }

  actualizarBusqueda(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.terminoBusqueda.set(target.value);
  }

  limpiarBusqueda(): void {
    this.terminoBusqueda.set('');
  }

  // --- Modal Crear / Editar Meta ---
  abrirModalCrear(): void {
    this.metaEnEdicion.set(null);
    this.metaForm.reset({
      titulo: '',
      montoObjetivo: null,
      fechaLimite: this.obtenerFechaFuturaDefecto(),
    });
    this.modalError.set(null);
    this.modalAbierto.set(true);
  }

  abrirModalEditar(meta: MetaAhorroResponse): void {
    this.metaEnEdicion.set(meta);
    this.metaForm.reset({
      titulo: meta.titulo,
      montoObjetivo: meta.montoObjetivo,
      fechaLimite: meta.fechaLimite,
    });
    this.modalError.set(null);
    this.modalAbierto.set(true);
  }

  cerrarModal(): void {
    this.modalAbierto.set(false);
    this.modalError.set(null);
    this.metaEnEdicion.set(null);
  }

  guardarMeta(): void {
    if (this.metaForm.invalid) {
      this.metaForm.markAllAsTouched();
      return;
    }

    const { titulo, montoObjetivo, fechaLimite } = this.metaForm.value;

    if (!titulo?.trim()) {
      this.modalError.set('El título de la meta es obligatorio.');
      return;
    }

    if (!montoObjetivo || montoObjetivo <= 0) {
      this.modalError.set('El monto objetivo debe ser mayor a 0.');
      return;
    }

    this.guardando.set(true);
    this.modalError.set(null);

    const editando = this.metaEnEdicion();

    if (editando) {
      // Actualizar
      const request: ActualizarMetaAhorro = {
        titulo: titulo.trim(),
        montoObjetivo: Number(montoObjetivo),
        fechaLimite: fechaLimite || null,
      };

      this.metaService.actualizarMeta(editando.id, request).subscribe({
        next: (metaActualizada) => {
          this.listaMetas.update((lista) =>
            lista.map((m) => (m.id === editando.id ? metaActualizada : m))
          );
          this.guardando.set(false);
          this.cerrarModal();
          this.mostrarExito('¡Meta de ahorro actualizada!');
        },
        error: (err) => {
          this.guardando.set(false);
          this.modalError.set(err.error?.mensaje || 'Error al actualizar la meta.');
        },
      });
    } else {
      // Crear nueva
      const request: MetaAhorroModel = {
        titulo: titulo.trim(),
        montoObjetivo: Number(montoObjetivo),
        fechaLimite: fechaLimite || null,
      };

      this.metaService.crearMeta(request).subscribe({
        next: (nuevaMeta) => {
          this.listaMetas.update((lista) => [nuevaMeta, ...lista]);
          this.guardando.set(false);
          this.cerrarModal();
          this.mostrarExito('¡Nueva meta de ahorro creada exitosamente!');
        },
        error: (err) => {
          this.guardando.set(false);
          this.modalError.set(err.error?.mensaje || 'Error al crear la meta. Revisa los datos.');
        },
      });
    }
  }

  // --- Modal Abonar / Aportar ---
  abrirModalAporte(meta: MetaAhorroResponse): void {
    this.metaParaAporte.set(meta);

    const primeraCatId =
      this.listaCategoriasGasto().length > 0 ? this.listaCategoriasGasto()[0].id : null;

    this.aporteForm.reset({
      monto: null,
      categoriaId: primeraCatId,
      metodoPago: 'Efectivo',
      fecha: this.obtenerFechaHoy(),
      nota: '',
    });

    this.aporteModalError.set(null);
    this.modalAporteAbierto.set(true);
  }

  cerrarModalAporte(): void {
    this.modalAporteAbierto.set(false);
    this.aporteModalError.set(null);
    this.metaParaAporte.set(null);
  }

  seleccionarMetodoAporte(metodo: string): void {
    this.aporteForm.patchValue({ metodoPago: metodo });
  }

  sumarAlAporte(montoExtra: number): void {
    const actual = Number(this.aporteForm.get('monto')?.value || 0);
    this.aporteForm.patchValue({ monto: actual + montoExtra });
  }

  llenarAporteRestante(): void {
    const meta = this.metaParaAporte();
    if (!meta) return;
    const restante = Math.max(0, Number(meta.montoObjetivo) - Number(meta.montoAcumulado || 0));
    this.aporteForm.patchValue({ monto: restante });
  }

  guardarAporte(): void {
    const meta = this.metaParaAporte();
    if (!meta) return;

    if (this.aporteForm.invalid) {
      this.aporteForm.markAllAsTouched();
      return;
    }

    const { monto, categoriaId, metodoPago, fecha, nota } = this.aporteForm.value;

    if (!monto || monto <= 0) {
      this.aporteModalError.set('Ingresa un monto a abonar mayor a 0.');
      return;
    }

    if (!categoriaId) {
      this.aporteModalError.set('Selecciona una categoría contable para el registro.');
      return;
    }

    this.abonando.set(true);
    this.aporteModalError.set(null);

    const request: AporteAhorroModel = {
      metaId: meta.id,
      categoriaId: Number(categoriaId),
      monto: Number(monto),
      metodoPago: metodoPago || 'Efectivo',
      fecha: fecha || this.obtenerFechaHoy(),
      nota: (nota || '').trim(),
    };

    this.metaService.crearAporte(request).subscribe({
      next: () => {
        // Actualizar localmente el saldo de la meta
        const nuevoAcumulado = Number(meta.montoAcumulado || 0) + Number(monto);
        const nuevoEstado =
          nuevoAcumulado >= Number(meta.montoObjetivo)
            ? EstadoMetaModel.COMPLETADA
            : EstadoMetaModel.EN_PROGRESO;

        this.listaMetas.update((lista) =>
          lista.map((m) =>
            m.id === meta.id
              ? {
                  ...m,
                  montoAcumulado: nuevoAcumulado,
                  estado: nuevoEstado,
                }
              : m
          )
        );

        this.abonando.set(false);
        this.cerrarModalAporte();
        this.mostrarExito(
          `¡Aporte de ${this.formatearCOP(Number(monto))} agregado a "${meta.titulo}"!`
        );
      },
      error: (err) => {
        this.abonando.set(false);
        this.aporteModalError.set(
          err.error?.mensaje || 'No se pudo registrar el abono. Intenta de nuevo.'
        );
      },
    });
  }

  // --- Modal Retiro de Ahorro ---
  abrirModalRetiro(meta: MetaAhorroResponse): void {
    this.metaParaRetiro.set(meta);

    const primeraCatId =
      this.listaCategoriasIngreso().length > 0 ? this.listaCategoriasIngreso()[0].id : null;

    this.retiroForm.reset({
      montoRetiro: null,
      categoriaId: primeraCatId,
      metodoPago: 'Efectivo',
      fecha: this.obtenerFechaHoy(),
      descripcion: '',
    });

    this.retiroModalError.set(null);
    this.modalRetiroAbierto.set(true);
  }

  cerrarModalRetiro(): void {
    this.modalRetiroAbierto.set(false);
    this.retiroModalError.set(null);
    this.metaParaRetiro.set(null);
  }

  seleccionarMetodoRetiro(metodo: string): void {
    this.retiroForm.patchValue({ metodoPago: metodo });
  }

  establecerMontoRetiroPorcentaje(porcentaje: number): void {
    const meta = this.metaParaRetiro();
    if (!meta) return;
    const acumulado = Number(meta.montoAcumulado || 0);
    const montoCalculado = Math.round((acumulado * porcentaje) / 100);
    this.retiroForm.patchValue({ montoRetiro: montoCalculado });
  }

  guardarRetiro(): void {
    const meta = this.metaParaRetiro();
    if (!meta) return;

    if (this.retiroForm.invalid) {
      this.retiroForm.markAllAsTouched();
      return;
    }

    const { montoRetiro, categoriaId, metodoPago, fecha, descripcion } = this.retiroForm.value;

    if (!montoRetiro || montoRetiro <= 0) {
      this.retiroModalError.set('El monto a retirar debe ser mayor a 0.');
      return;
    }

    if (montoRetiro > Number(meta.montoAcumulado || 0)) {
      this.retiroModalError.set(
        `Saldo insuficiente. Solo puedes retirar hasta ${this.formatearCOP(meta.montoAcumulado)}.`
      );
      return;
    }

    if (!categoriaId) {
      this.retiroModalError.set('Selecciona una categoría de ingreso para reincorporar el dinero.');
      return;
    }

    this.retirando.set(true);
    this.retiroModalError.set(null);

    const request: RetiroAhorro = {
      metaId: meta.id,
      categoriaId: Number(categoriaId),
      montoRetiro: Number(montoRetiro),
      metodoPago: metodoPago || 'Efectivo',
      fecha: fecha || this.obtenerFechaHoy(),
      descripcion: (descripcion || '').trim(),
    };

    this.metaService.retirarDinero(request).subscribe({
      next: (metaActualizada) => {
        this.listaMetas.update((lista) =>
          lista.map((m) => (m.id === meta.id ? metaActualizada : m))
        );
        this.retirando.set(false);
        this.cerrarModalRetiro();
        this.mostrarExito(
          `¡Retiro de ${this.formatearCOP(Number(montoRetiro))} completado con éxito!`
        );
      },
      error: (err) => {
        this.retirando.set(false);
        this.retiroModalError.set(err.error?.mensaje || 'Error al procesar el retiro.');
      },
    });
  }

  // --- Modal Historial de Aportes ---
  abrirModalHistorial(meta: MetaAhorroResponse): void {
    this.metaHistorial.set(meta);
    this.historialAportes.set([]);
    this.cargandoHistorial.set(true);
    this.modalHistorialAbierto.set(true);

    this.metaService.obtenerHistorialAportes(meta.id).subscribe({
      next: (aportes) => {
        this.historialAportes.set(aportes);
        this.cargandoHistorial.set(false);
      },
      error: () => {
        this.cargandoHistorial.set(false);
      },
    });
  }

  cerrarModalHistorial(): void {
    this.modalHistorialAbierto.set(false);
    this.metaHistorial.set(null);
    this.historialAportes.set([]);
  }

  // --- Eliminar Meta ---
  abrirConfirmarEliminar(meta: MetaAhorroResponse): void {
    this.metaAEliminar.set(meta);
    this.modalEliminarAbierto.set(true);
  }

  cerrarConfirmarEliminar(): void {
    this.modalEliminarAbierto.set(false);
    this.metaAEliminar.set(null);
  }

  confirmarEliminar(): void {
    const meta = this.metaAEliminar();
    if (!meta) return;

    this.eliminando.set(true);
    this.metaService.eliminarMeta(meta.id).subscribe({
      next: () => {
        this.listaMetas.update((lista) => lista.filter((m) => m.id !== meta.id));
        this.eliminando.set(false);
        this.cerrarConfirmarEliminar();
        this.mostrarExito('Meta de ahorro eliminada.');
      },
      error: (err) => {
        this.eliminando.set(false);
        this.errorMensaje.set(err.error?.mensaje || 'No se pudo eliminar la meta de ahorro.');
        this.cerrarConfirmarEliminar();
      },
    });
  }

  // Helpers de visualización
  formatearCOP(monto: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(monto || 0);
  }

  formatearFechaLegible(fechaStr: string): string {
    if (!fechaStr) return '';
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

  obtenerPorcentajeMeta(meta: MetaAhorroResponse): number {
    const objetivo = Number(meta.montoObjetivo || 0);
    const acumulado = Number(meta.montoAcumulado || 0);
    if (objetivo <= 0) return 0;
    const porc = Math.round((acumulado / objetivo) * 100);
    return Math.min(100, Math.max(0, porc));
  }

  obtenerDiasRestantes(fechaStr: string): { texto: string; vencido: boolean } {
    if (!fechaStr) return { texto: '', vencido: false };
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const [year, month, day] = fechaStr.split('-').map(Number);
    const fechaLim = new Date(year, month - 1, day);
    fechaLim.setHours(0, 0, 0, 0);

    const diffMs = fechaLim.getTime() - hoy.getTime();
    const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDias === 0) {
      return { texto: 'Finaliza hoy', vencido: false };
    } else if (diffDias > 0) {
      return { texto: `${diffDias} ${diffDias === 1 ? 'día restante' : 'días restantes'}`, vencido: false };
    } else {
      return { texto: 'Plazo expirado', vencido: true };
    }
  }

  private obtenerFechaHoy(): string {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private obtenerFechaFuturaDefecto(): string {
    const d = new Date();
    d.setMonth(d.getMonth() + 3); // 3 meses a futuro por defecto
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
