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

  it('exportar avisa que llega después', async () => {
    await visitar('/recetas/arroz-con-leche')
    fireEvent.click(screen.getByRole('button', { name: 'Exportar' }))
    expect(screen.getByText(/Exportar a Excel, CSV y JSON estará disponible pronto/)).toBeTruthy()
  })

  it('cambiar porciones recalcula cantidades y costo, y lo guarda en la URL', async () => {
    const router = await visitar('/recetas/arroz-con-leche')
    expect(screen.getByText('1,5 l')).toBeTruthy()
    const costoBase = screen.getByRole('heading', { name: /Costo estimado para 6 porciones/ }).parentElement?.textContent
    fireEvent.click(screen.getByRole('button', { name: 'Agregar una porción' }))
    await waitFor(() => expect(router.state.location.search).toBe('?porciones=7'))
    expect(screen.getByText('1,75 l')).toBeTruthy()
    const costoNuevo = screen.getByRole('heading', { name: /Costo estimado para 7 porciones/ }).parentElement?.textContent
    expect(costoNuevo).not.toBe(costoBase)
    for (const enlace of screen.getAllByRole('link', { name: 'Cocinar paso a paso' }))
      expect(enlace.getAttribute('href')).toBe('/recetas/arroz-con-leche/cocinar?porciones=7')
    fireEvent.click(screen.getByRole('button', { name: 'Volver a 6 porciones' }))
    await waitFor(() => expect(router.state.location.search).toBe(''))
    expect(screen.getByText(/como la receta original/)).toBeTruthy()
  })

  it('muestra cuánto comprar cuando hay merma', async () => {
    await visitar('/recetas/ajiaco-santafereno')
    expect(screen.getByText('Compra 890 g')).toBeTruthy()
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

describe('¿Qué cocino hoy?', () => {
  it('marca ingredientes en la URL y sugiere recetas con lo que falta', async () => {
    const router = await visitar('/hoy')
    expect(screen.getByRole('heading', { name: 'Marca lo que tienes' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Arroz blanco' }))
    await waitFor(() => expect(router.state.location.search).toBe('?tengo=arroz'))
    expect(screen.getByText('Tienes 1 de 4. Falta: Leche entera, Canela en astilla, Mantequilla.')).toBeTruthy()
  })
})

describe('lista de compras', () => {
  it('suma las recetas, marca comprados y se vacía al quitarlas', async () => {
    await visitar('/lista')
    expect(screen.getAllByText('Para Arepas de queso y Arroz con leche')).toHaveLength(2)
    const leche = screen.getByRole('checkbox', { name: /Leche entera/ })
    fireEvent.click(leche)
    expect((leche as HTMLInputElement).checked).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: 'Quitar Arepas de queso de la lista' }))
    fireEvent.click(screen.getByRole('button', { name: 'Quitar Arroz con leche de la lista' }))
    expect(screen.getByRole('heading', { name: 'Tu lista está vacía' })).toBeTruthy()
  })
})

describe('formularios', () => {
  it('contacto: al enviar vacío marca errores y enfoca el primero', async () => {
    await visitar('/contacto')
    fireEvent.click(screen.getByRole('button', { name: 'Enviar receta' }))
    const nombre = screen.getByLabelText('Nombre')
    expect(nombre.getAttribute('aria-invalid')).toBe('true')
    expect(document.activeElement).toBe(nombre)
    expect(screen.getByText('Revisa los campos marcados.')).toBeTruthy()
  })

  it('contacto: completo, avisa que el envío llega después', async () => {
    await visitar('/contacto')
    fireEvent.click(screen.getByRole('radio', { name: 'Escribir un mensaje' }))
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Ana' } })
    fireEvent.change(screen.getByLabelText('Correo'), { target: { value: 'ana@correo.co' } })
    fireEvent.change(screen.getByLabelText('Mensaje'), { target: { value: 'Hola, una pregunta sobre el ajiaco.' } })
    fireEvent.click(screen.getByRole('button', { name: 'Enviar mensaje' }))
    expect(screen.getByText(/El envío del formulario se activa en una próxima versión/)).toBeTruthy()
  })

  it('acceso: crear cuenta exige contraseña de 8 caracteres', async () => {
    await visitar('/acceso')
    fireEvent.click(screen.getByRole('radio', { name: 'Crear cuenta' }))
    fireEvent.change(screen.getByLabelText('Correo'), { target: { value: 'ana@correo.co' } })
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'corta' } })
    fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }))
    expect(screen.getByText('Usa al menos 8 caracteres.')).toBeTruthy()
  })

  it('nueva receta: sin datos marca los campos obligatorios', async () => {
    await visitar('/mi-cocina/nueva')
    fireEvent.click(screen.getByRole('button', { name: 'Guardar receta' }))
    expect(screen.getByText('Escribe el nombre de la receta.')).toBeTruthy()
    expect(screen.getByText('Agrega al menos un ingrediente con su cantidad.')).toBeTruthy()
    expect(document.activeElement).toBe(screen.getByLabelText('Nombre de la receta'))
  })
})

describe('galería en móvil', () => {
  it('los filtros se pliegan tras un botón que dice cuántos hay activos', async () => {
    await visitar('/recetas')
    const boton = screen.getByRole('button', { name: 'Filtros' })
    expect(boton.getAttribute('aria-expanded')).toBe('false')
    expect(document.getElementById('filtros-recetas')?.className).toContain('hidden')
    fireEvent.click(boton)
    expect(boton.getAttribute('aria-expanded')).toBe('true')
    cleanup()
    await visitar('/recetas?categoria=sopas&max=10000')
    expect(screen.getByRole('button', { name: 'Filtros (2)' }).getAttribute('aria-expanded')).toBe('true')
  })
})
