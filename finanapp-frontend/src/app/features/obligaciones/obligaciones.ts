import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ObligacionService } from '../../core/services/obligacion.service';
import { CategoriaService } from '../../core/services/categoria.service';
import { LayoutService } from '../../core/services/layout.service';
import {
  ActualizarObligacion,
  CuotaSeguridad,
  ObligacionModel,
  ObligacionResponse,
} from '../../core/models/obligacion.model';
import { EstadoObligacionModel } from '../../core/models/estado-obligacion.model';
import { FrecuenciaModel } from '../../core/models/frecuencia.model';
import {
  PagoObligacionModel,
  PagoObligacionResponse,
} from '../../core/models/pago-obligacion.model';
import { CategoriaResponse } from '../../core/models/categoria.model';
import { TipoTransaccionModel } from '../../core/models/tipo-transaccion.model';

@Component({
  selector: 'app-obligaciones',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './obligaciones.html',
  styleUrl: './obligaciones.css',
})
export class Obligaciones implements OnInit {
  private fb = inject(FormBuilder);
  private obligacionService = inject(ObligacionService);
  private categoriaService = inject(CategoriaService);
  layoutService = inject(LayoutService);

  readonly EstadoObligacion = EstadoObligacionModel;
  readonly Frecuencia = FrecuenciaModel;

  // Estados de datos y carga
  cargando = signal<boolean>(false);
  guardando = signal<boolean>(false);
  pagando = signal<boolean>(false);
  desactivando = signal<boolean>(false);
  cargandoHistorial = signal<boolean>(false);

  errorMensaje = signal<string | null>(null);
  modalError = signal<string | null>(null);
  pagoModalError = signal<string | null>(null);
  exitoMensaje = signal<string | null>(null);

  // Listas
  listaObligaciones = signal<ObligacionResponse[]>([]);
  listaCategoriasGasto = signal<CategoriaResponse[]>([]);
  cuotaSeguridad = signal<number>(0);
  historialPagos = signal<PagoObligacionResponse[]>([]);

  // Filtros
  filtroEstado = signal<'TODAS' | 'PENDIENTE' | 'VENCIDA' | 'PAGADA'>('TODAS');
  terminoBusqueda = signal<string>('');

  // Modales
  modalAbierto = signal<boolean>(false);
  modalPagoAbierto = signal<boolean>(false);
  modalHistorialAbierto = signal<boolean>(false);
  modalDesactivarAbierto = signal<boolean>(false);

  // Elementos activos para modales
  obligacionEnEdicion = signal<ObligacionResponse | null>(null);
  obligacionAPagar = signal<ObligacionResponse | null>(null);
  obligacionADesactivar = signal<ObligacionResponse | null>(null);
  obligacionHistorial = signal<ObligacionResponse | null>(null);

  // Opciones de métodos de pago
  readonly metodosPago = [
    'Efectivo',
    'Nequi',
    'Daviplata',
    'Tarjeta Débito',
    'Tarjeta Crédito',
    'Transferencia Bancaria',
  ];

  // Opciones de frecuencia
  readonly frecuencias: { valor: FrecuenciaModel; etiqueta: string }[] = [
    { valor: FrecuenciaModel.MENSUAL, etiqueta: 'Mensual' },
    { valor: FrecuenciaModel.QUINCENAL, etiqueta: 'Quincenal' },
    { valor: FrecuenciaModel.SEMANAL, etiqueta: 'Semanal' },
    { valor: FrecuenciaModel.DIARIA, etiqueta: 'Diaria' },
  ];

