import { describe, expect, it } from 'vitest'
import categorias from '@/data/categorias.json'
import ingredientes from '@/data/ingredientes.json'
import { ARCHIVOS_RECETAS, CATEGORIAS, INGREDIENTES, RECETAS } from './catalogo'
import { validarCategorias, validarIngredientes, validarReceta } from './validar'

// Si algo falla aquí, el mensaje dice el archivo, el campo y qué corregir.
describe('datos del recetario', () => {
  it('ingredientes.json es válido', () => {
    expect(validarIngredientes(ingredientes).errores).toEqual([])
  })

  it('categorias.json es válido', () => {
    expect(validarCategorias(categorias).errores).toEqual([])
  })

  const idsCategorias = new Set(CATEGORIAS.map((c) => c.id))
  for (const [slug, datos] of Object.entries(ARCHIVOS_RECETAS)) {
    it(`recetas/${slug}/receta.json es válida`, () => {
      expect(validarReceta(datos, slug, INGREDIENTES, idsCategorias).errores).toEqual([])
    })
  }

  it('todas las recetas se cargan', () => {
    expect(RECETAS).toHaveLength(Object.keys(ARCHIVOS_RECETAS).length)
    expect(RECETAS.length).toBeGreaterThan(0)
  })

  it('cada categoría tiene al menos una receta', () => {
    for (const { id } of CATEGORIAS) expect(RECETAS.some((r) => r.categoria === id), `categoría «${id}» sin recetas`).toBe(true)
  })
})

describe('validarReceta', () => {
  const base = {
    id: 'sopa',
    titulo: 'Sopa',
    resumen: 'Una sopa.',
    categoria: 'sopas',
    porcionesBase: 4,
    tiempoMin: 30,
    ingredientes: [{ ingrediente: 'sal', cantidad: 5, unidad: 'g' }],
    miseEnPlace: [],
    pasos: [{ texto: 'Hierve el agua.', ingredientes: ['sal'] }],
  }
  const validar = (cambios: Record<string, unknown>, slug = 'sopa') =>
    validarReceta({ ...base, ...cambios }, slug, INGREDIENTES, new Set(['sopas'])).errores

  it('acepta una receta mínima', () => {
    expect(validar({})).toEqual([])
  })

  it('señala archivo, campo y motivo', () => {
    expect(validar({ ingredientes: [{ ingrediente: 'papa-x', cantidad: 1, unidad: 'g' }] })).toContain(
      'recetas/sopa/receta.json → ingredientes[0].ingrediente: «papa-x» no existe en ingredientes.json',
    )
  })

  it('rechaza unidades, cantidades y categorías inválidas', () => {
    const errores = validar({ categoria: 'mariscos', ingredientes: [{ ingrediente: 'sal', cantidad: 0, unidad: 'chorrito' }] })
    expect(errores.join('\n')).toMatch(/categoria: «mariscos» no existe/)
    expect(errores.join('\n')).toMatch(/cantidad: número mayor que 0/)
    expect(errores.join('\n')).toMatch(/unidad: debe ser/)
  })

  it('exige que el id coincida con la carpeta', () => {
    expect(validar({}, 'otra-sopa').join('\n')).toMatch(/id: debe coincidir/)
  })

  it('un paso no puede usar un ingrediente que la receta no tiene', () => {
    expect(validar({ pasos: [{ texto: 'Agrega el pollo.', ingredientes: ['pechuga-pollo'] }] }).join('\n')).toMatch(
      /pasos\[0\]\.ingredientes: «pechuga-pollo» no está/,
    )
  })
})

describe('validarIngredientes', () => {
  it('rechaza precios con decimales y fechas imposibles', () => {
    const errores = validarIngredientes([
      { id: 'sal', nombre: 'Sal', unidadBase: 'g', precio: 2000.5, porCantidad: 1000, fechaPrecio: '2026-02-30', merma: 0 },
    ]).errores.join('\n')
    expect(errores).toMatch(/precio: entero en COP o null/)
    expect(errores).toMatch(/fechaPrecio/)
  })

  it('acepta un ingrediente sin precio (null)', () => {
    expect(
      validarIngredientes([{ id: 'agua', nombre: 'Agua', unidadBase: 'ml', precio: null, porCantidad: 1000, fechaPrecio: '2026-10-01', merma: 0 }]).errores,
    ).toEqual([])
  })
})
