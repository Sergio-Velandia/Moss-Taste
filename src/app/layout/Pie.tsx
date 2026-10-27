import { Link } from 'react-router-dom'
import { NAV_PIE } from './navegacion'

export function Pie() {
  return (
    <footer className="mt-auto border-t print:hidden border-line bg-surface pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:grid-cols-[1fr_auto] sm:items-center sm:px-6">
        <p className="max-w-prose text-ink-soft">
          El recetario de la familia, con cantidades y costo en pesos colombianos para cualquier número de porciones.
        </p>
        <nav aria-label="Pie de página">
          <ul className="flex flex-wrap gap-x-2">
            {NAV_PIE.map(({ a, texto }) => (
              <li key={a}>
                <Link to={a} className="inline-flex min-h-11 items-center px-2 font-bold text-ink-soft underline-offset-4 hover:text-ink hover:underline">
                  {texto}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  )
}
