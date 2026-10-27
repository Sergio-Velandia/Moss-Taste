import { RotateCw } from 'lucide-react'
import { useEffect } from 'react'
import { useRouteError } from 'react-router-dom'
import { Boton } from '@/components/ui/Boton'
import { BotonEnlace } from '@/components/ui/BotonEnlace'
import { EstadoError } from '@/components/ui/Estados'

// Error inesperado al abrir una ruta (por ejemplo, un archivo que no cargó tras una actualización).
// La traza va a la consola; la pantalla solo dice qué pasó y qué hacer.
export function ErrorRuta() {
  const error = useRouteError()
  useEffect(() => console.error(error), [error])

  return (
    <main id="contenido" className="mx-auto grid min-h-dvh max-w-2xl content-center px-4 py-12">
      <h1 className="sr-only">Error</h1>
      <EstadoError
        titulo="No se pudo abrir esta página"
        accion={
          <div className="flex flex-wrap justify-center gap-3">
            <Boton icono={<RotateCw aria-hidden="true" className="size-5" />} onClick={() => window.location.reload()}>
              Recargar
            </Boton>
            <BotonEnlace to="/" variante="secundario">
              Ir al inicio
            </BotonEnlace>
          </div>
        }
      >
        <p>Puede ser un problema de conexión o que el sitio se acaba de actualizar. Recarga la página para intentarlo de nuevo.</p>
      </EstadoError>
    </main>
  )
}
