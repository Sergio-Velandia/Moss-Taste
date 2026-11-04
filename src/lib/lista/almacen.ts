// Lista de compras guardada en el navegador (localStorage) para quien no tiene sesión.
// - Si el almacenamiento no está disponible (modo privado, bloqueado o lleno), la lista vive solo en memoria
//   y el sitio funciona igual; `persistente` lo dice para avisarlo en pantalla.
// - Topes para no llenar el almacenamiento: 20 recetas y 16 KB.
// - Con sesión, la lista pasa a la cuenta (ver combinar.ts y almacenCuenta.ts) y aquí no queda copia.

export const CLAVE_LISTA = 'moss-taste:lista'
export const MAX_RECETAS = 20
export const MAX_COMPRADOS = 200
export const MAX_BYTES = 16_000
const MAX_PORCIONES = 30

export interface EntradaGuardada {
  id: string
  porciones: number
}

export interface EstadoLista {
  recetas: EntradaGuardada[]
  /** Claves de los ítems marcados como comprados. */
  comprados: string[]
}

export type ResultadoAgregar = 'agregada' | 'actualizada' | 'llena'

export const LISTA_VACIA: EstadoLista = { recetas: [], comprados: [] }

const ID = /^[a-z0-9]+(-[a-z0-9]+)*$/

/** Lo leído del almacenamiento es entrada externa: se valida y se descarta lo que no cuadre. */
export function validarEstado(datos: unknown): EstadoLista {
  if (typeof datos !== 'object' || datos === null) return LISTA_VACIA
  const { recetas, comprados } = datos as Record<string, unknown>
  const vistas = new Set<string>()
  const entradas = (Array.isArray(recetas) ? recetas : [])
    .filter((r): r is EntradaGuardada => {
      if (typeof r !== 'object' || r === null) return false
      const { id, porciones } = r as Record<string, unknown>
      return typeof id === 'string' && ID.test(id) && Number.isInteger(porciones) && (porciones as number) >= 1 && (porciones as number) <= MAX_PORCIONES
    })
    .filter((r) => !vistas.has(r.id) && vistas.add(r.id))
    .slice(0, MAX_RECETAS)
    .map(({ id, porciones }) => ({ id, porciones }))
  const marcados = [...new Set((Array.isArray(comprados) ? comprados : []).filter((c): c is string => typeof c === 'string' && c.length <= 80))].slice(0, MAX_COMPRADOS)
  return { recetas: entradas, comprados: marcados }
}

// Operaciones puras sobre el estado.

export function agregarReceta(estado: EstadoLista, id: string, porciones: number): [EstadoLista, ResultadoAgregar] {
  if (estado.recetas.some((r) => r.id === id)) return [cambiarPorciones(estado, id, porciones), 'actualizada']
  if (estado.recetas.length >= MAX_RECETAS) return [estado, 'llena']
  return [{ ...estado, recetas: [...estado.recetas, { id, porciones }] }, 'agregada']
}

export function cambiarPorciones(estado: EstadoLista, id: string, porciones: number): EstadoLista {
  return { ...estado, recetas: estado.recetas.map((r) => (r.id === id ? { id, porciones } : r)) }
}

export function quitarReceta(estado: EstadoLista, id: string): EstadoLista {
  return { ...estado, recetas: estado.recetas.filter((r) => r.id !== id) }
}

export function alternarComprado(estado: EstadoLista, clave: string): EstadoLista {
  const comprados = estado.comprados.includes(clave) ? estado.comprados.filter((c) => c !== clave) : [...estado.comprados, clave].slice(-MAX_COMPRADOS)
  return { ...estado, comprados }
}

// El almacén: estado en memoria + copia en localStorage cuando se puede.

export interface AlmacenLista {
  leer: () => EstadoLista
  persistente: () => boolean
  cambiar: (nuevo: EstadoLista) => void
  suscribir: (oyente: () => void) => () => void
  /** Vuelve a leer el almacenamiento (por ejemplo, cuando otra pestaña cambió la lista). */
  recargar: () => void
}

export function crearAlmacenLista(obtenerStorage: () => Storage | undefined): AlmacenLista {
  const oyentes = new Set<() => void>()
  let persistente = true

  function desdeStorage(): EstadoLista {
    try {
      const crudo = obtenerStorage()?.getItem(CLAVE_LISTA)
      return crudo ? validarEstado(JSON.parse(crudo)) : LISTA_VACIA
    } catch {
      persistente = false
      return LISTA_VACIA
    }
  }

  let estado = desdeStorage()
  const avisar = () => oyentes.forEach((o) => o())

  return {
    leer: () => estado,
    persistente: () => persistente,
    cambiar(nuevo) {
      estado = nuevo
      try {
        const texto = JSON.stringify(nuevo)
        if (texto.length > MAX_BYTES) throw new RangeError('La lista supera el tope de tamaño')
        const storage = obtenerStorage()
        if (!storage) throw new Error('Sin almacenamiento')
        storage.setItem(CLAVE_LISTA, texto)
        persistente = true
      } catch {
        // Bloqueado, lleno o en modo privado: la lista sigue en memoria mientras la pestaña esté abierta.
        persistente = false
      }
      avisar()
    },
    suscribir(oyente) {
      oyentes.add(oyente)
      return () => oyentes.delete(oyente)
    },
    recargar() {
      estado = desdeStorage()
      avisar()
    },
  }
}
