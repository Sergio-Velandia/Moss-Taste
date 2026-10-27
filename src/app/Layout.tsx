import { Outlet } from 'react-router-dom'

// Provisional: la cabecera, el pie y el salto al contenido llegan en el siguiente commit.
export function Layout() {
  return (
    <main id="contenido" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <Outlet />
    </main>
  )
}
