import { describe, expect, it } from 'vitest'
import { calcularReceta } from '@/lib/calculo/costo'
import { sumarLista, totalesLista } from '@/lib/recetas/lista'
import { INGREDIENTES, recetaPorSlug } from '@/test/catalogoPrueba'
import { aCSV } from './csv'
import { hojaDeLista, hojasDeReceta } from './hojas'
import { listaAJSON, recetaAJSON } from './json'
import { titulo, valorDe, type Hoja } from './tabla'

const FECHA = '2026-11-02'
const arroz = recetaPorSlug('arroz-con-leche')
if (!arroz) throw new Error('falta el arroz con leche de prueba')

const buscarFila = (hoja: Hoja | undefined, etiqueta: string) => hoja?.filas.find((f) => f[0] !== undefined && valorDe(f[0]) === etiqueta)

describe('hojasDeReceta', () => {
  const hojas = hojasDeReceta(arroz, 12, INGREDIENTES, 'Postres', FECHA)

  it('arma las cuatro hojas del contexto', () => {
    expect(hojas.map((h) => h.nombre)).toEqual(['Receta', 'Ingredientes', 'Total', 'Lista de compras'])
  })

  it('la hoja de ingredientes tiene encabezado y una fila por ingrediente, con las porciones pedidas', () => {
    const ingredientes = hojas[1]
    expect(ingredientes?.filas).toHaveLength(arroz.ingredientes.length + 1)
    // 1,5 l de leche para 6 porciones → 3 l para 12
    expect(ingredientes?.filas.find((f) => f[0] === 'Leche entera')?.slice(1, 3).map(valorDe)).toEqual([3, 'l'])
  })

  it('el total coincide con el cálculo de la ficha', () => {
    const c = calcularReceta(arroz, 12, INGREDIENTES)
    expect(valorDe(buscarFila(hojas[2], 'Total estimado')?.[1] ?? null)).toBe(c.total)
    expect(valorDe(buscarFila(hojas[2], 'Por porción, estimado')?.[1] ?? null)).toBe(c.porPorcion)
  })

  it('la hoja de la receta trae los pasos numerados y la fecha de exportación', () => {
    expect(hojas[0]?.filas.filter((f) => typeof f[0] === 'number')).toHaveLength(arroz.pasos.length)
    expect(buscarFila(hojas[0], 'Exportado de Moss Taste')?.[1]).toBe(FECHA)
  })
})

describe('hojaDeLista', () => {
  it('muestra los dos totales por separado: lo que cuestan las recetas y lo que se paga en caja', () => {
    const items = sumarLista([{ receta: arroz, porciones: 6 }], INGREDIENTES)
    const totales = totalesLista(items)
    const hoja = hojaDeLista(items, FECHA)
    expect(valorDe(buscarFila(hoja, 'Lo que cuestan las recetas')?.[4] ?? null)).toBe(totales.proporcional)
    expect(valorDe(buscarFila(hoja, 'Lo que se paga hoy en caja')?.[5] ?? null)).toBe(totales.caja)
  })
})

describe('aCSV', () => {
  const hoja: Hoja = {
    nombre: 'Prueba',
    anchos: [],
    filas: [
      [titulo('Ingrediente'), 'Cantidad'],
      ['Papa criolla', 1.5],
      ['Sal; al gusto', 2000],
      ['Dice "hola"', null],
      ['=SUMA(A1:A2)', -3],
      ['Ñame con tilde', 0.25],
    ],
  }
  const csv = aCSV([hoja])

  it('empieza con BOM, usa punto y coma y termina las líneas en CRLF', () => {
    expect(csv.startsWith('﻿')).toBe(true)
    expect(csv.split('\r\n')[0]).toBe('﻿Ingrediente;Cantidad')
    expect(csv.endsWith('\r\n')).toBe(true)
  })

  it('escribe decimales con coma y sin separador de miles', () => {
    expect(csv).toContain('Papa criolla;1,5\r\n')
    expect(csv).toContain(';2000\r\n')
    expect(csv).toContain('Ñame con tilde;0,25')
  })

  it('pone entre comillas lo que tiene separador o comillas', () => {
    expect(csv).toContain('"Sal; al gusto";2000')
    expect(csv).toContain('"Dice ""hola""";\r\n')
  })

  it('neutraliza lo que Excel ejecutaría como fórmula, sin tocar los números negativos', () => {
    expect(csv).toContain("'=SUMA(A1:A2);-3")
  })

  it('varias tablas quedan separadas por una fila vacía', () => {
    const dos = aCSV([hoja, { nombre: 'Otra', anchos: [], filas: [['B']] }])
    expect(dos).toContain('0,25\r\n\r\nB\r\n')
  })
})

describe('JSON', () => {
  it('la receta trae porciones, ingredientes y costo, y se puede leer de vuelta', () => {
    const datos = JSON.parse(recetaAJSON(arroz, 12, INGREDIENTES, FECHA))
    expect(datos.generadoPor).toBe('Moss Taste')
    expect(datos.exportado).toBe(FECHA)
    expect(datos.receta.porciones).toBe(12)
    expect(datos.ingredientes).toHaveLength(arroz.ingredientes.length)
    expect(datos.costo.total).toBe(calcularReceta(arroz, 12, INGREDIENTES).total)
  })

  it('la lista separa lo que cuestan las recetas de lo que se paga en caja', () => {
    const entradas = [{ receta: arroz, porciones: 6 }]
    const items = sumarLista(entradas, INGREDIENTES)
    const datos = JSON.parse(listaAJSON(entradas, items, FECHA))
    expect(Object.keys(datos.totales)).toEqual(['completos', 'loQueCuestanLasRecetas', 'loQueSePagaEnCaja', 'sinPrecio'])
    expect(datos.recetas).toEqual([{ id: 'arroz-con-leche', titulo: 'Arroz con leche', porciones: 6 }])
  })
})
