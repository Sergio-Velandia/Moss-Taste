import { MotionConfig } from 'motion/react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { rutasApp } from './rutasApp'
import { ProveedorTema } from './tema/ProveedorTema'

// BASE_URL es '/Moss-Taste/' (base de Vite), así el router funciona dentro de la ruta de GitHub Pages.
const router = createBrowserRouter(rutasApp, { basename: import.meta.env.BASE_URL })

export function App() {
  return (
    <ProveedorTema>
      {/* Motion respeta prefers-reduced-motion en todas las animaciones */}
      <MotionConfig reducedMotion="user">
        <RouterProvider router={router} />
      </MotionConfig>
    </ProveedorTema>
  )
}
