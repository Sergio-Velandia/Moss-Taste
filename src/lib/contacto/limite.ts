/*
 * Tope de envíos desde este navegador: uno por minuto y cinco por día. Frena el doble clic y el abuso casual;
 * el límite que de verdad protege la cuota está en el panel de EmailJS (por IP), porque este se puede saltar.
 * Guarda solo las horas de los envíos. Si el navegador no deja guardar, el tope vive en memoria.
 */

export const CLAVE_ENVIOS = 'moss-taste:envios'
export const ESPERA_MS = 60_000
export const MAX_POR_DIA = 5
const DIA_MS = 24 * 60 * 60 * 1000

export type Bloqueo = { motivo: 'espera'; segundos: number } | { motivo: 'dia' }

/** Las horas de envío de las últimas 24 horas, sin valores raros. */
export function recientes(horas: unknown, ahora: number): number[] {
  if (!Array.isArray(horas)) return []
  return horas.filter((h): h is number => typeof h === 'number' && Number.isFinite(h) && h <= ahora && ahora - h < DIA_MS).slice(-MAX_POR_DIA)
}

export function bloqueo(horas: number[], ahora: number): Bloqueo | null {
  const vigentes = recientes(horas, ahora)
  if (vigentes.length >= MAX_POR_DIA) return { motivo: 'dia' }
  const ultima = vigentes.at(-1)
  if (ultima !== undefined && ahora - ultima < ESPERA_MS) return { motivo: 'espera', segundos: Math.ceil((ESPERA_MS - (ahora - ultima)) / 1000) }
  return null
}

export interface LimiteEnvios {
  bloqueo(ahora?: number): Bloqueo | null
  registrar(ahora?: number): void
}

export function crearLimite(obtenerStorage: () => Storage | undefined): LimiteEnvios {
  let memoria: number[] = []
  let guardado = false

  function leer(ahora: number): number[] {
    try {
      const crudo = obtenerStorage()?.getItem(CLAVE_ENVIOS)
      // Si ya se había guardado y no está, se borraron los datos del sitio: el tope vuelve a cero.
      if (crudo != null) memoria = recientes(JSON.parse(crudo), ahora)
      else if (guardado) memoria = []
    } catch {
      // Sin almacenamiento o con datos dañados: se sigue con lo que hay en memoria.
    }
    return memoria
  }

  return {
    bloqueo: (ahora = Date.now()) => bloqueo(leer(ahora), ahora),
    registrar(ahora = Date.now()) {
      memoria = [...leer(ahora), ahora].slice(-MAX_POR_DIA)
      try {
        const storage = obtenerStorage()
        storage?.setItem(CLAVE_ENVIOS, JSON.stringify(memoria))
        guardado = storage !== undefined
      } catch {
        // Modo privado o cuota llena: el tope queda en memoria hasta cerrar la pestaña.
      }
    },
  }
}

// El de la app. localStorage puede lanzar error con solo leer la propiedad (cookies bloqueadas).
export const limiteEnvios = crearLimite(() => {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage
  } catch {
    return undefined
  }
})
