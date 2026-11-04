import { Check, Eye, EyeOff, KeyRound, LogIn, LogOut, UserPlus, UserX } from 'lucide-react'
import { useRef, useState, type FormEvent } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { CasillaAutorizacion } from '@/components/cuenta/CasillaAutorizacion'
import { ConfirmarIdentidad } from '@/components/cuenta/ConfirmarIdentidad'
import { EncabezadoPagina } from '@/components/EncabezadoPagina'
import { AvisoEnVivo } from '@/components/ui/AvisoEnVivo'
import { Boton } from '@/components/ui/Boton'
import { Campo } from '@/components/ui/Campo'
import { Cargando, EstadoError } from '@/components/ui/Estados'
import { cx } from '@/lib/clases'
import { cuentasDisponibles } from '@/lib/cuentas/config'
import { codigoDe, mensajeDeError, traducirError } from '@/lib/cuentas/errores'
import { hayPista } from '@/lib/cuentas/pista'
import {
  aceptarAutorizacion,
  cerrarSesion,
  crearCuentaConCorreo,
  entrarConCorreo,
  entrarConGoogle,
  rechazarAutorizacion,
  recuperarContrasena,
  reintentarSesion,
  useSesionVerificada,
} from '@/lib/cuentas/sesion'
import type { UsuarioSesion } from '@/lib/cuentas/tipos'
import { validarAcceso, validarCorreo, type CampoAcceso, type Errores } from '@/lib/validarFormularios'

const TEXTO_AUTORIZACION = 'Soy mayor de edad o tengo autorización de quien me representa, y autorizo el tratamiento de mis datos para usar mi cuenta en Moss Taste.'

/** Solo rutas internas: un enlace ajeno no puede usar /acceso para sacar a alguien del sitio. */
function rutaDeVuelta(valor: string | null): string {
  return valor && valor.startsWith('/') && !valor.startsWith('//') && !valor.startsWith('/\\') ? valor : '/mi-cocina'
}

export function Acceso() {
  const sesion = useSesionVerificada()
  const [params] = useSearchParams()

  if (sesion.fase === 'activa') return <Navigate to={rutaDeVuelta(params.get('volver'))} replace />
  if (sesion.fase === 'pendiente') return <Autorizacion usuario={sesion.usuario} />
  if (sesion.fase === 'error')
    return (
      <div className="mx-auto grid w-full max-w-md gap-8">
        <EncabezadoPagina ruta="/acceso" titulo="Entra a tu cocina" />
        <EstadoError titulo="No pudimos revisar tu cuenta" accion={<Boton onClick={() => void reintentarSesion()}>Intentar de nuevo</Boton>}>
          <p>{sesion.mensaje}</p>
        </EstadoError>
      </div>
    )
  // Con pista de sesión se espera la respuesta de Firebase: es probable que ya tenga la sesión abierta.
  if (sesion.fase === 'cargando' && hayPista())
    return (
      <div className="mx-auto grid w-full max-w-md gap-8">
        <EncabezadoPagina ruta="/acceso" titulo="Entra a tu cocina" />
        <Cargando />
      </div>
    )
  return <Formulario />
}

