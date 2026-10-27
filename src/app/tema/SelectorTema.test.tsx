// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ProveedorTema } from './ProveedorTema'
import { SelectorTema } from './SelectorTema'
import { CLAVE_TEMA } from './tema'

function montar() {
  render(
    <ProveedorTema>
      <SelectorTema />
    </ProveedorTema>,
  )
}

describe('SelectorTema', () => {
  beforeEach(() => {
    localStorage.clear()
    delete document.documentElement.dataset.theme
  })
  afterEach(cleanup)

  it('usa el tema claro por defecto', () => {
    montar()
    expect((screen.getByRole("radio", { name: "Claro" }) as HTMLInputElement).checked).toBe(true)
    expect(document.documentElement.dataset.theme).toBe('light')
  })

  it('aplica y recuerda la elección', () => {
    montar()
    fireEvent.click(screen.getByRole('radio', { name: 'Oscuro' }))
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(localStorage.getItem(CLAVE_TEMA)).toBe('dark')
  })

  it('recupera la elección guardada', () => {
    localStorage.setItem(CLAVE_TEMA, 'system')
    montar()
    expect((screen.getByRole("radio", { name: "Sistema" }) as HTMLInputElement).checked).toBe(true)
  })

  it('ignora un valor guardado inválido', () => {
    localStorage.setItem(CLAVE_TEMA, 'morado')
    montar()
    expect(document.documentElement.dataset.theme).toBe('light')
  })

  it('el script de index.html usa la misma clave de almacenamiento', () => {
    const html = readFileSync(join(process.cwd(), 'index.html'), 'utf8')
    expect(html).toContain(`"${CLAVE_TEMA}"`)
  })
})
