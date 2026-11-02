// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { calcularReceta } from '@/lib/calculo/costo'
import type { Ingrediente, Receta } from '@/lib/recetas/tipos'
import { ResumenCosto } from './ResumenCosto'

afterEach(cleanup)

const papa: Ingrediente = { id: 'papa', nombre: 'Papa', unidadBase: 'g', precio: null, porCantidad: 1000, merma: 0 }
const receta: Receta = {
  id: 'sopa',
  titulo: 'Sopa',
  resumen: 'Sopa.',
  categoria: 'sopas',
  porcionesBase: 4,
  tiempoMin: 30,
  ingredientes: [{ ingrediente: 'papa', cantidad: 500, unidad: 'g' }],
  miseEnPlace: [],
  pasos: [{ texto: 'Hierve.' }],
}

describe('ResumenCosto', () => {
  it('sin ningún precio dice que el costo está pendiente, nunca «$ 0»', () => {
    render(<ResumenCosto costo={calcularReceta(receta, 4, new Map([['papa', papa]]))} porciones={4} />)
    expect(screen.getByText('Pendiente')).toBeTruthy()
    expect(document.body.textContent).not.toMatch(/\$\s*0\b/)
  })

  it('con precio muestra el rango', () => {
    const conPrecio = { ...papa, precio: 4000, fechaPrecio: '2026-11-01' }
    render(<ResumenCosto costo={calcularReceta(receta, 4, new Map([['papa', conPrecio]]))} porciones={4} />)
    expect(screen.queryByText('Pendiente')).toBeNull()
    expect(document.body.textContent).toMatch(/1\.800 a/)
  })
})
