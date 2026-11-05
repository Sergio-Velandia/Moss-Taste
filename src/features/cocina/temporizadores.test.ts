import { describe, expect, it } from 'vitest'
import * as t from './temporizadores'

const MIN = t.MINUTO_MS
const R = 'lentejas-con-chorizo'
const AHORA = 1_000_000_000

function storageFalso(inicial: Record<string, string> = {}): Storage {
  const datos = new Map(Object.entries(inicial))
  return {
    getItem: (k) => datos.get(k) ?? null,
    setItem: (k, v) => void datos.set(k, v),
    removeItem: (k) => void datos.delete(k),
    clear: () => datos.clear(),
    key: () => null,
    get length() {
      return datos.size
    },
  }
}

describe('un temporizador', () => {
  const uno = t.iniciar([], R, 2, 30, AHORA)

  it('cuenta por hora de fin: no importa cuántos tics se pierdan en segundo plano', () => {
    expect(uno[0]).toEqual({ receta: R, paso: 2, fin: AHORA + 30 * MIN, restanteMs: null })
    expect(t.restante(uno[0] as t.Temporizador, AHORA + 10 * MIN)).toBe(20 * MIN)
    expect(t.estaTerminado(uno[0] as t.Temporizador, AHORA + 30 * MIN - 1)).toBe(false)
    expect(t.estaTerminado(uno[0] as t.Temporizador, AHORA + 30 * MIN)).toBe(true)
    expect(t.restante(uno[0] as t.Temporizador, AHORA + 40 * MIN)).toBe(0)
  })

  it('al pausar deja de contar y al reanudar sigue con lo que le faltaba', () => {
    const pausado = t.pausar(uno, R, 2, AHORA + 10 * MIN)
    expect(pausado[0]).toEqual({ receta: R, paso: 2, fin: null, restanteMs: 20 * MIN })
    expect(t.restante(pausado[0] as t.Temporizador, AHORA + 999 * MIN)).toBe(20 * MIN)
    expect(t.estaTerminado(pausado[0] as t.Temporizador, AHORA + 999 * MIN)).toBe(false)
    const seguido = t.reanudar(pausado, R, 2, AHORA + 50 * MIN)
    expect(seguido[0]?.fin).toBe(AHORA + 70 * MIN)
  })

  it('suma un minuto corriendo, en pausa y ya terminado', () => {
    expect(t.sumarMinuto(uno, R, 2, AHORA)[0]?.fin).toBe(AHORA + 31 * MIN)
    expect(t.sumarMinuto(t.pausar(uno, R, 2, AHORA), R, 2, AHORA)[0]?.restanteMs).toBe(31 * MIN)
    // Si ya terminó, el minuto cuenta desde ahora, no desde cuando terminó.
    const tarde = AHORA + 40 * MIN
    expect(t.sumarMinuto(uno, R, 2, tarde)[0]?.fin).toBe(tarde + MIN)
  })

  it('no se puede pausar uno ya terminado', () => {
    const tarde = AHORA + 40 * MIN
    expect(t.pausar(uno, R, 2, tarde)).toEqual(uno)
  })

  it('varios a la vez, sin pisarse; volver a iniciar reemplaza al del mismo paso', () => {
    const dos = t.iniciar(uno, R, 3, 8, AHORA + MIN)
    expect(dos).toHaveLength(2)
    expect(t.buscar(dos, R, 3)?.fin).toBe(AHORA + 9 * MIN)
    expect(t.buscar(dos, R, 2)?.fin).toBe(AHORA + 30 * MIN)
    expect(t.iniciar(dos, R, 2, 5, AHORA)).toHaveLength(2)
    expect(t.quitar(dos, R, 2).map((x) => x.paso)).toEqual([3])
  })

  it('el mismo paso de otra receta es otro temporizador', () => {
    const otro = t.iniciar(uno, 'sudado-de-pollo', 2, 5, AHORA)
    expect(otro).toHaveLength(2)
    expect(t.quitar(otro, R, 2).map((x) => x.receta)).toEqual(['sudado-de-pollo'])
  })
})