  // Formulario Obligación (Crear / Editar)
  obligacionForm = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    monto: [null as number | null, [Validators.required, Validators.min(1)]],
    frecuencia: [FrecuenciaModel.MENSUAL, [Validators.required]],
    proximoVencimiento: [this.obtenerFechaHoy(), [Validators.required]],
    diaLimitePago: [null as number | null, [Validators.min(1), Validators.max(31)]],
  });

  // Formulario de Pago / Abono
  pagoForm = this.fb.group({
    montoPagado: [null as number | null, [Validators.required, Validators.min(1)]],
    categoriaId: [null as number | null, [Validators.required]],
    metodoPago: ['Efectivo', [Validators.required]],
    fechaPago: [this.obtenerFechaHoy(), [Validators.required]],
  });

  // Lista filtrada por estado y término de búsqueda
  obligacionesFiltradas = computed(() => {
    let resultado = this.listaObligaciones();

    const estado = this.filtroEstado();
    if (estado !== 'TODAS') {
      resultado = resultado.filter((o) => o.estado === estado);
    }

    const query = this.terminoBusqueda().trim().toLowerCase();
    if (query) {
      resultado = resultado.filter((o) => o.nombre.toLowerCase().includes(query));
    }

    return resultado;
  });

  // Contadores y totales
  totalDeudaPendiente = computed(() => {
    return this.listaObligaciones()
      .filter((o) => o.activa)
      .reduce((sum, o) => sum + Number(o.saldoPendiente || 0), 0);
  });

  totalMontoEstimado = computed(() => {
    return this.listaObligaciones()
      .filter((o) => o.activa)
      .reduce((sum, o) => sum + Number(o.monto || 0), 0);
  });

  conteoPendientes = computed(
    () => this.listaObligaciones().filter((o) => o.estado === EstadoObligacionModel.PENDIENTE).length
  );

  conteoVencidas = computed(
    () => this.listaObligaciones().filter((o) => o.estado === EstadoObligacionModel.VENCIDA).length
  );

  conteoPagadas = computed(
    () => this.listaObligaciones().filter((o) => o.estado === EstadoObligacionModel.PAGADA).length
  );

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando.set(true);
    this.errorMensaje.set(null);

    // Cargar cuota de seguridad diaria
    this.obligacionService.obtenerCuotaSeguridad().subscribe({
      next: (res) => {
        this.cuotaSeguridad.set(res?.cuotaSeguridad ? Number(res.cuotaSeguridad) : 0);
      },
      error: () => {},
    });

    // Cargar categorías de tipo Gasto para asociar pagos
    this.categoriaService.obtenerCategorias(TipoTransaccionModel.GASTO).subscribe({
      next: (cats) => {
        this.listaCategoriasGasto.set(cats);
      },
      error: () => {},
    });

    // Cargar obligaciones
    this.obligacionService.obtenerObligaciones().subscribe({
      next: (data) => {
        this.listaObligaciones.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        this.errorMensaje.set(
          err.error?.mensaje || 'No se pudieron cargar las obligaciones. Intenta de nuevo.'
        );
      },
    });
  }

  cambiarFiltroEstado(nuevoEstado: 'TODAS' | 'PENDIENTE' | 'VENCIDA' | 'PAGADA'): void {
    this.filtroEstado.set(nuevoEstado);
  }

  actualizarBusqueda(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.terminoBusqueda.set(target.value);
  }

  limpiarBusqueda(): void {
    this.terminoBusqueda.set('');
  }

  // --- Modal Crear / Editar Obligación ---
  abrirModalCrear(): void {
    this.obligacionEnEdicion.set(null);
    this.obligacionForm.reset({
      nombre: '',
      monto: null,
      frecuencia: FrecuenciaModel.MENSUAL,
      proximoVencimiento: this.obtenerFechaHoy(),
      diaLimitePago: null,
    });
    this.modalError.set(null);
    this.modalAbierto.set(true);
  }

  abrirModalEditar(ob: ObligacionResponse): void {
    this.obligacionEnEdicion.set(ob);
    this.obligacionForm.reset({
      nombre: ob.nombre,
      monto: ob.monto,
      frecuencia: ob.frecuencia,
      proximoVencimiento: ob.proximoVencimiento,
      diaLimitePago: ob.diaLimitePago,
    });
    this.modalError.set(null);
    this.modalAbierto.set(true);
  }

  cerrarModal(): void {
    this.modalAbierto.set(false);
    this.modalError.set(null);
    this.obligacionEnEdicion.set(null);
  }

  guardarObligacion(): void {
    if (this.obligacionForm.invalid) {
      this.obligacionForm.markAllAsTouched();
      return;
    }

    const { nombre, monto, frecuencia, proximoVencimiento, diaLimitePago } = this.obligacionForm.value;

    if (!nombre?.trim()) {
      this.modalError.set('El nombre de la obligación es obligatorio.');
      return;
    }

    if (!monto || monto <= 0) {
      this.modalError.set('El monto debe ser mayor a 0.');
      return;
    }

    if (!proximoVencimiento) {
      this.modalError.set('La fecha de próximo vencimiento es obligatoria.');
      return;
    }

    this.guardando.set(true);
    this.modalError.set(null);

    const obEditando = this.obligacionEnEdicion();

    if (obEditando) {
      // Editar
      const requestActualizar: ActualizarObligacion = {
        nombre: nombre.trim(),
        monto: Number(monto),
        frecuencia: frecuencia as FrecuenciaModel,
        proximoVencimiento,
        diaLimitePago: diaLimitePago ? Number(diaLimitePago) : null,
      };

      this.obligacionService.actualizarObligacion(obEditando.id, requestActualizar).subscribe({
        next: (obActualizada) => {
          this.listaObligaciones.update((lista) =>
            lista.map((o) => (o.id === obEditando.id ? obActualizada : o))
          );
          this.guardando.set(false);
          this.cerrarModal();
          this.mostrarExito('¡Obligación actualizada exitosamente!');
        },
        error: (err) => {
          this.guardando.set(false);
          this.modalError.set(
            err.error?.mensaje || 'Error al actualizar la obligación. Revisa los datos.'
          );
        },
      });
    } else {
      // Crear nueva
      const nuevaOb: ObligacionModel = {
        nombre: nombre.trim(),
        monto: Number(monto),
        frecuencia: frecuencia as FrecuenciaModel,
        proximoVencimiento,
        diaLimitePago: diaLimitePago ? Number(diaLimitePago) : null,
      };

      this.obligacionService.crearObligacion(nuevaOb).subscribe({
        next: (obCreada) => {
          this.listaObligaciones.update((lista) => [obCreada, ...lista]);
          this.guardando.set(false);
          this.cerrarModal();
          this.mostrarExito('¡Obligación registrada exitosamente!');
          this.recargarCuotaSeguridad();
        },
        error: (err) => {
          this.guardando.set(false);
          this.modalError.set(
            err.error?.mensaje || 'Error al registrar la obligación. Revisa los campos.'
          );
        },
      });
    }
  }

  // --- Modal Registrar Pago / Abono ---
  abrirModalPago(ob: ObligacionResponse): void {
    this.obligacionAPagar.set(ob);

    // Categoría por defecto si existe alguna de gasto
    const primeraCatId =
      this.listaCategoriasGasto().length > 0 ? this.listaCategoriasGasto()[0].id : null;

    this.pagoForm.reset({
      montoPagado: Number(ob.saldoPendiente || 0),
      categoriaId: primeraCatId,
      metodoPago: 'Efectivo',
      fechaPago: this.obtenerFechaHoy(),
    });

    this.pagoModalError.set(null);
    this.modalPagoAbierto.set(true);
  }

  cerrarModalPago(): void {
    this.modalPagoAbierto.set(false);
    this.pagoModalError.set(null);
    this.obligacionAPagar.set(null);
  }

  seleccionarMetodoPago(metodo: string): void {
    this.pagoForm.patchValue({ metodoPago: metodo });
  }

  establecerMontoPago(porcentaje: number): void {
    const ob = this.obligacionAPagar();
    if (!ob) return;
    const saldo = Number(ob.saldoPendiente || 0);
    const montoCalculado = Math.round((saldo * porcentaje) / 100);
    this.pagoForm.patchValue({ montoPagado: montoCalculado });
  }

  guardarPago(): void {
    const ob = this.obligacionAPagar();
    if (!ob) return;

    if (this.pagoForm.invalid) {
      this.pagoForm.markAllAsTouched();
      return;
    }

    const { montoPagado, categoriaId, metodoPago, fechaPago } = this.pagoForm.value;

    if (!montoPagado || montoPagado <= 0) {
      this.pagoModalError.set('Ingresa un monto válido mayor a 0.');
      return;
    }

    if (montoPagado > Number(ob.saldoPendiente)) {
      this.pagoModalError.set(
        `El monto no puede superar el saldo pendiente (${this.formatearCOP(ob.saldoPendiente)}).`
      );
      return;
    }

    if (!categoriaId) {
      this.pagoModalError.set('Debes seleccionar una categoría contable para este gasto.');
      return;
    }

    this.pagando.set(true);
    this.pagoModalError.set(null);

    const requestPago: PagoObligacionModel = {
      obligacionId: ob.id,
      categoriaId: Number(categoriaId),
      metodoPago: metodoPago || 'Efectivo',
      montoPagado: Number(montoPagado),
      fechaPago: fechaPago || this.obtenerFechaHoy(),
    };

    this.obligacionService.crearPago(requestPago).subscribe({
      next: (pagoRealizado) => {
        // Actualizar la obligación localmente
        const nuevoSaldo = Math.max(0, Number(ob.saldoPendiente) - Number(montoPagado));
        const nuevoEstado =
          nuevoSaldo <= 0 ? EstadoObligacionModel.PAGADA : EstadoObligacionModel.PENDIENTE;

        this.listaObligaciones.update((lista) =>
          lista.map((o) =>
            o.id === ob.id
              ? {
                  ...o,
                  saldoPendiente: nuevoSaldo,
                  estado: nuevoEstado,
                }
              : o
          )
        );

        this.pagando.set(false);
        this.cerrarModalPago();
        this.mostrarExito(
          `¡Abono de ${this.formatearCOP(Number(montoPagado))} registrado exitosamente!`
        );
        this.recargarCuotaSeguridad();
      },
      error: (err) => {
        this.pagando.set(false);
        this.pagoModalError.set(
          err.error?.mensaje || 'No se pudo registrar el pago. Verifica los campos.'
        );
      },
    });
  }

  // --- Modal Historial de Pagos ---
  abrirModalHistorial(ob: ObligacionResponse): void {
    this.obligacionHistorial.set(ob);
    this.historialPagos.set([]);
    this.cargandoHistorial.set(true);
    this.modalHistorialAbierto.set(true);

    this.obligacionService.obtenerHistorialPagos(ob.id).subscribe({
      next: (pagos) => {
        this.historialPagos.set(pagos);
        this.cargandoHistorial.set(false);
      },
      error: () => {
        this.cargandoHistorial.set(false);
      },
    });
  }

  cerrarModalHistorial(): void {
    this.modalHistorialAbierto.set(false);
    this.obligacionHistorial.set(null);
    this.historialPagos.set([]);
  }

  // --- Desactivar / Eliminar ---
  abrirConfirmarDesactivar(ob: ObligacionResponse): void {
    this.obligacionADesactivar.set(ob);
    this.modalDesactivarAbierto.set(true);
  }

  cerrarConfirmarDesactivar(): void {
    this.modalDesactivarAbierto.set(false);
    this.obligacionADesactivar.set(null);
  }

  confirmarDesactivar(): void {
    const ob = this.obligacionADesactivar();
    if (!ob) return;

    this.desactivando.set(true);
    this.obligacionService.desactivarObligacion(ob.id).subscribe({
      next: () => {
        this.listaObligaciones.update((lista) => lista.filter((o) => o.id !== ob.id));
        this.desactivando.set(false);
        this.cerrarConfirmarDesactivar();
        this.mostrarExito('Obligación desactivada exitosamente.');
        this.recargarCuotaSeguridad();
      },
      error: (err) => {
        this.desactivando.set(false);
        this.errorMensaje.set(err.error?.mensaje || 'No se pudo desactivar la obligación.');
        this.cerrarConfirmarDesactivar();
      },
    });
  }

  // --- Helpers de Formato ---
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

  obtenerPorcentajePagado(ob: ObligacionResponse): number {
    const monto = Number(ob.monto || 0);
    const saldo = Number(ob.saldoPendiente || 0);
    if (monto <= 0) return 0;
    const pagado = monto - saldo;
    const porcentaje = Math.round((pagado / monto) * 100);
    return Math.max(0, Math.min(100, porcentaje));
  }

  obtenerDiasRestantes(fechaStr: string): { texto: string; vencido: boolean } {
    if (!fechaStr) return { texto: '', vencido: false };
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const [year, month, day] = fechaStr.split('-').map(Number);
    const fechaVenc = new Date(year, month - 1, day);
    fechaVenc.setHours(0, 0, 0, 0);

    const diffMs = fechaVenc.getTime() - hoy.getTime();
    const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDias === 0) {
      return { texto: 'Vence hoy', vencido: false };
    } else if (diffDias > 0) {
      return { texto: `Vence en ${diffDias} ${diffDias === 1 ? 'día' : 'días'}`, vencido: false };
    } else {
      const diasVencido = Math.abs(diffDias);
      return { texto: `Venció hace ${diasVencido} ${diasVencido === 1 ? 'día' : 'días'}`, vencido: true };
    }
  }

  private recargarCuotaSeguridad(): void {
    this.obligacionService.obtenerCuotaSeguridad().subscribe({
      next: (res) => {
        this.cuotaSeguridad.set(res?.cuotaSeguridad ? Number(res.cuotaSeguridad) : 0);
      },
      error: () => {},
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
