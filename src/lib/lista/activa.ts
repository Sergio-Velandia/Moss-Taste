import { crearAlmacenLista, type AlmacenLista } from './almacen'

// La lista que se está usando: la del navegador, o la de la cuenta mientras haya sesión.
// Va en un archivo aparte, sin React ni Firebase, para que la cuenta pueda migrar la del navegador.

// localStorage puede lanzar error con solo leer la propiedad (por ejemplo, con las cookies bloqueadas).
export const almacenNavegador = crearAlmacenLista(() => {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage
  } catch {
    return undefined
  }
})

let deCuenta: AlmacenLista | null = null
const oyentes = new Set<() => void>()
const avisar = () => oyentes.forEach((o) => o())
almacenNavegador.suscribir(avisar)

export const almacenActivo = (): AlmacenLista => deCuenta ?? almacenNavegador
export const enCuenta = () => deCuenta !== null

let soltar: (() => void) | undefined
export function usarAlmacenDeCuenta(almacen: AlmacenLista | null): void {
  soltar?.()
  soltar = almacen?.suscribir(avisar)
  deCuenta = almacen
  avisar()
}

export function suscribirActivo(oyente: () => void) {
  oyentes.add(oyente)
  return () => oyentes.delete(oyente)
}
