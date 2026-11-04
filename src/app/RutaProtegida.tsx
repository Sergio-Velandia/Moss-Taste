import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Boton } from '@/components/ui/Boton'
import { Cargando, EstadoError } from '@/components/ui/Estados'
import { reintentarSesion, useSesionVerificada } from '@/lib/cuentas/sesion'

// Quien no tenga sesión, o no haya aceptado la autorización, va a /acceso y vuelve adonde iba.
// Decide lo que responde Firebase, nunca la pista guardada en el navegador.
export function RutaProtegida() {
  const sesion = useSesionVerificada()
  const { pathname, search } = useLocation()

  if (sesion.fase === 'activa') return <Outlet />
  if (sesion.fase === 'anonima' || sesion.fase === 'pendiente') return <Navigate to={`/acceso?volver=${encodeURIComponent(pathname + search)}`} replace />
  if (sesion.fase === 'error')
    return (
      <div className="mx-auto grid w-full max-w-md gap-8 px-4 py-12">
        <h1 tabIndex={-1} className="text-4xl outline-none">
          Mi cocina
        </h1>
        <EstadoError titulo="No pudimos revisar tu cuenta" accion={<Boton onClick={() => void reintentarSesion()}>Intentar de nuevo</Boton>}>
          <p>{sesion.mensaje}</p>
        </EstadoError>
      </div>
    )
  return (
    <div className="mx-auto grid w-full max-w-md gap-8 px-4 py-12">
      <h1 tabIndex={-1} className="text-4xl outline-none">
        Mi cocina
      </h1>
      <Cargando />
    </div>
  )
}
