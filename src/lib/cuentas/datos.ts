import { useSyncExternalStore } from 'react'
import { almacenActivo, almacenNavegador, usarAlmacenDeCuenta } from '@/lib/lista/activa'
import { LISTA_VACIA, MAX_BYTES, quitarReceta, type EntradaGuardada } from '@/lib/lista/almacen'
import { crearAlmacenCuenta, leerTextoLista, textoLista, type AlmacenCuenta } from '@/lib/lista/almacenCuenta'
import { combinarListas } from '@/lib/lista/combinar'
import { INGREDIENTES, recetaPorSlug } from '@/lib/recetas/catalogo'
import { sumarLista } from '@/lib/recetas/lista'
import type { Receta } from '@/lib/recetas/tipos'
import { TOPES } from './config'
import { mensajeDeError } from './errores'
import { misDatosAJSON } from './misDatos'
import { docAReceta, recetaADoc } from './recetaPersonal'
import type { Interaccion, PerfilGuardado, ServicioCuentas, UsuarioSesion } from './tipos'

// Los datos de la cuenta con sesión: favoritos, notas, recetas personales y lista. Se leen una vez al entrar y
// se guardan en memoria mientras dura la sesión. No importa Firebase: recibe el servicio ya cargado.

export const INTERACCION_VACIA: Interaccion = { favorita: false, probada: '', nota: '' }
const REFRESCO_MS = 60_000

export interface DatosCuenta {
  interacciones: Readonly<Record<string, Interaccion>>
  recetas: readonly Receta[]
  /** Se dijo al combinar la lista del navegador con la de la cuenta. */
  avisoLista: string
}

const VACIOS: DatosCuenta = { interacciones: {}, recetas: [], avisoLista: '' }

let datos = VACIOS
let conexion: { servicio: ServicioCuentas; usuario: UsuarioSesion; perfil: PerfilGuardado; lista: AlmacenCuenta } | null = null
/** Lo último confirmado por el servidor: a esto se vuelve si una escritura falla. */
let confirmadas: Record<string, Interaccion> = {}
let colas: Record<string, Promise<string | null>> = {}
let ilegibles: Record<string, unknown> = {}
let quitarFoco: (() => void) | undefined

const oyentes = new Set<() => void>()
function fijar(cambios: Partial<DatosCuenta>) {
  datos = { ...datos, ...cambios }
  oyentes.forEach((o) => o())
}

export function buscarReceta(id: string): Receta | undefined {
  return recetaPorSlug(id) ?? datos.recetas.find((r) => r.id === id)
}

function cantidadesDe(recetas: EntradaGuardada[]): ReadonlyMap<string, number> {
  const entradas = recetas.flatMap(({ id, porciones }) => {
    const receta = buscarReceta(id)
    return receta ? [{ receta, porciones }] : []
  })
  return new Map(sumarLista(entradas, INGREDIENTES).map((i) => [i.clave, i.cantidad]))
}

/** Lleva la lista del navegador a la cuenta. Solo se borra del navegador cuando ya quedó guardada. */
async function migrarLista(servicio: ServicioCuentas, uid: string, perfil: PerfilGuardado): Promise<{ lista: AlmacenCuenta; aviso: string }> {
  const guardar = (texto: string) => servicio.guardarLista(uid, texto)
  const deCuenta = leerTextoLista(perfil.lista)
  const delNavegador = almacenNavegador.leer()
  if (!delNavegador.recetas.length && !delNavegador.comprados.length) return { lista: crearAlmacenCuenta(deCuenta, guardar), aviso: '' }

  const { estado, sinEspacio } = combinarListas(deCuenta, delNavegador, cantidadesDe)
  const texto = textoLista(estado)
  try {
    if (texto.length > MAX_BYTES) throw new RangeError('La lista supera el tope de tamaño')
    await guardar(texto)
    // Lo que no cupo se queda en el navegador: se intenta otra vez la próxima vez que entre.
    almacenNavegador.cambiar({ ...LISTA_VACIA, recetas: delNavegador.recetas.filter((r) => sinEspacio.includes(r.id)) })
    const fuera = sinEspacio.map((id) => buscarReceta(id)?.titulo ?? id).join(', ')
    return {
      lista: crearAlmacenCuenta(estado, guardar),
      aviso: fuera
        ? `Pasamos a tu cuenta la lista de este navegador. No cupieron (el tope es de 20 recetas): ${fuera}. Quita alguna y vuelve a entrar para traerlas.`
        : 'Pasamos a tu cuenta la lista que tenías en este navegador y la juntamos con la que ya había.',
    }
  } catch {
    return { lista: crearAlmacenCuenta(estado, guardar, false), aviso: 'No se pudo pasar a tu cuenta la lista de este navegador. Sigue guardada aquí y se intenta otra vez la próxima vez que entres.' }
  }
}

