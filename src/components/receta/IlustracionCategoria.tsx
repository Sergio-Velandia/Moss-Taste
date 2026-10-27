import { CakeSlice, ChefHat, EggFried, Soup, type LucideIcon } from 'lucide-react'
import { cx } from '@/lib/clases'

const ICONOS: Record<string, LucideIcon> = {
  sopas: Soup,
  desayunos: EggFried,
  postres: CakeSlice,
}

// Marcador de posición por categoría mientras llegan las imágenes (Fase 3). Es decorativo.
export function IlustracionCategoria({ categoria, className }: { categoria: string; className?: string }) {
  const Icono = ICONOS[categoria] ?? ChefHat
  return (
    <div
      aria-hidden="true"
      className={cx(
        'relative grid place-items-center overflow-hidden bg-accent-soft text-accent',
        // Trama de puntos con el color del acento, sin hex sueltos.
        'bg-[radial-gradient(color-mix(in_srgb,currentColor_18%,transparent)_1.5px,transparent_1.5px)] bg-size-[18px_18px]',
        className,
      )}
    >
      <Icono className="size-1/3 max-h-28 max-w-28" strokeWidth={1.25} />
    </div>
  )
}
