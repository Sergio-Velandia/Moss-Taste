import { describe, expect, it } from 'vitest'
import { calcularReceta, topePorPorcion } from '@/lib/calculo/costo'
import { filtrarRecetas, sinSaberSiCaben, type Filtros } from './filtrar'
import { INGREDIENTES as REALES, RECETAS as PUBLICADAS, recetaPorSlug } from './catalogo'
import { opcionesDeHoy, sugerirRecetas } from './hoy'
import type { Ingrediente, IngredienteReceta, Receta } from './tipos'

const base = { unidadBase: 'g', porCantidad: 1000, fechaPrecio: '2026-11-02', merma: 0 } as const
const CATALOGO = new Map<string, Ingrediente>(
  [
    { ...base, id: 'papa', nombre: 'Papa', precio: 19_200 },
    { ...base, id: 'pollo', nombre: 'Pollo', precio: 10_000, alternativa: 'gallina' },
    { ...base, id: 'pasas', nombre: 'Pasas', precio: 1000 },
    { ...base, id: 'sal', nombre: 'Sal', precio: 1000 },
    { ...base, id: 'agua', nombre: 'Agua', unidadBase: 'ml', precio: null, noSeCostea: true },
  ].map((i) => [i.id, i as Ingrediente]),
)

const receta = (id: string, ingredientes: IngredienteReceta[]): Receta => ({ id, titulo: id, resumen: '', categoria: 'sopas', porcionesBase: 1, tiempoMin: 10, ingredientes, miseEnPlace: [], pasos: [{ texto: 'Hazlo.' }] })
const g = (ingrediente: string, cantidad = 100, extra: Partial<IngredienteReceta> = {}): IngredienteReceta => ({ ingrediente, cantidad, unidad: 'g', ...extra })

// 250 g de papa a $ 19.200 el kilo: $ 4.800 por porción, entre $ 4.320 y $ 5.280.
const DE_4800 = receta('de-4800', [g('papa', 250)])
const DE_1000 = receta('de-1000', [g('pollo', 100)])
const CON_NAME = receta('mia-conname12', [g('pollo', 100), g('Ñame de la finca', 100)])

describe('el presupuesto usa el extremo alto del estimado', () => {
  it('$ 4.800 con ±10 % llega hasta $ 5.280', () => {
    const c = calcularReceta(DE_4800, 1, CATALOGO)
    expect([c.porPorcion, c.porPorcionMinimo, c.porPorcionMaximo]).toEqual([4800, 4320, 5280])
    expect(topePorPorcion(c)).toBe(5280)
  })

  it('no pasa «Hasta $ 5.000», aunque el costo central quepa', () => {
    expect(sugerirRecetas([DE_4800], [], 5000, CATALOGO).sugerencias).toEqual([])
    expect(filtrarRecetas([DE_4800], { q: '', categorias: [], ingrediente: null, maxPorcion: 5000 }, CATALOGO)).toEqual([])
  })

  it('pasa cuando el extremo alto cabe, justo en el límite', () => {
    expect(sugerirRecetas([DE_4800], [], 5280, CATALOGO).sugerencias).toHaveLength(1)
    expect(sugerirRecetas([DE_4800], [], 5279, CATALOGO).sugerencias).toHaveLength(0)
  })
})

describe('una receta con costo parcial', () => {
  const filtros: Filtros = { q: '', categorias: [], ingrediente: null, maxPorcion: 20_000 }

  it('no tiene tope: un costo parcial no es un costo', () => {
    expect(topePorPorcion(calcularReceta(CON_NAME, 1, CATALOGO))).toBeNull()
  })

  it('no pasa el presupuesto, pero no desaparece: se dice aparte y qué le falta', () => {
    const { sugerencias, sinSaber } = sugerirRecetas([DE_1000, CON_NAME], [], 20_000, CATALOGO)
    expect(sugerencias.map((s) => s.receta.id)).toEqual(['de-1000'])
    expect(sinSaber.map((s) => s.receta.id)).toEqual(['mia-conname12'])
    expect(sinSaber[0]?.sinPrecio).toEqual(['Ñame de la finca'])
  })

  it('lo mismo en el filtro de la galería', () => {
    expect(filtrarRecetas([DE_1000, CON_NAME], filtros, CATALOGO).map((r) => r.id)).toEqual(['de-1000'])
    expect(sinSaberSiCaben([DE_1000, CON_NAME], filtros, CATALOGO).map((s) => s.receta.id)).toEqual(['mia-conname12'])
    expect(sinSaberSiCaben([CON_NAME], { ...filtros, maxPorcion: null }, CATALOGO)).toEqual([])
    expect(sinSaberSiCaben([CON_NAME], { ...filtros, q: 'otra-cosa' }, CATALOGO)).toEqual([])
  })

  it('sin presupuesto se sugiere normal', () => {
    const { sugerencias, sinSaber } = sugerirRecetas([CON_NAME], ['pollo'], null, CATALOGO)
    expect(sugerencias).toHaveLength(1)
    expect(sinSaber).toEqual([])
  })

  it('con ingredientes marcados, solo se dice aparte si tiene algo de lo marcado', () => {
    expect(sugerirRecetas([CON_NAME], ['papa'], 20_000, CATALOGO).sinSaber).toEqual([])
    expect(sugerirRecetas([CON_NAME], ['pollo'], 20_000, CATALOGO).sinSaber).toHaveLength(1)
  })
})

