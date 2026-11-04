import { CircleAlert } from 'lucide-react'
import { useId, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface Props {
  marcada: boolean
  onChange: (marcada: boolean) => void
  error?: string
  name?: string
  /** El texto que se autoriza. El enlace a la política va después. */
  children: ReactNode
}

// Autorización del tratamiento de datos (Ley 1581 de 2012): sin marcar por defecto, con la política al alcance
// antes de aceptar. El enlace abre otra pestaña para no perder lo que ya se escribió en el formulario.
export function CasillaAutorizacion({ marcada, onChange, error, name = 'autorizacion', children }: Props) {
  const id = useId()
  const idError = `${id}-error`
  return (
    <div className="grid gap-1.5">
      <div className="flex items-start gap-3">
        <input
          id={id}
          name={name}
          type="checkbox"
          checked={marcada}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? idError : undefined}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 size-6 shrink-0 cursor-pointer accent-accent"
        />
        <p>
          <label htmlFor={id} className="cursor-pointer">
            {children}
          </label>{' '}
          <Link to="/privacidad" target="_blank" rel="noopener" className="font-bold text-accent underline underline-offset-4">
            Política de privacidad (se abre en otra pestaña)
          </Link>
        </p>
      </div>
      {error && (
        <p id={idError} className="flex items-start gap-1.5 text-sm text-danger">
          <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}
