import { UNIDADES, UNIDADES_BASE, type Categoria, type Ingrediente, type Receta } from './tipos'

// Validación propia, sin dependencias. Cada error dice el archivo, el campo y qué falla,
// para que `npm test` señale exactamente dónde corregir.

type Registro = Record<string, unknown>

const esRegistro = (v: unknown): v is Registro => typeof v === 'object' && v !== null && !Array.isArray(v)
const esTexto = (v: unknown, max: number): v is string => typeof v === 'string' && v.trim().length > 0 && v.length <= max
const esEnteroEntre = (v: unknown, min: number, max: number): v is number => Number.isInteger(v) && (v as number) >= min && (v as number) <= max
const ID = /^[a-z0-9]+(-[a-z0-9]+)*$/
const FECHA = /^\d{4}-\d{2}-\d{2}$/

function fechaValida(v: unknown): boolean {
  if (typeof v !== 'string' || !FECHA.test(v)) return false
  const fecha = new Date(`${v}T00:00:00Z`)
  return !Number.isNaN(fecha.getTime()) && fecha.toISOString().startsWith(v)
}

export interface Resultado<T> {
  valor?: T
  errores: string[]
}

export function validarIngredientes(datos: unknown, archivo = 'ingredientes.json'): Resultado<Ingrediente[]> {
  const errores: string[] = []
  if (!Array.isArray(datos)) return { errores: [`${archivo}: debe ser una lista`] }
  const vistos = new Set<string>()
  datos.forEach((d, i) => {
    const donde = `${archivo} → [${i}]`
    if (!esRegistro(d)) return errores.push(`${donde}: debe ser un objeto`)
    const id = d.id
    const lugar = typeof id === 'string' ? `${archivo} → ${id}` : donde
    if (typeof id !== 'string' || !ID.test(id)) errores.push(`${donde}.id: usa minúsculas, números y guiones`)
    else if (vistos.has(id)) errores.push(`${lugar}: id repetido`)
    else vistos.add(id)
    if (!esTexto(d.nombre, 60)) errores.push(`${lugar}.nombre: texto de 1 a 60 caracteres`)
    if (!(UNIDADES_BASE as readonly unknown[]).includes(d.unidadBase)) errores.push(`${lugar}.unidadBase: debe ser ${UNIDADES_BASE.join(', ')}`)
    if (d.precio !== null && !esEnteroEntre(d.precio, 0, 10_000_000)) errores.push(`${lugar}.precio: entero en COP o null`)
    if (typeof d.porCantidad !== 'number' || d.porCantidad <= 0) errores.push(`${lugar}.porCantidad: número mayor que 0`)
    if (!fechaValida(d.fechaPrecio)) errores.push(`${lugar}.fechaPrecio: fecha AAAA-MM-DD válida`)
    if (typeof d.merma !== 'number' || d.merma < 0 || d.merma >= 1) errores.push(`${lugar}.merma: número de 0 a menos de 1`)
    if (d.densidad !== undefined && (typeof d.densidad !== 'number' || d.densidad <= 0)) errores.push(`${lugar}.densidad: número mayor que 0`)
    if (d.gramosPorUnidad !== undefined && (typeof d.gramosPorUnidad !== 'number' || d.gramosPorUnidad <= 0)) errores.push(`${lugar}.gramosPorUnidad: número mayor que 0`)
    if (d.unidadNombre !== undefined) {
      const u = d.unidadNombre
      if (!esRegistro(u) || !esTexto(u.singular, 20) || !esTexto(u.plural, 20)) errores.push(`${lugar}.unidadNombre: { singular, plural }`)
      else if (d.unidadBase !== 'unidad') errores.push(`${lugar}.unidadNombre: solo aplica si unidadBase es «unidad»`)
    }
    if (d.ejemplo !== undefined && typeof d.ejemplo !== 'boolean') errores.push(`${lugar}.ejemplo: true o false`)
    return undefined
  })
  return errores.length ? { errores } : { valor: datos as Ingrediente[], errores }
}

export function validarCategorias(datos: unknown, archivo = 'categorias.json'): Resultado<Categoria[]> {
  const errores: string[] = []
  if (!Array.isArray(datos)) return { errores: [`${archivo}: debe ser una lista`] }
  const vistos = new Set<string>()
  datos.forEach((d, i) => {
    const donde = `${archivo} → [${i}]`
    if (!esRegistro(d)) return errores.push(`${donde}: debe ser un objeto`)
    if (typeof d.id !== 'string' || !ID.test(d.id)) errores.push(`${donde}.id: usa minúsculas, números y guiones`)
    else if (vistos.has(d.id)) errores.push(`${donde}.id: «${d.id}» repetido`)
    else vistos.add(d.id)
    if (!esTexto(d.nombre, 40)) errores.push(`${donde}.nombre: texto de 1 a 40 caracteres`)
    if (!esTexto(d.descripcion, 160)) errores.push(`${donde}.descripcion: texto de 1 a 160 caracteres`)
    return undefined
  })
  return errores.length ? { errores } : { valor: datos as Categoria[], errores }
}

