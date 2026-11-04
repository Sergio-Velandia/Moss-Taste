import { Plus, Save, Trash2 } from 'lucide-react'
import { useId, useRef, useState, type FormEvent } from 'react'
import { flushSync } from 'react-dom'
import { useNavigate, useParams } from 'react-router-dom'
import { EncabezadoPagina } from '@/components/EncabezadoPagina'
import { AvisoEnVivo } from '@/components/ui/AvisoEnVivo'
import { Boton } from '@/components/ui/Boton'
import { BotonEnlace } from '@/components/ui/BotonEnlace'
import { Campo, CampoArea, CampoSelect } from '@/components/ui/Campo'
import { TOPES } from '@/lib/cuentas/config'
import { guardarRecetaPersonal, quedanRecetas, useDatosCuenta } from '@/lib/cuentas/datos'
import { mensajeDeError } from '@/lib/cuentas/errores'
import { filaIngredienteVacia, filaPasoVacia, FORM_VACIO, hayErrores, LIMITES, nuevoIdReceta, recetaAForm, resolverIngrediente, validarFormReceta, type ErroresReceta, type FilaIngrediente, type FilaPaso, type FormReceta } from '@/lib/cuentas/recetaPersonal'
import { formatoFecha } from '@/lib/formato'
import { CATEGORIAS, INGREDIENTES } from '@/lib/recetas/catalogo'
import { rutaDeReceta } from '@/lib/recetas/rutaReceta'
import { UNIDADES, type Unidad } from '@/lib/recetas/tipos'
import { NoEncontrada } from './NoEncontrada'

const OPCIONES_INGREDIENTE = [...INGREDIENTES.values()].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
const NOMBRE_UNIDAD: Record<string, string> = { g: 'g', kg: 'kg', ml: 'ml', l: 'l', taza: 'tazas', cucharada: 'cucharadas', cucharadita: 'cucharaditas', unidad: 'unidades', libra: 'libras (500 g)', pizca: 'pizcas' }
const SIN_ERRORES: ErroresReceta = { ingredientes: {}, pasos: {} }

/** Crea (/mi-cocina/nueva) o edita (/mi-cocina/editar/:id) una receta personal. */
export function NuevaReceta() {
  const { id } = useParams()
  const { recetas } = useDatosCuenta()
  if (!id) return <Formulario key="nueva" />
  const receta = recetas.find((r) => r.id === id)
  return receta ? <Formulario key={id} id={id} inicial={recetaAForm(receta, INGREDIENTES)} /> : <NoEncontrada />
}

// Las filas llevan una clave estable para React; se quita al validar.
type ConClave<T> = T & { clave: number }

