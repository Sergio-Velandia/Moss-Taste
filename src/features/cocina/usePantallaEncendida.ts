import { useCallback } from 'react'

export interface PantallaEncendida {
  /** El navegador tiene la Screen Wake Lock API. */
  soportada: boolean
  activa: boolean
  /** true mientras la lógica no esté implementada. */
  pendiente: boolean
  alternar: () => void
}

/*
 * Gancho para mantener la pantalla encendida en el modo cocina.
 * PENDIENTE (fase funcional, ver ROADMAP): pedir navigator.wakeLock.request('screen'), soltarlo al salir
 * del modo cocina y volver a pedirlo cuando la pestaña recupere la visibilidad. Hoy solo detecta el soporte.
 */
export function usePantallaEncendida(): PantallaEncendida {
  const soportada = typeof navigator !== 'undefined' && 'wakeLock' in navigator
  const alternar = useCallback(() => {}, [])
  return { soportada, activa: false, pendiente: true, alternar }
}
