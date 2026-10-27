import type { Ingrediente, IngredienteReceta, Unidad } from './recetas/tipos'

// Formatos de Colombia con Intl. El dinero siempre llega como entero en COP.

const COP = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
const NUMERO = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 })
const FECHA = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })

export const formatoCOP = (pesos: number): string => COP.format(pesos)
export const formatoNumero = (n: number): string => NUMERO.format(n)

/** '2026-10-01' → '1 de octubre de 2026'. Se lee en UTC para que la zona horaria no cambie el día. */
export const formatoFecha = (iso: string): string => FECHA.format(new Date(`${iso}T00:00:00Z`))

export function formatoMinutos(minutos: number): string {
  const horas = Math.floor(minutos / 60)
  const resto = minutos % 60
  if (!horas) return `${resto} min`
  return resto ? `${horas} h ${resto} min` : `${horas} h`
}

export const formatoPorciones = (n: number): string => `${n} ${n === 1 ? 'porción' : 'porciones'}`

const NOMBRES_UNIDAD: Record<Exclude<Unidad, 'unidad'>, [string, string]> = {
  g: ['g', 'g'],
  kg: ['kg', 'kg'],
  ml: ['ml', 'ml'],
  l: ['l', 'l'],
  taza: ['taza', 'tazas'],
  cucharada: ['cucharada', 'cucharadas'],
  cucharadita: ['cucharadita', 'cucharaditas'],
}

/** 800 g · 2 dientes · 1 manojo · 1,5 tazas */
export function formatoCantidad({ cantidad, unidad }: Pick<IngredienteReceta, 'cantidad' | 'unidad'>, ingrediente?: Ingrediente): string {
  const uno = cantidad === 1
  const [singular, plural] =
    unidad === 'unidad'
      ? [ingrediente?.unidadNombre?.singular ?? 'unidad', ingrediente?.unidadNombre?.plural ?? 'unidades']
      : NOMBRES_UNIDAD[unidad]
  return `${formatoNumero(cantidad)} ${uno ? singular : plural}`
}

/** Quita tildes y mayúsculas para comparar textos al buscar. */
export const normalizar = (texto: string): string =>
  texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('es').trim()
