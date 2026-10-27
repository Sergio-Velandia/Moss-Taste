import { Plus, Save, Trash2 } from 'lucide-react'
import { useId, useRef, useState, type FormEvent } from 'react'
import { EncabezadoPagina } from '@/components/EncabezadoPagina'
import { AvisoEnVivo } from '@/components/ui/AvisoEnVivo'
import { Boton } from '@/components/ui/Boton'
import { Campo, CampoArea, CampoSelect } from '@/components/ui/Campo'
import { CATEGORIAS, INGREDIENTES } from '@/lib/recetas/catalogo'
import { UNIDADES } from '@/lib/recetas/tipos'

// Solo la pantalla. Guardar recetas personales (privadas, en Firestore) llega con las cuentas en la Fase 6.

interface FilaIngrediente {
  clave: number
  ingrediente: string
  cantidad: string
  unidad: string
  alGusto: boolean
}
interface FilaPaso {
  clave: number
  texto: string
  minutos: string
}

const OPCIONES_INGREDIENTE = [...INGREDIENTES.values()].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
const NOMBRE_UNIDAD: Record<string, string> = { g: 'g', kg: 'kg', ml: 'ml', l: 'l', taza: 'tazas', cucharada: 'cucharadas', cucharadita: 'cucharaditas', unidad: 'unidades' }

type Errores = Partial<Record<'titulo' | 'categoria' | 'porciones' | 'tiempo' | 'ingredientes' | 'pasos', string>>

