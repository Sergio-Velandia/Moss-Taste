// @vitest-environment jsdom
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const html = readFileSync(join(process.cwd(), 'index.html'), 'utf8')
const css = readFileSync(join(process.cwd(), 'src/styles/entrada.css'), 'utf8')

const BASE = '/Moss-Taste/'
const plantilla = /<template id="plantilla-entrada">[\s\S]*?<\/template>/.exec(html)?.[0] ?? ''
const script = /<\/template>\s*<script>([\s\S]*?)<\/script>/.exec(html)?.[1]?.replaceAll('%BASE_URL%', BASE) ?? ''

interface Llegada {
  ruta?: string
  referente?: string
  tipo?: string
  movimientoReducido?: boolean
}

function llegar({ ruta = BASE, referente = '', tipo = 'navigate', movimientoReducido = false }: Llegada = {}) {
  window.history.replaceState(null, '', ruta)
  Object.defineProperty(document, 'referrer', { value: referente, configurable: true })
  vi.stubGlobal('matchMedia', () => ({ matches: movimientoReducido }))
  vi.spyOn(performance, 'getEntriesByType').mockReturnValue([{ type: tipo }] as unknown as PerformanceEntryList)
  new Function(script)()
  return document.querySelector<HTMLElement>('.entrada')
}

beforeEach(() => {
  vi.useFakeTimers()
  document.head.innerHTML = '<meta name="theme-color" content="#faf7f2" />'
  document.body.innerHTML = plantilla
})

afterEach(() => {
  document.querySelector('.entrada')?.remove()
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('pantalla de entrada: cuándo aparece', () => {
  it('aparece al llegar de afuera, sin leerla el lector de pantalla', () => {
    const entrada = llegar({ referente: 'https://www.google.com/' })
    expect(entrada).not.toBeNull()
    expect(entrada?.getAttribute('aria-hidden')).toBe('true')
  })

  it('aparece también al venir de Moss o Nexus, que comparten dominio', () => {
    expect(llegar({ referente: `${location.origin}/Moss/` })).not.toBeNull()
  })

  it('no aparece al recargar ni al volver atrás', () => {
    expect(llegar({ tipo: 'reload' })).toBeNull()
    expect(llegar({ tipo: 'back_forward' })).toBeNull()
  })

  it('no aparece al abrir otra página del mismo sitio', () => {
    expect(llegar({ referente: `${location.origin}${BASE}recetas/` })).toBeNull()
  })

  it('no aparece en el modo cocina, con o sin barra final', () => {
    expect(llegar({ ruta: `${BASE}recetas/lentejas-con-chorizo/cocinar/` })).toBeNull()
    expect(llegar({ ruta: `${BASE}recetas/lentejas-con-chorizo/cocinar` })).toBeNull()
  })

  it('no aparece con movimiento reducido', () => {
    expect(llegar({ movimientoReducido: true })).toBeNull()
  })

  it('si el navegador no da los datos de la navegación, no rompe la página', () => {
    window.history.replaceState(null, '', BASE)
    vi.spyOn(performance, 'getEntriesByType').mockImplementation(() => {
      throw new Error('no disponible')
    })
    expect(() => new Function(script)()).not.toThrow()
    expect(document.querySelector('.entrada')).toBeNull()
  })
})

describe('pantalla de entrada: cuándo se va', () => {
  it('se va sola a los 3 segundos como mucho y devuelve el color del navegador', () => {
    llegar()
    const color = document.querySelector('meta[name=theme-color]')
    expect(color?.getAttribute('content')).toBe('#1f1029')
    vi.advanceTimersByTime(2999)
    expect(document.querySelector('.entrada')).not.toBeNull()
    vi.advanceTimersByTime(1)
    expect(document.querySelector('.entrada')).toBeNull()
    expect(color?.getAttribute('content')).toBe('#faf7f2')
  })

  it('se va al terminar su animación, no la de un hijo', () => {
    const entrada = llegar()
    entrada?.querySelector('.entrada-lema')?.dispatchEvent(new Event('animationend', { bubbles: true }))
    expect(document.querySelector('.entrada')).not.toBeNull()
    entrada?.dispatchEvent(new Event('animationend'))
    expect(document.querySelector('.entrada')).toBeNull()
  })

  it.each([
    ['un toque', 'pointerdown'],
    ['una tecla', 'keydown'],
  ])('se salta con %s', (_nombre, evento) => {
    llegar()
    window.dispatchEvent(new Event(evento))
    expect(document.querySelector('.entrada')).toBeNull()
  })
})

describe('pantalla de entrada: el diseño', () => {
  it('sus animaciones terminan antes de los 3 segundos', () => {
    const duracion = Number(/--entrada-duracion:\s*(\d+)ms/.exec(css)?.[1])
    expect(duracion).toBeGreaterThan(0)
    expect(duracion).toBeLessThanOrEqual(3000)
    // Las capas con su propio tiempo tampoco se pasan: retraso + duración.
    const capas = [...css.matchAll(/animation-delay: (\d+)ms;\s*animation-duration: (\d+)ms/g)]
    expect(capas.length).toBeGreaterThan(0)
    for (const [, retraso, propia] of capas) expect(Number(retraso) + Number(propia)).toBeLessThanOrEqual(duracion)
  })

  it('solo anima transform y opacity', () => {
    const fotogramas = [...css.matchAll(/@keyframes [\w-]+ \{([\s\S]*?)\n\}/g)].map((m) => m[1] ?? '')
    expect(fotogramas.length).toBeGreaterThan(0)
    const propiedades = new Set(fotogramas.flatMap((f) => [...f.matchAll(/^\s*([a-z-]+):/gm)].map((m) => m[1])))
    expect([...propiedades].sort()).toEqual(['opacity', 'transform'])
  })

  it('no usa hex sueltos: los colores viven en los tokens', () => {
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/i)
  })

  it('no tiene títulos ni elementos con foco que estorben a la página', () => {
    expect(plantilla).not.toMatch(/<(h[1-6]|a|button|input)\b/)
  })
})