function Formulario() {
  const [creando, setCreando] = useState(false)
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [autorizo, setAutorizo] = useState(false)
  const [visible, setVisible] = useState(false)
  const [errores, setErrores] = useState<Errores<CampoAcceso>>({})
  const [aviso, setAviso] = useState('')
  const [ocupado, setOcupado] = useState<'correo' | 'google' | 'recuperar' | null>(null)
  const raiz = useRef<HTMLDivElement>(null)

  const enfocar = (campo: CampoAcceso) => raiz.current?.querySelector<HTMLElement>(`[name="${campo}"]`)?.focus()

  function mostrarErrores(nuevos: Errores<CampoAcceso>) {
    setErrores(nuevos)
    const primero = (['correo', 'contrasena', 'autorizacion'] as const).find((c) => nuevos[c])
    if (primero) enfocar(primero)
    setAviso('')
    return Boolean(primero)
  }

  function mostrarFallo(error: unknown) {
    const { mensaje, campo } = traducirError(error)
    if (campo) mostrarErrores({ [campo]: mensaje })
    else setAviso(mensaje)
  }

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    if (ocupado || mostrarErrores(validarAcceso(correo, contrasena, creando, autorizo))) return
    setOcupado('correo')
    try {
      if (creando) await crearCuentaConCorreo(correo.trim(), contrasena)
      else await entrarConCorreo(correo.trim(), contrasena)
    } catch (error) {
      mostrarFallo(error)
    } finally {
      setOcupado(null)
    }
  }

  async function conGoogle() {
    if (ocupado) return
    if (creando && !autorizo) {
      mostrarErrores({ autorizacion: 'Marca la casilla para crear tu cuenta.' })
      return
    }
    setErrores({})
    setAviso('')
    setOcupado('google')
    try {
      await entrarConGoogle(creando)
    } catch (error) {
      mostrarFallo(error)
    } finally {
      setOcupado(null)
    }
  }

  async function recuperar() {
    if (ocupado) return
    const errorCorreo = validarCorreo(correo)
    if (errorCorreo) {
      mostrarErrores({ correo: 'Escribe tu correo arriba para enviarte el enlace.' })
      return
    }
    setErrores({})
    setOcupado('recuperar')
    try {
      await recuperarContrasena(correo.trim())
      // El mismo mensaje exista o no la cuenta: así nadie puede averiguar quién está registrado.
      setAviso(`Si hay una cuenta con ${correo.trim()}, te llega un correo con un enlace para crear una contraseña nueva. Revisa también el correo no deseado.`)
    } catch (error) {
      if (codigoDe(error) === 'auth/user-not-found') setAviso(`Si hay una cuenta con ${correo.trim()}, te llega un correo con un enlace para crear una contraseña nueva. Revisa también el correo no deseado.`)
      else mostrarFallo(error)
    } finally {
      setOcupado(null)
    }
  }

  return (
    <div ref={raiz} className="mx-auto grid w-full max-w-md gap-8">
      <EncabezadoPagina ruta="/acceso" titulo={creando ? 'Crea tu cuenta' : 'Entra a tu cocina'}>
        Con una cuenta guardas favoritos, notas, las recetas que ya probaste y tus propias recetas. Para ver las recetas no necesitas cuenta.
      </EncabezadoPagina>

      {!cuentasDisponibles() && (
        <p className="rounded-md bg-accent-soft px-4 py-3">Las cuentas no están disponibles en este momento. Todas las recetas se pueden ver sin cuenta.</p>
      )}

      <fieldset className="grid grid-cols-2 gap-1 rounded-full border border-line bg-surface p-1">
        <legend className="sr-only">¿Tienes cuenta?</legend>
        {(
          [
            [false, 'Entrar'],
            [true, 'Crear cuenta'],
          ] as const
        ).map(([valor, texto]) => (
          <label
            key={texto}
            className={cx(
              'grid min-h-11 cursor-pointer place-items-center rounded-full font-bold has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent',
              creando === valor ? 'bg-accent text-on-accent' : 'text-ink-soft hover:text-ink',
            )}
          >
            <input
              type="radio"
              name="modo"
              checked={creando === valor}
              onChange={() => {
                setCreando(valor)
                setErrores({})
                setAviso('')
              }}
              className="sr-only"
            />
            {texto}
          </label>
        ))}
      </fieldset>

      <form noValidate onSubmit={enviar} className="grid gap-5">
        <Campo etiqueta="Correo" name="correo" type="email" inputMode="email" autoComplete="email" spellCheck={false} value={correo} error={errores.correo} onChange={(e) => setCorreo(e.target.value)} />
        <div className="relative">
          <Campo
            etiqueta="Contraseña"
            name="contrasena"
            type={visible ? 'text' : 'password'}
            autoComplete={creando ? 'new-password' : 'current-password'}
            ayuda={creando ? 'Al menos 8 caracteres.' : undefined}
            value={contrasena}
            error={errores.contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            className="pr-14"
          />
          <button
            type="button"
            aria-pressed={visible}
            aria-label="Mostrar contraseña"
            onClick={() => setVisible((v) => !v)}
            className="absolute top-[2.1rem] right-1 grid size-11 cursor-pointer place-items-center rounded-md text-ink-soft hover:text-ink"
          >
            {visible ? <EyeOff aria-hidden="true" className="size-5" /> : <Eye aria-hidden="true" className="size-5" />}
          </button>
        </div>
        {!creando && (
          <button type="button" onClick={() => void recuperar()} className="min-h-11 w-fit cursor-pointer font-bold text-accent underline-offset-4 hover:underline">
            Olvidé mi contraseña
          </button>
        )}
        {creando && (
          <CasillaAutorizacion marcada={autorizo} error={errores.autorizacion} onChange={setAutorizo}>
            {TEXTO_AUTORIZACION}
          </CasillaAutorizacion>
        )}
        <Boton type="submit" tamano="lg" cargando={ocupado === 'correo'} icono={creando ? <UserPlus aria-hidden="true" className="size-5" /> : <LogIn aria-hidden="true" className="size-5" />}>
          {creando ? 'Crear cuenta' : 'Entrar'}
        </Boton>
      </form>

      <div className="flex items-center gap-3 text-sm text-ink-soft">
        <span className="h-px flex-1 bg-line" />o<span className="h-px flex-1 bg-line" />
      </div>

      {/* Sin logos de marcas de terceros: ícono genérico. */}
      <Boton variante="secundario" tamano="lg" cargando={ocupado === 'google'} icono={<KeyRound aria-hidden="true" className="size-5" />} onClick={() => void conGoogle()}>
        Continuar con Google
      </Boton>

      <AvisoEnVivo mensaje={aviso} />

      <p className="text-sm text-ink-soft">
        Al entrar con Google recibimos tu correo y el nombre de tu perfil. Qué guardamos y para qué, en la{' '}
        <Link to="/privacidad" className="font-bold text-accent underline underline-offset-4">
          política de privacidad
        </Link>
        .
      </p>
    </div>
  )
}

