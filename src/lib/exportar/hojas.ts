import { calcularReceta, RANGO_COSTO, type LineaCalculada } from '@/lib/calculo/costo'
import { redondearCocina } from '@/lib/calculo/redondeo'
import { formatoCantidad, formatoMinutos } from '@/lib/formato'
import { sumarLista, totalesLista, type EntradaLista, type ItemLista } from '@/lib/recetas/lista'
import type { Ingrediente, Receta, Unidad } from '@/lib/recetas/tipos'
import { SITIO } from '@/sitio'
import { cantidad, cop, titulo, type Celda, type Hoja } from './tabla'

// Las hojas que se exportan de una receta y de la lista de compras (ver CONTEXTO: «Receta», «Ingredientes»,
// «Total» y «Lista de compras»). Puras: reciben la fecha para que las pruebas sean estables.

const NOMBRES: Record<Unidad, [string, string]> = {
  g: ['g', 'g'],
  kg: ['kg', 'kg'],
  ml: ['ml', 'ml'],
  l: ['l', 'l'],
  taza: ['taza', 'tazas'],
  cucharada: ['cucharada', 'cucharadas'],
  cucharadita: ['cucharadita', 'cucharaditas'],
  libra: ['libra', 'libras'],
  pizca: ['pizca', 'pizcas'],
  unidad: ['unidad', 'unidades'],
}

/** Cantidad redondeada como en la ficha, pero como número + nombre de unidad, para que la hoja pueda sumar. */
function cantidadYUnidad(valor: number, unidad: Unidad, ingrediente?: Ingrediente): [Celda, string] {
  const r = redondearCocina(valor, unidad)
  const [singular, plural] =
    r.unidad === 'unidad' && ingrediente?.unidadNombre ? [ingrediente.unidadNombre.singular, ingrediente.unidadNombre.plural] : NOMBRES[r.unidad]
  return [cantidad(r.valor), r.valor > 1 ? plural : singular]
}

const MOTIVOS = { 'sin-precio': 'Sin precio', 'sin-conversion': 'Sin equivalencia', 'sin-ingrediente': 'Sin precio', 'no-se-costea': 'No se costea' }

function marcas(l: LineaCalculada): string {
  return [
    l.item.ajustarAlGusto && 'Al gusto',
    l.item.opcional && 'Opcional',
    l.item.alternativa,
    l.item.nota,
    l.motivo && MOTIVOS[l.motivo],
    l.ingrediente && l.ingrediente.merma > 0 && `Merma estimada ${Math.round(l.ingrediente.merma * 100)} %`,
  ]
    .filter(Boolean)
    .join('; ')
}

const pie = (fecha: string): Celda[][] => [[], ['Exportado de Moss Taste', fecha], ['Sitio', SITIO.url], ['Nota', 'Valores estimados: la merma y el peso de las medidas son aproximados.']]

