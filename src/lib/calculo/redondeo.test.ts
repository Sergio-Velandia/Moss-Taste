import { describe, expect, it } from 'vitest'
import { numeroCocina, redondearCocina } from './redondeo'

const r = (cantidad: number, unidad: Parameters<typeof redondearCocina>[1]) => {
  const { valor, unidad: u } = redondearCocina(cantidad, unidad)
  return `${numeroCocina(valor, u)} ${u}`
}

describe('redondearCocina', () => {
  it('gramos: decimales chicos, enteros, de 5 en 5 y kilos', () => {
    expect(r(2.34, 'g')).toBe('2,5 g')
    expect(r(0.1, 'g')).toBe('0,5 g')
    expect(r(83.33, 'g')).toBe('83 g')
    expect(r(333.33, 'g')).toBe('335 g')
    expect(r(888.89, 'g')).toBe('890 g')
    expect(r(1600, 'g')).toBe('1,6 kg')
    expect(r(3333.3, 'g')).toBe('3,35 kg')
  })

  it('el borde de mil pasa a la unidad grande', () => {
    expect(r(998, 'g')).toBe('1 kg')
    expect(r(0.5, 'kg')).toBe('500 g')
    expect(r(1.25, 'l')).toBe('1,25 l')
    expect(r(250, 'ml')).toBe('250 ml')
  })

  it('tazas, cucharadas y unidades en fracciones de cocina', () => {
    expect(r(1.5, 'taza')).toBe('1½ taza')
    expect(r(0.7, 'taza')).toBe('¾ taza')
    expect(r(2.6, 'cucharada')).toBe('2½ cucharada')
    expect(r(1.33, 'unidad')).toBe('1½ unidad')
    expect(r(1.1, 'libra')).toBe('1 libra')
    expect(r(3.4, 'pizca')).toBe('3 pizca')
  })

  it('nunca muestra cero si la receta pide algo', () => {
    expect(r(0.05, 'taza')).toBe('¼ taza')
    expect(r(0.1, 'unidad')).toBe('½ unidad')
    expect(r(0.2, 'pizca')).toBe('1 pizca')
    expect(r(0, 'g')).toBe('0 g')
  })
})
