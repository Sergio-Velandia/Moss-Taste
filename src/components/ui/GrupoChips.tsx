import type { ReactNode } from 'react'

// Grupo de chips de filtro con su leyenda: el lector de pantalla anuncia a qué filtro pertenece cada chip.
export function GrupoChips({ titulo, ayuda, children }: { titulo: string; ayuda?: string; children: ReactNode }) {
  return (
    <fieldset className="grid content-start gap-2">
      <legend className="mb-2 font-bold">{titulo}</legend>
      {ayuda && <p className="-mt-1 text-sm text-ink-soft">{ayuda}</p>}
      <div className="flex flex-wrap items-start gap-2">{children}</div>
    </fieldset>
  )
}
