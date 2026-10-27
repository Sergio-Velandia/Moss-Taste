// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { RUTAS_FIJAS } from '@/rutas'
import { rutasApp } from './rutasApp'
import { ProveedorTema } from './tema/ProveedorTema'

afterEach(cleanup)

async function visitar(ruta: string) {
  const router = createMemoryRouter(rutasApp, { initialEntries: [ruta] })
  render(
    <ProveedorTema>
      <RouterProvider router={router} />
    </ProveedorTema>,
  )
  return screen.findAllByRole('heading', { level: 1 })
}

// Prueba de humo: cada ruta abre con un solo h1 y su título de pestaña.
describe('rutas', () => {
  for (const { ruta, titulo } of RUTAS_FIJAS) {
    it(`${ruta} tiene un solo h1 y su título`, async () => {
      const h1 = await visitar(ruta)
      expect(h1).toHaveLength(1)
      await waitFor(() => expect(document.title).toContain(titulo))
    })
  }

  it('una ruta desconocida muestra la página 404 sin indexar', async () => {
    const [h1] = await visitar('/no-existe')
    expect(h1?.textContent).toBe('Esta página no existe')
    await waitFor(() => expect(document.head.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex'))
  })

  it('las rutas de receta y modo cocina abren', async () => {
    expect(await visitar('/recetas/ajiaco')).toHaveLength(1)
    cleanup()
    expect(await visitar('/recetas/ajiaco/cocinar')).toHaveLength(1)
  })
})
