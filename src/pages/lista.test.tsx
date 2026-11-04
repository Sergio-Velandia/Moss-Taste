// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { rutasApp } from '@/app/rutasApp'
import { ProveedorTema } from '@/app/tema/ProveedorTema'
import { CLAVE_LISTA } from '@/lib/lista/almacen'

// Datos fijos de prueba: estas pruebas no dependen de las recetas publicadas.
vi.mock('@/lib/recetas/catalogo', () => import('@/test/catalogoPrueba'))

afterEach(cleanup)

// jsdom no sabe descargar: se capturan el blob y el nombre del archivo en vez de navegar.
const descargas: { nombre: string; blob: Blob }[] = []
beforeAll(() => {
  let ultimo: Blob | null = null
  URL.createObjectURL = vi.fn((blob: Blob) => {
    ultimo = blob
    return 'blob:prueba'
  })
  URL.revokeObjectURL = vi.fn()
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
    if (ultimo) descargas.push({ nombre: this.download, blob: ultimo })
  })
})

async function visitar(ruta: string) {
  const router = createMemoryRouter(rutasApp, { initialEntries: [ruta] })
  render(
    <ProveedorTema>
      <RouterProvider router={router} />
    </ProveedorTema>,
  )
  await screen.findByRole('heading', { level: 1 })
  // Bajo carga, el h1 aparece antes de que React se suscriba a la lista: se vacían los efectos antes de tocar la pantalla.
  await act(async () => {})
  return router
}

describe('exportar una receta', () => {
  it('ofrece tres formatos y descarga el CSV con las porciones elegidas', async () => {
    await visitar('/recetas/arroz-con-leche?porciones=12')
    fireEvent.click(screen.getByRole('button', { name: 'Exportar' }))
    expect(screen.getByRole('button', { name: /^Excel/ })).toBeTruthy()
    expect(screen.getByRole('button', { name: /^JSON/ })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /^CSV/ }))
    await screen.findByText('Descargaste arroz-con-leche-12-porciones.csv.')
    const blob = descargas.at(-1)?.blob
    // Blob.text() quita el BOM al decodificar: se revisan los bytes reales del archivo.
    const bytes = new Uint8Array((await blob?.arrayBuffer()) ?? new ArrayBuffer(0))
    expect([...bytes.slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf])
    expect((await blob?.text())?.startsWith('Ingrediente;Cantidad')).toBe(true)
  })

  it('descarga el JSON con la receta y su costo', async () => {
    await visitar('/recetas/arroz-con-leche')
    fireEvent.click(screen.getByRole('button', { name: 'Exportar' }))
    fireEvent.click(screen.getByRole('button', { name: /^JSON/ }))
    await screen.findByText('Descargaste arroz-con-leche-6-porciones.json.')
    const datos = JSON.parse((await descargas.at(-1)?.blob.text()) ?? '{}')
    expect(datos.receta.porciones).toBe(6)
    expect(datos.costo.total).toBeGreaterThan(0)
  })
})

describe('lista de compras', () => {
  it('empieza vacía e invita a agregar recetas', async () => {
    localStorage.clear()
    await visitar('/lista')
    expect(screen.getByRole('heading', { name: 'Tu lista está vacía' })).toBeTruthy()
  })

  it('agrega desde la ficha, se guarda, suma, separa los totales y se vacía', async () => {
    const router = await visitar('/recetas/arroz-con-leche?porciones=12')
    fireEvent.click(screen.getByRole('button', { name: 'Agregar a la lista' }))
    expect(screen.getByText('Agregaste la receta a la lista de compras, para 12 porciones.')).toBeTruthy()
    expect(JSON.parse(localStorage.getItem(CLAVE_LISTA) ?? '{}').recetas).toEqual([{ id: 'arroz-con-leche', porciones: 12 }])

    // Agregarla otra vez actualiza las porciones en vez de duplicarla.
    fireEvent.click(screen.getByRole('button', { name: 'Agregar a la lista' }))
    expect(screen.getByText('La receta ya estaba en la lista: ahora es para 12 porciones.')).toBeTruthy()

    await router.navigate('/lista')
    await screen.findByRole('heading', { name: 'Recetas en la lista' })
    await act(async () => {})
    // 1,5 l de leche para 6 porciones → 3 l para 12.
    const leche = screen.getByRole('checkbox', { name: /Leche entera.*Necesitas 3 l/ })
    expect(screen.getByRole('heading', { name: 'Lo que cuestan estas recetas' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Lo que pagas hoy en caja' })).toBeTruthy()

    fireEvent.click(leche)
    expect((leche as HTMLInputElement).checked).toBe(true)
    expect(JSON.parse(localStorage.getItem(CLAVE_LISTA) ?? '{}').comprados).toHaveLength(1)

    const receta = screen.getByRole('link', { name: 'Arroz con leche' }).closest('li') as HTMLElement
    fireEvent.click(within(receta).getByRole('button', { name: 'Quitar una porción' }))
    expect(JSON.parse(localStorage.getItem(CLAVE_LISTA) ?? '{}').recetas[0].porciones).toBe(11)

    fireEvent.click(screen.getByRole('button', { name: 'Vaciar lista' }))
    fireEvent.click(screen.getByRole('button', { name: 'Vaciar lista' }))
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Tu lista está vacía' })).toBeTruthy())
  })
})
