// Firebase responde con códigos en inglés. Aquí se traducen a lo que pasó y cómo arreglarlo; el código crudo nunca se muestra.

export type CampoError = 'correo' | 'contrasena'

interface Traduccion {
  mensaje: string
  /** Si el error es de un campo, se muestra junto a él. */
  campo?: CampoError
}

const CREDENCIALES: Traduccion = { mensaje: 'El correo o la contraseña no coinciden. Revísalos, o usa «Olvidé mi contraseña».', campo: 'contrasena' }
const REDES: Traduccion = { mensaje: 'No hay conexión con el servidor. Revisa tu internet e intenta de nuevo.' }
const CONFIGURACION: Traduccion = { mensaje: 'Las cuentas tienen un problema de configuración en este sitio. Escríbenos desde Contacto para corregirlo.' }
const SESION: Traduccion = { mensaje: 'Tu sesión se cerró. Entra de nuevo para continuar.' }

const TRADUCCIONES: Record<string, Traduccion> = {
  'auth/email-already-in-use': { mensaje: 'Ya hay una cuenta con ese correo. Entra con tu contraseña o con Google, o usa «Olvidé mi contraseña».', campo: 'correo' },
  'auth/invalid-email': { mensaje: 'Revisa el correo: debe verse como nombre@correo.com.', campo: 'correo' },
  'auth/missing-email': { mensaje: 'Escribe tu correo.', campo: 'correo' },
  'auth/weak-password': { mensaje: 'Esa contraseña es muy débil. Usa al menos 8 caracteres, mejor una frase que puedas recordar.', campo: 'contrasena' },
  'auth/missing-password': { mensaje: 'Escribe tu contraseña.', campo: 'contrasena' },
  'auth/invalid-credential': CREDENCIALES,
  'auth/invalid-login-credentials': CREDENCIALES,
  'auth/wrong-password': CREDENCIALES,
  'auth/user-not-found': CREDENCIALES,
  'auth/user-mismatch': { mensaje: 'Esa cuenta no es la que tiene la sesión abierta. Confirma con la misma cuenta con la que entraste.' },
  'auth/user-disabled': { mensaje: 'Esta cuenta está desactivada. Escribe a contacto@sergio-velandia.dev para revisarla.' },
  'auth/too-many-requests': { mensaje: 'Hubo demasiados intentos seguidos. Espera unos minutos e intenta de nuevo.' },
  'auth/network-request-failed': REDES,
  'auth/popup-closed-by-user': { mensaje: 'Cerraste la ventana de Google antes de terminar. Intenta de nuevo cuando quieras.' },
  'auth/cancelled-popup-request': { mensaje: 'Se abrió otra ventana de Google. Termina en esa, o intenta de nuevo.' },
  'auth/popup-blocked': { mensaje: 'El navegador bloqueó la ventana de Google. Permite las ventanas emergentes de este sitio e intenta de nuevo.' },
  'auth/account-exists-with-different-credential': { mensaje: 'Ya hay una cuenta con ese correo. Entra con tu contraseña, o usa «Olvidé mi contraseña».', campo: 'correo' },
  'auth/requires-recent-login': { mensaje: 'Por seguridad, confirma tu identidad otra vez para continuar.' },
  'auth/no-current-user': SESION,
  'auth/unauthorized-domain': CONFIGURACION,
  'auth/operation-not-allowed': CONFIGURACION,
  'auth/invalid-api-key': CONFIGURACION,
  'auth/api-key-not-valid': CONFIGURACION,
  'permission-denied': { mensaje: 'No se pudo guardar: el servidor no lo permitió. Recarga la página; si sigue pasando, escríbenos desde Contacto.' },
  unauthenticated: SESION,
  unavailable: REDES,
  'deadline-exceeded': REDES,
  'resource-exhausted': { mensaje: 'Por hoy se llegó al límite del plan gratuito del recetario. Tus datos están a salvo; intenta de nuevo mañana.' },
}

const GENERAL: Traduccion = { mensaje: 'Algo falló y no se pudo completar. Intenta de nuevo; si sigue pasando, escríbenos desde Contacto.' }

export function codigoDe(error: unknown): string {
  const codigo = (error as { code?: unknown } | null)?.code
  return typeof codigo === 'string' ? codigo.replace(/^firestore\//, '') : ''
}

export function traducirError(error: unknown): Traduccion {
  const codigo = codigoDe(error)
  // La clave de API restringida responde con el dominio en el código: auth/requests-from-referer-…-are-blocked.
  if (codigo.startsWith('auth/requests-from-referer')) return CONFIGURACION
  return TRADUCCIONES[codigo] ?? GENERAL
}

export const mensajeDeError = (error: unknown): string => traducirError(error).mensaje