function Formulario({ id, inicial = FORM_VACIO }: { id?: string; inicial?: FormReceta }) {
  const base = useId()
  const navigate = useNavigate()
  const contador = useRef(1000)
  const formulario = useRef<HTMLFormElement>(null)
  const nuevaClave = () => ++contador.current
  const [campos, setCampos] = useState({ titulo: inicial.titulo, categoria: inicial.categoria, porciones: inicial.porciones, tiempo: inicial.tiempo, resumen: inicial.resumen, tareas: inicial.tareas })
  const [ingredientes, setIngredientes] = useState<ConClave<FilaIngrediente>[]>(() => inicial.ingredientes.map((f, i) => ({ ...f, clave: i })))
  const [pasos, setPasos] = useState<ConClave<FilaPaso>[]>(() => inicial.pasos.map((f, i) => ({ ...f, clave: i })))
  const [errores, setErrores] = useState<ErroresReceta>(SIN_ERRORES)
  const [aviso, setAviso] = useState('')
  const [guardando, setGuardando] = useState(false)

  const cambiar = (campo: keyof typeof campos, valor: string) => setCampos((c) => ({ ...c, [campo]: valor }))
  const cambiarIngrediente = (clave: number, cambios: Partial<FilaIngrediente>) => setIngredientes((filas) => filas.map((f) => (f.clave === clave ? { ...f, ...cambios } : f)))
  const cambiarPaso = (clave: number, cambios: Partial<FilaPaso>) => setPasos((filas) => filas.map((f) => (f.clave === clave ? { ...f, ...cambios } : f)))

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    if (guardando) return
    const idReceta = id ?? nuevoIdReceta()
    const { errores: nuevos, receta } = validarFormReceta({ ...campos, ingredientes, pasos }, OPCIONES_INGREDIENTE, idReceta)
    // Con flushSync los errores ya están en la página para poder enfocar el primero, en el orden del formulario.
    flushSync(() => setErrores(nuevos))
    if (hayErrores(nuevos) || !receta) {
      formulario.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
      setAviso('Revisa los campos marcados.')
      return
    }
    if (!id && !quedanRecetas()) {
      setAviso(`Llegaste al tope de ${TOPES.recetas} recetas personales. Borra alguna para guardar esta.`)
      return
    }
    setGuardando(true)
    setAviso('Guardando…')
    try {
      await guardarRecetaPersonal(receta, !id)
      navigate(rutaDeReceta(idReceta), { replace: true })
    } catch (error) {
      setAviso(`${mensajeDeError(error)} Lo que escribiste sigue aquí.`)
      setGuardando(false)
    }
  }

  return (
    <div className="grid gap-10">
      <EncabezadoPagina ruta="/mi-cocina/nueva" titulo={id ? 'Editar receta' : undefined}>
        Tus recetas son privadas: otras cuentas no las ven. Escribe el ingrediente: si está en el catálogo se calcula su costo; si no, queda «Sin precio» y el costo se avisa como parcial.
      </EncabezadoPagina>

      <form ref={formulario} noValidate onSubmit={enviar} className="grid max-w-3xl gap-10">
        <section aria-labelledby={`${base}-datos`} className="grid gap-5">
          <h2 id={`${base}-datos`} className="text-2xl">
            Datos básicos
          </h2>
          <Campo etiqueta="Nombre de la receta" maxLength={LIMITES.titulo} value={campos.titulo} error={errores.titulo} onChange={(e) => cambiar('titulo', e.target.value)} placeholder="Sancocho de la abuela…" />
          <div className="grid gap-5 sm:grid-cols-3">
            <CampoSelect etiqueta="Categoría" value={campos.categoria} error={errores.categoria} onChange={(e) => cambiar('categoria', e.target.value)}>
              <option value="">Elige una</option>
              {CATEGORIAS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </CampoSelect>
            <Campo etiqueta="Porciones" inputMode="numeric" value={campos.porciones} error={errores.porciones} onChange={(e) => cambiar('porciones', e.target.value)} />
            <Campo etiqueta="Tiempo total" nota="minutos" inputMode="numeric" value={campos.tiempo} error={errores.tiempo} onChange={(e) => cambiar('tiempo', e.target.value)} />
          </div>
          <CampoArea etiqueta="Resumen" nota="Opcional" rows={2} maxLength={LIMITES.resumen} value={campos.resumen} error={errores.resumen} onChange={(e) => cambiar('resumen', e.target.value)} placeholder="Una frase que cuente qué es…" />
        </section>

        <section aria-labelledby={`${base}-ingredientes`} className="grid gap-4">
          <h2 id={`${base}-ingredientes`} className="text-2xl">
            Ingredientes
          </h2>
          <datalist id={`${base}-catalogo`}>
            {OPCIONES_INGREDIENTE.map((o) => (
              <option key={o.id} value={o.nombre}>
                {o.nombre}
              </option>
            ))}
          </datalist>
          <ul className="grid gap-4">
            {ingredientes.map((fila, i) => {
              const error = errores.ingredientes[i]
              const nombre = fila.nombre.trim()
              const delCatalogo = nombre ? INGREDIENTES.get(resolverIngrediente(nombre, OPCIONES_INGREDIENTE)) : undefined
              return (
                <li key={fila.clave} className="grid gap-3 rounded-lg border border-line bg-surface p-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-start">
                  <Campo
                    etiqueta={`Ingrediente ${i + 1}`}
                    list={`${base}-catalogo`}
                    autoComplete="off"
                    maxLength={LIMITES.ingrediente}
                    value={fila.nombre}
                    error={error?.nombre}
                    ayuda={!nombre ? undefined : !delCatalogo ? 'No está en el catálogo: quedará «Sin precio».' : delCatalogo.fechaPrecio ? `Está en el catálogo: usa su precio, al ${formatoFecha(delCatalogo.fechaPrecio)}.` : 'Está en el catálogo, pero todavía sin precio.'}
                    onChange={(e) => cambiarIngrediente(fila.clave, { nombre: e.target.value })}
                  />
                  <Campo etiqueta="Cantidad" inputMode="decimal" value={fila.cantidad} error={error?.cantidad} onChange={(e) => cambiarIngrediente(fila.clave, { cantidad: e.target.value })} />
                  <CampoSelect etiqueta="Unidad" value={fila.unidad} onChange={(e) => cambiarIngrediente(fila.clave, { unidad: e.target.value as Unidad })}>
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
                    className="justify-self-start sm:mt-7 sm:justify-self-auto"
                    icono={<Trash2 aria-hidden="true" className="size-5" />}
                  />
                  <label className="flex min-h-11 cursor-pointer items-center gap-2 sm:col-span-4">
                    <input type="checkbox" checked={fila.alGusto} onChange={(e) => cambiarIngrediente(fila.clave, { alGusto: e.target.checked })} className="size-5 accent-accent" />
                    Al gusto (la cantidad es solo una referencia)
                  </label>
                </li>
              )
            })}
          </ul>
          {errores.ingredientes[TOPES.ingredientes] && <p className="text-danger">{errores.ingredientes[TOPES.ingredientes]?.nombre}</p>}
          <Boton
            variante="secundario"
            className="justify-self-start"
            disabled={ingredientes.length >= TOPES.ingredientes}
            icono={<Plus aria-hidden="true" className="size-5" />}
            onClick={() => setIngredientes((filas) => [...filas, { ...filaIngredienteVacia(), clave: nuevaClave() }])}
          >
            Agregar ingrediente
          </Boton>
        </section>

        <section aria-labelledby={`${base}-mise`} className="grid gap-4">
          <h2 id={`${base}-mise`} className="text-2xl">
            Antes de empezar
          </h2>
          <CampoArea etiqueta="Lo que se deja listo" nota="Opcional, una tarea por línea" rows={4} value={campos.tareas} error={errores.tareas} onChange={(e) => cambiar('tareas', e.target.value)} placeholder="Pela y corta las papas…" />
        </section>

        <section aria-labelledby={`${base}-pasos`} className="grid gap-4">
          <h2 id={`${base}-pasos`} className="text-2xl">
            Preparación
          </h2>
          <ol className="grid gap-4">
            {pasos.map((paso, i) => (
              <li key={paso.clave} className="grid gap-3 rounded-lg border border-line bg-surface p-4 sm:grid-cols-[minmax(0,1fr)_8rem_auto] sm:items-start">
                <CampoArea etiqueta={`Paso ${i + 1}`} rows={3} maxLength={LIMITES.paso} value={paso.texto} error={errores.pasos[i]?.texto} onChange={(e) => cambiarPaso(paso.clave, { texto: e.target.value })} />
                <Campo etiqueta="Temporizador" nota="min" inputMode="numeric" value={paso.minutos} error={errores.pasos[i]?.minutos} onChange={(e) => cambiarPaso(paso.clave, { minutos: e.target.value })} />
                <Boton
                  variante="fantasma"
                  aria-label={`Quitar paso ${i + 1}`}
                  disabled={pasos.length === 1}
                  onClick={() => setPasos((filas) => filas.filter((f) => f.clave !== paso.clave))}
                  className="justify-self-start sm:mt-7 sm:justify-self-auto"
                  icono={<Trash2 aria-hidden="true" className="size-5" />}
                />
              </li>
            ))}
          </ol>
          {errores.pasos[TOPES.pasos] && <p className="text-danger">{errores.pasos[TOPES.pasos]?.texto}</p>}
          <Boton variante="secundario" className="justify-self-start" disabled={pasos.length >= TOPES.pasos} icono={<Plus aria-hidden="true" className="size-5" />} onClick={() => setPasos((filas) => [...filas, { ...filaPasoVacia(), clave: nuevaClave() }])}>
            Agregar paso
          </Boton>
        </section>

        <div className="grid justify-items-start gap-3 border-t border-line pt-6">
          <div className="flex flex-wrap gap-2">
            <Boton type="submit" tamano="lg" cargando={guardando} icono={<Save aria-hidden="true" className="size-5" />}>
              Guardar receta
            </Boton>
            <BotonEnlace to={id ? rutaDeReceta(id) : '/mi-cocina'} tamano="lg" variante="fantasma">
              Cancelar
            </BotonEnlace>
          </div>
          <AvisoEnVivo mensaje={aviso} />
        </div>
      </form>
    </div>
  )
}
