import { describe, expect, it } from 'vitest'
import { escalar, factorPorciones } from './escalar'
import { cantidadACompra } from './merma'

describe('escalar', () => {
  it('proporcional a las porciones', () => {
    expect(escalar(800, 4, 8)).toBe(1600)
    expect(escalar(800, 4, 2)).toBe(400)
    expect(escalar(500, 6, 1)).toBeCloseTo(83.333, 3)
    expect(escalar(2, 4, 30)).toBe(15)
  })

  it('las porciones base dan factor 1', () => {
    expect(factorPorciones(4, 4)).toBe(1)
  })

  it('rechaza porciones en cero o negativas', () => {
    expect(() => factorPorciones(0, 4)).toThrow(RangeError)
    expect(() => factorPorciones(4, 0)).toThrow(RangeError)
    expect(() => factorPorciones(4, -2)).toThrow(RangeError)
    expect(() => factorPorciones(4, Number.NaN)).toThrow(RangeError)
  })
})

describe('cantidadACompra', () => {
  it('sin merma se compra lo que se usa', () => {
    expect(cantidadACompra(800, 0)).toBe(800)
  })

  it('con merma se compra más', () => {
    expect(cantidadACompra(900, 0.1)).toBeCloseTo(1000)
    expect(cantidadACompra(800, 0.1)).toBeCloseTo(888.89, 2)
    expect(cantidadACompra(100, 0.5)).toBe(200)
  })

  it('una merma alta sigue siendo finita', () => {
    expect(Number.isFinite(cantidadACompra(100, 0.99))).toBe(true)
  })

  it('rechaza mermas imposibles', () => {
    expect(() => cantidadACompra(100, 1)).toThrow(RangeError)
    expect(() => cantidadACompra(100, -0.1)).toThrow(RangeError)
  })
})
