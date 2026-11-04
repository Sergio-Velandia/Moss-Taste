import { normalizar } from '@/lib/formato'
import { UNIDADES, type Ingrediente, type IngredienteReceta, type Paso, type Receta, type Unidad } from '@/lib/recetas/tipos'
import { TOPES } from './config'
import type { RecetaDoc } from './tipos'

/*
 * Recetas personales: del formulario a la receta, de la receta al documento de Firestore y de vuelta.
 * Tienen la misma forma que las públicas para usar el mismo cálculo y los mismos componentes.
 * Un ingrediente que no está en el catálogo guarda su nombre donde iría el id: el cálculo no lo encuentra,
 * dice «Sin precio» y el costo queda parcial y avisado. Nunca se asume cero.
 */

export const LIMITES = { titulo: 80, resumen: 200, ingrediente: 60, tarea: 300, paso: 600, cantidad: 100_000, temporizador: 600 } as const
// Los mismos totales de firestore.rules: las comillas y los saltos de línea ocupan más al guardarse.
const TOTAL_INGREDIENTES = 12_000
const TOTAL_PASOS = 26_000

export interface FilaIngrediente {
  nombre: string
  cantidad: string
  unidad: Unidad
  alGusto: boolean
}
export interface FilaPaso {
  texto: string
  minutos: string
}
export interface FormReceta {
  titulo: string
  categoria: string
  porciones: string
  tiempo: string
  resumen: string
  /** Una tarea por línea. */
  tareas: string
  ingredientes: FilaIngrediente[]
  pasos: FilaPaso[]
}

export interface ErroresReceta {
  titulo?: string
  categoria?: string
  porciones?: string
  tiempo?: string
  resumen?: string
  tareas?: string
  /** Por posición de la fila. */
  ingredientes: Record<number, { nombre?: string; cantidad?: string }>
  pasos: Record<number, { texto?: string; minutos?: string }>
}

export const filaIngredienteVacia = (): FilaIngrediente => ({ nombre: '', cantidad: '', unidad: 'g', alGusto: false })
export const filaPasoVacia = (): FilaPaso => ({ texto: '', minutos: '' })
export const FORM_VACIO: FormReceta = { titulo: '', categoria: '', porciones: '4', tiempo: '', resumen: '', tareas: '', ingredientes: [filaIngredienteVacia()], pasos: [filaPasoVacia()] }

export function hayErrores(e: ErroresReceta): boolean {
  return Boolean(e.titulo || e.categoria || e.porciones || e.tiempo || e.resumen || e.tareas || Object.keys(e.ingredientes).length || Object.keys(e.pasos).length)
}

/** El id del catálogo si el nombre coincide (sin tildes ni mayúsculas); si no, el nombre tal cual. */
export function resolverIngrediente(nombre: string, catalogo: Iterable<Ingrediente>): string {
  const buscado = normalizar(nombre.trim())
  for (const ingrediente of catalogo) if (normalizar(ingrediente.nombre) === buscado) return ingrediente.id
  return nombre.trim()
}

const numero = (texto: string) => Number(texto.trim().replace(',', '.'))
const entero = (texto: string, min: number, max: number) => {
  const n = numero(texto)
  return Number.isInteger(n) && n >= min && n <= max && texto.trim() !== ''
}
const lineas = (texto: string) =>
  texto
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

const ingredienteAJson = (i: IngredienteReceta) => JSON.stringify({ ingrediente: i.ingrediente, cantidad: i.cantidad, unidad: i.unidad, ...(i.ajustarAlGusto ? { ajustarAlGusto: true } : {}) })
const pasoAJson = (p: Paso) => JSON.stringify({ texto: p.texto, ...(p.temporizadorMin ? { temporizadorMin: p.temporizadorMin } : {}) })

