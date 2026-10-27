import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

const css = readFileSync(new URL('./tokens.css', import.meta.url), 'utf8')

// Lee los colores hex de un bloque de tokens (`--c-nombre: #rrggbb;`).
function leerBloque(selector: string): Record<string, string> {
  const inicio = css.indexOf(selector)
  if (inicio === -1) throw new Error(`No se encontró el bloque ${selector} en tokens.css`)
  const cuerpo = css.slice(inicio, css.indexOf('}', inicio))
  const tokens: Record<string, string> = {}
  for (const [, nombre, hex] of cuerpo.matchAll(/--c-([\w-]+):\s*(#[0-9a-f]{6})\s*;/gi)) {
    if (nombre && hex) tokens[nombre] = hex
  }
  return tokens
}

function luminancia(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contraste(a: string, b: string): number {
  const [claro, oscuro] = [luminancia(a), luminancia(b)].sort((x, y) => y - x) as [number, number]
  return (claro + 0.05) / (oscuro + 0.05)
}

// [texto o borde, fondo, mínimo WCAG AA]
const PARES: [string, string, number][] = [
  ['ink', 'bg', 4.5],
  ['ink', 'surface', 4.5],
  ['ink', 'accent-soft', 4.5],
  ['ink-soft', 'bg', 4.5],
  ['ink-soft', 'surface', 4.5],
  ['accent', 'bg', 4.5],
  ['accent', 'surface', 4.5],
  ['accent', 'accent-soft', 4.5],
  ['on-accent', 'accent', 4.5],
  ['success', 'surface', 4.5],
  ['success', 'success-soft', 4.5],
  ['danger', 'surface', 4.5],
  ['danger', 'danger-soft', 4.5],
  ['ink', 'danger-soft', 4.5],
  // Bordes de campos y controles: 3:1 (WCAG 1.4.11)
  ['line-strong', 'bg', 3],
  ['line-strong', 'surface', 3],
]

const TEMAS = {
  claro: leerBloque(':root {'),
  oscuro: leerBloque(":root[data-theme='dark']"),
}

describe('tokens de color', () => {
  it('el tema sistema repite exactamente los valores del tema oscuro', () => {
    expect(leerBloque(":root[data-theme='system']")).toEqual(TEMAS.oscuro)
  })

  for (const [tema, tokens] of Object.entries(TEMAS)) {
    for (const [texto, fondo, minimo] of PARES) {
      it(`${tema}: ${texto} sobre ${fondo} cumple ${minimo}:1`, () => {
        const a = tokens[texto]
        const b = tokens[fondo]
        expect(a, `falta --c-${texto} en el tema ${tema}`).toBeDefined()
        expect(b, `falta --c-${fondo} en el tema ${tema}`).toBeDefined()
        expect(contraste(a!, b!)).toBeGreaterThanOrEqual(minimo)
      })
    }
  }
})
