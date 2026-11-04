import { calcularReceta } from '@/lib/calculo/costo'
import { totalesLista, type EntradaLista, type ItemLista } from '@/lib/recetas/lista'
import type { Ingrediente, Receta } from '@/lib/recetas/tipos'
import { SITIO } from '@/sitio'

// JSON sin dependencias: los mismos datos que muestra el sitio, para guardarlos o usarlos en otra herramienta.

const redondear = (n: number | null) => (n === null ? null : Math.round(n * 1000) / 1000)
const cabecera = (fecha: string) => ({ generadoPor: SITIO.nombre, sitio: SITIO.url, exportado: fecha, moneda: 'COP' })

export function recetaAJSON(receta: Receta, porciones: number, catalogo: ReadonlyMap<string, Ingrediente>, fecha: string): string {
  const c = calcularReceta(receta, porciones, catalogo)
  return JSON.stringify(
    {
      ...cabecera(fecha),
      receta: {
        id: receta.id,
        titulo: receta.titulo,
        resumen: receta.resumen,
        categoria: receta.categoria,
        porcionesOriginales: receta.porcionesBase,
        porciones,
        tiempoMin: receta.tiempoMin,
        miseEnPlace: receta.miseEnPlace,
        pasos: receta.pasos.map((p) => ({ texto: p.texto, temporizadorMin: p.temporizadorMin ?? null })),
        notas: receta.notas ?? [],
      },
      ingredientes: c.lineas.map((l) => ({
        id: l.item.ingrediente,
        nombre: l.ingrediente?.nombre ?? l.item.ingrediente,
        cantidad: redondear(l.cantidad),
        unidad: l.item.unidad,
        compra: redondear(l.compra),
        unidadCompra: l.ingrediente?.unidadBase ?? null,
        precio: l.ingrediente && !l.ingrediente.noSeCostea ? l.ingrediente.precio : null,
        porCantidad: l.ingrediente?.porCantidad ?? null,
        subtotal: l.subtotal,
        fechaPrecio: l.subtotal === null ? null : (l.ingrediente?.fechaPrecio ?? null),
        ajustarAlGusto: Boolean(l.item.ajustarAlGusto),
        opcional: Boolean(l.item.opcional),
        alternativa: l.item.alternativa ?? null,
        nota: l.item.nota ?? null,
        sinPrecio: l.motivo ?? null,
      })),
      costo: {
        // false: falta el precio de alguna línea y los números son parciales.
        completo: c.sinPrecio.length === 0,
        total: c.total,
        minimo: c.minimo,
        maximo: c.maximo,
        porPorcion: c.porPorcion,
        porPorcionMinimo: c.porPorcionMinimo,
        porPorcionMaximo: c.porPorcionMaximo,
        fechaPrecio: c.fechaPrecio,
        opcionales: c.opcionales,
        sinPrecio: c.sinPrecio,
      },
    },
    null,
    2,
  )
}

export function listaAJSON(entradas: readonly EntradaLista[], items: readonly ItemLista[], fecha: string): string {
  const totales = totalesLista(items)
  return JSON.stringify(
    {
      ...cabecera(fecha),
      recetas: entradas.map(({ receta, porciones }) => ({ id: receta.id, titulo: receta.titulo, porciones })),
      items: items.map((i) => ({
        id: i.idIngrediente,
        nombre: i.ingrediente?.nombre ?? i.idIngrediente,
        cantidad: redondear(i.cantidad),
        unidad: i.unidad,
        enLaTienda: i.tienda?.descripcion ?? null,
        loQueCuesta: i.subtotal,
        seCobraEnCaja: i.tienda?.costoCaja ?? null,
        para: i.recetas,
      })),
      totales: {
        // false: falta el precio de alguna línea y los números son parciales.
        completos: totales.sinPrecio.length === 0,
        // Dos números distintos, que no se suman: lo que cuestan las recetas y lo que se paga en caja.
        loQueCuestanLasRecetas: totales.proporcional,
        loQueSePagaEnCaja: totales.caja,
        sinPrecio: totales.sinPrecio,
      },
    },
    null,
    2,
  )
}