describe('formatos', () => {
  it.each([
    [0, '00:00'],
    [1, '00:01'],
    [30 * MIN, '30:00'],
    [59 * MIN + 1000, '59:01'],
    [150 * MIN, '2:30:00'],
  ])('%i ms se ve %s', (ms, texto) => {
    expect(t.formatoReloj(ms)).toBe(texto)
  })

  it.each([
    [10_000, 'hace un momento'],
    [MIN, 'hace 1 minuto'],
    [3 * MIN, 'hace 3 minutos'],
    [60 * MIN, 'hace 1 h'],
    [65 * MIN, 'hace 1 h 5 min'],
  ])('%i ms terminó %s', (ms, texto) => {
    expect(t.formatoHace(ms)).toBe(texto)
  })
})

describe('lo guardado en el navegador', () => {
  it('guarda solo la receta, el paso y la hora de fin', () => {
    const storage = storageFalso()
    const almacen = t.crearAlmacen(() => storage)
    almacen.guardar(t.iniciar([], R, 2, 30, AHORA))
    expect(JSON.parse(storage.getItem(t.CLAVE_TEMPORIZADORES) ?? '')).toEqual([{ receta: R, paso: 2, fin: AHORA + 30 * MIN, restanteMs: null }])
  })

  it('sobrevive a una recarga, y al quitar el último ya no queda nada', () => {
    const storage = storageFalso()
    const almacen = t.crearAlmacen(() => storage)
    almacen.guardar(t.iniciar([], R, 2, 30, AHORA))
    expect(t.crearAlmacen(() => storage).leer(AHORA + MIN)).toHaveLength(1)
    almacen.guardar([])
    expect(storage.getItem(t.CLAVE_TEMPORIZADORES)).toBeNull()
  })

  it('si borran los datos del sitio, no revive lo que había en memoria', () => {
    const storage = storageFalso()
    const almacen = t.crearAlmacen(() => storage)
    almacen.guardar(t.iniciar([], R, 2, 30, AHORA))
    storage.clear()
    expect(almacen.leer(AHORA)).toEqual([])
  })

  it('descarta lo que no cuadra', () => {
    const datos = [
      { receta: R, paso: 2, fin: AHORA, restanteMs: null },
      { receta: 'CON ESPACIOS', paso: 1, fin: AHORA, restanteMs: null },
      { receta: R, paso: 0, fin: AHORA, restanteMs: null },
      { receta: R, paso: 3, fin: 'mañana', restanteMs: null },
      { receta: R, paso: 4, fin: null, restanteMs: -5 },
      { receta: R, paso: 2, fin: AHORA + 1, restanteMs: null },
      'nada',
    ]
    expect(t.validarTemporizadores(datos, AHORA).map((x) => x.paso)).toEqual([2])
    expect(t.validarTemporizadores('roto', AHORA)).toEqual([])
    const dañado = storageFalso({ [t.CLAVE_TEMPORIZADORES]: '{roto' })
    expect(t.crearAlmacen(() => dañado).leer(AHORA)).toEqual([])
  })

  it('borra los que terminaron hace más de 12 horas, pero no los pausados', () => {
    const datos = [
      { receta: R, paso: 1, fin: AHORA - 13 * 60 * MIN, restanteMs: null },
      { receta: R, paso: 2, fin: AHORA - 60 * MIN, restanteMs: null },
      { receta: R, paso: 3, fin: null, restanteMs: 5 * MIN },
    ]
    expect(t.validarTemporizadores(datos, AHORA).map((x) => x.paso)).toEqual([2, 3])
  })

  it('funciona en memoria si el navegador no deja guardar', () => {
    const lleno = storageFalso()
    lleno.setItem = () => {
      throw new DOMException('Cuota', 'QuotaExceededError')
    }
    const almacen = t.crearAlmacen(() => lleno)
    almacen.guardar(t.iniciar([], R, 2, 30, AHORA))
    expect(almacen.leer(AHORA)).toHaveLength(1)
    almacen.fijarSilencio(true)
    expect(almacen.silenciada()).toBe(true)
    const sinNada = t.crearAlmacen(() => undefined)
    sinNada.guardar(t.iniciar([], R, 2, 30, AHORA))
    expect(sinNada.leer(AHORA)).toHaveLength(1)
  })

  it('la alarma suena por defecto y el silencio se recuerda', () => {
    const storage = storageFalso()
    const almacen = t.crearAlmacen(() => storage)
    expect(almacen.silenciada()).toBe(false)
    almacen.fijarSilencio(true)
    expect(t.crearAlmacen(() => storage).silenciada()).toBe(true)
    almacen.fijarSilencio(false)
    expect(storage.getItem(t.CLAVE_SILENCIO)).toBeNull()
  })
})
