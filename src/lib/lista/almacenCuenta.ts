import { MAX_BYTES, validarEstado, type AlmacenLista, type EstadoLista } from './almacen'

// La lista mientras hay sesión: vive en memoria y se guarda en la cuenta poco después de cada cambio.
// Si falla, sigue en memoria y se reintenta con el siguiente cambio. `persistente` lo dice para avisarlo.

export const ESPERA_GUARDADO_MS = 500

export const textoLista = (estado: EstadoLista): string => JSON.stringify(estado)

export function leerTextoLista(texto: string): EstadoLista {
  try {
    return validarEstado(texto ? JSON.parse(texto) : null)
  } catch {
    return validarEstado(null)
  }
}

export interface AlmacenCuenta extends AlmacenLista {
  /** Guarda ya lo pendiente (antes de cerrar sesión). */
  guardarPendiente: () => Promise<void>
  /** Trae lo que otro dispositivo guardó, si aquí no hay nada sin guardar. */
  recibir: (texto: string) => void
  /** Deja de guardar (la cuenta se está borrando). */
  detener: () => void
}

export function crearAlmacenCuenta(inicial: EstadoLista, guardar: (texto: string) => Promise<void>, persistenteInicial = true): AlmacenCuenta {
  const oyentes = new Set<() => void>()
  let estado = inicial
  let persistente = persistenteInicial
  let pendiente = false
  let detenido = false
  let temporizador: ReturnType<typeof setTimeout> | undefined
  let ultimoGuardado = textoLista(inicial)
  const avisar = () => oyentes.forEach((o) => o())

  async function guardarAhora() {
    clearTimeout(temporizador)
    if (!pendiente || detenido) return
    pendiente = false
    const texto = textoLista(estado)
    try {
      if (texto.length > MAX_BYTES) throw new RangeError('La lista supera el tope de tamaño')
      await guardar(texto)
      ultimoGuardado = texto
      persistente = true
    } catch {
      persistente = false
    }
    avisar()
  }

  return {
    leer: () => estado,
    persistente: () => persistente,
    cambiar(nuevo) {
      estado = nuevo
      pendiente = true
      clearTimeout(temporizador)
      temporizador = setTimeout(() => void guardarAhora(), ESPERA_GUARDADO_MS)
      avisar()
    },
    suscribir(oyente) {
      oyentes.add(oyente)
      return () => oyentes.delete(oyente)
    },
    recargar() {},
    guardarPendiente: guardarAhora,
    recibir(texto) {
      if (pendiente || !persistente || texto === ultimoGuardado) return
      ultimoGuardado = texto
      estado = leerTextoLista(texto)
      avisar()
    },
    detener() {
      detenido = true
      clearTimeout(temporizador)
    },
  }
}
