// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { rutasApp } from '@/app/rutasApp'
import { ProveedorTema } from '@/app/tema/ProveedorTema'
import { URL_EMAILJS } from '@/lib/contacto/enviar'
import { CLAVE_ENVIOS, MAX_POR_DIA } from '@/lib/contacto/limite'

vi.mock('@/lib/recetas/catalogo', () => import('@/test/catalogoPrueba'))

const fetchFalso = vi.fn<typeof fetch>()

beforeEach(() => {
  localStorage.clear()
  fetchFalso.mockReset()
  fetchFalso.mockResolvedValue(new Response('OK', { status: 200 }))
  vi.stubGlobal('fetch', fetchFalso)
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

async function abrirContacto() {
  const router = createMemoryRouter(rutasApp, { initialEntries: ['/contacto'] })
  render(
    <ProveedorTema>
      <RouterProvider router={router} />
    </ProveedorTema>,
  )
  await screen.findByRole('heading', { level: 1 })
}

function llenarMensaje() {
  fireEvent.click(screen.getByRole('radio', { name: 'Escribir un mensaje' }))
  fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Ana' } })
  fireEvent.change(screen.getByLabelText('Correo'), { target: { value: 'ana@correo.co' } })
  fireEvent.change(screen.getByLabelText('Mensaje'), { target: { value: 'Hola, una pregunta sobre el ajiaco.' } })
}

const enviar = () => fireEvent.click(screen.getByRole('button', { name: 'Enviar mensaje' }))

describe('contacto', () => {
  it('envía el mensaje, agradece y limpia el formulario', async () => {
    await abrirContacto()
    expect(screen.getByText(/El envío pasa por EmailJS/)).toBeTruthy()
    llenarMensaje()
    enviar()
    await screen.findByText('Gracias, Ana. Recibí tu mensaje y te respondo a ana@correo.co.')
    expect(fetchFalso).toHaveBeenCalledOnce()
    const [url, opciones] = fetchFalso.mock.calls[0] as [string, RequestInit]
    expect(url).toBe(URL_EMAILJS)
    expect(JSON.parse(opciones.body as string).template_params).toMatchObject({ tipo: 'Mensaje', correo: 'ana@correo.co' })
    expect((screen.getByLabelText('Nombre') as HTMLInputElement).value).toBe('')
    // Se queda en «Escribir un mensaje».
    expect((screen.getByRole('radio', { name: 'Escribir un mensaje' }) as HTMLInputElement).checked).toBe(true)
  })

  it('una receta propuesta lleva su nombre en el asunto', async () => {
    await abrirContacto()
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Ana' } })
    fireEvent.change(screen.getByLabelText('Correo'), { target: { value: 'ana@correo.co' } })
    fireEvent.change(screen.getByLabelText('Nombre de la receta'), { target: { value: 'Sancocho' } })
    fireEvent.change(screen.getByLabelText('Ingredientes y pasos'), { target: { value: 'Para 4 porciones: 1 gallina, 3 papas pastusas.' } })
    fireEvent.click(screen.getByRole('button', { name: 'Enviar receta' }))
    await screen.findByText(/Recibí tu receta/)
    const [, opciones] = fetchFalso.mock.calls[0] as [string, RequestInit]
    expect(JSON.parse(opciones.body as string).template_params.asunto).toBe('[Moss Taste] Receta propuesta: Sancocho')
  })

  it('si falla, lo dice y conserva lo escrito', async () => {
    fetchFalso.mockResolvedValue(new Response('Error', { status: 500 }))
    await abrirContacto()
    llenarMensaje()
    enviar()
    await screen.findByText(/No se pudo enviar el mensaje\. Lo que escribiste sigue aquí/)
    expect((screen.getByLabelText('Nombre') as HTMLInputElement).value).toBe('Ana')
    expect(localStorage.getItem(CLAVE_ENVIOS)).toBeNull()
  })

  it('sin conexión lo dice distinto', async () => {
    fetchFalso.mockRejectedValue(new TypeError('Failed to fetch'))
    await abrirContacto()
    llenarMensaje()
    enviar()
    await screen.findByText(/parece que no hay conexión/)
  })

  it('pide esperar un minuto entre envíos', async () => {
    await abrirContacto()
    llenarMensaje()
    enviar()
    await screen.findByText(/Gracias, Ana/)
    llenarMensaje()
    enviar()
    expect(screen.getByText(/Acabas de enviar un mensaje\. Espera \d+ segundos/)).toBeTruthy()
    expect(fetchFalso).toHaveBeenCalledOnce()
  })

  it('al llegar al tope del día no envía', async () => {
    const hace = (h: number) => Date.now() - h * 60 * 60 * 1000
    localStorage.setItem(CLAVE_ENVIOS, JSON.stringify(Array.from({ length: MAX_POR_DIA }, (_, i) => hace(i + 1))))
    await abrirContacto()
    llenarMensaje()
    enviar()
    expect(screen.getByText(`Ya enviaste ${MAX_POR_DIA} mensajes hoy desde este navegador. Intenta de nuevo mañana.`)).toBeTruthy()
    expect(fetchFalso).not.toHaveBeenCalled()
  })

  it('si un robot llena el campo trampa, no envía nada', async () => {
    await abrirContacto()
    llenarMensaje()
    fireEvent.change(document.getElementById('sitio-web') as HTMLInputElement, { target: { value: 'spam.example' } })
    enviar()
    expect(fetchFalso).not.toHaveBeenCalled()
  })
})
