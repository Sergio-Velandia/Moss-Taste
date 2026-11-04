// Pista de que este navegador tenía una sesión, para saber si vale la pena descargar el SDK de Firebase.
// Solo eso: no decide qué se muestra ni a qué ruta se entra (eso lo dice Firebase). Si alguien la pone a mano,
// lo peor que pasa es que se descargue el SDK de más.
export const CLAVE_PISTA = 'moss-taste:sesion'

export function hayPista(): boolean {
  try {
    return window.localStorage.getItem(CLAVE_PISTA) === '1'
  } catch {
    return false
  }
}

export function fijarPista(activa: boolean): void {
  try {
    if (activa) window.localStorage.setItem(CLAVE_PISTA, '1')
    else window.localStorage.removeItem(CLAVE_PISTA)
  } catch {
    // Sin almacenamiento: el SDK se descarga solo al entrar a /acceso o a /mi-cocina.
  }
}