export function validarReceta(
  datos: unknown,
  slug: string,
  ingredientes: ReadonlyMap<string, Ingrediente>,
  categorias: ReadonlySet<string>,
): Resultado<Receta> {
  const archivo = `recetas/${slug}/receta.json`
  if (!esRegistro(datos)) return { errores: [`${archivo}: debe ser un objeto`] }
  const d = datos
  const errores: string[] = []
  const e = (campo: string, mensaje: string) => errores.push(`${archivo} → ${campo}: ${mensaje}`)

  if (!ID.test(slug)) e('carpeta', 'el nombre de la carpeta usa minúsculas, números y guiones')
  if (d.id !== slug) e('id', `debe coincidir con el nombre de la carpeta («${slug}»)`)
  if (!esTexto(d.titulo, 80)) e('titulo', 'texto de 1 a 80 caracteres')
  if (!esTexto(d.resumen, 200)) e('resumen', 'texto de 1 a 200 caracteres')
  if (typeof d.categoria !== 'string' || !categorias.has(d.categoria)) e('categoria', `«${String(d.categoria)}» no existe en categorias.json`)
  if (!esEnteroEntre(d.porcionesBase, 1, 50)) e('porcionesBase', 'entero de 1 a 50')
  if (!esEnteroEntre(d.tiempoMin, 1, 1440)) e('tiempoMin', 'minutos, entero de 1 a 1440')
  if (d.ejemplo !== undefined && typeof d.ejemplo !== 'boolean') e('ejemplo', 'true o false')

  const usados = new Set<string>()
  if (!Array.isArray(d.ingredientes) || d.ingredientes.length === 0) e('ingredientes', 'lista con al menos un ingrediente')
  else
    d.ingredientes.forEach((ing: unknown, i) => {
      const campo = `ingredientes[${i}]`
      if (!esRegistro(ing)) return e(campo, 'debe ser un objeto')
      if (typeof ing.ingrediente !== 'string' || !ingredientes.has(ing.ingrediente))
        e(`${campo}.ingrediente`, `«${String(ing.ingrediente)}» no existe en ingredientes.json`)
      else if (usados.has(ing.ingrediente)) e(`${campo}.ingrediente`, `«${ing.ingrediente}» está repetido`)
      else usados.add(ing.ingrediente)
      if (typeof ing.cantidad !== 'number' || !(ing.cantidad > 0)) e(`${campo}.cantidad`, 'número mayor que 0')
      if (!(UNIDADES as readonly unknown[]).includes(ing.unidad)) e(`${campo}.unidad`, `debe ser ${UNIDADES.join(', ')}`)
      if (ing.ajustarAlGusto !== undefined && typeof ing.ajustarAlGusto !== 'boolean') e(`${campo}.ajustarAlGusto`, 'true o false')
      if (ing.nota !== undefined && !esTexto(ing.nota, 80)) e(`${campo}.nota`, 'texto de 1 a 80 caracteres')
      return undefined
    })

  if (!Array.isArray(d.miseEnPlace) || d.miseEnPlace.some((m) => !esTexto(m, 300))) e('miseEnPlace', 'lista de textos de 1 a 300 caracteres')

  if (!Array.isArray(d.pasos) || d.pasos.length === 0) e('pasos', 'lista con al menos un paso')
  else
    d.pasos.forEach((paso: unknown, i) => {
      const campo = `pasos[${i}]`
      if (!esRegistro(paso)) return e(campo, 'debe ser un objeto')
      if (!esTexto(paso.texto, 600)) e(`${campo}.texto`, 'texto de 1 a 600 caracteres')
      if (paso.ingredientes !== undefined) {
        if (!Array.isArray(paso.ingredientes)) e(`${campo}.ingredientes`, 'lista de ids')
        else
          paso.ingredientes.forEach((id: unknown) => {
            if (typeof id !== 'string' || !usados.has(id)) e(`${campo}.ingredientes`, `«${String(id)}» no está en los ingredientes de la receta`)
          })
      }
      if (paso.temporizadorMin !== undefined && !esEnteroEntre(paso.temporizadorMin, 1, 600)) e(`${campo}.temporizadorMin`, 'minutos, entero de 1 a 600')
      return undefined
    })

  return errores.length ? { errores } : { valor: d as unknown as Receta, errores }
}
