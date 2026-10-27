import { describe, expect, it } from 'vitest'
import { formatoCantidad, formatoCOP, formatoFecha, formatoMinutos, formatoPorciones, normalizar } from './formato'
import type { Ingrediente } from './recetas/tipos'

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
