// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Boton } from './Boton'
import { Campo } from './Campo'
import { Chip } from './Chip'
import { Cargando, EstadoError } from './Estados'

afterEach(cleanup)

describe('Boton', () => {
  it('al cargar conserva la etiqueta, se marca ocupado y no dispara la acción', () => {
    const accion = vi.fn()
    render(
      <Boton cargando onClick={accion}>
        Guardar receta
      </Boton>,
    )
    const boton = screen.getByRole('button', { name: 'Guardar receta' })
    expect(boton.getAttribute('aria-busy')).toBe('true')
    expect(boton.getAttribute('aria-disabled')).toBe('true')
    fireEvent.click(boton)
    expect(accion).not.toHaveBeenCalled()
  })
})

describe('Campo', () => {
  it('enlaza la etiqueta, la ayuda y el error', () => {
    render(<Campo etiqueta="Correo" ayuda="Te respondo a este correo." error="Escribe un correo válido, por ejemplo ana@correo.co." />)
    const campo = screen.getByLabelText('Correo')
    expect(campo.getAttribute('aria-invalid')).toBe('true')
    const descripcion = (campo.getAttribute('aria-describedby') ?? '')
      .split(' ')
      .map((id) => document.getElementById(id)?.textContent)
    expect(descripcion).toEqual(['Escribe un correo válido, por ejemplo ana@correo.co.', 'Te respondo a este correo.'])
  })

  it('sin error no se marca inválido', () => {
    render(<Campo etiqueta="Nombre" />)
    expect(screen.getByLabelText('Nombre').hasAttribute('aria-invalid')).toBe(false)
  })
})

describe('Chip', () => {
  it('expone su estado con aria-pressed y avisa el cambio', () => {
    const alCambiar = vi.fn()
    render(
      <Chip activo={false} onChange={alCambiar}>
        Sopas
      </Chip>,
    )
    const chip = screen.getByRole('button', { name: 'Sopas' })
    expect(chip.getAttribute('aria-pressed')).toBe('false')
    fireEvent.click(chip)
    expect(alCambiar).toHaveBeenCalledWith(true)
  })
})

describe('Estados', () => {
  it('la carga se anuncia como estado y el error como alerta', () => {
    render(
      <>
        <Cargando texto="Cargando recetas…" />
        <EstadoError titulo="No se pudo cargar la receta" />
      </>,
    )
    expect(screen.getByRole('status').textContent).toContain('Cargando recetas…')
    expect(screen.getByRole('alert').textContent).toContain('No se pudo cargar la receta')
  })
})