/** Valida el formulario. Cada error dice qué falta y va junto a su campo. Si no hay errores, devuelve la receta. */
export function validarFormReceta(form: FormReceta, catalogo: Iterable<Ingrediente>, id: string): { errores: ErroresReceta; receta?: Receta } {
  const errores: ErroresReceta = { ingredientes: {}, pasos: {} }
  const titulo = form.titulo.trim()
  if (!titulo) errores.titulo = 'Escribe el nombre de la receta.'
  else if (titulo.length > LIMITES.titulo) errores.titulo = `Acorta el nombre a ${LIMITES.titulo} caracteres o menos.`
  if (!form.categoria) errores.categoria = 'Elige una categoría.'
  if (!entero(form.porciones, 1, 50)) errores.porciones = 'Escribe un número entero de 1 a 50.'
  if (!entero(form.tiempo, 1, 1440)) errores.tiempo = 'Escribe el tiempo total en minutos, de 1 a 1440.'
  if (form.resumen.trim().length > LIMITES.resumen) errores.resumen = `Acorta el resumen a ${LIMITES.resumen} caracteres o menos.`

  const tareas = lineas(form.tareas)
  if (tareas.length > TOPES.tareas) errores.tareas = `Deja ${TOPES.tareas} tareas o menos.`
  else if (tareas.some((t) => t.length > LIMITES.tarea)) errores.tareas = `Cada tarea puede tener hasta ${LIMITES.tarea} caracteres.`

  const vistos = new Set<string>()
  const ingredientes: IngredienteReceta[] = []
  form.ingredientes.forEach((fila, i) => {
    const nombre = fila.nombre.trim()
    if (!nombre && !fila.cantidad.trim()) return
    const error: { nombre?: string; cantidad?: string } = {}
    const idIngrediente = resolverIngrediente(nombre, catalogo)
    if (!nombre) error.nombre = 'Escribe el ingrediente.'
    else if (nombre.length > LIMITES.ingrediente) error.nombre = `Acorta el nombre a ${LIMITES.ingrediente} caracteres o menos.`
    else if (vistos.has(normalizar(idIngrediente))) error.nombre = 'Este ingrediente ya está en la receta. Suma las cantidades en una sola fila.'
    vistos.add(normalizar(idIngrediente))
    const cantidad = numero(fila.cantidad)
    if (!(cantidad > 0) || cantidad > LIMITES.cantidad) error.cantidad = 'Escribe una cantidad mayor que 0, por ejemplo 1,5.'
    if (error.nombre || error.cantidad) errores.ingredientes[i] = error
    else ingredientes.push({ ingrediente: idIngrediente, cantidad, unidad: fila.unidad, ...(fila.alGusto ? { ajustarAlGusto: true } : {}) })
  })
  if (!Object.keys(errores.ingredientes).length && ingredientes.length === 0) errores.ingredientes[0] = { nombre: 'Agrega al menos un ingrediente con su cantidad.' }
  else if (ingredientes.length > TOPES.ingredientes) errores.ingredientes[TOPES.ingredientes] = { nombre: `Deja ${TOPES.ingredientes} ingredientes o menos.` }

  const pasos: Paso[] = []
  form.pasos.forEach((fila, i) => {
    const texto = fila.texto.trim()
    if (!texto && !fila.minutos.trim()) return
    const error: { texto?: string; minutos?: string } = {}
    if (!texto) error.texto = 'Escribe qué se hace en este paso.'
    else if (texto.length > LIMITES.paso) error.texto = `Acorta el paso a ${LIMITES.paso} caracteres o menos.`
    if (fila.minutos.trim() && !entero(fila.minutos, 1, LIMITES.temporizador)) error.minutos = `Minutos enteros, de 1 a ${LIMITES.temporizador}.`
    if (error.texto || error.minutos) errores.pasos[i] = error
    else pasos.push({ texto, ...(fila.minutos.trim() ? { temporizadorMin: numero(fila.minutos) } : {}) })
  })
  if (!Object.keys(errores.pasos).length && pasos.length === 0) errores.pasos[0] = { texto: 'Escribe al menos un paso.' }
  else if (pasos.length > TOPES.pasos) errores.pasos[TOPES.pasos] = { texto: `Deja ${TOPES.pasos} pasos o menos.` }
  else if (pasos.map(pasoAJson).join('').length > TOTAL_PASOS) errores.pasos[0] = { texto: 'Los pasos son demasiado largos para guardarlos. Acórtalos un poco.' }
  if (ingredientes.map(ingredienteAJson).join('').length > TOTAL_INGREDIENTES) errores.ingredientes[0] = { nombre: 'Los ingredientes son demasiado largos para guardarlos.' }

  if (hayErrores(errores)) return { errores }
  return {
    errores,
    receta: { id, titulo, resumen: form.resumen.trim(), categoria: form.categoria, porcionesBase: numero(form.porciones), tiempoMin: numero(form.tiempo), ingredientes, miseEnPlace: tareas, pasos },
  }
}

