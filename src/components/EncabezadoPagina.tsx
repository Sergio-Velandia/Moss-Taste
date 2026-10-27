import type { ReactNode } from 'react'
import { useMetadatos } from '@/lib/useMetadatos'
import { rutaFija, type RutaConocida } from '@/rutas'

interface Props {
  ruta: RutaConocida
  /** Texto visible del h1 cuando difiere del título de la pestaña. */
  titulo?: string
  children?: ReactNode
}

// h1 + entrada de una página fija. También fija sus metadatos desde RUTAS_FIJAS.
export function EncabezadoPagina({ ruta, titulo, children }: Props) {
  const datos = rutaFija(ruta)
  useMetadatos(datos)
  return (
    <header className="grid gap-3">
      <h1 tabIndex={-1} className="text-4xl outline-none">
        {titulo ?? datos.titulo}
      </h1>
      <p className="max-w-prose text-lg text-ink-soft">{children ?? datos.descripcion}</p>
    </header>
  )
}
