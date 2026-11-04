import { initializeApp } from 'firebase/app'
import {
  browserLocalPersistence,
  browserPopupRedirectResolver,
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  deleteUser,
  EmailAuthProvider,
  GoogleAuthProvider,
  indexedDBLocalPersistence,
  initializeAuth,
  onAuthStateChanged,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth'
import { collection, connectFirestoreEmulator, deleteDoc, doc, getDoc, getDocs, getFirestore, increment, serverTimestamp, setDoc, updateDoc, writeBatch } from 'firebase/firestore/lite'
import { configFirebase } from './config'
import type { Interaccion, ServicioCuentas, UsuarioSesion } from './tipos'

// El único archivo que importa Firebase, y solo se carga con import() cuando hace falta una cuenta:
// quien solo mira recetas no descarga el SDK. Una prueba verifica que nadie lo importe de forma estática.
// Firestore lite: sin tiempo real ni caché en el navegador, y 100 KB menos.

const app = initializeApp(configFirebase())
const auth = initializeAuth(app, {
  persistence: [indexedDBLocalPersistence, browserLocalPersistence],
  popupRedirectResolver: browserPopupRedirectResolver,
})
auth.languageCode = 'es'
const db = getFirestore(app)
// Solo para probar la app completa contra los emuladores. En el sitio publicado esta variable no existe.
if (import.meta.env.VITE_FIREBASE_EMULADOR === '1') {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
  connectFirestoreEmulator(db, '127.0.0.1', 8080)
}

function proveedorGoogle() {
  // Deja elegir cuenta en vez de entrar con la última que usó el navegador (importa en un computador compartido).
  return new GoogleAuthProvider().setCustomParameters({ prompt: 'select_account' })
}

function aUsuario(u: User): UsuarioSesion {
  return {
    uid: u.uid,
    correo: u.email,
    nombre: u.displayName,
    proveedores: u.providerData.map((p) => p.providerId),
    creada: u.metadata.creationTime ?? null,
  }
}

function usuarioActual(): User {
  if (!auth.currentUser) throw Object.assign(new Error('Sin sesión'), { code: 'auth/no-current-user' })
  return auth.currentUser
}

const rutaPerfil = (uid: string) => doc(db, 'usuarios', uid)
const rutaInteraccion = (uid: string, slug: string) => doc(db, 'usuarios', uid, 'interacciones', slug)
const rutaReceta = (uid: string, id: string) => doc(db, 'usuarios', uid, 'recetas', id)

const aFecha = (valor: unknown) => (valor && typeof valor === 'object' && 'toDate' in valor ? (valor as { toDate: () => Date }).toDate().toISOString() : null)

// Los contadores cambian en la misma escritura que el documento que cuentan: las reglas lo exigen.
function conContador(uid: string, cambio: 1 | -1, coleccion: 'recetas' | 'interacciones', id: string, escribir: (lote: ReturnType<typeof writeBatch>) => void) {
  const lote = writeBatch(db)
  escribir(lote)
  lote.update(rutaPerfil(uid), coleccion === 'recetas' ? { conteoRecetas: increment(cambio), ultimaReceta: id } : { conteoInteracciones: increment(cambio), ultimaInteraccion: id })
  return lote.commit()
}

const conFecha = (datos: Interaccion) => ({ ...datos, actualizada: serverTimestamp() })

export const servicio: ServicioCuentas = {
  observarSesion: (oyente) => onAuthStateChanged(auth, (u) => oyente(u ? aUsuario(u) : null)),
  crearConCorreo: async (correo, contrasena) => void (await createUserWithEmailAndPassword(auth, correo, contrasena)),
  entrarConCorreo: async (correo, contrasena) => void (await signInWithEmailAndPassword(auth, correo, contrasena)),
  entrarConGoogle: async () => void (await signInWithPopup(auth, proveedorGoogle())),
  recuperarContrasena: (correo) => sendPasswordResetEmail(auth, correo),
  salir: () => signOut(auth),
  async confirmarIdentidad(contrasena) {
    const u = usuarioActual()
    if (contrasena !== undefined) await reauthenticateWithCredential(u, EmailAuthProvider.credential(u.email ?? '', contrasena))
    else await reauthenticateWithPopup(u, proveedorGoogle())
  },
  borrarUsuario: () => deleteUser(usuarioActual()),

  async leerPerfil(uid) {
    const foto = await getDoc(rutaPerfil(uid))
    if (!foto.exists()) return null
    const d = foto.data()
    return {
      autorizacion: { version: String(d.autorizacion?.version ?? ''), fecha: aFecha(d.autorizacion?.fecha) },
      lista: typeof d.lista === 'string' ? d.lista : '',
      conteoRecetas: Number(d.conteoRecetas ?? 0),
      conteoInteracciones: Number(d.conteoInteracciones ?? 0),
    }
  },
  crearPerfil: (uid, versionPolitica) =>
    setDoc(rutaPerfil(uid), {
      autorizacion: { acepta: true, version: versionPolitica, fecha: serverTimestamp() },
      conteoRecetas: 0,
      conteoInteracciones: 0,
      ultimaReceta: '',
      ultimaInteraccion: '',
      lista: '',
    }),
  borrarPerfil: (uid) => deleteDoc(rutaPerfil(uid)),
  guardarLista: (uid, lista) => updateDoc(rutaPerfil(uid), { lista }),

  async leerInteracciones(uid) {
    const fotos = await getDocs(collection(db, 'usuarios', uid, 'interacciones'))
    return Object.fromEntries(
      fotos.docs.map((f) => {
        const d = f.data()
        return [f.id, { favorita: d.favorita === true, probada: typeof d.probada === 'string' ? d.probada : '', nota: typeof d.nota === 'string' ? d.nota : '' }]
      }),
    )
  },
  crearInteraccion: (uid, slug, datos) => conContador(uid, 1, 'interacciones', slug, (lote) => lote.set(rutaInteraccion(uid, slug), conFecha(datos))),
  actualizarInteraccion: (uid, slug, datos) => setDoc(rutaInteraccion(uid, slug), conFecha(datos)),
  borrarInteraccion: (uid, slug) => conContador(uid, -1, 'interacciones', slug, (lote) => lote.delete(rutaInteraccion(uid, slug))),

  async leerRecetas(uid) {
    const fotos = await getDocs(collection(db, 'usuarios', uid, 'recetas'))
    return Object.fromEntries(fotos.docs.map((f) => [f.id, f.data()]))
  },
  crearReceta: (uid, id, datos) =>
    conContador(uid, 1, 'recetas', id, (lote) => lote.set(rutaReceta(uid, id), { ...datos, creada: serverTimestamp(), actualizada: serverTimestamp() })),
  actualizarReceta: (uid, id, datos) => updateDoc(rutaReceta(uid, id), { ...datos, actualizada: serverTimestamp() }),
  borrarReceta: (uid, id) => conContador(uid, -1, 'recetas', id, (lote) => lote.delete(rutaReceta(uid, id))),
}
