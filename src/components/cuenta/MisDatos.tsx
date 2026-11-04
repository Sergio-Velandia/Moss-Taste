import { Download, LogOut, UserX } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AvisoEnVivo } from '@/components/ui/AvisoEnVivo'
import { Boton } from '@/components/ui/Boton'
import { borrarCuentaYDatos, exportarMisDatos } from '@/lib/cuentas/datos'
import { codigoDe, mensajeDeError } from '@/lib/cuentas/errores'
import { cerrarSesion, reintentarSesion } from '@/lib/cuentas/sesion'
import type { UsuarioSesion } from '@/lib/cuentas/tipos'
import { descargar, hoy, TIPOS } from '@/lib/exportar/descargar'
import { ConfirmarIdentidad } from './ConfirmarIdentidad'

// Exportar y borrar: los datos son de cada persona. El borrado es completo y desde la app.
export function MisDatos({ usuario }: { usuario: UsuarioSesion }) {
  const [aviso, setAviso] = useState('')
  const [borrando, setBorrando] = useState(false)
  const [progreso, setProgreso] = useState('')

  function exportar() {
    const fecha = hoy()
    const nombre = `mis-datos-moss-taste-${fecha}.json`
    descargar(nombre, exportarMisDatos(fecha), TIPOS.json)
    setAviso(`Descargaste ${nombre}.`)
  }

  async function salir() {
    setAviso('')
    try {
      await cerrarSesion()
    } catch (error) {
      setAviso(mensajeDeError(error))
    }
  }

  async function borrar() {
    try {
      await borrarCuentaYDatos((hechos, total) => setProgreso(total ? `Borrando tus datos: ${hechos} de ${total}…` : 'Borrando tu cuenta…'))
    } catch (error) {
      // Lo ya borrado no vuelve. Se recargan los datos de la cuenta para poder repetir con lo que quede.
      if (codigoDe(error) !== 'auth/requires-recent-login') void reintentarSesion()
      throw error
    }
  }

  return (
    <div className="grid gap-5">
      <p>
        Entraste como <strong className="font-bold">{usuario.correo ?? usuario.nombre ?? 'tu cuenta'}</strong>
        {usuario.proveedores.includes('google.com') ? ', con Google.' : '.'}
      </p>
      <div className="flex flex-wrap gap-2">
        <Boton variante="secundario" icono={<Download aria-hidden="true" className="size-5" />} onClick={exportar}>
          Exportar mis datos
        </Boton>
        <Boton variante="secundario" icono={<LogOut aria-hidden="true" className="size-5" />} onClick={() => void salir()}>
          Cerrar sesión
        </Boton>
      </div>
      <p className="max-w-prose text-sm text-ink-soft">
        El archivo JSON trae tus favoritos, notas, recetas personales y tu lista de compras. El recetario no tiene copias automáticas: guardar el tuyo es la forma de tener respaldo.
      </p>
      <AvisoEnVivo mensaje={aviso} />

      <div className="grid gap-3 border-t border-line pt-5">
        <h3 className="text-xl">Borrar mi cuenta</h3>
        <p className="max-w-prose">
          Se borran tu cuenta, favoritos, notas, recetas personales y lista de compras. No se puede deshacer. Si escribiste por el formulario de contacto, esos mensajes están aparte, en el correo del recetario: para borrarlos, escribe a{' '}
          <a href="mailto:contacto@sergio-velandia.dev" className="font-bold text-accent underline underline-offset-4">
            contacto@sergio-velandia.dev
          </a>
          . Más detalle en la{' '}
          <Link to="/privacidad" className="font-bold text-accent underline underline-offset-4">
            política de privacidad
          </Link>
          .
        </p>
        {borrando ? (
          <div className="grid gap-3 rounded-lg border border-line p-4">
            <p className="font-bold">Por seguridad, confirma que eres tú.</p>
            <ConfirmarIdentidad usuario={usuario} accion="Borrar mi cuenta y mis datos" alConfirmar={borrar} progreso={progreso} />
            <Boton variante="fantasma" className="justify-self-start" onClick={() => setBorrando(false)}>
              Conservar mi cuenta
            </Boton>
          </div>
        ) : (
          <Boton variante="secundario" className="justify-self-start" icono={<UserX aria-hidden="true" className="size-5" />} onClick={() => setBorrando(true)}>
            Borrar mi cuenta y mis datos
          </Boton>
        )}
      </div>
    </div>
  )
}
