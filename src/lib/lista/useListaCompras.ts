import { useCallback, useEffect, useSyncExternalStore } from 'react'
import {
  agregarReceta,
  alternarComprado,
  cambiarPorciones,
  CLAVE_LISTA,
  crearAlmacenLista,
  LISTA_VACIA,
  quitarReceta,
  type EstadoLista,
  type ResultadoAgregar,
} from './almacen'

// Un solo almacén para toda la app. localStorage puede lanzar error con solo leer la propiedad
// (por ejemplo, con las cookies bloqueadas), así que también se envuelve.
const almacen = crearAlmacenLista(() => {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage
  } catch {
    return undefined
  }
})

export interface ListaCompras {
  estado: EstadoLista
  /** false si la lista no se puede guardar en este navegador: vive solo en memoria. */
  persistente: boolean
  agregar: (id: string, porciones: number) => ResultadoAgregar
  cambiarPorciones: (id: string, porciones: number) => void
  quitar: (id: string) => void
  alternarComprado: (clave: string) => void
  vaciar: () => void
}

export function useListaCompras(): ListaCompras {
  const estado = useSyncExternalStore(almacen.suscribir, almacen.leer, () => LISTA_VACIA)
  const persistente = useSyncExternalStore(almacen.suscribir, almacen.persistente, () => true)

  // Si otra pestaña cambia la lista, esta se actualiza.
  useEffect(() => {
    const alCambiar = (e: StorageEvent) => {
      if (e.key === CLAVE_LISTA) almacen.recargar()
    }
    window.addEventListener('storage', alCambiar)
    return () => window.removeEventListener('storage', alCambiar)
  }, [])

  const agregar = useCallback((id: string, porciones: number) => {
    const [nuevo, resultado] = agregarReceta(almacen.leer(), id, porciones)
    if (resultado !== 'llena') almacen.cambiar(nuevo)
    return resultado
  }, [])

  return {
    estado,
    persistente,
    agregar,
    cambiarPorciones: useCallback((id, porciones) => almacen.cambiar(cambiarPorciones(almacen.leer(), id, porciones)), []),
    quitar: useCallback((id) => almacen.cambiar(quitarReceta(almacen.leer(), id)), []),
    alternarComprado: useCallback((clave) => almacen.cambiar(alternarComprado(almacen.leer(), clave)), []),
    vaciar: useCallback(() => almacen.cambiar(LISTA_VACIA), []),
  }
}
