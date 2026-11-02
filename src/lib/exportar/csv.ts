import { valorDe, type Celda, type Hoja } from './tabla'

/*
 * CSV que abre bien en Excel en español (configuración regional de Colombia), sin dependencias:
 *   - UTF-8 con BOM: sin él, Excel lee las tildes y la ñ como basura.
 *   - Separador «;»: con coma decimal, Excel en español espera punto y coma entre columnas.
 *   - Decimales con coma y sin separador de miles, para que Excel los lea como números.
 *   - Saltos de línea CRLF.
 *   - Un texto que empiece con = + - @ se antepone con un apóstrofo, para que Excel no lo ejecute como
 *     fórmula (inyección de CSV); importa cuando lleguen las recetas personales.
 */

const BOM = '﻿'
const SEPARADOR = ';'
const FIN = '\r\n'

function texto(valor: string): string {
  const seguro = /^[=+\-@\t\r]/.test(valor) ? `'${valor}` : valor
  return /[;"\r\n]/.test(seguro) ? `"${seguro.replace(/"/g, '""')}"` : seguro
}

function celda(c: Celda): string {
  const v = valorDe(c)
  if (v === null) return ''
  if (typeof v === 'number') return String(v).replace('.', ',')
  return texto(v)
}

/** Una o varias tablas en un solo CSV, separadas por una fila vacía. */
export function aCSV(hojas: readonly Hoja[]): string {
  const filas = hojas.flatMap((hoja, i) => [...(i > 0 ? [[] as Celda[]] : []), ...hoja.filas])
  return BOM + filas.map((fila) => fila.map(celda).join(SEPARADOR)).join(FIN) + FIN
}
