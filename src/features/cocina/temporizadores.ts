// Temporizadores del modo cocina: lógica pura y su almacenamiento, sin React.
// - Cuentan por hora de fin, no por segundos sumados: los navegadores frenan las pestañas en segundo plano.
// - Se guardan en el navegador solo la receta, el paso y la hora de fin (o lo que falta, si están en pausa),
//   para no perder 2 h 30 de sobrebarriga por una recarga. Se borran al terminar y darles «Listo».

export const CLAVE_TEMPORIZADORES = 'moss-taste:temporizadores'
export const CLAVE_SILENCIO = 'moss-taste:alarma-silenciada'
export const MINUTO_MS = 60_000
const MAX_TEMPORIZADORES = 50
/** Uno terminado hace tanto ya no le sirve a nadie: se borra aunque no le hayan dado «Listo». */
const VENCIDO_MS = 12 * 60 * MINUTO_MS

export interface Temporizador {
  receta: string
  /** Número del paso, desde 1. */
  paso: number
  /** Hora de fin en milisegundos; null si está en pausa. */
  fin: number | null
  /** Lo que falta; solo si está en pausa. */
  restanteMs: number | null
}

const ID = /^[a-z0-9]+(-[a-z0-9]+)*$/

/** Lo leído del almacenamiento es entrada externa: lo que no cuadre se descarta. */
export function validarTemporizadores(datos: unknown, ahora: number): Temporizador[] {
  if (!Array.isArray(datos)) return []
  const validos: Temporizador[] = []
  for (const d of datos as unknown[]) {
    if (typeof d !== 'object' || d === null) continue
    const { receta, paso, fin, restanteMs } = d as Record<string, unknown>
    if (typeof receta !== 'string' || !ID.test(receta) || !Number.isInteger(paso) || (paso as number) < 1) continue
    const corriendo = typeof fin === 'number' && Number.isFinite(fin) && restanteMs == null
    const enPausa = fin == null && typeof restanteMs === 'number' && Number.isFinite(restanteMs) && restanteMs > 0
    if (!corriendo && !enPausa) continue
    if (corriendo && ahora - (fin as number) > VENCIDO_MS) continue
    if (validos.some((t) => t.receta === receta && t.paso === paso)) continue
    validos.push({ receta, paso: paso as number, fin: corriendo ? (fin as number) : null, restanteMs: enPausa ? (restanteMs as number) : null })
  }
  return validos.slice(-MAX_TEMPORIZADORES)
}

const esEste = (t: Temporizador, receta: string, paso: number) => t.receta === receta && t.paso === paso
const cambiar = (lista: readonly Temporizador[], receta: string, paso: number, cambio: (t: Temporizador) => Temporizador) => lista.map((t) => (esEste(t, receta, paso) ? cambio(t) : t))

export const buscar = (lista: readonly Temporizador[], receta: string, paso: number) => lista.find((t) => esEste(t, receta, paso))
export const estaTerminado = (t: Temporizador, ahora: number) => t.fin !== null && t.fin <= ahora
export const restante = (t: Temporizador, ahora: number) => (t.fin !== null ? Math.max(0, t.fin - ahora) : (t.restanteMs ?? 0))

export function iniciar(lista: readonly Temporizador[], receta: string, paso: number, minutos: number, ahora: number): Temporizador[] {
  return [...lista.filter((t) => !esEste(t, receta, paso)), { receta, paso, fin: ahora + minutos * MINUTO_MS, restanteMs: null }].slice(-MAX_TEMPORIZADORES)
}

export function pausar(lista: readonly Temporizador[], receta: string, paso: number, ahora: number): Temporizador[] {
  return cambiar(lista, receta, paso, (t) => (t.fin === null || estaTerminado(t, ahora) ? t : { ...t, fin: null, restanteMs: t.fin - ahora }))
}

export function reanudar(lista: readonly Temporizador[], receta: string, paso: number, ahora: number): Temporizador[] {
  return cambiar(lista, receta, paso, (t) => (t.fin !== null ? t : { ...t, fin: ahora + (t.restanteMs ?? 0), restanteMs: null }))
}

