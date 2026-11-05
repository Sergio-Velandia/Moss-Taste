import { describe, expect, it } from 'vitest'
import categorias from '@/data/categorias.json'
import ingredientes from '@/data/ingredientes.json'
import { calcularReceta } from '@/lib/calculo/costo'
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

  // Un precio puede faltar (la ficha dice «Sin precio», nunca asume cero), pero la medida siempre debe poder
  // convertirse a la unidad del catálogo: si no, falta una densidad o un peso por unidad.
  it('cada ingrediente de cada receta se puede convertir a la unidad del catálogo', () => {
    for (const receta of RECETAS) {
      const malas = calcularReceta(receta, receta.porcionesBase, INGREDIENTES).lineas.filter(
        (l) => l.motivo === 'sin-conversion' || l.motivo === 'sin-ingrediente',
      )
      expect(
        malas.map((l) => `recetas/${receta.id}: ${l.item.ingrediente} en ${l.item.unidad} (${l.motivo})`),
        'Agrega la densidad o gramosPorUnidad en ingredientes.json',
      ).toEqual([])
    }
  })

  // Archivos de imagen presentes en cada carpeta de receta (solo se mira que existan).
  const imagenes = new Set(Object.keys(import.meta.glob('/src/data/recetas/*/{imagen,miniatura}.webp')))
  const tieneImagenes = (slug: string) =>
    imagenes.has(`/src/data/recetas/${slug}/imagen.webp`) && imagenes.has(`/src/data/recetas/${slug}/miniatura.webp`)

  // Recetas publicadas mientras su imagen se genera; hoy, ninguna. Lista a propósito: todas las demás deben tenerla.
  const IMAGEN_PENDIENTE = new Set<string>([])

  it('una receta sale de la lista de pendientes cuando ya tiene su imagen', () => {
    expect([...IMAGEN_PENDIENTE].filter(tieneImagenes)).toEqual([])
  })

  it('cada receta real tiene imagen, miniatura y texto alternativo', () => {
    const faltan = RECETAS.filter((r) => !r.ejemplo && !IMAGEN_PENDIENTE.has(r.id) && (!tieneImagenes(r.id) || !r.imagenAlt)).map(
      (r) => `recetas/${r.id}: falta imagen.webp, miniatura.webp (npm run imagenes) o imagenAlt en receta.json`,
    )
    expect(faltan).toEqual([])
  })

  it('una receta con imagen describe la imagen', () => {
    expect(RECETAS.filter((r) => tieneImagenes(r.id) && !r.imagenAlt).map((r) => `recetas/${r.id}: falta imagenAlt`)).toEqual([])
  })

  it('cada categoría con recetas reales tiene imagen de respaldo con imagen propia', () => {
    const conReales = new Set(RECETAS.filter((r) => !r.ejemplo).map((r) => r.categoria))
    const faltan = CATEGORIAS.filter((c) => conReales.has(c.id) && !(c.imagenRespaldo && (tieneImagenes(c.imagenRespaldo) || IMAGEN_PENDIENTE.has(c.imagenRespaldo)))).map(
      (c) => `categorias.json → ${c.id}: imagenRespaldo debe ser el slug de una receta con imagen`,
    )
    expect(faltan).toEqual([])
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

  it('las notas son textos', () => {
    expect(validar({ notas: ['Con agua caliente, nunca fría.'] })).toEqual([])
    expect(validar({ notas: [''] }).join()).toMatch(/notas: lista de textos/)
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

  it('lo que no se costea lleva precio null y puede no tener fecha', () => {
    expect(validarIngredientes([{ id: 'agua', nombre: 'Agua', unidadBase: 'ml', precio: null, porCantidad: 1000, merma: 0, noSeCostea: true }]).errores).toEqual([])
    expect(
      validarIngredientes([{ id: 'agua', nombre: 'Agua', unidadBase: 'ml', precio: 100, porCantidad: 1000, merma: 0, noSeCostea: true }]).errores.join(),
    ).toMatch(/si no se costea, el precio va en null/)
  })

  it('un precio pendiente (null) no necesita fecha; un precio sí', () => {
    expect(validarIngredientes([{ id: 'papa', nombre: 'Papa', unidadBase: 'g', precio: null, porCantidad: 1000, merma: 0 }]).errores).toEqual([])
    expect(validarIngredientes([{ id: 'papa', nombre: 'Papa', unidadBase: 'g', precio: 3000, porCantidad: 1000, merma: 0 }]).errores.join()).toMatch(/fechaPrecio/)
  })

  it('acepta un ingrediente sin precio (null)', () => {
    expect(
      validarIngredientes([{ id: 'agua', nombre: 'Agua', unidadBase: 'ml', precio: null, porCantidad: 1000, fechaPrecio: '2026-10-01', merma: 0 }]).errores,
    ).toEqual([])
  })
})
