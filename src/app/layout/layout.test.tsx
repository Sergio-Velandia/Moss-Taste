// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { rutasApp } from '../rutasApp'
import { ProveedorTema } from '../tema/ProveedorTema'

afterEach(cleanup)

async function montar(ruta = '/') {
  const router = createMemoryRouter(rutasApp, { initialEntries: [ruta] })
  render(
    <ProveedorTema>
      <RouterProvider router={router} />
    </ProveedorTema>,
  )
  await screen.findByRole('heading', { level: 1 })
  return router
}

describe('layout', () => {
  it('ofrece saltar al contenido principal', async () => {
    await montar()
    const salto = screen.getByRole('link', { name: 'Saltar al contenido' })
    expect(salto.getAttribute('href')).toBe('#contenido')
    expect(document.getElementById('contenido')?.tagName).toBe('MAIN')
  })

  it('marca la página actual en la navegación', async () => {
    await montar('/recetas')
    const actuales = screen.getAllByRole('link', { name: 'Recetas' }).filter((a) => a.getAttribute('aria-current') === 'page')
    expect(actuales.length).toBeGreaterThan(0)
  })

  it('el menú móvil abre, cierra con Escape y devuelve el foco', async () => {
    await montar()
    const boton = screen.getByRole('button', { name: 'Menú' })
    fireEvent.click(boton)
    expect(boton.getAttribute('aria-expanded')).toBe('true')
    expect(document.getElementById('menu-movil')).not.toBeNull()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(boton.getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(boton)
  })

  it('al navegar, el foco pasa al h1 de la nueva página', async () => {
    const router = await montar()
    await router.navigate('/hoy')
    await waitFor(() => expect(document.activeElement?.textContent).toBe('¿Qué cocino hoy?'))
  })
})
