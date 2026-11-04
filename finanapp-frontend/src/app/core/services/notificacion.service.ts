import { computed, inject, Injectable, signal } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Notificacion, TipoNotificacion } from '../models/notificacion.model';
import { ObligacionService } from './obligacion.service';
import { MetaAhorroService } from './meta-ahorro.service';

const STORAGE_KEY = 'finanapp_notificaciones';
const DISMISSED_KEY = 'finanapp_notificaciones_descartadas';

@Injectable({
  providedIn: 'root',
})
export class NotificacionService {
  private obligacionService = inject(ObligacionService);
  private metaAhorroService = inject(MetaAhorroService);

  notificaciones = signal<Notificacion[]>([]);
  cargando = signal<boolean>(false);

  noLeidasCount = computed(() => this.notificaciones().filter((n) => !n.leida).length);
  deudasCount = computed(() => this.notificaciones().filter((n) => n.tipo === 'DEUDA').length);
  ahorrosCount = computed(() => this.notificaciones().filter((n) => n.tipo === 'AHORRO').length);
  sistemaCount = computed(
    () => this.notificaciones().filter((n) => n.tipo === 'SISTEMA' || n.tipo === 'CONSEJO').length
  );

  constructor() {
    this.cargarDesdeAlmacenamiento();
    this.sincronizar();
  }

