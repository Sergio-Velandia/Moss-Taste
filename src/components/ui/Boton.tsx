import { LoaderCircle } from 'lucide-react'
import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from 'react'
import { clasesBoton, type TamanoBoton, type VarianteBoton } from './estilosBoton'

interface PropsBoton extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: VarianteBoton
  tamano?: TamanoBoton
  icono?: ReactNode
  /** Muestra un indicador junto a la etiqueta, que se conserva. */
  cargando?: boolean
}

// Inactivo con aria-disabled (no con `disabled`) para que siga siendo enfocable y anunciable.
export function Boton({
  variante,
  tamano,
  icono,
  cargando = false,
  disabled,
  className,
  children,
  type = 'button',
  onClick,
  ...resto
}: PropsBoton) {
  const inactivo = disabled || cargando

  function alPulsar(evento: MouseEvent<HTMLButtonElement>) {
    if (inactivo) {
      evento.preventDefault()
      return
    }
    onClick?.(evento)
  }

  return (
    <button
      type={type}
      aria-disabled={inactivo || undefined}
      aria-busy={cargando || undefined}
      className={clasesBoton(variante, tamano, className)}
      onClick={alPulsar}
      {...resto}
    >
      {cargando ? <LoaderCircle aria-hidden="true" className="size-5 animate-spin" /> : icono}
      {children}
    </button>
  )
}
