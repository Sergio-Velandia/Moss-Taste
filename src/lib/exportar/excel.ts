import { esRica, type Celda, type Hoja } from './tabla'

// El .xlsx es lo único que usa una librería (write-excel-file, MIT). Se importa aquí dentro, solo al exportar,
// para que no pese en la carga inicial del sitio.

const FORMATOS = { cop: '"$" #,##0', cantidad: '0.##' } as const

type CeldaExcel = { value?: string | number; type?: StringConstructor | NumberConstructor; format?: string; fontWeight?: 'bold' } | null

function aCeldaExcel(c: Celda): CeldaExcel {
  const valor = esRica(c) ? c.valor : c
  if (valor === null) return null
  const base: NonNullable<CeldaExcel> = typeof valor === 'number' ? { value: valor, type: Number } : { value: valor, type: String }
  if (esRica(c)) {
    if (c.formato && typeof valor === 'number') base.format = FORMATOS[c.formato]
    if (c.negrita) base.fontWeight = 'bold'
  }
  return base
}

export async function generarExcel(hojas: readonly Hoja[]): Promise<Blob> {
  const { default: escribirExcel } = await import('write-excel-file/browser')
  return escribirExcel(
    hojas.map((hoja) => ({
      sheet: hoja.nombre,
      data: hoja.filas.map((fila) => (fila.length ? fila.map(aCeldaExcel) : [null])),
      columns: hoja.anchos.map((width) => ({ width })),
    })),
    { fontFamily: 'Calibri', fontSize: 11 },
  ).toBlob()
}