export function recetaADoc(r: Receta): RecetaDoc {
  return {
    titulo: r.titulo,
    resumen: r.resumen,
    categoria: r.categoria,
    porcionesBase: r.porcionesBase,
    tiempoMin: r.tiempoMin,
    ingredientes: r.ingredientes.map(ingredienteAJson),
    miseEnPlace: r.miseEnPlace,
    pasos: r.pasos.map(pasoAJson),
  }
}

function leerJson(texto: unknown): Record<string, unknown> | null {
  if (typeof texto !== 'string') return null
  try {
    const dato: unknown = JSON.parse(texto)
    return typeof dato === 'object' && dato !== null && !Array.isArray(dato) ? (dato as Record<string, unknown>) : null
  } catch {
    return null
  }
}

/** Lo que llega de Firestore es entrada externa: si algo no cuadra, la receta no se muestra (null). */
export function docAReceta(id: string, crudo: unknown): Receta | null {
  if (typeof crudo !== 'object' || crudo === null) return null
  const d = crudo as Record<string, unknown>
  if (typeof d.titulo !== 'string' || !d.titulo || typeof d.categoria !== 'string' || !Number.isInteger(d.porcionesBase) || !Number.isInteger(d.tiempoMin)) return null
  if (!Array.isArray(d.ingredientes) || !Array.isArray(d.pasos) || !Array.isArray(d.miseEnPlace)) return null
  if ((d.porcionesBase as number) < 1) return null

  const ingredientes: IngredienteReceta[] = []
  for (const texto of d.ingredientes) {
    const i = leerJson(texto)
    if (!i || typeof i.ingrediente !== 'string' || !i.ingrediente || typeof i.cantidad !== 'number' || !(i.cantidad > 0) || !UNIDADES.includes(i.unidad as Unidad)) return null
    ingredientes.push({ ingrediente: i.ingrediente, cantidad: i.cantidad, unidad: i.unidad as Unidad, ...(i.ajustarAlGusto === true ? { ajustarAlGusto: true } : {}) })
  }
  const pasos: Paso[] = []
  for (const texto of d.pasos) {
    const p = leerJson(texto)
    if (!p || typeof p.texto !== 'string' || !p.texto) return null
    pasos.push({ texto: p.texto, ...(typeof p.temporizadorMin === 'number' ? { temporizadorMin: p.temporizadorMin } : {}) })
  }
  if (ingredientes.length === 0 || pasos.length === 0) return null
  return {
    id,
    titulo: d.titulo,
    resumen: typeof d.resumen === 'string' ? d.resumen : '',
    categoria: d.categoria,
    porcionesBase: d.porcionesBase as number,
    tiempoMin: d.tiempoMin as number,
    ingredientes,
    miseEnPlace: d.miseEnPlace.filter((t): t is string => typeof t === 'string'),
    pasos,
  }
}

/** Para editar: de la receta guardada al formulario. Los decimales se muestran con coma. */
export function recetaAForm(r: Receta, catalogo: ReadonlyMap<string, Ingrediente>): FormReceta {
  return {
    titulo: r.titulo,
    categoria: r.categoria,
    porciones: String(r.porcionesBase),
    tiempo: String(r.tiempoMin),
    resumen: r.resumen,
    tareas: r.miseEnPlace.join('\n'),
    ingredientes: r.ingredientes.map((i) => ({
      nombre: catalogo.get(i.ingrediente)?.nombre ?? i.ingrediente,
      cantidad: String(i.cantidad).replace('.', ','),
      unidad: i.unidad,
      alGusto: Boolean(i.ajustarAlGusto),
    })),
    pasos: r.pasos.map((p) => ({ texto: p.texto, minutos: p.temporizadorMin ? String(p.temporizadorMin) : '' })),
  }
}

/** Id propio: «mia-» + letras y números. No choca con ningún slug público y lo admite la lista de compras. */
export function nuevoIdReceta(): string {
  return `mia-${crypto.randomUUID().replaceAll('-', '').slice(0, 16)}`
}