// Cuenta de Authentication sin autorización: acaba de entrar con Google o cerró la pestaña a mitad.
// No puede usar nada hasta aceptar; si no acepta, la cuenta se borra.
function Autorizacion({ usuario }: { usuario: UsuarioSesion }) {
  const [autorizo, setAutorizo] = useState(false)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [rechazando, setRechazando] = useState(false)
  const [pedirIdentidad, setPedirIdentidad] = useState(false)

  async function aceptar(evento: FormEvent) {
    evento.preventDefault()
    if (!autorizo) {
      setError('Marca la casilla para terminar de crear tu cuenta.')
      document.querySelector<HTMLElement>('[name="autorizacion"]')?.focus()
      return
    }
    setOcupado(true)
    setAviso('')
    try {
      await aceptarAutorizacion()
    } catch (e) {
      setAviso(mensajeDeError(e))
    } finally {
      setOcupado(false)
    }
  }

  async function rechazar() {
    setOcupado(true)
    setAviso('')
    try {
      await rechazarAutorizacion()
    } catch (e) {
      if (codigoDe(e) === 'auth/requires-recent-login') setPedirIdentidad(true)
      else setAviso(mensajeDeError(e))
    } finally {
      setOcupado(false)
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-md gap-8">
      <EncabezadoPagina ruta="/acceso" titulo="Un último paso">
        Para usar tu cuenta{usuario.correo ? ` (${usuario.correo})` : ''} necesitamos tu autorización. Hasta que aceptes no guardamos favoritos, notas ni recetas.
      </EncabezadoPagina>

      <form noValidate onSubmit={aceptar} className="grid gap-5">
        <CasillaAutorizacion
          marcada={autorizo}
          error={error || undefined}
          onChange={(v) => {
            setAutorizo(v)
            setError('')
          }}
        >
          {TEXTO_AUTORIZACION}
        </CasillaAutorizacion>
        <Boton type="submit" tamano="lg" cargando={ocupado && !rechazando} icono={<Check aria-hidden="true" className="size-5" />}>
          Aceptar y continuar
        </Boton>
      </form>

      <AvisoEnVivo mensaje={aviso} />

      <section aria-labelledby="titulo-no-acepto" className="grid gap-3 border-t border-line pt-6">
        <h2 id="titulo-no-acepto" className="text-2xl">
          Si no quieres aceptar
        </h2>
        {pedirIdentidad ? (
          <>
            <p>Por seguridad, confirma que eres tú para borrar la cuenta.</p>
            <ConfirmarIdentidad usuario={usuario} accion="Borrar la cuenta" alConfirmar={rechazarAutorizacion} />
          </>
        ) : rechazando ? (
          <>
            <p>Se borra la cuenta y no queda nada guardado. Las recetas se siguen viendo sin cuenta.</p>
            <div className="flex flex-wrap gap-2">
              <Boton variante="secundario" cargando={ocupado} icono={<UserX aria-hidden="true" className="size-5" />} onClick={() => void rechazar()}>
                Borrar la cuenta
              </Boton>
              <Boton variante="fantasma" onClick={() => setRechazando(false)}>
                Conservar
              </Boton>
            </div>
          </>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Boton variante="secundario" icono={<UserX aria-hidden="true" className="size-5" />} onClick={() => setRechazando(true)}>
              No acepto
            </Boton>
            <Boton variante="fantasma" icono={<LogOut aria-hidden="true" className="size-5" />} onClick={() => void cerrarSesion()}>
              Decidir después
            </Boton>
          </div>
        )}
      </section>
    </div>
  )
}
