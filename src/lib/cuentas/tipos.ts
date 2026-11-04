// Lo que la app necesita de Firebase. La implementación real está en firebase.ts, que se carga bajo demanda;
// las pruebas de pantallas usan una en memoria (src/test/cuentasFalsas.ts).

export interface UsuarioSesion {
  uid: string
  correo: string | null
  /** Solo si entró con Google: el nombre de su perfil. */
  nombre: string | null
  /** 'password', 'google.com'. */
  proveedores: string[]
  creada: string | null
}

export interface PerfilGuardado {
  autorizacion: { version: string; fecha: string | null }
  /** La lista de compras como JSON. Se valida al leerla. */
  lista: string
  conteoRecetas: number
  conteoInteracciones: number
}

export interface Interaccion {
  favorita: boolean
  /** Fecha AAAA-MM-DD en que la probó, o vacío. */
  probada: string
  nota: string
}

/** Una receta personal en Firestore. Las listas son textos porque las reglas solo pueden medir el total de textos. */
export interface RecetaDoc {
  titulo: string
  resumen: string
  categoria: string
  porcionesBase: number
  tiempoMin: number
  ingredientes: string[]
  miseEnPlace: string[]
  pasos: string[]
}

export interface ServicioCuentas {
  observarSesion: (oyente: (usuario: UsuarioSesion | null) => void) => () => void
  crearConCorreo: (correo: string, contrasena: string) => Promise<void>
  entrarConCorreo: (correo: string, contrasena: string) => Promise<void>
  entrarConGoogle: () => Promise<void>
  recuperarContrasena: (correo: string) => Promise<void>
  salir: () => Promise<void>
  /** Firebase pide haber entrado hace poco para borrar la cuenta. Sin contraseña, usa la ventana de Google. */
  confirmarIdentidad: (contrasena?: string) => Promise<void>
  borrarUsuario: () => Promise<void>

  leerPerfil: (uid: string) => Promise<PerfilGuardado | null>
  crearPerfil: (uid: string, versionPolitica: string) => Promise<void>
  borrarPerfil: (uid: string) => Promise<void>
  guardarLista: (uid: string, lista: string) => Promise<void>

  leerInteracciones: (uid: string) => Promise<Record<string, Interaccion>>
  crearInteraccion: (uid: string, slug: string, datos: Interaccion) => Promise<void>
  actualizarInteraccion: (uid: string, slug: string, datos: Interaccion) => Promise<void>
  borrarInteraccion: (uid: string, slug: string) => Promise<void>

  leerRecetas: (uid: string) => Promise<Record<string, unknown>>
  crearReceta: (uid: string, id: string, datos: RecetaDoc) => Promise<void>
  actualizarReceta: (uid: string, id: string, datos: RecetaDoc) => Promise<void>
  borrarReceta: (uid: string, id: string) => Promise<void>
}
