import { KeyRound, ShieldCheck } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { AvisoEnVivo } from '@/components/ui/AvisoEnVivo'
import { Boton } from '@/components/ui/Boton'
import { Campo } from '@/components/ui/Campo'
import { traducirError } from '@/lib/cuentas/errores'
import { confirmarIdentidad } from '@/lib/cuentas/sesion'
import type { UsuarioSesion } from '@/lib/cuentas/tipos'

interface Props {
  usuario: UsuarioSesion
  /** Para qué se confirma: «Borrar mi cuenta». */
  accion: string
  /** Se llama con la identidad ya confirmada. Puede tardar; si lanza error, se muestra aquí. */
  alConfirmar: () => Promise<void>
  /** Mensaje mientras alConfirmar trabaja. */
  progreso?: string
}

// Firebase pide haber entrado hace poco para borrar una cuenta. La contraseña va directo a Authentication: aquí no se guarda.
export function ConfirmarIdentidad({ usuario, accion, alConfirmar, progreso = '' }: Props) {
  const [contrasena, setContrasena] = useState('')
  const [errorContrasena, setErrorContrasena] = useState('')
  const [aviso, setAviso] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const conContrasena = usuario.proveedores.includes('password')
  const conGoogle = usuario.proveedores.includes('google.com')

  async function confirmar(valor?: string) {
    setOcupado(true)
    setAviso('')
    setErrorContrasena('')
    try {
      await confirmarIdentidad(valor)
      await alConfirmar()
    } catch (error) {
      const { mensaje, campo } = traducirError(error)
      if (campo === 'contrasena') setErrorContrasena(mensaje)
      else setAviso(mensaje)
    } finally {
      setOcupado(false)
    }
  }

  function enviar(evento: FormEvent) {
    evento.preventDefault()
    if (!contrasena) {
      setErrorContrasena('Escribe tu contraseña para confirmar que eres tú.')
      return
    }
    void confirmar(contrasena)
  }

  return (
    <div className="grid gap-4">
      {conContrasena && (
        <form noValidate onSubmit={enviar} className="grid gap-4">
          <Campo etiqueta="Tu contraseña" name="confirmar-contrasena" type="password" autoComplete="current-password" value={contrasena} error={errorContrasena || undefined} onChange={(e) => setContrasena(e.target.value)} />
          <Boton type="submit" variante="secundario" cargando={ocupado} className="justify-self-start" icono={<ShieldCheck aria-hidden="true" className="size-5" />}>
            {accion}
          </Boton>
        </form>
      )}
      {conGoogle && (
        <Boton variante="secundario" cargando={ocupado && !conContrasena} disabled={ocupado} className="justify-self-start" icono={<KeyRound aria-hidden="true" className="size-5" />} onClick={() => void confirmar()}>
          {conContrasena ? 'Confirmar con Google' : `${accion}: confirmar con Google`}
        </Boton>
      )}
      <AvisoEnVivo mensaje={aviso || (ocupado ? progreso : '')} />
    </div>
  )
}
