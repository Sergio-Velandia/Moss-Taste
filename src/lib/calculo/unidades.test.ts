import { describe, expect, it } from 'vitest'
import { convertir, EQUIVALENCIAS } from './unidades'

describe('convertir', () => {
  it('dentro de la misma dimensión', () => {
    expect(convertir(1.5, 'kg', 'g')).toBe(1500)
    expect(convertir(2, 'libra', 'g')).toBe(1000)
    expect(convertir(2, 'l', 'ml')).toBe(2000)
    expect(convertir(3, 'unidad', 'unidad')).toBe(3)
  })

  it('medidas de cocina estándar', () => {
    expect(convertir(1, 'taza', 'ml')).toBe(240)
    expect(convertir(2, 'cucharada', 'ml')).toBe(30)
    expect(convertir(3, 'cucharadita', 'ml')).toBe(15)
    expect(convertir(16, 'pizca', 'ml')).toBeCloseTo(5)
  })

  it('volumen a peso y peso a volumen con la densidad', () => {
    expect(convertir(1, 'taza', 'g', { densidad: 0.85 })).toBeCloseTo(204)
    expect(convertir(510, 'g', 'ml', { densidad: 0.85 })).toBeCloseTo(600)
  })

  it('unidades a peso y peso a unidades con el peso por unidad', () => {
    expect(convertir(2, 'unidad', 'g', { gramosPorUnidad: 300 })).toBe(600)
    expect(convertir(900, 'g', 'unidad', { gramosPorUnidad: 300 })).toBe(3)
    expect(convertir(1, 'kg', 'unidad', { gramosPorUnidad: 250 })).toBe(4)
  })

  it('unidades a volumen pasando por gramos', () => {
    expect(convertir(1, 'unidad', 'ml', { gramosPorUnidad: 60, densidad: 1.2 })).toBeCloseTo(50)
  })

  it('sin datos para convertir devuelve null, no un número inventado', () => {
    expect(convertir(1, 'taza', 'g')).toBeNull()
    expect(convertir(2, 'unidad', 'g')).toBeNull()
    expect(convertir(500, 'g', 'unidad')).toBeNull()
    expect(convertir(1, 'unidad', 'ml', { densidad: 1 })).toBeNull()
  })

  it('cero se mantiene en cero', () => {
    expect(convertir(0, 'taza', 'g', { densidad: 0.85 })).toBe(0)
  })

  it('cada unidad tiene un factor positivo', () => {
    for (const [unidad, { factor }] of Object.entries(EQUIVALENCIAS)) expect(factor, unidad).toBeGreaterThan(0)
  })
})