export function hojasDeReceta(receta: Receta, porciones: number, catalogo: ReadonlyMap<string, Ingrediente>, categoria: string, fecha: string): Hoja[] {
  const c = calcularReceta(receta, porciones, catalogo)
  // Nunca parece completo si falta una línea: lo dice la etiqueta del total.
  const parcial = c.sinPrecio.length > 0

  const hojaReceta: Hoja = {
    nombre: 'Receta',
    anchos: [30, 90, 20],
    filas: [
      [titulo('Receta'), titulo(receta.titulo)],
      ['Categoría', categoria],
      ['Porciones', porciones],
      ['Porciones de la receta original', receta.porcionesBase],
      ['Tiempo total', formatoMinutos(receta.tiempoMin)],
      [],
      [titulo('Antes de empezar')],
      ...receta.miseEnPlace.map((t): Celda[] => ['', t]),
      [],
      [titulo('Paso'), titulo('Preparación'), titulo('Temporizador (min)')],
      ...receta.pasos.map((p, i): Celda[] => [i + 1, p.texto, p.temporizadorMin ?? null]),
      ...(receta.notas?.length ? [[], [titulo('Notas de la casa')], ...receta.notas.map((n): Celda[] => ['', n])] : []),
      ...pie(fecha),
    ],
  }

  const hojaIngredientes: Hoja = {
    nombre: 'Ingredientes',
    anchos: [28, 10, 12, 16, 12, 14, 12, 14, 14, 14, 14, 40],
    filas: [
      [
        'Ingrediente',
        'Cantidad',
        'Unidad',
        'Compra (con merma)',
        'Unidad',
        'Precio del catálogo',
        'Por',
        'Subtotal',
        'Mínimo (−10 %)',
        'Máximo (+10 %)',
        'Fecha del precio',
        'Notas',
      ].map(titulo),
      ...c.lineas.map((l): Celda[] => {
        const ing = l.ingrediente
        const [cant, unidad] = cantidadYUnidad(l.cantidad, l.item.unidad, ing)
        const [compra, unidadCompra] = ing && l.compra !== null ? cantidadYUnidad(l.compra, ing.unidadBase, ing) : [null, '']
        return [
          ing?.nombre ?? l.item.ingrediente,
          cant,
          unidad,
          compra,
          unidadCompra,
          cop(ing && !ing.noSeCostea ? ing.precio : null),
          ing ? formatoCantidad({ cantidad: ing.porCantidad, unidad: ing.unidadBase }, ing) : '',
          cop(l.subtotal),
          cop(l.subtotal === null ? null : Math.round(l.subtotal * (1 - RANGO_COSTO))),
          cop(l.subtotal === null ? null : Math.round(l.subtotal * (1 + RANGO_COSTO))),
          l.subtotal === null ? '' : (ing?.fechaPrecio ?? ''),
          marcas(l),
        ]
      }),
    ],
  }

  const hojaTotal: Hoja = {
    nombre: 'Total',
    anchos: [36, 16, 50],
    filas: [
      [titulo('Costo estimado'), titulo(receta.titulo)],
      ['Porciones', porciones],
      [],
      ['Total mínimo (−10 %)', cop(c.minimo)],
      [titulo(parcial ? 'Total parcial: faltan precios' : 'Total estimado'), { valor: c.total, formato: 'cop', negrita: true }],
      ['Total máximo (+10 %)', cop(c.maximo)],
      [],
      ['Por porción, mínimo', cop(c.porPorcionMinimo)],
      [titulo(parcial ? 'Por porción, parcial: faltan precios' : 'Por porción, estimado'), { valor: c.porPorcion, formato: 'cop', negrita: true }],
      ['Por porción, máximo', cop(c.porPorcionMaximo)],
      [],
      ['Incluye opcionales', cop(c.opcionales.total), c.opcionales.nombres.join(', ')],
      ['Sin precio (no suman)', c.sinPrecio.length, c.sinPrecio.join(', ')],
      ['Fecha del precio más antiguo', c.fechaPrecio ?? 'Sin precios'],
      ...pie(fecha),
    ],
  }

  return [hojaReceta, hojaIngredientes, hojaTotal, hojaDeLista(sumarLista([{ receta, porciones }], catalogo), fecha)]
}

/** La lista de compras: qué comprar, cómo se compra en la tienda y los dos totales, sin mezclarlos. */
export function hojaDeLista(items: readonly ItemLista[], fecha: string): Hoja {
  const totales = totalesLista(items)
  const parcial = totales.sinPrecio.length > 0 ? ' (parcial: faltan precios)' : ''
  return {
    nombre: 'Lista de compras',
    anchos: [28, 12, 12, 26, 18, 18, 40],
    filas: [
      ['Ingrediente', 'Comprar', 'Unidad', 'En la tienda', 'Lo que cuesta', 'Se paga en caja', 'Para'].map(titulo),
      ...items.map((i): Celda[] => {
        const [cant, unidad] = cantidadYUnidad(i.cantidad, i.unidad, i.ingrediente)
        const noSeCostea = i.ingrediente?.noSeCostea
        return [
          i.ingrediente?.nombre ?? i.idIngrediente,
          cant,
          unidad,
          i.tienda?.descripcion ?? (noSeCostea ? 'No se costea' : i.ingrediente ? 'Suelto, por peso' : ''),
          cop(i.subtotal),
          cop(i.tienda?.costoCaja ?? null),
          i.recetas.join(', '),
        ]
      }),
      [],
      [titulo(`Lo que cuestan las recetas${parcial}`), '', '', 'Proporcional a lo que se usa', { valor: totales.proporcional, formato: 'cop', negrita: true }],
      [titulo(`Lo que se paga hoy en caja${parcial}`), '', '', 'Empaques completos', '', { valor: totales.caja, formato: 'cop', negrita: true }],
      ...(totales.sinPrecio.length ? [['Sin precio (no suman)', '', '', totales.sinPrecio.join(', ')]] : []),
      ...pie(fecha),
    ],
  }
}

/** Las recetas que forman la lista, con sus porciones. */
export function hojaDeRecetasDeLista(entradas: readonly EntradaLista[], catalogo: ReadonlyMap<string, Ingrediente>): Hoja {
  return {
    nombre: 'Recetas',
    anchos: [32, 12, 20, 24],
    filas: [
      ['Receta', 'Porciones', 'Costo por porción', 'Nota'].map(titulo),
      ...entradas.map(({ receta, porciones }): Celda[] => {
        const c = calcularReceta(receta, porciones, catalogo)
        return [receta.titulo, porciones, cop(c.porPorcion), c.sinPrecio.length ? 'Parcial: faltan precios' : '']
      }),
    ],
  }
}