describe('qué cuenta como principal', () => {
  const sopa = receta('sopa', [g('pollo'), g('agua'), g('sal', 5, { ajustarAlGusto: true }), g('pasas', 10, { opcional: true })])

  it('el agua, lo que va al gusto y lo opcional no faltan', () => {
    const [s] = sugerirRecetas([sopa], ['pollo'], null, CATALOGO).sugerencias
    expect(s?.faltan).toEqual([])
    expect([s?.tienes, s?.total]).toEqual([1, 1])
  })

  it('tampoco salen entre las opciones', () => {
    const { catalogo, libres } = opcionesDeHoy([sopa], CATALOGO)
    expect(catalogo.map((i) => i.id)).toEqual(['pollo'])
    expect(libres).toEqual([])
  })

  it('un opcional que otra receta pide como principal sí sale', () => {
    expect(opcionesDeHoy([sopa, receta('otra', [g('pasas')])], CATALOGO).catalogo.map((i) => i.id)).toEqual(['pasas', 'pollo'])
  })

  it('los nombres libres van aparte, sin mezclarse con el catálogo', () => {
    const { catalogo, libres } = opcionesDeHoy([CON_NAME], CATALOGO)
    expect(catalogo.map((i) => i.id)).toEqual(['pollo'])
    expect(libres).toEqual(['Ñame de la finca'])
  })
})

describe('sugerencias', () => {
  it('sin ingredientes ni presupuesto no sugiere nada', () => {
    expect(sugerirRecetas([DE_1000], [], null, CATALOGO)).toEqual({ sugerencias: [], sinSaber: [] })
  })

  it('el presupuesto solo ya lista lo que cabe, de la más barata a la más cara', () => {
    expect(sugerirRecetas([DE_4800, DE_1000], [], 10_000, CATALOGO).sugerencias.map((s) => s.receta.id)).toEqual(['de-1000', 'de-4800'])
  })

  it('la alternativa del catálogo acompaña a lo que falta; la de la receta manda si la hay', () => {
    const conCatalogo = receta('a', [g('papa'), g('pollo')])
    expect(sugerirRecetas([conCatalogo], ['papa'], null, CATALOGO).sugerencias[0]?.faltan).toEqual(['Pollo (o gallina)'])
    const conPropia = receta('b', [g('papa'), g('pollo', 100, { alternativa: 'o 200 g de gallina' })])
    expect(sugerirRecetas([conPropia], ['papa'], null, CATALOGO).sugerencias[0]?.faltan).toEqual(['Pollo (o 200 g de gallina)'])
  })
})

describe('con las recetas publicadas', () => {
  it('ninguna sugerencia dice que falta agua, sal ni un opcional', () => {
    const { sugerencias } = sugerirRecetas(PUBLICADAS, ['leche'], null, REALES)
    expect(sugerencias.length).toBeGreaterThan(0)
    for (const { faltan } of sugerencias) expect(faltan.join(' ')).not.toMatch(/Agua|Sal\b|Uvas pasas/)
  })

  it('con todo lo principal de la changua, sale completa', () => {
    const changua = recetaPorSlug('changua')
    if (!changua) throw new Error('Falta la changua')
    const principales = opcionesDeHoy([changua], REALES).catalogo.map((i) => i.id)
    const [primera] = sugerirRecetas(PUBLICADAS, principales, null, REALES).sugerencias
    expect(primera?.receta.id).toBe('changua')
    expect(primera?.faltan).toEqual([])
  })

  it('dice que el calado se puede cambiar, sacándolo del catálogo', () => {
    const { sugerencias } = sugerirRecetas(PUBLICADAS, ['leche'], null, REALES)
    const changua = sugerencias.find((s) => s.receta.id === 'changua')
    expect(changua?.faltan.join(' ')).toContain('Calado (o pan tostado)')
    expect(REALES.get('calado')?.alternativa).toBe('pan tostado')
    expect(recetaPorSlug('changua')?.ingredientes.find((i) => i.ingrediente === 'calado')?.alternativa).toBeUndefined()
  })

  it('el filtro de $ 5.000 coincide con el extremo alto de cada una', () => {
    for (const r of PUBLICADAS) {
      const tope = topePorPorcion(calcularReceta(r, r.porcionesBase, REALES))
      const pasa = sugerirRecetas([r], [], 5000, REALES).sugerencias.length === 1
      expect(pasa).toBe(tope !== null && tope <= 5000)
    }
  })
})
