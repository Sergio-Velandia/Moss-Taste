import { useCallback, useEffect, useSyncExternalStore } from 'react'
import { almacenActivo, almacenNavegador, enCuenta, suscribirActivo } from './activa'
import { agregarReceta, alternarComprado, cambiarPorciones, CLAVE_LISTA, LISTA_VACIA, quitarReceta, type EstadoLista, type ResultadoAgregar } from './almacen'

export interface ListaCompras {
  estado: EstadoLista
  /** false si la lista no se pudo guardar: vive solo en memoria. */
  persistente: boolean
  /** true si la lista está en la cuenta; false si está en este navegador. */
  enCuenta: boolean
  agregar: (id: string, porciones: number) => ResultadoAgregar
  cambiarPorciones: (id: string, porciones: number) => void
  quitar: (id: string) => void
  alternarComprado: (clave: string) => void
  vaciar: () => void
}

const leerEstado = () => almacenActivo().leer()
const leerPersistente = () => almacenActivo().persistente()

export function useListaCompras(): ListaCompras {
  const estado = useSyncExternalStore(suscribirActivo, leerEstado, () => LISTA_VACIA)
  const persistente = useSyncExternalStore(suscribirActivo, leerPersistente, () => true)
  const conCuenta = useSyncExternalStore(suscribirActivo, enCuenta, () => false)

  // Si otra pestaña cambia la lista del navegador, esta se actualiza.
  useEffect(() => {
    const alCambiar = (e: StorageEvent) => {
      if (e.key === CLAVE_LISTA) almacenNavegador.recargar()
    }
    window.addEventListener('storage', alCambiar)
    return () => window.removeEventListener('storage', alCambiar)
  }, [])

  const agregar = useCallback((id: string, porciones: number) => {
    const almacen = almacenActivo()
    const [nuevo, resultado] = agregarReceta(almacen.leer(), id, porciones)
    if (resultado !== 'llena') almacen.cambiar(nuevo)
    return resultado
  }, [])

  return {
    estado,
    persistente,
    enCuenta: conCuenta,
    agregar,
    cambiarPorciones: useCallback((id, porciones) => almacenActivo().cambiar(cambiarPorciones(leerEstado(), id, porciones)), []),
    quitar: useCallback((id) => almacenActivo().cambiar(quitarReceta(leerEstado(), id)), []),
    alternarComprado: useCallback((clave) => almacenActivo().cambiar(alternarComprado(leerEstado(), clave)), []),
    vaciar: useCallback(() => almacenActivo().cambiar(LISTA_VACIA), []),
  }
}
