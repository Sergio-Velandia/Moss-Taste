import { describe, expect, it } from 'vitest'
import { INGREDIENTES, RECETAS } from './catalogo'
import { escribirFiltros, filtrarRecetas, hayFiltros, leerFiltros, type Filtros } from './filtrar'

const sinFiltros: Filtros = { q: '', categorias: [], ingrediente: null, maxPorcion: null }
const ids = (f: Partial<Filtros>) => filtrarRecetas(RECETAS, { ...sinFiltros, ...f }, INGREDIENTES).map((r) => r.id)

describe('filtrarRecetas', () => {
  it('sin filtros devuelve todas', () => {
    expect(ids({})).toHaveLength(RECETAS.length)
  })

  it('busca sin importar tildes ni mayúsculas, también por ingrediente', () => {
    expect(ids({ q: 'AJIACO' })).toEqual(['ajiaco-santafereno'])
    expect(ids({ q: 'santafereno' })).toEqual(['ajiaco-santafereno'])
    expect(ids({ q: 'canela' })).toEqual(['arroz-con-leche'])
  })

  it('todas las palabras deben coincidir', () => {
    expect(ids({ q: 'arroz leche' })).toEqual(['arroz-con-leche'])
    expect(ids({ q: 'arroz pollo' })).toEqual([])
  })

  it('filtra por categoría, ingrediente y presupuesto por porción', () => {
    expect(ids({ categorias: ['postres', 'desayunos'] }).sort()).toEqual(['arepas-de-queso', 'arroz-con-leche'])
    expect(ids({ ingrediente: 'leche' }).sort()).toEqual(['arepas-de-queso', 'arroz-con-leche'])
    expect(ids({ maxPorcion: 5000 })).not.toContain('ajiaco-santafereno')
  })

  it('una búsqueda vacía o con espacios no filtra', () => {
    expect(ids({ q: '   ' })).toHaveLength(RECETAS.length)
    expect(hayFiltros({ ...sinFiltros, q: '   ' })).toBe(false)
  })
})

describe('filtros en la URL', () => {
  it('ida y vuelta sin perder datos', () => {
    const filtros: Filtros = { q: 'papa', categorias: ['sopas', 'postres'], ingrediente: 'leche', maxPorcion: 10000 }
    expect(leerFiltros(escribirFiltros(filtros))).toEqual(filtros)
  })

  it('omite los vacíos e ignora un presupuesto inválido', () => {
    expect(escribirFiltros(sinFiltros).toString()).toBe('')
    expect(leerFiltros(new URLSearchParams('max=abc')).maxPorcion).toBeNull()
    expect(leerFiltros(new URLSearchParams('max=-5')).maxPorcion).toBeNull()
  })
})