  /**
   * Carga notificaciones guardadas en LocalStorage
   */
  private cargarDesdeAlmacenamiento(): void {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed: Notificacion[] = JSON.parse(data);
        if (Array.isArray(parsed)) {
          this.notificaciones.set(parsed);
        }
      }
    } catch {
      // Ignorar errores al leer localStorage
    }
  }

  /**
   * Guarda las notificaciones actuales en LocalStorage
   */
  private guardarEnAlmacenamiento(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.notificaciones()));
    } catch {
      // Ignorar errores al guardar
    }
  }

  private obtenerDescartadas(): Set<string> {
    try {
      const data = localStorage.getItem(DISMISSED_KEY);
      if (data) {
        return new Set(JSON.parse(data));
      }
    } catch {
      // Ignorar error
    }
    return new Set<string>();
  }

  private guardarDescartadas(descartadas: Set<string>): void {
    try {
      localStorage.setItem(DISMISSED_KEY, JSON.stringify(Array.from(descartadas)));
    } catch {
      // Ignorar error
    }
  }

  /**
   * Consulta las obligaciones, cuota de seguridad y metas de ahorro del backend
   * para generar las notificaciones financieras dinámicas en tiempo real.
   */
  sincronizar(): void {
    this.cargando.set(true);

    forkJoin({
      obligaciones: this.obligacionService.obtenerObligaciones().pipe(catchError(() => of([]))),
      cuotaSeguridad: this.obligacionService
        .obtenerCuotaSeguridad()
        .pipe(catchError(() => of({ cuotaSeguridad: 0 }))),
      metas: this.metaAhorroService.obtenerMetas().pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ obligaciones, cuotaSeguridad, metas }) => {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const hoyIsoStr = hoy.toISOString().split('T')[0];

        const descartadas = this.obtenerDescartadas();
        const existentesMap = new Map<string, Notificacion>();
        for (const notif of this.notificaciones()) {
          existentesMap.set(notif.id, notif);
        }

        const nuevasGeneradas: Notificacion[] = [];

        // 1. Alertas de Obligaciones / Deudas
        if (Array.isArray(obligaciones)) {
          for (const ob of obligaciones) {
            if (!ob.activa || (ob.saldoPendiente != null && ob.saldoPendiente <= 0)) {
              continue;
            }

            const fechaVenc = ob.proximoVencimiento
              ? new Date(ob.proximoVencimiento + 'T00:00:00')
              : null;
            const diffDias = fechaVenc
              ? Math.ceil((fechaVenc.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
              : null;

            // Deuda Vencida
            if (ob.estado === 'VENCIDA' || (diffDias != null && diffDias < 0)) {
              const id = `deuda-vencida-${ob.id}`;
              nuevasGeneradas.push({
                id,
                titulo: `Deuda Vencida: ${ob.nombre}`,
                mensaje: `Presentas un saldo de $${(ob.saldoPendiente || ob.monto).toLocaleString(
                  'es-CO'
                )} vencido desde el ${ob.proximoVencimiento}. Te sugerimos abonar cuanto antes.`,
                tipo: 'DEUDA',
                prioridad: 'ALTA',
                fecha: new Date().toISOString(),
                leida: false,
                rutaAccion: '/obligaciones',
                textoAccion: 'Pagar Deuda',
                icono: '🚨',
              });
            }
            // Deuda Próxima a Vencer (dentro de los próximos 3 días)
            else if (diffDias != null && diffDias <= 3) {
              const id = `deuda-proxima-${ob.id}`;
              const tiempoTexto = diffDias === 0 ? 'hoy' : `en ${diffDias} día(s)`;
              nuevasGeneradas.push({
                id,
                titulo: `Vencimiento Próximo: ${ob.nombre}`,
                mensaje: `Tu obligación vence ${tiempoTexto} (${ob.proximoVencimiento}). Saldo pendiente: $${(
                  ob.saldoPendiente || ob.monto
                ).toLocaleString('es-CO')} COP.`,
                tipo: 'DEUDA',
                prioridad: 'MEDIA',
                fecha: new Date().toISOString(),
                leida: false,
                rutaAccion: '/obligaciones',
                textoAccion: 'Abonar',
                icono: '⏳',
              });
            }
          }
        }

        // 2. Alerta de Cuota Diaria de Seguridad
        if (cuotaSeguridad && cuotaSeguridad.cuotaSeguridad > 0) {
          const id = `cuota-seguridad-${hoyIsoStr}`;
          nuevasGeneradas.push({
            id,
            titulo: 'Cuota Diaria de Seguridad Sugerida',
            mensaje: `Para cubrir tus compromisos a tiempo, te sugerimos apartar hoy $${cuotaSeguridad.cuotaSeguridad.toLocaleString(
              'es-CO'
            )} COP.`,
            tipo: 'SISTEMA',
            prioridad: 'MEDIA',
            fecha: new Date().toISOString(),
            leida: false,
            rutaAccion: '/obligaciones',
            textoAccion: 'Ver Obligaciones',
            icono: '🛡️',
          });
        }

        // 3. Alertas de Metas de Ahorro
        if (Array.isArray(metas)) {
          for (const meta of metas) {
            const acumulado = meta.montoAcumulado || 0;
            const objetivo = meta.montoObjetivo || 0;

            // Meta Cumplida
            if (meta.estado === 'COMPLETADA' || (objetivo > 0 && acumulado >= objetivo)) {
              const id = `meta-cumplida-${meta.id}`;
              nuevasGeneradas.push({
                id,
                titulo: `¡Meta Alcanzada: ${meta.titulo}!`,
                mensaje: `¡Felicitaciones! Has completado el 100% de tu objetivo de ahorro con $${acumulado.toLocaleString(
                  'es-CO'
                )} COP acumulados.`,
                tipo: 'AHORRO',
                prioridad: 'BAJA',
                fecha: new Date().toISOString(),
                leida: false,
                rutaAccion: '/ahorros',
                textoAccion: 'Ver Meta',
                icono: '🏆',
              });
            }
            // Meta por finalizar (dentro de 5 días o menos y no cumplida)
            else if (meta.fechaLimite) {
              const fechaObj = new Date(meta.fechaLimite + 'T00:00:00');
              const diffDias = Math.ceil((fechaObj.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
              if (diffDias >= 0 && diffDias <= 5) {
                const id = `meta-proxima-${meta.id}`;
                nuevasGeneradas.push({
                  id,
                  titulo: `Meta por finalizar: ${meta.titulo}`,
                  mensaje: `Tu plazo finaliza en ${diffDias === 0 ? 'hoy' : diffDias + ' días'}. Llevas $${acumulado.toLocaleString(
                    'es-CO'
                  )} de $${objetivo.toLocaleString('es-CO')} COP.`,
                  tipo: 'AHORRO',
                  prioridad: 'MEDIA',
                  fecha: new Date().toISOString(),
                  leida: false,
                  rutaAccion: '/ahorros',
                  textoAccion: 'Abonar a Meta',
                  icono: '🎯',
                });
              }
            }
          }
        }

        // 4. Consejo de Flujo Diario
        const idConsejo = `consejo-flujo-${hoyIsoStr}`;
        nuevasGeneradas.push({
          id: idConsejo,
          titulo: 'Control de Flujo Diario',
          mensaje:
            'Recuerda anotar todos los ingresos y gastos diarios al terminar tu jornada para mantener tus finanzas transparentes.',
          tipo: 'CONSEJO',
          prioridad: 'BAJA',
          fecha: new Date().toISOString(),
          leida: false,
          rutaAccion: '/transacciones',
          textoAccion: 'Nuevo Movimiento',
          icono: '💡',
        });

        // Combinar con existentes respetando el estado de lectura y las descartadas
        const listaFinal: Notificacion[] = [];

        for (const nueva of nuevasGeneradas) {
          if (descartadas.has(nueva.id)) {
            continue;
          }
          if (existentesMap.has(nueva.id)) {
            const anterior = existentesMap.get(nueva.id)!;
            listaFinal.push({
              ...nueva,
              leida: anterior.leida,
              fecha: anterior.fecha,
            });
            existentesMap.delete(nueva.id);
          } else {
            listaFinal.push(nueva);
          }
        }

        // Mantener notificaciones personalizadas o adicionales no generadas automáticamente
        existentesMap.forEach((notif) => {
          if (notif.id.startsWith('custom-')) {
            listaFinal.push(notif);
          }
        });

        // Ordenar: primero no leídas, luego por prioridad (ALTA, MEDIA, BAJA), y luego por fecha más reciente
        const prioridadPeso: Record<string, number> = { ALTA: 3, MEDIA: 2, BAJA: 1 };
        listaFinal.sort((a, b) => {
          if (a.leida !== b.leida) {
            return a.leida ? 1 : -1;
          }
          const pesoDiff = (prioridadPeso[b.prioridad] || 0) - (prioridadPeso[a.prioridad] || 0);
          if (pesoDiff !== 0) return pesoDiff;
          return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
        });

        this.notificaciones.set(listaFinal);
        this.guardarEnAlmacenamiento();
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
      },
    });
  }

  marcarComoLeida(id: string): void {
    this.notificaciones.update((lista) =>
      lista.map((n) => (n.id === id ? { ...n, leida: true } : n))
    );
    this.guardarEnAlmacenamiento();
  }

  marcarTodasComoLeidas(): void {
    this.notificaciones.update((lista) => lista.map((n) => ({ ...n, leida: true })));
    this.guardarEnAlmacenamiento();
  }

  eliminarNotificacion(id: string): void {
    const descartadas = this.obtenerDescartadas();
    descartadas.add(id);
    this.guardarDescartadas(descartadas);

    this.notificaciones.update((lista) => lista.filter((n) => n.id !== id));
    this.guardarEnAlmacenamiento();
  }

  limpiarTodas(): void {
    const descartadas = this.obtenerDescartadas();
    for (const notif of this.notificaciones()) {
      descartadas.add(notif.id);
    }
    this.guardarDescartadas(descartadas);

    this.notificaciones.set([]);
    this.guardarEnAlmacenamiento();
  }

  agregarNotificacion(datos: {
    titulo: string;
    mensaje: string;
    tipo: TipoNotificacion;
    prioridad: 'ALTA' | 'MEDIA' | 'BAJA';
    rutaAccion?: string;
    textoAccion?: string;
    icono?: string;
  }): void {
    const nueva: Notificacion = {
      id: `custom-${Date.now()}`,
      titulo: datos.titulo,
      mensaje: datos.mensaje,
      tipo: datos.tipo,
      prioridad: datos.prioridad,
      fecha: new Date().toISOString(),
      leida: false,
      rutaAccion: datos.rutaAccion,
      textoAccion: datos.textoAccion,
      icono: datos.icono || '🔔',
    };

    this.notificaciones.update((lista) => [nueva, ...lista]);
    this.guardarEnAlmacenamiento();
  }
}
