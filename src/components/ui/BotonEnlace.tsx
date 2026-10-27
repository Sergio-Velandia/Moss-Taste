import type { ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { clasesBoton, type TamanoBoton, type VarianteBoton } from './estilosBoton'

interface PropsBotonEnlace extends LinkProps {
  variante?: VarianteBoton
  tamano?: TamanoBoton
  icono?: ReactNode
}

// Navegar es un enlace real (<a>), aunque se vea como botón.
export function BotonEnlace({ variante, tamano, icono, className, children, ...resto }: PropsBotonEnlace) {
  return (
    <Link className={clasesBoton(variante, tamano, className)} {...resto}>
      {icono}
      {children}
    </Link>
  )
}
