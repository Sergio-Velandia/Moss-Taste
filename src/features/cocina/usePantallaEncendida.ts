import { useCallback, useEffect, useRef, useState } from 'react'

export interface PantallaEncendida {
  /** El navegador tiene la Screen Wake Lock API. */
  soportada: boolean
  activa: boolean
  /** El navegador la negó (por ejemplo, con la batería baja). */
  negada: boolean
  /** El botón: enciende o apaga. Si la apagan a mano, un temporizador no la vuelve a encender. */
  alternar: () => void
  /** Al iniciar un temporizador: la enciende, salvo que la hayan apagado a mano. */
  encender: () => void
}

/*
 * Mantiene la pantalla encendida en el modo cocina. El navegador la suelta al salir de la pestaña, así que
 * se vuelve a pedir al regresar; y se suelta del todo al salir del modo cocina.
 */
export function usePantallaEncendida(): PantallaEncendida {
  const soportada = typeof navigator !== 'undefined' && 'wakeLock' in navigator
  const [activa, setActiva] = useState(false)
  const [negada, setNegada] = useState(false)
  const candado = useRef<WakeLockSentinel | null>(null)
  const deseada = useRef(false)
  const apagadaAMano = useRef(false)

  const pedir = useCallback(async () => {
    if (!soportada || candado.current) return
    try {
      const nuevo = await navigator.wakeLock.request('screen')
      // Pudieron apagarla o salir mientras el navegador respondía.
      if (!deseada.current) {
        await nuevo.release()
        return
      }
      candado.current = nuevo
      nuevo.addEventListener('release', () => {
        if (candado.current === nuevo) candado.current = null
        setActiva(false)
      })
      setActiva(true)
      setNegada(false)
    } catch {
      setActiva(false)
      setNegada(true)
    }
  }, [soportada])

  const soltar = useCallback(() => {
    deseada.current = false
    void candado.current?.release()
    candado.current = null
    setActiva(false)
  }, [])

  useEffect(() => {
    const alVolver = () => {
      if (document.visibilityState === 'visible' && deseada.current) void pedir()
    }
    document.addEventListener('visibilitychange', alVolver)
    return () => {
      document.removeEventListener('visibilitychange', alVolver)
      soltar()
    }
  }, [pedir, soltar])

  const alternar = useCallback(() => {
    if (deseada.current) {
      apagadaAMano.current = true
      soltar()
      return
    }
    apagadaAMano.current = false
    deseada.current = true
    void pedir()
  }, [pedir, soltar])

  const encender = useCallback(() => {
    if (apagadaAMano.current || deseada.current) return
    deseada.current = true
    void pedir()
  }, [pedir])

  return { soportada, activa, negada, alternar, encender }
}
