import { describe, expect, it } from 'vitest'
import type { Ingrediente } from '@/lib/recetas/tipos'
import { compraEnTienda } from './empaques'

const ing = (datos: Partial<Ingrediente>): Ingrediente => ({
  id: 'x',
  nombre: 'X',
  unidadBase: 'g',
  precio: 6500,
  porCantidad: 100,
  fechaPrecio: '2026-11-02',
  merma: 0,
  ...datos,
})

describe('compraEnTienda', () => {
  it('en empaque se paga el empaque completo', () => {
    const alcaparras = ing({ empaque: { singular: 'frasco', plural: 'frascos' } })
    expect(compraEnTienda(alcaparras, 60)).toEqual({ descripcion: '1 frasco de 100 g', costoCaja: 6500 })
    expect(compraEnTienda(alcaparras, 150)).toEqual({ descripcion: '2 frascos de 100 g', costoCaja: 13000 })
  })

  it('justo el tamaño del empaque no pide uno más por redondeo', () => {
    const huevos = ing({ unidadBase: 'unidad', precio: 13250, porCantidad: 30, unidadNombre: { singular: 'huevo', plural: 'huevos' }, empaque: { singular: 'panal', plural: 'panales' } })
    expect(compraEnTienda(huevos, 30.0000000001)).toEqual({ descripcion: '1 panal de 30 huevos', costoCaja: 13250 })
  })

  it('por unidad se compran unidades enteras', () => {
    const mazorca = ing({ unidadBase: 'unidad', precio: 2250, porCantidad: 1, unidadNombre: { singular: 'mazorca', plural: 'mazorcas' } })
    expect(compraEnTienda(mazorca, 2.5)).toEqual({ descripcion: '3 mazorcas', costoCaja: 6750 })
  })

  it('suelto por peso se paga lo que se pesa', () => {
    const papa = ing({ precio: 3400, porCantidad: 1000 })
    expect(compraEnTienda(papa, 588.24)).toEqual({ descripcion: null, costoCaja: 2000 })
  })

  it('sin precio o lo que no se costea no tiene costo de caja', () => {
    expect(compraEnTienda(ing({ precio: null, empaque: { singular: 'sobre', plural: 'sobres' } }), 10).costoCaja).toBeNull()
    expect(compraEnTienda(ing({ precio: null, noSeCostea: true, unidadBase: 'ml' }), 500)).toEqual({ descripcion: null, costoCaja: null })
  })
})