/** Devuelve false si la carga dejó de valer (`vigente`) y no se conectó nada. */
export async function activarDatos(servicio: ServicioCuentas, usuario: UsuarioSesion, perfil: PerfilGuardado, vigente: () => boolean): Promise<boolean> {
  const [interacciones, crudas] = await Promise.all([servicio.leerInteracciones(usuario.uid), servicio.leerRecetas(usuario.uid)])
  if (!vigente()) return false
  const recetas: Receta[] = []
  ilegibles = {}
  for (const [id, crudo] of Object.entries(crudas)) {
    const receta = docAReceta(id, crudo)
    if (receta) recetas.push(receta)
    else ilegibles[id] = crudo
  }
  recetas.sort((a, b) => a.titulo.localeCompare(b.titulo, 'es'))
  confirmadas = { ...interacciones }
  colas = {}
  datos = { interacciones, recetas, avisoLista: '' }

  const { lista, aviso } = await migrarLista(servicio, usuario.uid, perfil)
  if (!vigente()) {
    datos = VACIOS
    return false
  }
  conexion = { servicio, usuario, perfil, lista }
  usarAlmacenDeCuenta(lista)
  fijar({ avisoLista: aviso })

  // Sin tiempo real: al volver a esta pestaña se trae la lista por si cambió en otro dispositivo.
  quitarFoco?.()
  let ultimo = Date.now()
  const alEnfocar = () => {
    if (Date.now() - ultimo < REFRESCO_MS) return
    ultimo = Date.now()
    servicio
      .leerPerfil(usuario.uid)
      .then((p) => {
        if (p) lista.recibir(p.lista)
      })
      .catch(() => {})
  }
  window.addEventListener('focus', alEnfocar)
  quitarFoco = () => window.removeEventListener('focus', alEnfocar)
  return true
}

export function desactivarDatos(): void {
  quitarFoco?.()
  quitarFoco = undefined
  conexion = null
  confirmadas = {}
  colas = {}
  ilegibles = {}
  usarAlmacenDeCuenta(null)
  fijar(VACIOS)
}

export async function guardarPendientes(): Promise<void> {
  await Promise.all(Object.values(colas))
  await conexion?.lista.guardarPendiente()
}

const estaVacia = (i: Interaccion) => !i.favorita && !i.probada && !i.nota

/**
 * Cambia favorita, probada o nota. La pantalla cambia al instante; si la escritura falla, vuelve a lo último
 * confirmado y devuelve el mensaje de error. Los cambios seguidos de una receta se escriben en orden.
 */
