import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { crearAlarma } from './alarma'
import * as t from './temporizadores'
import type { Temporizador } from './temporizadores'

// localStorage puede lanzar error con solo leer la propiedad (por ejemplo, con las cookies bloqueadas).
const almacen = t.crearAlmacen(() => {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage
  } catch {
    return undefined
  }
})

/** Si terminó hace más que esto (se volvió a la pestaña mucho después), se avisa en pantalla, sin hacer sonar la alarma. */
const SUENA_HASTA_MS = 2 * t.MINUTO_MS

export interface Temporizadores {
  /** Los de esta receta, por número de paso. */
  lista: Temporizador[]
  terminados: Temporizador[]
  ahora: number
  silenciada: boolean
  /** Lo que acaba de terminar, para anunciarlo. */
  anuncio: string
  iniciar: (paso: number, minutos: number) => void
  pausar: (paso: number) => void
  reanudar: (paso: number) => void
  sumarMinuto: (paso: number) => void
  quitar: (paso: number) => void
  alternarSilencio: () => void
}

export function useTemporizadores(receta: string): Temporizadores {
  const [ahora, setAhora] = useState(() => Date.now())
  const [todos, setTodos] = useState(() => almacen.leer(Date.now()))
  const [silenciada, setSilenciada] = useState(() => almacen.silenciada())
  const [anuncio, setAnuncio] = useState('')
  const alarma = useRef(crearAlarma())
  const avisados = useRef(new Set<number>())

  const lista = useMemo(() => todos.filter((x) => x.receta === receta).sort((a, b) => a.paso - b.paso), [todos, receta])
  const terminados = useMemo(() => lista.filter((x) => t.estaTerminado(x, ahora)), [lista, ahora])
  const hayCorriendo = lista.some((x) => x.fin !== null && !t.estaTerminado(x, ahora))
  const hayTerminados = terminados.length > 0

  const actualizar = useCallback((cambio: (lista: readonly Temporizador[], instante: number) => Temporizador[]) => {
    const instante = Date.now()
    setAhora(instante)
    setTodos((actual) => {
      const nueva = cambio(actual, instante)
      almacen.guardar(nueva)
      return nueva
    })
  }, [])

  // Un segundo por tic mientras algo corre. La hora de fin manda, así que un tic atrasado no descuenta de menos.
  useEffect(() => {
    if (!hayCorriendo && !hayTerminados) return undefined
    const intervalo = setInterval(() => setAhora(Date.now()), 1000)
    return () => clearInterval(intervalo)
  }, [hayCorriendo, hayTerminados])

  // Al volver a la pestaña se pone al día de inmediato.
  useEffect(() => {
    const alVolver = () => {
      if (document.visibilityState === 'visible') setAhora(Date.now())
    }
    document.addEventListener('visibilitychange', alVolver)
    return () => document.removeEventListener('visibilitychange', alVolver)
  }, [])

  useEffect(() => {
    const instancia = alarma.current
    return () => instancia.detener()
  }, [])

  // Lo que acaba de terminar: se anuncia una vez y suena, salvo que esté silenciada o haya pasado hace mucho.
  useEffect(() => {
    const nuevos = terminados.filter((x) => !avisados.current.has(x.paso))
    for (const x of nuevos) avisados.current.add(x.paso)
    for (const paso of avisados.current) if (!terminados.some((x) => x.paso === paso)) avisados.current.delete(paso)
    if (!hayTerminados) alarma.current.detener()
    if (!nuevos.length) return
    setAnuncio(`Terminó el temporizador ${nuevos.map((x) => `del paso ${x.paso}`).join(' y ')}.`)
    const recientes = nuevos.some((x) => ahora - (x.fin ?? 0) < SUENA_HASTA_MS)
    if (recientes && !silenciada) alarma.current.sonar()
  }, [terminados, hayTerminados, ahora, silenciada])

  return {
    lista,
    terminados,
    ahora,
    silenciada,
    anuncio,
    iniciar: useCallback(
      (paso, minutos) => {
        alarma.current.preparar()
        actualizar((l, i) => t.iniciar(l, receta, paso, minutos, i))
      },
      [actualizar, receta],
    ),
    pausar: useCallback((paso) => actualizar((l, i) => t.pausar(l, receta, paso, i)), [actualizar, receta]),
    reanudar: useCallback(
      (paso) => {
        alarma.current.preparar()
        actualizar((l, i) => t.reanudar(l, receta, paso, i))
      },
      [actualizar, receta],
    ),
    sumarMinuto: useCallback(
      (paso) => {
        alarma.current.preparar()
        actualizar((l, i) => t.sumarMinuto(l, receta, paso, i))
      },
      [actualizar, receta],
    ),
    quitar: useCallback((paso) => actualizar((l) => t.quitar(l, receta, paso)), [actualizar, receta]),
    alternarSilencio: useCallback(() => {
      setSilenciada((actual) => {
        const nuevo = !actual
        almacen.fijarSilencio(nuevo)
        if (nuevo) alarma.current.detener()
        else alarma.current.preparar()
        return nuevo
      })
    }, []),
  }
}