/** Si ya había terminado, vuelve a correr con ese minuto: «le falta un poquito». */
export function sumarMinuto(lista: readonly Temporizador[], receta: string, paso: number, ahora: number): Temporizador[] {
  return cambiar(lista, receta, paso, (t) => {
    if (t.fin === null) return { ...t, restanteMs: (t.restanteMs ?? 0) + MINUTO_MS }
    return { ...t, fin: Math.max(t.fin, ahora) + MINUTO_MS }
  })
}

export function quitar(lista: readonly Temporizador[], receta: string, paso: number): Temporizador[] {
  return lista.filter((t) => !esEste(t, receta, paso))
}

/** «24:13», o «2:30:00» si pasa de una hora. Redondea hacia arriba: nunca muestra 00:00 antes de terminar. */
export function formatoReloj(ms: number): string {
  const total = Math.ceil(Math.max(0, ms) / 1000)
  const dos = (n: number) => String(n).padStart(2, '0')
  const horas = Math.floor(total / 3600)
  const minutos = Math.floor((total % 3600) / 60)
  const segundos = total % 60
  return horas ? `${horas}:${dos(minutos)}:${dos(segundos)}` : `${dos(minutos)}:${dos(segundos)}`
}

/** «hace un momento», «hace 3 minutos», «hace 1 h 5 min». */
export function formatoHace(ms: number): string {
  const minutos = Math.floor(ms / MINUTO_MS)
  if (minutos < 1) return 'hace un momento'
  if (minutos < 60) return minutos === 1 ? 'hace 1 minuto' : `hace ${minutos} minutos`
  const resto = minutos % 60
  return `hace ${Math.floor(minutos / 60)} h${resto ? ` ${resto} min` : ''}`
}

export interface AlmacenTemporizadores {
  leer: (ahora: number) => Temporizador[]
  guardar: (lista: readonly Temporizador[]) => void
  silenciada: () => boolean
  fijarSilencio: (silenciada: boolean) => void
}

/** Si el navegador no deja guardar, todo sigue funcionando en memoria mientras la pestaña esté abierta. */
export function crearAlmacen(obtenerStorage: () => Storage | undefined): AlmacenTemporizadores {
  let memoria: Temporizador[] = []
  let silencioEnMemoria = false
  /** El último guardado funcionó: si ahora no hay nada, es que borraron los datos del sitio. */
  let guardado = false
  return {
    leer(ahora) {
      try {
        const crudo = obtenerStorage()?.getItem(CLAVE_TEMPORIZADORES)
        if (crudo != null) memoria = validarTemporizadores(JSON.parse(crudo), ahora)
        else if (guardado) memoria = []
      } catch {
        // Bloqueado o dañado: se sigue con lo que hay en memoria.
      }
      return memoria
    },
    guardar(lista) {
      memoria = [...lista]
      try {
        const storage = obtenerStorage()
        if (lista.length) storage?.setItem(CLAVE_TEMPORIZADORES, JSON.stringify(lista))
        else storage?.removeItem(CLAVE_TEMPORIZADORES)
        guardado = storage !== undefined
      } catch {
        // Modo privado o cuota llena: quedan en memoria.
        guardado = false
      }
    },
    silenciada() {
      try {
        const crudo = obtenerStorage()?.getItem(CLAVE_SILENCIO)
        if (crudo != null) silencioEnMemoria = crudo === '1'
      } catch {
        // Sin almacenamiento: vale lo de la memoria.
      }
      return silencioEnMemoria
    },
    fijarSilencio(silenciada) {
      silencioEnMemoria = silenciada
      try {
        const storage = obtenerStorage()
        if (silenciada) storage?.setItem(CLAVE_SILENCIO, '1')
        else storage?.removeItem(CLAVE_SILENCIO)
      } catch {
        // Queda en memoria.
      }
    },
  }
}
