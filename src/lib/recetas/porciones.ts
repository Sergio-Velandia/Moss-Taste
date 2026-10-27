// Las porciones elegidas viven en la URL (?porciones=8): se pueden compartir y pasan al modo cocina.

export const MIN_PORCIONES = 1
export const MAX_PORCIONES = 30

/** Porciones válidas de la URL, o las base de la receta si no hay o son inválidas. */
export function leerPorciones(params: URLSearchParams, porcionesBase: number): number {
  const n = Number(params.get('porciones'))
  return Number.isInteger(n) && n >= MIN_PORCIONES && n <= MAX_PORCIONES ? n : porcionesBase
}

/** '?porciones=8', o '' si son las porciones base. */
export function consultaPorciones(porciones: number, porcionesBase: number): string {
  return porciones === porcionesBase ? '' : `?porciones=${porciones}`
}
