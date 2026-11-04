// @vitest-environment jsdom
import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

// Datos fijos de prueba: estas pruebas no dependen de las recetas publicadas.
vi.mock('@/lib/recetas/catalogo', () => import('@/test/catalogoPrueba'))
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
    // Las de la cuenta, sin sesión, llevan a /acceso.
    const esperado = ruta.startsWith('/mi-cocina') ? 'Entrar' : titulo
    it(`${ruta} tiene un solo h1 y su título`, async () => {
      const h1 = await visitar(ruta)
      expect(h1).toHaveLength(1)
      await waitFor(() => expect(document.title).toContain(esperado))
    })
  }

  it('el pie enlaza a la privacidad y a la licencia, y la política dice lo que debe decir', async () => {
    await visitar('/privacidad')
    const pie = screen.getByRole('navigation', { name: 'Pie de página' })
    expect(within(pie).getByRole('link', { name: 'Privacidad' }).getAttribute('href')).toBe('/privacidad')
    expect(within(pie).getByRole('link', { name: 'Licencia' }).getAttribute('href')).toBe('/licencia')
    for (const texto of [/Última actualización/, /Bogotá, Colombia/, /encargado del tratamiento/, /correo y el nombre de tu perfil/, /consultar, actualizar y rectificar/, /mayor de edad/, /EmailJS/, /Cloudflare/, /Gmail/, /Esa dirección no se publica/, /contacto@sergio-velandia\.dev/])
      expect(document.body.textContent).toMatch(texto)
  })

  it('una ruta desconocida muestra la página 404 sin indexar', async () => {
    const [h1] = await visitar('/no-existe')
    expect(h1?.textContent).toBe('Esta página no existe')
    await waitFor(() => expect(document.head.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex'))
  })

  it('las rutas de receta y modo cocina abren', async () => {
    expect(await visitar('/recetas/ajiaco-santafereno')).toHaveLength(1)
    cleanup()
    expect(await visitar('/recetas/ajiaco-santafereno/cocinar')).toHaveLength(1)
  })
})
