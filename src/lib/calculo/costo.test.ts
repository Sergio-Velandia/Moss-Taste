import { describe, expect, it } from 'vitest'
import type { Ingrediente, Receta } from '@/lib/recetas/tipos'
import { calcularReceta, costoDe } from './costo'

const ing = (datos: Partial<Ingrediente> & Pick<Ingrediente, 'id'>): Ingrediente => ({
  nombre: datos.id,
  unidadBase: 'g',
  precio: 1000,
  porCantidad: 1000,
  fechaPrecio: '2026-10-01',
  merma: 0,
  ...datos,
})

const catalogo = new Map<string, Ingrediente>(
  [
    ing({ id: 'pollo', nombre: 'Pollo', precio: 18000, merma: 0.1 }),
    ing({ id: 'azucar', nombre: 'Azúcar', precio: 4000, densidad: 0.85 }),
    ing({ id: 'harina', nombre: 'Harina', precio: 4400 }),
    ing({ id: 'mazorca', nombre: 'Mazorca', precio: 5000, gramosPorUnidad: 300, fechaPrecio: '2026-09-20' }),
    ing({ id: 'leche', nombre: 'Leche', unidadBase: 'ml', precio: 4200 }),
    ing({ id: 'agua', nombre: 'Agua', unidadBase: 'ml', precio: null }),
    ing({ id: 'ajo', nombre: 'Ajo', unidadBase: 'unidad', precio: 300, porCantidad: 1 }),
  ].map((i) => [i.id, i]),
)

const receta = (ingredientes: Receta['ingredientes'], porcionesBase = 4): Receta => ({
  id: 'prueba',
  titulo: 'Prueba',
  resumen: 'Prueba',
  categoria: 'sopas',
  porcionesBase,
  tiempoMin: 10,
  ingredientes,
  miseEnPlace: [],
  pasos: [{ texto: 'x' }],
})

describe('calcularReceta', () => {
  it('cobra lo que se compra: el uso más la merma', () => {
    const [pollo] = calcularReceta(receta([{ ingrediente: 'pollo', cantidad: 800, unidad: 'g' }]), 4, catalogo).lineas
    expect(pollo?.uso).toBe(800)
    expect(pollo?.compra).toBeCloseTo(888.89, 2)
    expect(pollo?.subtotal).toBe(16000)
  })

  it('escala cantidades y costo con las porciones', () => {
    const r = receta([{ ingrediente: 'pollo', cantidad: 800, unidad: 'g' }])
    const ocho = calcularReceta(r, 8, catalogo)
    expect(ocho.lineas[0]?.cantidad).toBe(1600)
    expect(ocho.total).toBe(32000)
    expect(ocho.porPorcion).toBe(4000)
    const una = calcularReceta(r, 1, catalogo)
    expect(una.lineas[0]?.cantidad).toBe(200)
    expect(una.total).toBe(4000)
  })

  it('convierte medidas de cocina con densidad y unidades con peso por unidad', () => {
    const c = calcularReceta(
      receta([
        { ingrediente: 'azucar', cantidad: 1, unidad: 'taza' },
        { ingrediente: 'harina', cantidad: 1, unidad: 'libra' },
        { ingrediente: 'mazorca', cantidad: 2, unidad: 'unidad' },
        { ingrediente: 'leche', cantidad: 2.5, unidad: 'taza' },
      ]),
      4,
      catalogo,
    )
    expect(c.lineas.map((l) => l.subtotal)).toEqual([816, 2200, 3000, 2520])
  })

  it('todo el dinero es entero y el total es la suma de las líneas', () => {
    const c = calcularReceta(
      receta(
        [
          { ingrediente: 'pollo', cantidad: 333, unidad: 'g' },
          { ingrediente: 'azucar', cantidad: 0.75, unidad: 'taza' },
          { ingrediente: 'ajo', cantidad: 3, unidad: 'unidad' },
        ],
        3,
      ),
      7,
      catalogo,
    )
    const valores = [c.total, c.minimo, c.maximo, c.porPorcion, c.porPorcionMinimo, c.porPorcionMaximo, ...c.lineas.map((l) => l.subtotal ?? 0)]
    for (const v of valores) expect(Number.isInteger(v), String(v)).toBe(true)
    expect(c.total).toBe(c.lineas.reduce((s, l) => s + (l.subtotal ?? 0), 0))
  })

  it('rango de ±10 % sobre el total y por porción', () => {
    const c = calcularReceta(receta([{ ingrediente: 'harina', cantidad: 1000, unidad: 'g' }]), 4, catalogo)
    expect([c.minimo, c.total, c.maximo]).toEqual([3960, 4400, 4840])
    expect([c.porPorcionMinimo, c.porPorcion, c.porPorcionMaximo]).toEqual([990, 1100, 1210])
  })

  it('nunca asume cero: dice qué falta y por qué', () => {
    const c = calcularReceta(
      receta([
        { ingrediente: 'agua', cantidad: 500, unidad: 'ml' },
        { ingrediente: 'harina', cantidad: 1, unidad: 'taza' },
        { ingrediente: 'fantasma', cantidad: 1, unidad: 'g' },
        { ingrediente: 'leche', cantidad: 100, unidad: 'ml' },
      ]),
      4,
      catalogo,
    )
    expect(c.lineas.map((l) => l.motivo)).toEqual(['sin-precio', 'sin-conversion', 'sin-ingrediente', undefined])
    expect(c.sinPrecio).toEqual(['Agua', 'Harina', 'fantasma'])
    expect(c.total).toBe(420)
  })

  it('la fecha es la del precio más antiguo que se usó', () => {
    const c = calcularReceta(
      receta([
        { ingrediente: 'harina', cantidad: 100, unidad: 'g' },
        { ingrediente: 'mazorca', cantidad: 1, unidad: 'unidad' },
      ]),
      4,
      catalogo,
    )
    expect(c.fechaPrecio).toBe('2026-09-20')
  })

  it('sin ningún precio, el total es 0 y no hay fecha', () => {
    const c = calcularReceta(receta([{ ingrediente: 'agua', cantidad: 1, unidad: 'l' }]), 4, catalogo)
    expect(c.total).toBe(0)
    expect(c.fechaPrecio).toBeNull()
  })

  it('montos grandes siguen exactos', () => {
    const caro = new Map([['trufa', ing({ id: 'trufa', precio: 9_000_000 })]])
    const c = calcularReceta(receta([{ ingrediente: 'trufa', cantidad: 2, unidad: 'kg' }], 4), 40, caro)
    expect(c.total).toBe(180_000_000)
    expect(Number.isSafeInteger(c.total)).toBe(true)
  })
})

describe('costoDe', () => {
  it('redondea al peso y respeta el precio null', () => {
    expect(costoDe(ing({ id: 'x', precio: 1000, porCantidad: 3 }), 1)).toBe(333)
    expect(costoDe(ing({ id: 'x', precio: null }), 100)).toBeNull()
  })
})
