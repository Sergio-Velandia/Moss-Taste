import { calcularReceta, costoDe } from '@/lib/calculo/costo'
import { compraEnTienda, type Compra } from '@/lib/calculo/empaques'
import type { Ingrediente, Receta, Unidad } from './tipos'

/*
 * Lista de compras: suma lo que hay que COMPRAR (con merma) de varias recetas, convertido a la unidad
 * del catálogo para poder juntar «2½ tazas» y «1,5 l» de leche. Lo que no se puede convertir queda
 * en su propia línea, en la unidad de la receta y sin precio.
 * Cada línea dice además cómo viene en la tienda (empaques completos) y cuánto se paga en caja.
 */

export interface EntradaLista {
  receta: Receta
  porciones: number
}

export interface ItemLista {
  clave: string
  ingrediente: Ingrediente | undefined
  idIngrediente: string
  /** Cantidad a comprar: en la unidad del catálogo si se pudo convertir, si no en la de la receta. */
  cantidad: number
  unidad: Unidad
  /** Títulos de las recetas que lo piden. */
  recetas: string[]
  /** Costo proporcional a lo que se compra (con merma), COP entero; null si no se puede calcular. */
  subtotal: number | null
  /** Cómo se compra en la tienda y cuánto se paga en caja; null si la cantidad no se pudo convertir. */
  tienda: Compra | null
}

export interface TotalesLista {
  /** Lo que cuestan las recetas: proporcional a lo que se usa. */
  proporcional: number
  /** Lo que se paga hoy en caja comprando empaques completos. */
  caja: number
  /** Nombres sin precio: no suman a ninguno de los dos totales. */
  sinPrecio: string[]
}

export function sumarLista(entradas: readonly EntradaLista[], catalogo: ReadonlyMap<string, Ingrediente>): ItemLista[] {
  const items = new Map<string, ItemLista>()
  for (const { receta, porciones } of entradas) {
    for (const linea of calcularReceta(receta, porciones, catalogo).lineas) {
      const id = linea.item.ingrediente
      const convertible = linea.compra !== null && linea.ingrediente !== undefined
      const clave = convertible ? id : `${id}:${linea.item.unidad}`
      const cantidad = convertible ? (linea.compra ?? 0) : linea.cantidad
      const unidad: Unidad = convertible && linea.ingrediente ? linea.ingrediente.unidadBase : linea.item.unidad
      const existente = items.get(clave)
      if (existente) {
        existente.cantidad += cantidad
        if (!existente.recetas.includes(receta.titulo)) existente.recetas.push(receta.titulo)
      } else {
        items.set(clave, { clave, ingrediente: linea.ingrediente, idIngrediente: id, cantidad, unidad, recetas: [receta.titulo], subtotal: null, tienda: null })
      }
    }
  }
  return [...items.values()]
    .map((item) => ({
      ...item,
      // El precio se calcula sobre el total a comprar, no sumando líneas redondeadas.
      subtotal: item.ingrediente && !item.clave.includes(':') ? costoDe(item.ingrediente, item.cantidad) : null,
      tienda: item.ingrediente && !item.clave.includes(':') ? compraEnTienda(item.ingrediente, item.cantidad) : null,
    }))
    .sort((a, b) => (a.ingrediente?.nombre ?? a.idIngrediente).localeCompare(b.ingrediente?.nombre ?? b.idIngrediente, 'es'))
}

export function totalesLista(items: readonly ItemLista[]): TotalesLista {
  const costeables = items.filter((i) => !i.ingrediente?.noSeCostea)
  return {
    proporcional: costeables.reduce((s, i) => s + (i.subtotal ?? 0), 0),
    caja: costeables.reduce((s, i) => s + (i.tienda?.costoCaja ?? 0), 0),
    sinPrecio: costeables.filter((i) => i.subtotal === null).map((i) => i.ingrediente?.nombre ?? i.idIngrediente),
  }
}
