import { CircleCheckBig, Heart, LogIn, Save } from 'lucide-react'
import { useId, useState, type FormEvent } from 'react'
import { useLocation } from 'react-router-dom'
import { AvisoEnVivo } from '@/components/ui/AvisoEnVivo'
import { Boton } from '@/components/ui/Boton'
import { BotonEnlace } from '@/components/ui/BotonEnlace'
import { CampoArea } from '@/components/ui/Campo'
import { cx } from '@/lib/clases'
import { TOPES } from '@/lib/cuentas/config'
import { cambiarInteraccion, INTERACCION_VACIA, useDatosCuenta } from '@/lib/cuentas/datos'
import { useSesionSiHayPista } from '@/lib/cuentas/sesion'
import { hoy } from '@/lib/exportar/descargar'
import { formatoFecha } from '@/lib/formato'

// Favorita, «ya la probé» y nota de una receta pública, para quien tenga sesión.
// Sin sesión solo invita a entrar: aquí no se descarga Firebase.
export function PanelReceta({ slug }: { slug: string }) {
  const sesion = useSesionSiHayPista()
  const { pathname, search } = useLocation()
  if (sesion.fase === 'activa') return <PanelConSesion key={slug} slug={slug} />
  if (sesion.fase === 'cargando') return null
  return (
    <p className="flex flex-wrap items-center gap-x-3 text-ink-soft">
      {sesion.fase === 'pendiente' ? 'Termina de crear tu cuenta para guardar favoritos y notas.' : 'Con una cuenta guardas favoritos y notas de esta receta.'}
      <BotonEnlace to={`/acceso?volver=${encodeURIComponent(pathname + search)}`} variante="fantasma" icono={<LogIn aria-hidden="true" className="size-5" />}>
        Entrar
      </BotonEnlace>
    </p>
  )
}

function PanelConSesion({ slug }: { slug: string }) {
  const id = useId()
  const { interacciones } = useDatosCuenta()
  const actual = interacciones[slug] ?? INTERACCION_VACIA
  const [nota, setNota] = useState(actual.nota)
  const [errorNota, setErrorNota] = useState('')
  const [aviso, setAviso] = useState('')
  const [guardando, setGuardando] = useState(false)

  // La pantalla cambia al instante; si la escritura falla, vuelve sola y aquí se dice por qué.
  async function alternar(cambios: Partial<typeof actual>, listo: string) {
    setAviso('')
    const error = await cambiarInteraccion(slug, cambios)
    setAviso(error ?? listo)
  }

  async function guardarNota(evento: FormEvent) {
    evento.preventDefault()
    const texto = nota.trim()
    if (texto.length > TOPES.nota) {
      setErrorNota(`Acorta la nota a ${TOPES.nota} caracteres o menos.`)
      return
    }
    setErrorNota('')
    setGuardando(true)
    const error = await cambiarInteraccion(slug, { nota: texto })
    setGuardando(false)
    setAviso(error ?? (texto ? 'Guardaste tu nota.' : 'Borraste tu nota.'))
    if (error) setNota(actual.nota)
  }

  const clasesActivo = 'border-accent bg-accent-soft'
  return (
    <section aria-labelledby={`${id}-titulo`} className="grid gap-4 rounded-lg border border-line bg-surface p-5">
      <h2 id={`${id}-titulo`} className="text-2xl">
        En tu cocina
      </h2>
      <div className="flex flex-wrap gap-2">
        <Boton
          variante="secundario"
          aria-pressed={actual.favorita}
          className={cx(actual.favorita && clasesActivo)}
          icono={<Heart aria-hidden="true" className={cx('size-5', actual.favorita && 'fill-accent text-accent')} />}
          onClick={() => void alternar({ favorita: !actual.favorita }, actual.favorita ? 'Quitaste la receta de tus favoritas.' : 'Agregaste la receta a tus favoritas.')}
        >
          Favorita
        </Boton>
        <Boton
          variante="secundario"
          aria-pressed={Boolean(actual.probada)}
          className={cx(actual.probada && clasesActivo)}
          icono={<CircleCheckBig aria-hidden="true" className={cx('size-5', actual.probada && 'text-accent')} />}
          onClick={() => void alternar({ probada: actual.probada ? '' : hoy() }, actual.probada ? 'Quitaste la marca de «ya la probé».' : 'Marcaste que ya la probaste.')}
        >
          Ya la probé
        </Boton>
      </div>
      {actual.probada && <p className="text-sm text-ink-soft">La probaste el {formatoFecha(actual.probada)}.</p>}
      <form noValidate onSubmit={guardarNota} className="grid gap-3">
        <CampoArea etiqueta="Tu nota" nota="Otras cuentas no la ven" rows={3} name="nota" maxLength={TOPES.nota} value={nota} error={errorNota || undefined} onChange={(e) => setNota(e.target.value)} placeholder="Con la mitad de la sal queda mejor…" />
        <Boton type="submit" variante="secundario" cargando={guardando} disabled={nota.trim() === actual.nota} className="justify-self-start" icono={<Save aria-hidden="true" className="size-5" />}>
          Guardar nota
        </Boton>
      </form>
      <AvisoEnVivo mensaje={aviso} />
    </section>
  )
}
