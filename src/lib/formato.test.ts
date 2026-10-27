import { describe, expect, it } from 'vitest'
import { formatoCantidad, formatoCOP, formatoFecha, formatoMinutos, formatoPorciones, normalizar } from './formato'
import { costoProvisional } from './recetas/costoProvisional'
import type { Ingrediente, Receta } from './recetas/tipos'

// Intl usa espacio duro entre el signo y el número.
const sinEspacioDuro = (s: string) => s.replace(/ /g, ' ')

describe('formato', () => {
  it('pesos colombianos sin decimales y con punto de miles', () => {
    expect(sinEspacioDuro(formatoCOP(27400))).toBe('$ 27.400')
    expect(sinEspacioDuro(formatoCOP(1250000))).toBe('$ 1.250.000')
  })

  it('cantidades con unidad en singular o plural', () => {
    const ajo = { unidadNombre: { singular: 'diente', plural: 'dientes' } } as Ingrediente
    expect(formatoCantidad({ cantidad: 800, unidad: 'g' })).toBe('800 g')
    expect(formatoCantidad({ cantidad: 1.5, unidad: 'taza' })).toBe('1½ tazas')
    expect(formatoCantidad({ cantidad: 0.75, unidad: 'taza' })).toBe('¾ taza')
    expect(formatoCantidad({ cantidad: 1600, unidad: 'g' })).toBe('1,6 kg')
    expect(formatoCantidad({ cantidad: 1, unidad: 'libra' })).toBe('1 libra')
    expect(formatoCantidad({ cantidad: 1, unidad: 'unidad' }, ajo)).toBe('1 diente')
    expect(formatoCantidad({ cantidad: 3, unidad: 'unidad' }, ajo)).toBe('3 dientes')
    expect(formatoCantidad({ cantidad: 2, unidad: 'unidad' })).toBe('2 unidades')
  })

  it('tiempo, porciones y fecha', () => {
    expect(formatoMinutos(40)).toBe('40 min')
    expect(formatoMinutos(120)).toBe('2 h')
    expect(formatoMinutos(100)).toBe('1 h 40 min')
    expect(formatoPorciones(1)).toBe('1 porción')
    expect(formatoPorciones(4)).toBe('4 porciones')
    expect(formatoFecha('2026-10-01')).toBe('1 de octubre de 2026')
  })

  it('normaliza tildes y mayúsculas para buscar', () => {
    expect(normalizar('  Azúcar MORENA ')).toBe('azucar morena')
  })
})

describe('costoProvisional', () => {
  const catalogo = new Map<string, Ingrediente>([
    ['pollo', { id: 'pollo', nombre: 'Pollo', unidadBase: 'g', precio: 18000, porCantidad: 1000, fechaPrecio: '2026-10-01', merma: 0 }],
    ['ajo', { id: 'ajo', nombre: 'Ajo', unidadBase: 'unidad', precio: 300, porCantidad: 1, fechaPrecio: '2026-09-15', merma: 0 }],
    ['agua', { id: 'agua', nombre: 'Agua', unidadBase: 'ml', precio: null, porCantidad: 1000, fechaPrecio: '2026-10-01', merma: 0 }],
  ])
  const receta = (ingredientes: Receta['ingredientes']): Receta => ({
    id: 'r',
    titulo: 'R',
    resumen: 'R',
    categoria: 'sopas',
    porcionesBase: 4,
    tiempoMin: 10,
    ingredientes,
    miseEnPlace: [],
    pasos: [{ texto: 'x' }],
  })

  it('suma en enteros, con rango de ±10 % y costo por porción', () => {
    const costo = costoProvisional(
      receta([
        { ingrediente: 'pollo', cantidad: 800, unidad: 'g' },
        { ingrediente: 'ajo', cantidad: 3, unidad: 'unidad' },
      ]),
      catalogo,
    )
    expect(costo.total).toBe(14400 + 900)
    expect(costo.minimo).toBe(13770)
    expect(costo.maximo).toBe(16830)
    expect(costo.porPorcion).toBe(3825)
    expect(Number.isInteger(costo.porPorcionMinimo)).toBe(true)
    expect(costo.fechaPrecio).toBe('2026-09-15')
    expect(costo.sinPrecio).toEqual([])
  })

  it('un ingrediente sin precio no suma cero en silencio: se reporta', () => {
    const costo = costoProvisional(receta([{ ingrediente: 'agua', cantidad: 500, unidad: 'ml' }]), catalogo)
    expect(costo.total).toBe(0)
    expect(costo.sinPrecio).toEqual(['Agua'])
    expect(costo.fechaPrecio).toBeNull()
  })

  it('una unidad distinta a la del catálogo queda sin precio hasta la Fase 2', () => {
    const costo = costoProvisional(receta([{ ingrediente: 'pollo', cantidad: 1, unidad: 'kg' }]), catalogo)
    expect(costo.lineas[0]?.subtotal).toBeNull()
    expect(costo.sinPrecio).toEqual(['Pollo'])
  })
})
