import { LogIn, Menu, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { BotonEnlace } from '@/components/ui/BotonEnlace'
import { cx } from '@/lib/clases'
import { SelectorTema } from '../tema/SelectorTema'
import { Marca } from './Marca'
import { NAV_PRINCIPAL } from './navegacion'

// La ubicación actual se marca con subrayado y peso, no solo con color.
function claseEnlace({ isActive }: { isActive: boolean }) {
  return cx(
    'inline-flex min-h-11 items-center rounded-sm px-3 font-bold underline-offset-[0.4em] decoration-2',
    isActive ? 'text-ink underline decoration-accent' : 'text-ink-soft hover:text-ink hover:underline hover:decoration-line-strong',
  )
}

export function Cabecera() {
  const [abierto, setAbierto] = useState(false)
  const botonMenu = useRef<HTMLButtonElement>(null)
  const cerrar = () => setAbierto(false)

  // Escape cierra el menú y devuelve el foco al botón que lo abrió.
  useEffect(() => {
    if (!abierto) return
    function alTeclear(evento: KeyboardEvent) {
      if (evento.key !== 'Escape') return
      setAbierto(false)
      botonMenu.current?.focus()
    }
    document.addEventListener('keydown', alTeclear)
    return () => document.removeEventListener('keydown', alTeclear)
  }, [abierto])

  return (
    <header className="sticky top-0 z-30 border-b print:hidden border-line bg-bg pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2 sm:px-6">
        <Marca />

        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV_PRINCIPAL.map(({ a, texto }) => (
              <li key={a}>
                <NavLink to={a} className={claseEnlace}>
                  {texto}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <SelectorTema />
          <BotonEnlace to="/acceso" variante="secundario" icono={<LogIn aria-hidden="true" className="size-5" />}>
            Entrar
          </BotonEnlace>
        </div>

        <button
          ref={botonMenu}
          type="button"
          aria-expanded={abierto}
          aria-controls="menu-movil"
          onClick={() => setAbierto((valor) => !valor)}
          className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-line-strong px-3 font-bold lg:hidden"
        >
          {abierto ? <X aria-hidden="true" className="size-5" /> : <Menu aria-hidden="true" className="size-5" />}
          Menú
        </button>
      </div>

      {/* Siempre montado: al cerrarse queda invisible (fuera del orden de tabulación y del lector de pantalla).
          Entra con opacidad y desplazamiento; sale más rápido de lo que entra. */}
      <div
        id="menu-movil"
        className={cx(
          'absolute inset-x-0 top-full border-b border-line bg-bg shadow-2 transition-[opacity,translate,visibility] ease-out lg:hidden',
          abierto ? 'visible translate-y-0 opacity-100 duration-200' : 'pointer-events-none invisible -translate-y-2 opacity-0 duration-150',
        )}
      >
        <nav aria-label="Principal" className="mx-auto grid max-w-6xl gap-4 px-4 pt-2 pb-6">
          <ul className="grid">
            {NAV_PRINCIPAL.map(({ a, texto }) => (
              <li key={a} className="border-b border-line">
                <NavLink to={a} onClick={cerrar} className={({ isActive }) => cx(claseEnlace({ isActive }), 'min-h-12 w-full px-1 text-lg')}>
                  {texto}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SelectorTema />
            <BotonEnlace to="/acceso" onClick={cerrar} variante="secundario" icono={<LogIn aria-hidden="true" className="size-5" />}>
              Entrar
            </BotonEnlace>
          </div>
        </nav>
      </div>
    </header>
  )
}
