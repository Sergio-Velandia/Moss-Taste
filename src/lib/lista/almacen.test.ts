import { describe, expect, it } from 'vitest'
import {
  agregarReceta,
  alternarComprado,
  CLAVE_LISTA,
  crearAlmacenLista,
  LISTA_VACIA,
  MAX_RECETAS,
  quitarReceta,
  validarEstado,
} from './almacen'

/** Un Storage en memoria; `fallar` simula el modo privado o el almacenamiento bloqueado. */
function storageFalso(fallar: 'nunca' | 'leer' | 'escribir' = 'nunca', inicial: Record<string, string> = {}): Storage {
  const datos = new Map(Object.entries(inicial))
  return {
    get length() {
      return datos.size
    },
    clear: () => datos.clear(),
    key: (i) => [...datos.keys()][i] ?? null,
    getItem: (k) => {
      if (fallar === 'leer') throw new Error('SecurityError')
      return datos.get(k) ?? null
    },
    setItem: (k, v) => {
      if (fallar === 'escribir') throw new Error('QuotaExceededError')
      datos.set(k, v)
    },
    removeItem: (k) => void datos.delete(k),
  }
}

describe('operaciones de la lista', () => {
  it('agrega, actualiza las porciones si ya está y respeta el tope de recetas', () => {
    let [estado, r] = agregarReceta(LISTA_VACIA, 'changua', 4)
    expect(r).toBe('agregada')
    ;[estado, r] = agregarReceta(estado, 'changua', 8)
    expect(r).toBe('actualizada')
    expect(estado.recetas).toEqual([{ id: 'changua', porciones: 8 }])

    const llena = { recetas: Array.from({ length: MAX_RECETAS }, (_, i) => ({ id: `r-${i}`, porciones: 2 })), comprados: [] }
    expect(agregarReceta(llena, 'otra', 2)).toEqual([llena, 'llena'])
  })

  it('quita recetas y marca o desmarca comprados', () => {
    const estado = { recetas: [{ id: 'changua', porciones: 4 }], comprados: [] }
    expect(quitarReceta(estado, 'changua').recetas).toEqual([])
    const marcado = alternarComprado(estado, 'leche')
    expect(marcado.comprados).toEqual(['leche'])
    expect(alternarComprado(marcado, 'leche').comprados).toEqual([])
  })
})

describe('validarEstado', () => {
  it('descarta lo que no cuadra: ids raros, porciones fuera de rango, repetidos y basura', () => {
    expect(
      validarEstado({
        recetas: [
          { id: 'changua', porciones: 4 },
          { id: 'changua', porciones: 9 },
          { id: '<script>', porciones: 2 },
          { id: 'ajiaco', porciones: 0 },
          { id: 'arroz', porciones: 2.5 },
          'texto',
        ],
        comprados: ['leche', 3, null],
      }),
    ).toEqual({ recetas: [{ id: 'changua', porciones: 4 }], comprados: ['leche'] })
    expect(validarEstado('basura')).toEqual(LISTA_VACIA)
    expect(validarEstado(null)).toEqual(LISTA_VACIA)
  })
})

describe('crearAlmacenLista', () => {
  it('guarda y vuelve a leer del almacenamiento', () => {
    const storage = storageFalso()
    const almacen = crearAlmacenLista(() => storage)
    almacen.cambiar({ recetas: [{ id: 'changua', porciones: 4 }], comprados: [] })
    expect(crearAlmacenLista(() => storage).leer().recetas).toEqual([{ id: 'changua', porciones: 4 }])
    expect(almacen.persistente()).toBe(true)
  })

  it('con datos dañados en el almacenamiento arranca vacía', () => {
    const almacen = crearAlmacenLista(() => storageFalso('nunca', { [CLAVE_LISTA]: '{no es json' }))
    expect(almacen.leer()).toEqual(LISTA_VACIA)
  })

  it('si no se puede leer (modo privado), funciona en memoria y lo dice', () => {
    const almacen = crearAlmacenLista(() => storageFalso('leer'))
    expect(almacen.leer()).toEqual(LISTA_VACIA)
    expect(almacen.persistente()).toBe(false)
  })

  it('si no se puede escribir, la lista sigue en memoria y lo dice', () => {
    const almacen = crearAlmacenLista(() => storageFalso('escribir'))
    almacen.cambiar({ recetas: [{ id: 'changua', porciones: 4 }], comprados: [] })
    expect(almacen.leer().recetas).toHaveLength(1)
    expect(almacen.persistente()).toBe(false)
  })

  it('sin almacenamiento disponible también funciona en memoria', () => {
    const almacen = crearAlmacenLista(() => undefined)
    almacen.cambiar({ recetas: [{ id: 'changua', porciones: 4 }], comprados: [] })
    expect(almacen.leer().recetas).toHaveLength(1)
    expect(almacen.persistente()).toBe(false)
  })

  it('no escribe más allá del tope de tamaño', () => {
    const storage = storageFalso()
    const almacen = crearAlmacenLista(() => storage)
    almacen.cambiar({ recetas: [], comprados: Array.from({ length: 600 }, (_, i) => `ingrediente-con-un-nombre-bastante-largo-${i}`) })
    expect(storage.getItem(CLAVE_LISTA)).toBeNull()
    expect(almacen.persistente()).toBe(false)
  })

  it('avisa a quien esté suscrito', () => {
    const almacen = crearAlmacenLista(() => storageFalso())
    let avisos = 0
    const cancelar = almacen.suscribir(() => avisos++)
    almacen.cambiar(LISTA_VACIA)
    cancelar()
    almacen.cambiar(LISTA_VACIA)
    expect(avisos).toBe(1)
  })
})
