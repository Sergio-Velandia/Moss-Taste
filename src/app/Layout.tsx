import { useEffect, useRef } from 'react'
import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom'
import { Cabecera } from './layout/Cabecera'
import { Pie } from './layout/Pie'

// Al cambiar de ruta, el foco va al h1 de la página nueva para que el lector de pantalla la anuncie.
function useFocoAlNavegar() {
  const { pathname } = useLocation()
  const primera = useRef(true)
  useEffect(() => {
    if (primera.current) {
      primera.current = false
      return
    }
    document.querySelector<HTMLElement>('#contenido h1')?.focus({ preventScroll: true })
  }, [pathname])
}

export function Layout() {
  useFocoAlNavegar()
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#contenido"
        className="sr-only z-50 rounded-md bg-accent px-4 py-3 font-bold text-on-accent focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Saltar al contenido
      </a>
      <Cabecera />
      <main id="contenido" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 pt-10 pb-16 outline-none sm:px-6">
        <Outlet />
      </main>
      <Pie />
      <ScrollRestoration />
    </div>
  )
}
