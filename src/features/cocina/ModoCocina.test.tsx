// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { rutasApp } from '@/app/rutasApp'
import { ProveedorTema } from '@/app/tema/ProveedorTema'

afterEach(cleanup)

async function cocinar(busqueda = '') {
  const router = createMemoryRouter(rutasApp, { initialEntries: [`/recetas/arroz-con-leche/cocinar${busqueda}`] })
  render(
    <ProveedorTema>
      <RouterProvider router={router} />
    </ProveedorTema>,
  )
  await screen.findByRole('heading', { level: 1, name: 'Arroz con leche' })
  return router
}


describe('modo cocina', () => {
  it('usa las porciones de la ficha y las conserva al avanzar y al salir', async () => {
    const router = await cocinar('?porciones=12')
    expect(screen.getByText('Vas a necesitar, para 12 porciones')).toBeTruthy()
    expect(screen.getByText('3 l')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Empezar/ }))
    await waitFor(() => expect(router.state.location.search).toBe('?porciones=12&paso=1'))
    fireEvent.keyDown(window, { key: 'Escape' })
    await waitFor(() => expect(router.state.location.pathname + router.state.location.search).toBe('/recetas/arroz-con-leche?porciones=12'))
  })

  it('empieza en «Antes de empezar» con la mise en place y los ingredientes', async () => {
    await cocinar()
    expect(screen.getAllByText('Antes de empezar').length).toBeGreaterThan(0)
    expect(screen.getByText('Lava el arroz hasta que el agua salga clara.')).toBeTruthy()
    expect(screen.getByRole('button', { name: /Empezar/ })).toBeTruthy()
  })

  it('avanza con el botón y con las flechas, y guarda el paso en la URL', async () => {
    const router = await cocinar()
    fireEvent.click(screen.getByRole('button', { name: /Empezar/ }))
    await waitFor(() => expect(router.state.location.search).toBe('?paso=1'))
    expect(screen.getByText('Paso 1 de 4', { selector: 'output' })).toBeTruthy()
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    await waitFor(() => expect(router.state.location.search).toBe('?paso=2'))
    fireEvent.keyDown(window, { key: 'ArrowLeft' })
    await waitFor(() => expect(router.state.location.search).toBe('?paso=1'))
  })

  it('muestra los ingredientes y el temporizador del paso', async () => {
    await cocinar('?paso=3')
    await screen.findByText(/Cuando espese, añade el azúcar/)
    expect(screen.getByText('Para este paso')).toBeTruthy()
    expect(screen.getByText('08:00')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Iniciar/ }))
    expect(screen.getByText('Los temporizadores funcionarán en una próxima versión.')).toBeTruthy()
  })

  it('en el último paso ofrece terminar y luego volver a la receta', async () => {
    const router = await cocinar('?paso=4')
    fireEvent.click(screen.getByRole('button', { name: /Terminar/ }))
    await waitFor(() => expect(router.state.location.search).toBe('?paso=5'))
    expect(await screen.findByRole('heading', { name: 'Buen provecho' })).toBeTruthy()
  })

  it('un paso inválido en la URL vuelve al inicio', async () => {
    await cocinar('?paso=99')
    expect(screen.getAllByText('Antes de empezar').length).toBeGreaterThan(0)
  })

  it('Escape sale a la vista de lectura de la misma receta', async () => {
    const router = await cocinar('?paso=2')
    fireEvent.keyDown(window, { key: 'Escape' })
    await waitFor(() => expect(router.state.location.pathname).toBe('/recetas/arroz-con-leche'))
  })

  it('sin Wake Lock, el botón dice que no está disponible en este navegador', async () => {
    await cocinar()
    const boton = screen.getByRole('button', { name: /Mantener pantalla encendida/ })
    expect(boton.textContent).toContain('No disponible en este navegador')
    expect(boton.getAttribute('aria-disabled')).toBe('true')
  })
})

