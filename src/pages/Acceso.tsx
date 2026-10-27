import { Eye, EyeOff, KeyRound, LogIn, UserPlus } from 'lucide-react'
import { useRef, useState, type FormEvent } from 'react'
import { EncabezadoPagina } from '@/components/EncabezadoPagina'
import { AvisoEnVivo } from '@/components/ui/AvisoEnVivo'
import { Boton } from '@/components/ui/Boton'
import { Campo } from '@/components/ui/Campo'
import { cx } from '@/lib/clases'
import { validarAcceso, type CampoAcceso, type Errores } from '@/lib/validarFormularios'

// Solo la pantalla. El login real (Firebase Authentication con correo y Google) llega en la Fase 6.
export function Acceso() {
  const [creando, setCreando] = useState(false)
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [visible, setVisible] = useState(false)
  const [errores, setErrores] = useState<Errores<CampoAcceso>>({})
  const [aviso, setAviso] = useState('')
  const formulario = useRef<HTMLFormElement>(null)
  const PENDIENTE = 'Las cuentas llegan en una próxima versión. Por ahora todas las recetas se ven sin cuenta.'

  function enviar(evento: FormEvent) {
    evento.preventDefault()
    const nuevos = validarAcceso(correo, contrasena, creando)
    setErrores(nuevos)
    const primero = (['correo', 'contrasena'] as const).find((c) => nuevos[c])
    if (primero) {
      formulario.current?.querySelector<HTMLElement>(`[name="${primero}"]`)?.focus()
      setAviso('')
      return
    }
    setAviso(PENDIENTE)
  }

  return (
    <div className="mx-auto grid w-full max-w-md gap-8">
      <EncabezadoPagina ruta="/acceso" titulo={creando ? 'Crea tu cuenta' : 'Entra a tu cocina'}>
        Con una cuenta guardas favoritos, notas, las recetas que ya probaste y tus propias recetas.
      </EncabezadoPagina>

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

      <form ref={formulario} noValidate onSubmit={enviar} className="grid gap-5">
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
          <button type="button" onClick={() => setAviso(PENDIENTE)} className="min-h-11 w-fit cursor-pointer font-bold text-accent underline-offset-4 hover:underline">
            Olvidé mi contraseña
          </button>
        )}
        <Boton type="submit" tamano="lg" icono={creando ? <UserPlus aria-hidden="true" className="size-5" /> : <LogIn aria-hidden="true" className="size-5" />}>
          {creando ? 'Crear cuenta' : 'Entrar'}
        </Boton>
      </form>

      <div className="flex items-center gap-3 text-sm text-ink-soft">
        <span className="h-px flex-1 bg-line" />o<span className="h-px flex-1 bg-line" />
      </div>

      {/* Sin logos de marcas de terceros: ícono genérico. */}
      <Boton variante="secundario" tamano="lg" icono={<KeyRound aria-hidden="true" className="size-5" />} onClick={() => setAviso(PENDIENTE)}>
        Continuar con Google
      </Boton>

      <AvisoEnVivo mensaje={aviso} />
    </div>
  )
}
