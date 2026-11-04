// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Datos fijos de prueba: estas pruebas no dependen de las recetas publicadas.
vi.mock('@/lib/recetas/catalogo', () => import('@/test/catalogoPrueba'))
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

  it('muestra la imagen del plato con su texto alternativo y el aviso de IA', async () => {
    await visitar('/recetas/ajiaco-santafereno')
    expect(screen.getByRole('img', { name: 'Plato hondo de ajiaco con mazorca, crema y alcaparras al lado.' })).toBeTruthy()
    expect(screen.getByText('Imagen ilustrativa generada con IA.')).toBeTruthy()
  })

  it('sin imagen propia usa la de su categoría, decorativa y avisada', async () => {
    await visitar('/recetas/arroz-con-leche')
    expect(screen.getByText('Imagen de postres, ilustrativa y generada con IA.')).toBeTruthy()
    expect(document.querySelector('figure img')?.getAttribute('alt')).toBe('')
  })

  it('sin imagen ni respaldo muestra la ilustración de la categoría', async () => {
    await visitar('/recetas/arepas-de-queso')
    expect(document.querySelector('figure')).toBeNull()
  })

  it('muestra las notas de la casa', async () => {
    await visitar('/recetas/arroz-con-leche')
    expect(screen.getByRole('heading', { name: 'Notas de la casa' })).toBeTruthy()
    expect(screen.getByText('Si queda muy espeso, se corrige con un chorro de leche tibia.')).toBeTruthy()
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
    // Según la versión de Intl, el porcentaje sale «10%» o «10 %»: la prueba acepta los dos.
    const merma = (_: string, el: Element | null) => el?.tagName === 'SPAN' && /^Compra aprox\. 890 g \(merma estimada del 10\s?%\)$/.test(el.textContent ?? '')
    expect(screen.getByText(merma)).toBeTruthy()
    // 2 mazorcas en una receta que las cuenta, con precio por kilo: el peso es estimado.
    expect(screen.getByText('≈ 600 g')).toBeTruthy()
  })

  it('marca los opcionales en la fila, en su precio y en la tirilla, y muestra la alternativa', async () => {
    await visitar('/recetas/arroz-con-leche')
    expect(screen.getByText('Opcional')).toBeTruthy()
    expect(screen.getByText('opcional')).toBeTruthy()
    expect(screen.getByText(/Incluye .* de opcionales \(uvas pasas\)\./)).toBeTruthy()
    expect(screen.getByText('o panela rallada')).toBeTruthy()
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
  it('el presupuesto solo ya lista recetas, y explica de dónde sale el número', async () => {
    await visitar('/hoy?max=20000')
    expect(screen.queryByRole('heading', { name: 'Marca lo que tienes' })).toBeNull()
    expect(screen.getByRole('link', { name: 'Arroz con leche' })).toBeTruthy()
    expect(screen.getByText(/costo más alto del estimado/)).toBeTruthy()
    expect(screen.getAllByText(/estimado hasta \$/).length).toBeGreaterThan(0)
  })

  it('un ?tengo= inventado se ignora', async () => {
    await visitar('/hoy?tengo=inventado')
    expect(screen.getByRole('heading', { name: 'Marca lo que tienes' })).toBeTruthy()
  })

  it('el enlace con lo marcado se puede compartir', async () => {
    await visitar('/hoy?tengo=arroz')
    expect(screen.getByText(/^Tienes 1 de /)).toBeTruthy()
    expect((screen.getByRole('button', { name: 'Arroz blanco' })).getAttribute('aria-pressed')).toBe('true')
  })

  it('si nada cabe en el presupuesto, ofrece quitarlo', async () => {
    await visitar('/hoy?tengo=arroz&max=100')
    expect(screen.getByRole('button', { name: 'Quitar el presupuesto' })).toBeTruthy()
  })

  it('marca ingredientes en la URL y sugiere recetas con lo que falta', async () => {
    const router = await visitar('/hoy')
    expect(screen.getByRole('heading', { name: 'Marca lo que tienes' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Arroz blanco' }))
    await waitFor(() => expect(router.state.location.search).toBe('?tengo=arroz'))
    expect(screen.getByText('Tienes 1 de 4. Falta: Leche entera, Canela en astilla, Mantequilla.')).toBeTruthy()
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

  it('acceso: crear cuenta exige contraseña de 8 caracteres', async () => {
    await visitar('/acceso')
    fireEvent.click(screen.getByRole('radio', { name: 'Crear cuenta' }))
    fireEvent.change(screen.getByLabelText('Correo'), { target: { value: 'ana@correo.co' } })
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'corta' } })
    fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }))
    expect(screen.getByText('Usa al menos 8 caracteres.')).toBeTruthy()
  })
})

// Cambiar porciones o filtros actualiza la URL, pero no es ir a otra página: no debe volver arriba.
describe('cambiar la URL de la misma página conserva la posición', () => {
  const scrollTo = vi.fn()
  beforeEach(() => {
    vi.stubGlobal('scrollTo', scrollTo)
  })
  afterEach(() => {
    scrollTo.mockClear()
    vi.unstubAllGlobals()
  })
  const volvioArriba = () => scrollTo.mock.calls.some(([x, y]) => x === 0 && y === 0)

  it('al cambiar porciones en la ficha', async () => {
    const router = await visitar('/recetas/arroz-con-leche')
    await act(async () => {})
    scrollTo.mockClear()
    fireEvent.click(screen.getByRole('button', { name: 'Agregar una porción' }))
    await waitFor(() => expect(router.state.location.search).toBe('?porciones=7'))
    await act(async () => {})
    expect(volvioArriba()).toBe(false)
    fireEvent.click(screen.getByRole('button', { name: 'Volver a 6 porciones' }))
    await waitFor(() => expect(router.state.location.search).toBe(''))
    await act(async () => {})
    expect(volvioArriba()).toBe(false)
  })

  it('al filtrar la galería', async () => {
    const router = await visitar('/recetas')
    await act(async () => {})
    scrollTo.mockClear()
    fireEvent.click(screen.getByRole('button', { name: 'Desayunos' }))
    await waitFor(() => expect(router.state.location.search).toBe('?categoria=desayunos'))
    await act(async () => {})
    expect(volvioArriba()).toBe(false)
  })

  it('al marcar ingredientes en ¿Qué cocino hoy?', async () => {
    const router = await visitar('/hoy')
    await act(async () => {})
    scrollTo.mockClear()
    fireEvent.click(screen.getByRole('button', { name: 'Arroz blanco' }))
    await waitFor(() => expect(router.state.location.search).toBe('?tengo=arroz'))
    await act(async () => {})
    expect(volvioArriba()).toBe(false)
  })

  it('ir a otra página sí vuelve arriba', async () => {
    const router = await visitar('/recetas/arroz-con-leche')
    await act(async () => {})
    scrollTo.mockClear()
    await act(async () => {
      await router.navigate('/acerca')
    })
    await screen.findByRole('heading', { level: 1, name: /Acerca/ })
    expect(volvioArriba()).toBe(true)
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
