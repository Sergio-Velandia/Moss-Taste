// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { rutasApp } from '@/app/rutasApp'
import { ProveedorTema } from '@/app/tema/ProveedorTema'

afterEach(cleanup)

async function visitar(ruta: string) {
  const router = createMemoryRouter(rutasApp, { initialEntries: [ruta] })
  render(
    <ProveedorTema>
      <RouterProvider router={router} />
    </ProveedorTema>,
  )
  await screen.findByRole('heading', { level: 1 })
  return router
}

describe('modo lectura', () => {
  it('muestra la receta marcada como ejemplo, con ingredientes, costo y pasos', async () => {
    await visitar('/recetas/ajiaco-santafereno')
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Ajiaco santafereño')
    expect(screen.getAllByText('Receta de ejemplo').length).toBeGreaterThan(0)
    expect(screen.getByText('Papa criolla')).toBeTruthy()
    expect(screen.getByRole('heading', { name: /Costo estimado para 4 porciones/ })).toBeTruthy()
    for (const enlace of screen.getAllByRole('link', { name: 'Cocinar paso a paso' }))
      expect(enlace.getAttribute('href')).toBe('/recetas/ajiaco-santafereno/cocinar')
    await waitFor(() => expect(document.head.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex'))
  })

  it('exportar y cambiar porciones avisan que llegan después', async () => {
    await visitar('/recetas/arroz-con-leche')
    fireEvent.click(screen.getByRole('button', { name: 'Exportar' }))
    expect(screen.getByText(/Exportar a Excel, CSV y JSON estará disponible pronto/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Agregar una porción' }))
    expect(screen.getByText(/las cantidades y el costo se muestran para 6 porciones/)).toBeTruthy()
  })

  it('una receta que no existe muestra la 404', async () => {
    await visitar('/recetas/no-existe')
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Esta página no existe')
  })
})

describe('galería', () => {
  it('lee los filtros de la URL y los actualiza', async () => {
    const router = await visitar('/recetas?categoria=postres')
    const resultados = screen.getByRole('heading', { name: '1 receta' })
    expect(resultados).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Desayunos' }))
    await waitFor(() => expect(router.state.location.search).toBe('?categoria=postres&categoria=desayunos'))
    expect(screen.getByRole('heading', { name: '2 recetas' })).toBeTruthy()
  })

  it('sin resultados ofrece quitar los filtros', async () => {
    const router = await visitar('/recetas?q=langosta')
    const vacio = screen.getByRole('heading', { name: 'Ninguna receta coincide' }).closest('section')
    expect(vacio).not.toBeNull()
    fireEvent.click(within(vacio as HTMLElement).getByRole('button', { name: 'Quitar filtros' }))
    await waitFor(() => expect(router.state.location.search).toBe(''))
  })
})
