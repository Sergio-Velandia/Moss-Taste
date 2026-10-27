import { calcularReceta, costoDe } from '@/lib/calculo/costo'
import type { Ingrediente, Receta, Unidad } from './tipos'

/*
 * Lista de compras: suma lo que hay que COMPRAR (con merma) de varias recetas, convertido a la unidad
 * del catálogo para poder juntar «2½ tazas» y «1,5 l» de leche. Lo que no se puede convertir queda
 * en su propia línea, en la unidad de la receta y sin precio.
 * Agregar recetas desde la ficha con sus porciones llega en la Fase 4.
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
  /** COP entero, o null si no se puede calcular. */
  subtotal: number | null
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
        items.set(clave, { clave, ingrediente: linea.ingrediente, idIngrediente: id, cantidad, unidad, recetas: [receta.titulo], subtotal: null })
      }
    }
  }
  return [...items.values()]
    .map((item) => ({
      ...item,
      // El precio se calcula sobre el total a comprar, no sumando líneas redondeadas.
      subtotal: item.ingrediente && !item.clave.includes(':') ? costoDe(item.ingrediente, item.cantidad) : null,
    }))
    .sort((a, b) => (a.ingrediente?.nombre ?? a.idIngrediente).localeCompare(b.ingrediente?.nombre ?? b.idIngrediente, 'es'))
}