export function NuevaReceta() {
  const base = useId()
  const contador = useRef(2)
  const formulario = useRef<HTMLFormElement>(null)
  const [titulo, setTitulo] = useState('')
  const [categoria, setCategoria] = useState('')
  const [porciones, setPorciones] = useState('4')
  const [tiempo, setTiempo] = useState('')
  const [ingredientes, setIngredientes] = useState<FilaIngrediente[]>([{ clave: 1, ingrediente: '', cantidad: '', unidad: 'g', alGusto: false }])
  const [pasos, setPasos] = useState<FilaPaso[]>([{ clave: 1, texto: '', minutos: '' }])
  const [errores, setErrores] = useState<Errores>({})
  const [aviso, setAviso] = useState('')

  const nuevaClave = () => ++contador.current
  const cambiarIngrediente = (clave: number, cambios: Partial<FilaIngrediente>) =>
    setIngredientes((filas) => filas.map((f) => (f.clave === clave ? { ...f, ...cambios } : f)))
  const cambiarPaso = (clave: number, cambios: Partial<FilaPaso>) => setPasos((filas) => filas.map((f) => (f.clave === clave ? { ...f, ...cambios } : f)))

  function enviar(evento: FormEvent) {
    evento.preventDefault()
    const nuevos: Errores = {}
    if (!titulo.trim()) nuevos.titulo = 'Escribe el nombre de la receta.'
    if (!categoria) nuevos.categoria = 'Elige una categoría.'
    const n = Number(porciones)
    if (!Number.isInteger(n) || n < 1 || n > 50) nuevos.porciones = 'Escribe un número entero de 1 a 50.'
    const t = Number(tiempo)
    if (!Number.isInteger(t) || t < 1) nuevos.tiempo = 'Escribe el tiempo total en minutos, por ejemplo 45.'
    if (!ingredientes.some((f) => f.ingrediente && Number(f.cantidad.replace(',', '.')) > 0))
      nuevos.ingredientes = 'Agrega al menos un ingrediente con su cantidad.'
    if (!pasos.some((p) => p.texto.trim())) nuevos.pasos = 'Escribe al menos un paso.'
    setErrores(nuevos)
    const primero = Object.keys(nuevos)[0]
    if (primero) {
      formulario.current?.querySelector<HTMLElement>(`[data-campo="${primero}"]`)?.focus()
      setAviso('Revisa los campos marcados.')
      return
    }
    setAviso('Guardar recetas personales llega con las cuentas, en una próxima versión. Esta receta no se guardó.')
  }

  return (
    <div className="grid gap-10">
      <EncabezadoPagina ruta="/mi-cocina/nueva">
        Tus recetas son privadas: solo las ves tú desde tu cuenta. Usan los mismos ingredientes del catálogo para calcular el costo.
      </EncabezadoPagina>

      <form ref={formulario} noValidate onSubmit={enviar} className="grid max-w-3xl gap-10">
        <section aria-labelledby={`${base}-datos`} className="grid gap-5">
          <h2 id={`${base}-datos`} className="text-2xl">
            Datos básicos
          </h2>
          <Campo etiqueta="Nombre de la receta" data-campo="titulo" value={titulo} error={errores.titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Sancocho de la abuela…" />
          <div className="grid gap-5 sm:grid-cols-3">
            <CampoSelect etiqueta="Categoría" data-campo="categoria" value={categoria} error={errores.categoria} onChange={(e) => setCategoria(e.target.value)}>
              <option value="">Elige una</option>
              {CATEGORIAS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </CampoSelect>
            <Campo etiqueta="Porciones" data-campo="porciones" inputMode="numeric" value={porciones} error={errores.porciones} onChange={(e) => setPorciones(e.target.value)} />
            <Campo etiqueta="Tiempo total" nota="minutos" data-campo="tiempo" inputMode="numeric" value={tiempo} error={errores.tiempo} onChange={(e) => setTiempo(e.target.value)} />
          </div>
          <CampoArea etiqueta="Resumen" nota="Opcional" rows={2} placeholder="Una frase que cuente qué es…" />
        </section>

        <section aria-labelledby={`${base}-ingredientes`} className="grid gap-4">
          <h2 id={`${base}-ingredientes`} className="text-2xl">
            Ingredientes
          </h2>
          {errores.ingredientes && <p className="text-danger">{errores.ingredientes}</p>}
          <ul className="grid gap-4">
            {ingredientes.map((fila, i) => (
              <li key={fila.clave} className="grid gap-3 rounded-lg border border-line bg-surface p-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
                <CampoSelect
                  etiqueta={`Ingrediente ${i + 1}`}
                  data-campo={i === 0 ? 'ingredientes' : undefined}
                  value={fila.ingrediente}
                  onChange={(e) => cambiarIngrediente(fila.clave, { ingrediente: e.target.value })}
                >
                  <option value="">Elige uno</option>
                  {OPCIONES_INGREDIENTE.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.nombre}
                    </option>
                  ))}
                </CampoSelect>
                <Campo etiqueta="Cantidad" inputMode="decimal" value={fila.cantidad} onChange={(e) => cambiarIngrediente(fila.clave, { cantidad: e.target.value })} />
                <CampoSelect etiqueta="Unidad" value={fila.unidad} onChange={(e) => cambiarIngrediente(fila.clave, { unidad: e.target.value })}>
                  {UNIDADES.map((u) => (
                    <option key={u} value={u}>
                      {NOMBRE_UNIDAD[u]}
                    </option>
                  ))}
                </CampoSelect>
                <Boton
                  variante="fantasma"
                  aria-label={`Quitar ingrediente ${i + 1}`}
                  disabled={ingredientes.length === 1}
                  onClick={() => setIngredientes((filas) => filas.filter((f) => f.clave !== fila.clave))}
                  icono={<Trash2 aria-hidden="true" className="size-5" />}
                />
                <label className="flex min-h-11 cursor-pointer items-center gap-2 sm:col-span-4">
                  <input type="checkbox" checked={fila.alGusto} onChange={(e) => cambiarIngrediente(fila.clave, { alGusto: e.target.checked })} className="size-5 accent-accent" />
                  Al gusto (no se ajusta al cambiar porciones)
                </label>
              </li>
            ))}
          </ul>
          <Boton
            variante="secundario"
            className="justify-self-start"
            icono={<Plus aria-hidden="true" className="size-5" />}
            onClick={() => setIngredientes((filas) => [...filas, { clave: nuevaClave(), ingrediente: '', cantidad: '', unidad: 'g', alGusto: false }])}
          >
            Agregar ingrediente
          </Boton>
        </section>

        <section aria-labelledby={`${base}-mise`} className="grid gap-4">
          <h2 id={`${base}-mise`} className="text-2xl">
            Antes de empezar
          </h2>
          <CampoArea etiqueta="Lo que se deja listo" nota="Opcional, una tarea por línea" rows={4} placeholder="Pela y corta las papas…" />
        </section>

        <section aria-labelledby={`${base}-pasos`} className="grid gap-4">
          <h2 id={`${base}-pasos`} className="text-2xl">
            Preparación
          </h2>
          {errores.pasos && <p className="text-danger">{errores.pasos}</p>}
          <ol className="grid gap-4">
            {pasos.map((paso, i) => (
              <li key={paso.clave} className="grid gap-3 rounded-lg border border-line bg-surface p-4 sm:grid-cols-[minmax(0,1fr)_8rem_auto] sm:items-end">
                <CampoArea
                  etiqueta={`Paso ${i + 1}`}
                  rows={3}
                  data-campo={i === 0 ? 'pasos' : undefined}
                  value={paso.texto}
                  onChange={(e) => cambiarPaso(paso.clave, { texto: e.target.value })}
                />
                <Campo etiqueta="Temporizador" nota="min" inputMode="numeric" value={paso.minutos} onChange={(e) => cambiarPaso(paso.clave, { minutos: e.target.value })} />
                <Boton
                  variante="fantasma"
                  aria-label={`Quitar paso ${i + 1}`}
                  disabled={pasos.length === 1}
                  onClick={() => setPasos((filas) => filas.filter((f) => f.clave !== paso.clave))}
                  icono={<Trash2 aria-hidden="true" className="size-5" />}
                />
              </li>
            ))}
          </ol>
          <Boton
            variante="secundario"
            className="justify-self-start"
            icono={<Plus aria-hidden="true" className="size-5" />}
            onClick={() => setPasos((filas) => [...filas, { clave: nuevaClave(), texto: '', minutos: '' }])}
          >
            Agregar paso
          </Boton>
        </section>

        <div className="grid justify-items-start gap-3 border-t border-line pt-6">
          <Boton type="submit" tamano="lg" icono={<Save aria-hidden="true" className="size-5" />}>
            Guardar receta
          </Boton>
          <AvisoEnVivo mensaje={aviso} />
        </div>
      </form>
    </div>
  )
}
