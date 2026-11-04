import type { Interaccion, PerfilGuardado, RecetaDoc, ServicioCuentas, UsuarioSesion } from '@/lib/cuentas/tipos'

// Firebase en memoria para las pruebas de pantallas, con datos ficticios. Se usa con:
//   vi.mock('@/lib/cuentas/firebase', () => import('@/test/cuentasFalsas'))
// Las reglas de seguridad de verdad se prueban aparte, contra el emulador (reglas/firestore.test.ts).

interface Cuenta {
  usuario: UsuarioSesion
  contrasena?: string
  perfil: PerfilGuardado | null
  interacciones: Record<string, Interaccion>
  recetas: Record<string, unknown>
}

const error = (code: string) => Object.assign(new Error(code), { code })

export const banco = {
  cuentas: new Map<string, Cuenta>(),
  actual: null as Cuenta | null,
  oyentes: new Set<(u: UsuarioSesion | null) => void>(),
  /** Quién entra con el próximo «Continuar con Google». */
  google: 'google@correo.co',
  /** Métodos que fallan una vez con este código: { crearInteraccion: 'permission-denied' }. */
  fallas: {} as Partial<Record<keyof ServicioCuentas, string>>,
  /** true: borrar la cuenta pide confirmar identidad antes, como hace Firebase si la sesión es vieja. */
  pedirConfirmacion: false,
  llamadas: [] as string[],
}

function avisar() {
  const u = banco.actual?.usuario ?? null
  banco.oyentes.forEach((o) => o(u))
}

function nuevaCuenta(correo: string, proveedor: string, contrasena?: string): Cuenta {
  const cuenta: Cuenta = {
    usuario: { uid: `uid-${correo}`, correo, nombre: proveedor === 'google.com' ? 'Persona Ficticia' : null, proveedores: [proveedor], creada: '2026-11-04T00:00:00.000Z' },
    perfil: null,
    interacciones: {},
    recetas: {},
    ...(contrasena ? { contrasena } : {}),
  }
  banco.cuentas.set(correo, cuenta)
  return cuenta
}

/** Deja una cuenta creada; sin autorizar si se pide (la que cerró la pestaña a mitad). */
export function sembrarCuenta(correo: string, contrasena: string, opciones: { autorizada?: boolean; lista?: string } = {}): Cuenta {
  const cuenta = nuevaCuenta(correo, 'password', contrasena)
  if (opciones.autorizada !== false)
    cuenta.perfil = { autorizacion: { version: '2026-11-04', fecha: '2026-11-04T00:00:00.000Z' }, lista: opciones.lista ?? '', conteoRecetas: 0, conteoInteracciones: 0 }
  return cuenta
}

export function reiniciarBanco() {
  banco.cuentas.clear()
  banco.actual = null
  banco.google = 'google@correo.co'
  banco.fallas = {}
  banco.pedirConfirmacion = false
  banco.llamadas = []
  avisar()
}

function revisar(metodo: keyof ServicioCuentas) {
  banco.llamadas.push(metodo)
  const codigo = banco.fallas[metodo]
  if (codigo) {
    delete banco.fallas[metodo]
    throw error(codigo)
  }
}

function deUid(uid: string): Cuenta {
  const cuenta = [...banco.cuentas.values()].find((c) => c.usuario.uid === uid)
  if (!cuenta || banco.actual !== cuenta) throw error('permission-denied')
  return cuenta
}

/** Como las reglas: sin perfil no se puede leer ni escribir nada más. */
function registrada(uid: string): Cuenta {
  const cuenta = deUid(uid)
  if (!cuenta.perfil) throw error('permission-denied')
  return cuenta
}

export const servicio: ServicioCuentas = {
  observarSesion(oyente) {
    banco.oyentes.add(oyente)
    queueMicrotask(() => oyente(banco.actual?.usuario ?? null))
    return () => banco.oyentes.delete(oyente)
  },
  async crearConCorreo(correo, contrasena) {
    revisar('crearConCorreo')
    if (banco.cuentas.has(correo)) throw error('auth/email-already-in-use')
    banco.actual = nuevaCuenta(correo, 'password', contrasena)
    avisar()
  },
  async entrarConCorreo(correo, contrasena) {
    revisar('entrarConCorreo')
    const cuenta = banco.cuentas.get(correo)
    if (!cuenta || cuenta.contrasena !== contrasena) throw error('auth/invalid-credential')
    banco.actual = cuenta
    avisar()
  },
  async entrarConGoogle() {
    revisar('entrarConGoogle')
    banco.actual = banco.cuentas.get(banco.google) ?? nuevaCuenta(banco.google, 'google.com')
    avisar()
  },
  async recuperarContrasena() {
    revisar('recuperarContrasena')
  },
  async salir() {
    revisar('salir')
    banco.actual = null
    avisar()
  },
  async confirmarIdentidad(contrasena) {
    revisar('confirmarIdentidad')
    if (contrasena !== undefined && banco.actual?.contrasena !== contrasena) throw error('auth/invalid-credential')
    banco.pedirConfirmacion = false
  },
  async borrarUsuario() {
    revisar('borrarUsuario')
    if (banco.pedirConfirmacion) throw error('auth/requires-recent-login')
    if (banco.actual?.usuario.correo) banco.cuentas.delete(banco.actual.usuario.correo)
    banco.actual = null
    avisar()
  },

  async leerPerfil(uid) {
    revisar('leerPerfil')
    return deUid(uid).perfil
  },
  async crearPerfil(uid, version) {
    revisar('crearPerfil')
    deUid(uid).perfil = { autorizacion: { version, fecha: '2026-11-04T00:00:00.000Z' }, lista: '', conteoRecetas: 0, conteoInteracciones: 0 }
  },
  async borrarPerfil(uid) {
    revisar('borrarPerfil')
    const cuenta = registrada(uid)
    if (Object.keys(cuenta.recetas).length || Object.keys(cuenta.interacciones).length) throw error('permission-denied')
    cuenta.perfil = null
  },
  async guardarLista(uid, lista) {
    revisar('guardarLista')
    const perfil = registrada(uid).perfil as PerfilGuardado
    perfil.lista = lista
  },

  async leerInteracciones(uid) {
    revisar('leerInteracciones')
    return { ...registrada(uid).interacciones }
  },
  async crearInteraccion(uid, slug, datos) {
    revisar('crearInteraccion')
    registrada(uid).interacciones[slug] = datos
  },
  async actualizarInteraccion(uid, slug, datos) {
    revisar('actualizarInteraccion')
    registrada(uid).interacciones[slug] = datos
  },
  async borrarInteraccion(uid, slug) {
    revisar('borrarInteraccion')
    delete registrada(uid).interacciones[slug]
  },

  async leerRecetas(uid) {
    revisar('leerRecetas')
    return { ...registrada(uid).recetas }
  },
  async crearReceta(uid, id, datos: RecetaDoc) {
    revisar('crearReceta')
    registrada(uid).recetas[id] = datos
  },
  async actualizarReceta(uid, id, datos: RecetaDoc) {
    revisar('actualizarReceta')
    registrada(uid).recetas[id] = datos
  },
  async borrarReceta(uid, id) {
    revisar('borrarReceta')
    delete registrada(uid).recetas[id]
  },
}
