import { cx } from '@/lib/clases'

export type VarianteBoton = 'primario' | 'secundario' | 'fantasma'
export type TamanoBoton = 'md' | 'lg'

const VARIANTES: Record<VarianteBoton, string> = {
  primario: 'bg-accent text-on-accent shadow-1 hover:shadow-2',
  secundario: 'border border-line-strong bg-surface text-ink hover:border-accent hover:bg-accent-soft',
  fantasma: 'text-accent underline-offset-4 hover:bg-accent-soft hover:underline',
}

const TAMANOS: Record<TamanoBoton, string> = {
  md: 'min-h-11 px-4 text-base gap-2',
  lg: 'min-h-14 px-6 text-lg gap-2.5',
}

// Compartido por <Boton> y <BotonEnlace> para que un enlace con forma de botón se vea igual.
export function clasesBoton(variante: VarianteBoton = 'primario', tamano: TamanoBoton = 'md', extra?: string): string {
  return cx(
    'inline-flex cursor-pointer items-center justify-center rounded-md font-bold leading-tight select-none [&_svg]:shrink-0',
    'transition-transform duration-150 ease-out active:scale-[0.97]',
    'aria-disabled:cursor-not-allowed aria-disabled:opacity-55 aria-disabled:active:scale-100',
    VARIANTES[variante],
    TAMANOS[tamano],
    extra,
  )
}
