import { useEffect, useSyncExternalStore } from 'react'
import { cuentasDisponibles, VERSION_POLITICA } from './config'
import { mensajeDeError } from './errores'
import { fijarPista, hayPista } from './pista'
import type { ServicioCuentas, UsuarioSesion } from './tipos'

/*
 * Estado de la sesión. Este archivo va en la carga inicial y no importa Firebase: lo trae con import() solo
 * si hace falta (hay pista de sesión, o se entró a /acceso o a /mi-cocina).
 *
 * - sin-verificar: el SDK no se ha cargado; para quien solo mira recetas, se comporta como sin cuenta.
 * - pendiente: tiene cuenta en Authentication, pero no aceptó la autorización (no tiene perfil). Se trata
 *   siempre como no registrada, aunque haya cerrado la pestaña a mitad: al volver ve la autorización otra vez.
 *   Las reglas de Firestore tampoco le dejan leer ni escribir nada más.
 * - activa: aceptó y sus datos ya están cargados.
 */
export type Sesion =
  | { fase: 'sin-verificar' }
  | { fase: 'cargando' }
  | { fase: 'anonima' }
  | { fase: 'pendiente'; usuario: UsuarioSesion }
  | { fase: 'activa'; usuario: UsuarioSesion }
  | { fase: 'error'; mensaje: string }

let sesion: Sesion = { fase: 'sin-verificar' }
const oyentes = new Set<() => void>()
const fijar = (nueva: Sesion) => {
  sesion = nueva
  oyentes.forEach((o) => o())
}
export const leerSesion = () => sesion

export const obtenerServicio = (): Promise<ServicioCuentas> => import('./firebase').then((m) => m.servicio)

let arranque: Promise<void> | null = null
let usuarioActual: UsuarioSesion | null = null
let turno = 0
/** El módulo de datos, cuando hay una cuenta conectada. Apagarlo es inmediato: no puede pisar una sesión nueva. */
let datosActivos: typeof import('./datos') | null = null
/** Aceptó la casilla justo antes de crear la cuenta en esta misma pestaña. */
let autorizacionPrevia = false

function apagarDatos() {
  datosActivos?.desactivarDatos()
  datosActivos = null
}

async function alCambiarUsuario(servicio: ServicioCuentas, usuario: UsuarioSesion | null) {
  const este = ++turno
  usuarioActual = usuario
  if (!usuario) {
    fijarPista(false)
    apagarDatos()
    fijar({ fase: 'anonima' })
    return
  }
  fijarPista(true)
  apagarDatos()
  fijar({ fase: 'cargando' })
  try {
    let perfil = await servicio.leerPerfil(usuario.uid)
    if (!perfil && autorizacionPrevia) {
      await servicio.crearPerfil(usuario.uid, VERSION_POLITICA)
      perfil = await servicio.leerPerfil(usuario.uid)
    }
    if (este !== turno) return
    if (!perfil) {
      fijar({ fase: 'pendiente', usuario })
      return
    }
    const modulo = await import('./datos')
    // Si mientras tanto cerró sesión o entró otra cuenta, esta carga ya no vale y no se conecta.
    const conectada = await modulo.activarDatos(servicio, usuario, perfil, () => este === turno)
    if (!conectada) return
    datosActivos = modulo
    fijar({ fase: 'activa', usuario })
  } catch (error) {
    // Sin leer el perfil no se sabe si aceptó: nunca se le da paso.
    if (este === turno) fijar({ fase: 'error', mensaje: mensajeDeError(error) })
  } finally {
    autorizacionPrevia = false
  }
}

/** Carga el SDK y pregunta quién tiene sesión. Idempotente. */
export function asegurarSesion(): void {
  if (arranque) return
  if (!cuentasDisponibles()) {
    fijar({ fase: 'anonima' })
    return
  }
  fijar({ fase: 'cargando' })
  arranque = obtenerServicio()
    .then((servicio) => {
      servicio.observarSesion((usuario) => void alCambiarUsuario(servicio, usuario))
    })
    .catch((error: unknown) => {
      arranque = null
      fijar({ fase: 'error', mensaje: mensajeDeError(error) })
    })
}

export async function reintentarSesion(): Promise<void> {
  if (!arranque) {
    asegurarSesion()
    return
  }
  await alCambiarUsuario(await obtenerServicio(), usuarioActual)
}

/** Crea la cuenta con la casilla ya aceptada. Si se cierra la pestaña a mitad, queda pendiente de aceptar. */
export async function crearCuentaConCorreo(correo: string, contrasena: string): Promise<void> {
  const servicio = await obtenerServicio()
  autorizacionPrevia = true
  try {
    await servicio.crearConCorreo(correo, contrasena)
  } catch (error) {
    autorizacionPrevia = false
    throw error
  }
}

export async function entrarConCorreo(correo: string, contrasena: string): Promise<void> {
  await (await obtenerServicio()).entrarConCorreo(correo, contrasena)
}

/** conAutorizacion: viene de «Crear cuenta», con la casilla marcada. Quien ya tiene perfil entra sin más. */
export async function entrarConGoogle(conAutorizacion: boolean): Promise<void> {
  const servicio = await obtenerServicio()
  autorizacionPrevia = conAutorizacion
  try {
    await servicio.entrarConGoogle()
  } catch (error) {
    autorizacionPrevia = false
    throw error
  }
}

export async function recuperarContrasena(correo: string): Promise<void> {
  await (await obtenerServicio()).recuperarContrasena(correo)
}

export async function aceptarAutorizacion(): Promise<void> {
  if (!usuarioActual) return
  const servicio = await obtenerServicio()
  await servicio.crearPerfil(usuarioActual.uid, VERSION_POLITICA)
  await alCambiarUsuario(servicio, usuarioActual)
}

/** Rechazó la autorización: la cuenta se borra. Si Firebase pide confirmar identidad, el error sube a la pantalla. */
export async function rechazarAutorizacion(): Promise<void> {
  await (await obtenerServicio()).borrarUsuario()
}

export async function confirmarIdentidad(contrasena?: string): Promise<void> {
  await (await obtenerServicio()).confirmarIdentidad(contrasena)
}

export async function cerrarSesion(): Promise<void> {
  const servicio = await obtenerServicio()
  await datosActivos?.guardarPendientes()
  await servicio.salir()
}

function suscribir(oyente: () => void) {
  oyentes.add(oyente)
  return () => oyentes.delete(oyente)
}

export function useSesion(): Sesion {
  return useSyncExternalStore(suscribir, leerSesion, leerSesion)
}

/** Para las páginas de cuenta: carga el SDK aunque no haya pista. */
export function useSesionVerificada(): Sesion {
  useEffect(asegurarSesion, [])
  return useSesion()
}

/** Para la cabecera: solo trae el SDK si este navegador tenía una sesión. */
export function useSesionSiHayPista(): Sesion {
  useEffect(() => {
    if (hayPista()) asegurarSesion()
  }, [])
  return useSesion()
}
