import { Check } from 'lucide-react'
import type { ButtonHTMLAttributes } from 'react'
import { cx } from '@/lib/clases'

interface PropsChip extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  activo: boolean
  onChange: (activo: boolean) => void
}

// Chip de filtro: botón con aria-pressed. El estado activo se marca con color y con un ícono, no solo con color.
export function Chip({ activo, onChange, className, children, ...resto }: PropsChip) {
  return (
    <button
      type="button"
      aria-pressed={activo}
      onClick={() => onChange(!activo)}
      className={cx(
        'inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full border px-4 text-sm font-bold',
        'transition-transform duration-150 ease-out active:scale-[0.97]',
        activo
          ? 'border-accent bg-accent-soft text-ink'
          : 'border-line-strong bg-surface text-ink-soft hover:border-accent hover:text-ink',
        className,
      )}
      {...resto}
    >
      {activo && <Check aria-hidden="true" className="size-4 text-accent" strokeWidth={2.5} />}
      {children}
    </button>
  )
}
