import { Monitor, Moon, Sun, type LucideIcon } from 'lucide-react'
import { TEMAS, type Tema } from './tema'
import { useTema } from './useTema'

const OPCIONES: Record<Tema, { etiqueta: string; Icono: LucideIcon }> = {
  light: { etiqueta: 'Claro', Icono: Sun },
  dark: { etiqueta: 'Oscuro', Icono: Moon },
  system: { etiqueta: 'Sistema', Icono: Monitor },
}

// Radios nativos: Tab entra al grupo y las flechas cambian de opción sin código propio.
export function SelectorTema() {
  const { tema, cambiarTema } = useTema()

  return (
    <fieldset className="inline-flex gap-0.5 rounded-full border border-line bg-surface p-0.5">
      <legend className="sr-only">Tema</legend>
      {TEMAS.map((opcion) => {
        const { etiqueta, Icono } = OPCIONES[opcion]
        return (
          <label
            key={opcion}
            title={etiqueta}
            className="grid size-11 cursor-pointer place-items-center rounded-full text-ink-soft hover:bg-accent-soft hover:text-ink has-checked:bg-accent has-checked:text-on-accent has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent"
          >
            <input
              type="radio"
              name="tema"
              value={opcion}
              checked={opcion === tema}
              onChange={() => cambiarTema(opcion)}
              className="sr-only"
            />
            <Icono aria-hidden="true" className="size-5" strokeWidth={1.75} />
            <span className="sr-only">{etiqueta}</span>
          </label>
        )
      })}
    </fieldset>
  )
}
