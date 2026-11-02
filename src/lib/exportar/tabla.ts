// Representación propia de una hoja de cálculo, independiente de la librería de Excel.
// Las mismas tablas alimentan el .xlsx (write-excel-file), el CSV y las pruebas.

export type Valor = string | number | null

export interface CeldaRica {
  valor: Valor
  /** cop: pesos sin decimales; cantidad: hasta dos decimales. */
  formato?: 'cop' | 'cantidad'
  negrita?: boolean
}

export type Celda = Valor | CeldaRica

export interface Hoja {
  nombre: string
  /** Ancho de cada columna, en caracteres. */
  anchos: number[]
  filas: Celda[][]
}

export const titulo = (valor: string): CeldaRica => ({ valor, negrita: true })
export const cop = (valor: number | null): CeldaRica => ({ valor, formato: 'cop' })
export const cantidad = (valor: number | null): CeldaRica => ({ valor: valor === null ? null : Math.round(valor * 100) / 100, formato: 'cantidad' })

export function esRica(celda: Celda): celda is CeldaRica {
  return typeof celda === 'object' && celda !== null
}

export const valorDe = (celda: Celda): Valor => (esRica(celda) ? celda.valor : celda)
