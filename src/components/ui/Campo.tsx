import { ChevronDown, CircleAlert } from 'lucide-react'
import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { cx } from '@/lib/clases'

interface Comunes {
  etiqueta: string
  ayuda?: ReactNode
  error?: string
  /** Texto corto junto a la etiqueta, por ejemplo «Opcional». */
  nota?: string
}

// 16 px (text-base) para que iOS no haga zoom al enfocar.
const CLASES_CONTROL =
  'w-full rounded-md border border-line-strong bg-surface px-3.5 text-base text-ink placeholder:text-ink-soft aria-invalid:border-2 aria-invalid:border-danger'

function useIds(id: string | undefined, ayuda: ReactNode, error: string | undefined) {
  const generado = useId()
  const base = id ?? generado
  const idAyuda = ayuda ? `${base}-ayuda` : undefined
  const idError = error ? `${base}-error` : undefined
  const describedBy = [idError, idAyuda].filter(Boolean).join(' ') || undefined
  return { id: base, idAyuda, idError, describedBy }
}

interface PropsEnvoltura extends Comunes {
  id: string
  idAyuda?: string
  idError?: string
  children: ReactNode
}

function Envoltura({ id, etiqueta, nota, ayuda, idAyuda, error, idError, children }: PropsEnvoltura) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="flex flex-wrap items-baseline gap-x-2 font-bold">
        {etiqueta}
        {nota && <span className="text-sm font-normal text-ink-soft">{nota}</span>}
      </label>
      {children}
      {error && (
        <p id={idError} className="flex items-start gap-1.5 text-sm text-danger">
          <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}
      {ayuda && (
        <p id={idAyuda} className="text-sm text-ink-soft">
          {ayuda}
        </p>
      )}
    </div>
  )
}

export function Campo({ etiqueta, ayuda, error, nota, id, className, ...input }: Comunes & InputHTMLAttributes<HTMLInputElement>) {
  const ids = useIds(id, ayuda, error)
  return (
    <Envoltura id={ids.id} etiqueta={etiqueta} nota={nota} ayuda={ayuda} idAyuda={ids.idAyuda} error={error} idError={ids.idError}>
      <input
        id={ids.id}
        aria-invalid={error ? true : undefined}
        aria-describedby={ids.describedBy}
        className={cx(CLASES_CONTROL, 'min-h-12', className)}
        {...input}
      />
    </Envoltura>
  )
}

export function CampoArea({
  etiqueta,
  ayuda,
  error,
  nota,
  id,
  className,
  rows = 5,
  ...area
}: Comunes & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const ids = useIds(id, ayuda, error)
  return (
    <Envoltura id={ids.id} etiqueta={etiqueta} nota={nota} ayuda={ayuda} idAyuda={ids.idAyuda} error={error} idError={ids.idError}>
      <textarea
        id={ids.id}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={ids.describedBy}
        className={cx(CLASES_CONTROL, 'py-3 leading-relaxed', className)}
        {...area}
      />
    </Envoltura>
  )
}

export function CampoSelect({ etiqueta, ayuda, error, nota, id, className, children, ...select }: Comunes & SelectHTMLAttributes<HTMLSelectElement>) {
  const ids = useIds(id, ayuda, error)
  return (
    <Envoltura id={ids.id} etiqueta={etiqueta} nota={nota} ayuda={ayuda} idAyuda={ids.idAyuda} error={error} idError={ids.idError}>
      <div className="relative">
        <select
          id={ids.id}
          aria-invalid={error ? true : undefined}
          aria-describedby={ids.describedBy}
          className={cx(CLASES_CONTROL, 'min-h-12 cursor-pointer appearance-none pr-10', className)}
          {...select}
        >
          {children}
        </select>
        <ChevronDown aria-hidden="true" className="pointer-events-none absolute top-1/2 right-3 size-5 -translate-y-1/2 text-ink-soft" />
      </div>
    </Envoltura>
  )
}
