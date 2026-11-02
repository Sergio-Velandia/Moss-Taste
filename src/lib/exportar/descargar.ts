// Descarga un archivo generado en el navegador, sin servidor.

export const TIPOS = {
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  csv: 'text/csv;charset=utf-8',
  json: 'application/json;charset=utf-8',
} as const

export function descargar(nombre: string, contenido: Blob | string, tipo: string): void {
  const blob = typeof contenido === 'string' ? new Blob([contenido], { type: tipo }) : contenido
  const url = URL.createObjectURL(blob)
  const enlace = Object.assign(document.createElement('a'), { href: url, download: nombre, rel: 'noopener' })
  document.body.append(enlace)
  enlace.click()
  enlace.remove()
  // Se libera después: algunos navegadores leen el blob de forma asíncrona tras el clic.
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

/** Fecha local AAAA-MM-DD para el nombre del archivo y el pie de la hoja. */
export function hoy(fecha = new Date()): string {
  const dos = (n: number) => String(n).padStart(2, '0')
  return `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())}`
}
