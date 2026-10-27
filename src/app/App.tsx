import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { rutasApp } from './rutasApp'
import { ProveedorTema } from './tema/ProveedorTema'

// BASE_URL es '/Moss-Taste/' (base de Vite), así el router funciona dentro de la ruta de GitHub Pages.
const router = createBrowserRouter(rutasApp, { basename: import.meta.env.BASE_URL })

export function App() {
  return (
    <ProveedorTema>
      <RouterProvider router={router} />
    </ProveedorTema>
  )
}
