// La alarma de los temporizadores: tres pitidos generados en el navegador, sin archivos de sonido, y vibración donde
// exista. Los navegadores solo dejan sonar si hubo un toque antes: por eso `preparar` se llama al pulsar «Iniciar».

const CADA_MS = 1600
/** Suena un minuto como mucho: el aviso visual se queda hasta que le den «Listo». */
const MAXIMO_MS = 60_000
const PITIDOS = [0, 0.22, 0.44]

export interface Alarma {
  preparar: () => void
  sonar: () => void
  detener: () => void
}

type ConstructorAudio = typeof AudioContext

export function crearAlarma(): Alarma {
  let contexto: AudioContext | null = null
  let intervalo: ReturnType<typeof setInterval> | undefined
  let limite: ReturnType<typeof setTimeout> | undefined

  function obtenerContexto(): AudioContext | null {
    if (contexto) return contexto
    const Audio = (window.AudioContext ?? (window as unknown as { webkitAudioContext?: ConstructorAudio }).webkitAudioContext) as ConstructorAudio | undefined
    if (!Audio) return null
    try {
      contexto = new Audio()
    } catch {
      return null
    }
    return contexto
  }

  // El navegador solo deja vibrar después de un toque en la página (tras recargar, todavía no lo hay).
  function vibrar(patron: number | number[]) {
    if (navigator.userActivation?.hasBeenActive !== false) navigator.vibrate?.(patron)
  }

  function pitar() {
    vibrar([300, 150, 300])
    const ctx = obtenerContexto()
    if (!ctx) return
    const inicio = ctx.currentTime
    for (const desde of PITIDOS) {
      const oscilador = ctx.createOscillator()
      const volumen = ctx.createGain()
      oscilador.type = 'sine'
      oscilador.frequency.value = 880
      volumen.gain.setValueAtTime(0.0001, inicio + desde)
      volumen.gain.exponentialRampToValueAtTime(0.35, inicio + desde + 0.02)
      volumen.gain.exponentialRampToValueAtTime(0.0001, inicio + desde + 0.18)
      oscilador.connect(volumen)
      volumen.connect(ctx.destination)
      oscilador.start(inicio + desde)
      oscilador.stop(inicio + desde + 0.2)
    }
  }

  const detener = () => {
    // Sin esto, abrir el modo cocina pediría apagar una vibración que nunca empezó, y el navegador lo rechaza.
    if (intervalo === undefined) return
    clearInterval(intervalo)
    clearTimeout(limite)
    intervalo = undefined
    vibrar(0)
  }

  return {
    preparar() {
      void obtenerContexto()?.resume().catch(() => {})
    },
    sonar() {
      if (intervalo !== undefined) return
      pitar()
      intervalo = setInterval(pitar, CADA_MS)
      limite = setTimeout(detener, MAXIMO_MS)
    },
    detener,
  }
}