export function cambiarInteraccion(slug: string, cambios: Partial<Interaccion>): Promise<string | null> {
  const actual = datos.interacciones[slug] ?? INTERACCION_VACIA
  const nueva = { ...actual, ...cambios }
  if (!conexion) return Promise.resolve('Tu sesión se cerró. Entra de nuevo para continuar.')
  if (!confirmadas[slug] && !datos.interacciones[slug] && Object.keys(datos.interacciones).length >= TOPES.interacciones)
    return Promise.resolve(`Llegaste al tope de ${TOPES.interacciones} recetas con favorito, nota o marca. Quita alguna para seguir.`)
  fijar({ interacciones: { ...datos.interacciones, [slug]: nueva } })

  const { servicio, usuario } = conexion
  const volver = () => {
    const previa = confirmadas[slug]
    const { [slug]: _quitada, ...resto } = datos.interacciones
    fijar({ interacciones: previa ? { ...datos.interacciones, [slug]: previa } : resto })
  }
  const escribir = async (): Promise<string | null> => {
    const deseada = datos.interacciones[slug] ?? INTERACCION_VACIA
    const servidor = confirmadas[slug]
    try {
      if (estaVacia(deseada)) {
        if (servidor) await servicio.borrarInteraccion(usuario.uid, slug)
        delete confirmadas[slug]
        const { [slug]: _quitada, ...resto } = datos.interacciones
        fijar({ interacciones: resto })
      } else {
        if (servidor) await servicio.actualizarInteraccion(usuario.uid, slug, deseada)
        else await servicio.crearInteraccion(usuario.uid, slug, deseada)
        confirmadas[slug] = deseada
      }
      return null
    } catch (error) {
      volver()
      return mensajeDeError(error)
    }
  }
  const cola = (colas[slug] ?? Promise.resolve(null)).then(escribir)
  colas[slug] = cola
  return cola
}

function requerirConexion() {
  if (!conexion) throw Object.assign(new Error('Sin sesión'), { code: 'auth/no-current-user' })
  return conexion
}

export const quedanRecetas = () => datos.recetas.length + Object.keys(ilegibles).length < TOPES.recetas

/** Crea o edita una receta personal. El error sube a la pantalla, que conserva lo escrito. */
export async function guardarRecetaPersonal(receta: Receta, esNueva: boolean): Promise<void> {
  const { servicio, usuario } = requerirConexion()
  const doc = recetaADoc(receta)
  if (esNueva) await servicio.crearReceta(usuario.uid, receta.id, doc)
  else await servicio.actualizarReceta(usuario.uid, receta.id, doc)
  const otras = datos.recetas.filter((r) => r.id !== receta.id)
  fijar({ recetas: [...otras, receta].sort((a, b) => a.titulo.localeCompare(b.titulo, 'es')) })
}

export async function borrarRecetaPersonal(id: string): Promise<void> {
  const { servicio, usuario } = requerirConexion()
  await servicio.borrarReceta(usuario.uid, id)
  fijar({ recetas: datos.recetas.filter((r) => r.id !== id) })
  const almacen = almacenActivo()
  if (almacen.leer().recetas.some((r) => r.id === id)) almacen.cambiar(quitarReceta(almacen.leer(), id))
}

export function exportarMisDatos(fecha: string): string {
  const { usuario, perfil, lista } = requerirConexion()
  return misDatosAJSON({ usuario, autorizacion: perfil.autorizacion, interacciones: datos.interacciones, recetas: datos.recetas, ilegibles, lista: lista.leer() }, fecha)
}

/**
 * Borra todo y al final la cuenta. Antes hay que confirmar identidad. Los contadores obligan a borrar de a uno;
 * si se interrumpe, se puede repetir: lo ya borrado no vuelve. Sin perfil, la cuenta queda como no registrada.
 */
export async function borrarCuentaYDatos(progreso: (hechos: number, total: number) => void): Promise<void> {
  const { servicio, usuario, lista } = requerirConexion()
  await guardarPendientes()
  lista.detener()
  const slugs = Object.keys(confirmadas)
  const ids = [...datos.recetas.map((r) => r.id), ...Object.keys(ilegibles)]
  const total = slugs.length + ids.length
  let hechos = 0
  progreso(hechos, total)
  for (const slug of slugs) {
    await servicio.borrarInteraccion(usuario.uid, slug)
    delete confirmadas[slug]
    progreso(++hechos, total)
  }
  for (const id of ids) {
    await servicio.borrarReceta(usuario.uid, id)
    delete ilegibles[id]
    progreso(++hechos, total)
  }
  await servicio.borrarPerfil(usuario.uid)
  await servicio.borrarUsuario()
}

function suscribir(oyente: () => void) {
  oyentes.add(oyente)
  return () => oyentes.delete(oyente)
}
const leer = () => datos
export function useDatosCuenta(): DatosCuenta {
  return useSyncExternalStore(suscribir, leer, leer)
}
