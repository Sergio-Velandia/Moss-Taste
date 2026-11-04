// Configuración web de Firebase. No es secreta: viaja al navegador. Lo que protege los datos son las reglas
// de Firestore y la restricción de la clave por dominio. Sin estos valores el sitio funciona, pero sin cuentas.
export function configFirebase() {
  return {
    apiKey: (import.meta.env.VITE_FIREBASE_API_KEY as string | undefined) ?? '',
    authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined) ?? '',
    projectId: (import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined) ?? '',
    appId: (import.meta.env.VITE_FIREBASE_APP_ID as string | undefined) ?? '',
  }
}

export const cuentasDisponibles = () => Object.values(configFirebase()).every(Boolean)

/** Fecha de la política de privacidad vigente. Se guarda con la autorización de cada cuenta. */
export const VERSION_POLITICA = '2026-11-04'

/** Los mismos topes que imponen las reglas de Firestore (firestore.rules). */
export const TOPES = { recetas: 100, interacciones: 300, nota: 2000, ingredientes: 40, pasos: 40, tareas: 30 } as const
