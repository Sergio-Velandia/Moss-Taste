import { Send } from 'lucide-react'
import { useRef, useState, type FormEvent } from 'react'
import { EncabezadoPagina } from '@/components/EncabezadoPagina'
import { AvisoEnVivo } from '@/components/ui/AvisoEnVivo'
import { Boton } from '@/components/ui/Boton'
import { Campo, CampoArea } from '@/components/ui/Campo'
import { cx } from '@/lib/clases'
import { validarContacto, type CampoContacto, type DatosContacto, type Errores } from '@/lib/validarFormularios'

const VACIO: DatosContacto = { motivo: 'receta', nombre: '', correo: '', receta: '', mensaje: '' }
const ORDEN: CampoContacto[] = ['nombre', 'correo', 'receta', 'mensaje']

// Formulario sin backend. El envío por EmailJS llega en la Fase 5; hoy solo valida.
export function Contacto() {
  const [datos, setDatos] = useState(VACIO)
  const [errores, setErrores] = useState<Errores<CampoContacto>>({})
  const [tocados, setTocados] = useState<ReadonlySet<CampoContacto>>(new Set())
  const [estado, setEstado] = useState('')
  const trampa = useRef<HTMLInputElement>(null)
  const formulario = useRef<HTMLFormElement>(null)
  const proponiendo = datos.motivo === 'receta'

  const cambiar = (campo: keyof DatosContacto, valor: string) => {
    const nuevos = { ...datos, [campo]: valor } as DatosContacto
    setDatos(nuevos)
    // Una vez tocado, el campo se revalida al escribir para que el error desaparezca al corregirlo.
    if (tocados.size) setErrores(filtrar(validarContacto(nuevos), tocados))
  }
  const alSalir = (campo: CampoContacto) => {
    const nuevos = new Set(tocados).add(campo)
    setTocados(nuevos)
    setErrores(filtrar(validarContacto(datos), nuevos))
  }

  function enviar(evento: FormEvent) {
    evento.preventDefault()
    // Campo trampa: una persona no lo ve ni lo llena; un robot sí. Se descarta sin decirle nada.
    if (trampa.current?.value) return
    const todos = validarContacto(datos)
    setTocados(new Set(ORDEN))
    setErrores(todos)
    const primero = ORDEN.find((c) => todos[c])
    if (primero) {
      formulario.current?.querySelector<HTMLElement>(`[name="${primero}"]`)?.focus()
      setEstado('Revisa los campos marcados.')
      return
    }
    setEstado('El envío del formulario se activa en una próxima versión. Tu mensaje no se envió todavía.')
  }

  return (
    <div className="grid gap-10">
      <EncabezadoPagina ruta="/contacto">
        Propón una receta para el recetario o escríbeme. Si la propones, cuéntala con todos sus ingredientes y pasos: la reviso y, si
        está completa, la agrego escrita con mis palabras.
      </EncabezadoPagina>

      <form ref={formulario} noValidate onSubmit={enviar} className="grid max-w-2xl gap-6">
        <fieldset className="grid gap-2">
          <legend className="mb-2 font-bold">¿Qué quieres hacer?</legend>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ['receta', 'Proponer una receta'],
                ['mensaje', 'Escribir un mensaje'],
              ] as const
            ).map(([valor, texto]) => (
              <label
                key={valor}
                className={cx(
                  'inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-4 font-bold has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent',
                  datos.motivo === valor ? 'border-accent bg-accent-soft' : 'border-line-strong bg-surface text-ink-soft',
                )}
              >
                <input type="radio" name="motivo" value={valor} checked={datos.motivo === valor} onChange={() => cambiar('motivo', valor)} className="size-4 accent-accent" />
                {texto}
              </label>
            ))}
          </div>
        </fieldset>

        <Campo etiqueta="Nombre" name="nombre" autoComplete="name" value={datos.nombre} error={errores.nombre} onChange={(e) => cambiar('nombre', e.target.value)} onBlur={() => alSalir('nombre')} />
        <Campo
          etiqueta="Correo"
          name="correo"
          type="email"
          inputMode="email"
          autoComplete="email"
          spellCheck={false}
          placeholder="nombre@correo.com"
          ayuda="Solo para responderte."
          value={datos.correo}
          error={errores.correo}
          onChange={(e) => cambiar('correo', e.target.value)}
          onBlur={() => alSalir('correo')}
        />
        {proponiendo && (
          <Campo etiqueta="Nombre de la receta" name="receta" placeholder="Sancocho de gallina…" value={datos.receta} error={errores.receta} onChange={(e) => cambiar('receta', e.target.value)} onBlur={() => alSalir('receta')} />
        )}
        <CampoArea
          etiqueta={proponiendo ? 'Ingredientes y pasos' : 'Mensaje'}
          name="mensaje"
          rows={proponiendo ? 9 : 6}
          placeholder={proponiendo ? 'Para 4 porciones: 1 gallina, 3 papas pastusas… Paso 1: …' : 'Escribe tu mensaje…'}
          value={datos.mensaje}
          error={errores.mensaje}
          onChange={(e) => cambiar('mensaje', e.target.value)}
          onBlur={() => alSalir('mensaje')}
        />

        {/* Campo trampa (honeypot): fuera de la vista y del orden de tabulación. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label htmlFor="sitio-web">Sitio web</label>
          <input ref={trampa} id="sitio-web" name="sitio-web" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <div className="grid justify-items-start gap-3">
          <Boton type="submit" tamano="lg" icono={<Send aria-hidden="true" className="size-5" />}>
            {proponiendo ? 'Enviar receta' : 'Enviar mensaje'}
          </Boton>
          <AvisoEnVivo mensaje={estado} />
        </div>
      </form>
    </div>
  )
}

function filtrar(errores: Errores<CampoContacto>, tocados: ReadonlySet<CampoContacto>): Errores<CampoContacto> {
  return Object.fromEntries(Object.entries(errores).filter(([campo]) => tocados.has(campo as CampoContacto)))
}
