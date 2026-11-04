import { assertFails, assertSucceeds, initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing'
import { collection, collectionGroup, deleteDoc, doc, getDoc, getDocs, increment, serverTimestamp, setDoc, updateDoc, writeBatch, type Firestore } from 'firebase/firestore'
import { readFileSync } from 'node:fs'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

let entorno: RulesTestEnvironment

beforeAll(async () => {
  entorno = await initializeTestEnvironment({ projectId: 'demo-moss-taste', firestore: { rules: readFileSync('firestore.rules', 'utf8') } })
})
afterAll(() => entorno.cleanup())
beforeEach(() => entorno.clearFirestore())

const ANA = 'ana-uid'
const BETO = 'beto-uid'
const RECETA = 'mia-abcd1234'
const SLUG = 'ajiaco-santafereno'

const de = (uid: string) => entorno.authenticatedContext(uid).firestore() as unknown as Firestore
const anonimo = () => entorno.unauthenticatedContext().firestore() as unknown as Firestore

const perfilNuevo = () => ({
  autorizacion: { acepta: true, version: '2026-11-04', fecha: serverTimestamp() },
  conteoRecetas: 0,
  conteoInteracciones: 0,
  ultimaReceta: '',
  ultimaInteraccion: '',
  lista: '',
})
const receta = (cambios: object = {}) => ({
  titulo: 'Sancocho ficticio',
  resumen: '',
  categoria: 'sopas',
  porcionesBase: 4,
  tiempoMin: 60,
  ingredientes: ['{"ingrediente":"papa","cantidad":3,"unidad":"unidad"}'],
  miseEnPlace: [],
  pasos: ['{"texto":"Hierve todo."}'],
  creada: serverTimestamp(),
  actualizada: serverTimestamp(),
  ...cambios,
})
const interaccion = (cambios: object = {}) => ({ favorita: true, probada: '', nota: '', actualizada: serverTimestamp(), ...cambios })

/** Prepara datos saltándose las reglas, como si ya estuvieran guardados. */
async function sembrar(datos: Record<string, object>) {
  await entorno.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore()
    for (const [ruta, valor] of Object.entries(datos)) await setDoc(doc(db, ruta), valor)
  })
}
const perfilGuardado = (cambios: object = {}) => ({
  autorizacion: { acepta: true, version: '2026-11-04', fecha: new Date('2026-11-04') },
  conteoRecetas: 0,
  conteoInteracciones: 0,
  ultimaReceta: '',
  ultimaInteraccion: '',
  lista: '',
  ...cambios,
})

function crearReceta(db: Firestore, uid: string, id: string, datos: object = receta()) {
  const lote = writeBatch(db)
  lote.set(doc(db, `usuarios/${uid}/recetas/${id}`), datos)
  lote.update(doc(db, `usuarios/${uid}`), { conteoRecetas: increment(1), ultimaReceta: id })
  return lote.commit()
}
function borrarReceta(db: Firestore, uid: string, id: string) {
  const lote = writeBatch(db)
  lote.delete(doc(db, `usuarios/${uid}/recetas/${id}`))
  lote.update(doc(db, `usuarios/${uid}`), { conteoRecetas: increment(-1), ultimaReceta: id })
  return lote.commit()
}
function crearInteraccion(db: Firestore, uid: string, slug: string, datos: object = interaccion()) {
  const lote = writeBatch(db)
  lote.set(doc(db, `usuarios/${uid}/interacciones/${slug}`), datos)
  lote.update(doc(db, `usuarios/${uid}`), { conteoInteracciones: increment(1), ultimaInteraccion: slug })
  return lote.commit()
}
function borrarInteraccion(db: Firestore, uid: string, slug: string) {
  const lote = writeBatch(db)
  lote.delete(doc(db, `usuarios/${uid}/interacciones/${slug}`))
  lote.update(doc(db, `usuarios/${uid}`), { conteoInteracciones: increment(-1), ultimaInteraccion: slug })
  return lote.commit()
}

describe('una cuenta no puede tocar los datos de otra', () => {
  beforeEach(() =>
    sembrar({
      [`usuarios/${ANA}`]: perfilGuardado({ conteoRecetas: 1, conteoInteracciones: 1, lista: '{"recetas":[],"comprados":[]}' }),
      [`usuarios/${ANA}/recetas/${RECETA}`]: receta({ creada: new Date(), actualizada: new Date() }),
      [`usuarios/${ANA}/interacciones/${SLUG}`]: interaccion({ nota: 'Secreto de Ana', actualizada: new Date() }),
      [`usuarios/${BETO}`]: perfilGuardado(),
    }),
  )

  it('la dueña sí puede leer lo suyo (la prueba de abajo no pasa por otra razón)', async () => {
    const db = de(ANA)
    expect((await assertSucceeds(getDoc(doc(db, `usuarios/${ANA}/interacciones/${SLUG}`)))).data()?.nota).toBe('Secreto de Ana')
    await assertSucceeds(getDoc(doc(db, `usuarios/${ANA}`)))
    await assertSucceeds(getDocs(collection(db, `usuarios/${ANA}/recetas`)))
  })

  for (const [quien, db] of [
    ['otra cuenta registrada', () => de(BETO)],
    ['alguien sin sesión', anonimo],
  ] as const) {
    it(`${quien} no puede leer el perfil, las recetas ni las notas`, async () => {
      await assertFails(getDoc(doc(db(), `usuarios/${ANA}`)))
      await assertFails(getDoc(doc(db(), `usuarios/${ANA}/recetas/${RECETA}`)))
      await assertFails(getDocs(collection(db(), `usuarios/${ANA}/recetas`)))
      await assertFails(getDoc(doc(db(), `usuarios/${ANA}/interacciones/${SLUG}`)))
      await assertFails(getDocs(collection(db(), `usuarios/${ANA}/interacciones`)))
    })

    it(`${quien} no puede listar a los usuarios ni buscar en todas las cuentas`, async () => {
      await assertFails(getDocs(collection(db(), 'usuarios')))
      await assertFails(getDocs(collectionGroup(db(), 'recetas')))
      await assertFails(getDocs(collectionGroup(db(), 'interacciones')))
    })

    it(`${quien} no puede crear, cambiar ni borrar nada`, async () => {
      await assertFails(updateDoc(doc(db(), `usuarios/${ANA}`), { lista: 'cambiada' }))
      await assertFails(deleteDoc(doc(db(), `usuarios/${ANA}`)))
      await assertFails(crearReceta(db(), ANA, 'mia-intruso12'))
      await assertFails(updateDoc(doc(db(), `usuarios/${ANA}/recetas/${RECETA}`), { titulo: 'Cambiada' }))
      await assertFails(borrarReceta(db(), ANA, RECETA))
      await assertFails(crearInteraccion(db(), ANA, 'changua'))
      await assertFails(setDoc(doc(db(), `usuarios/${ANA}/interacciones/${SLUG}`), interaccion({ nota: 'Cambiada' })))
      await assertFails(borrarInteraccion(db(), ANA, SLUG))
    })
  }

  it('otra cuenta no puede crear el perfil de alguien más', async () => {
    await assertFails(setDoc(doc(de(BETO), 'usuarios/carla-uid'), perfilNuevo()))
  })

  it('nada se guardó ni cambió tras los intentos de otra cuenta', async () => {
    await assertFails(updateDoc(doc(de(BETO), `usuarios/${ANA}/recetas/${RECETA}`), { titulo: 'Cambiada' }))
    const titulo = (await assertSucceeds(getDoc(doc(de(ANA), `usuarios/${ANA}/recetas/${RECETA}`)))).data()?.titulo
    expect(titulo).toBe('Sancocho ficticio')
  })

  it('fuera de /usuarios no se puede leer ni escribir nada', async () => {
    await assertFails(getDoc(doc(de(ANA), 'otra/cosa')))
    await assertFails(setDoc(doc(de(ANA), 'otra/cosa'), { a: 1 }))
  })
})

describe('sin autorización no hay cuenta usable', () => {
  // Cuenta de Authentication que cerró la pestaña antes de aceptar: no tiene documento de perfil.
  it('no puede leer ni escribir recetas, notas ni lista', async () => {
    const db = de(ANA)
    await assertFails(setDoc(doc(db, `usuarios/${ANA}/recetas/${RECETA}`), receta()))
    await assertFails(crearReceta(db, ANA, RECETA))
    await assertFails(crearInteraccion(db, ANA, SLUG))
    await assertFails(setDoc(doc(db, `usuarios/${ANA}/interacciones/${SLUG}`), interaccion()))
    await assertFails(getDocs(collection(db, `usuarios/${ANA}/recetas`)))
    await assertFails(getDocs(collection(db, `usuarios/${ANA}/interacciones`)))
    await assertFails(updateDoc(doc(db, `usuarios/${ANA}`), { lista: 'x' }))
  })

  it('sí puede saber que no tiene perfil y crearlo aceptando', async () => {
    const db = de(ANA)
    expect((await assertSucceeds(getDoc(doc(db, `usuarios/${ANA}`)))).exists()).toBe(false)
    await assertSucceeds(setDoc(doc(db, `usuarios/${ANA}`), perfilNuevo()))
  })

  it.each([
    ['sin autorización', { autorizacion: undefined }],
    ['sin aceptar', { autorizacion: { acepta: false, version: 'v', fecha: serverTimestamp() } }],
    ['con una fecha inventada', { autorizacion: { acepta: true, version: 'v', fecha: new Date('2020-01-01') } }],
    ['con campos de más en la autorización', { autorizacion: { acepta: true, version: 'v', fecha: serverTimestamp(), extra: 1 } }],
    ['con contadores que no salen de cero', { conteoRecetas: -50 }],
    ['con campos de más', { admin: true }],
    ['con un «último» ya puesto', { ultimaReceta: RECETA }],
  ])('no se crea el perfil %s', async (_, cambios) => {
    const datos = Object.fromEntries(Object.entries({ ...perfilNuevo(), ...cambios }).filter(([, v]) => v !== undefined))
    await assertFails(setDoc(doc(de(ANA), `usuarios/${ANA}`), datos))
  })

  it('la autorización guardada no se puede reescribir', async () => {
    await sembrar({ [`usuarios/${ANA}`]: perfilGuardado() })
    await assertFails(updateDoc(doc(de(ANA), `usuarios/${ANA}`), { 'autorizacion.version': 'otra' }))
  })
})

describe('topes y contadores', () => {
  const llena = perfilGuardado({ conteoRecetas: 100, ultimaReceta: RECETA })

  it('la prueba pedida: con 100 recetas no puede poner su contador en 0', async () => {
    await sembrar({ [`usuarios/${ANA}`]: llena, [`usuarios/${ANA}/recetas/${RECETA}`]: receta({ creada: new Date(), actualizada: new Date() }) })
    await assertFails(updateDoc(doc(de(ANA), `usuarios/${ANA}`), { conteoRecetas: 0 }))
  })

  it('tampoco puede bajarlo en 1 sin borrar, ni nombrando una receta que no borra', async () => {
    await sembrar({ [`usuarios/${ANA}`]: llena, [`usuarios/${ANA}/recetas/${RECETA}`]: receta({ creada: new Date(), actualizada: new Date() }) })
    await assertFails(updateDoc(doc(de(ANA), `usuarios/${ANA}`), { conteoRecetas: 99 }))
    await assertFails(updateDoc(doc(de(ANA), `usuarios/${ANA}`), { conteoRecetas: 99, ultimaReceta: RECETA }))
    await assertFails(updateDoc(doc(de(ANA), `usuarios/${ANA}`), { conteoRecetas: 99, ultimaReceta: 'mia-noexiste1' }))
  })

  it('con 100 recetas no puede crear otra', async () => {
    await sembrar({ [`usuarios/${ANA}`]: llena })
    await assertFails(crearReceta(de(ANA), ANA, 'mia-sobrante1'))
  })

  it('no puede subir el contador sin crear ni saltarse números', async () => {
    await sembrar({ [`usuarios/${ANA}`]: perfilGuardado() })
    await assertFails(updateDoc(doc(de(ANA), `usuarios/${ANA}`), { conteoRecetas: 1, ultimaReceta: RECETA }))
    const db = de(ANA)
    const lote = writeBatch(db)
    lote.set(doc(db, `usuarios/${ANA}/recetas/${RECETA}`), receta())
    lote.update(doc(db, `usuarios/${ANA}`), { conteoRecetas: 2, ultimaReceta: RECETA })
    await assertFails(lote.commit())
  })

  it('no puede crear una receta sin subir el contador', async () => {
    await sembrar({ [`usuarios/${ANA}`]: perfilGuardado() })
    await assertFails(setDoc(doc(de(ANA), `usuarios/${ANA}/recetas/${RECETA}`), receta()))
  })

  it('no puede crear dos recetas por el precio de una', async () => {
    await sembrar({ [`usuarios/${ANA}`]: perfilGuardado() })
    const db = de(ANA)
    const lote = writeBatch(db)
    lote.set(doc(db, `usuarios/${ANA}/recetas/${RECETA}`), receta())
    lote.set(doc(db, `usuarios/${ANA}/recetas/mia-otra12345`), receta())
    lote.update(doc(db, `usuarios/${ANA}`), { conteoRecetas: increment(1), ultimaReceta: RECETA })
    await assertFails(lote.commit())
  })

  it('no puede cambiar una receta por otra dejando el contador igual', async () => {
    await sembrar({ [`usuarios/${ANA}`]: perfilGuardado({ conteoRecetas: 1, ultimaReceta: RECETA }), [`usuarios/${ANA}/recetas/${RECETA}`]: receta({ creada: new Date(), actualizada: new Date() }) })
    const db = de(ANA)
    const lote = writeBatch(db)
    lote.delete(doc(db, `usuarios/${ANA}/recetas/${RECETA}`))
    lote.set(doc(db, `usuarios/${ANA}/recetas/mia-otra12345`), receta())
    await assertFails(lote.commit())
  })

  it('no puede borrar una receta sin bajar el contador', async () => {
    await sembrar({ [`usuarios/${ANA}`]: perfilGuardado({ conteoRecetas: 1 }), [`usuarios/${ANA}/recetas/${RECETA}`]: receta({ creada: new Date(), actualizada: new Date() }) })
    await assertFails(deleteDoc(doc(de(ANA), `usuarios/${ANA}/recetas/${RECETA}`)))
  })

  it('no puede borrar el perfil para reiniciar los contadores con datos vivos', async () => {
    await sembrar({ [`usuarios/${ANA}`]: perfilGuardado({ conteoRecetas: 1 }), [`usuarios/${ANA}/recetas/${RECETA}`]: receta({ creada: new Date(), actualizada: new Date() }) })
    await assertFails(deleteDoc(doc(de(ANA), `usuarios/${ANA}`)))
  })

  it('los mismos candados valen para favoritos y notas', async () => {
    await sembrar({ [`usuarios/${ANA}`]: perfilGuardado({ conteoInteracciones: 300, ultimaInteraccion: SLUG }), [`usuarios/${ANA}/interacciones/${SLUG}`]: interaccion({ actualizada: new Date() }) })
    const db = de(ANA)
    await assertFails(updateDoc(doc(db, `usuarios/${ANA}`), { conteoInteracciones: 0 }))
    await assertFails(updateDoc(doc(db, `usuarios/${ANA}`), { conteoInteracciones: 299 }))
    await assertFails(crearInteraccion(db, ANA, 'changua'))
    await assertFails(deleteDoc(doc(db, `usuarios/${ANA}/interacciones/${SLUG}`)))
    await assertFails(deleteDoc(doc(db, `usuarios/${ANA}`)))
  })

  it('el camino normal sí funciona: crear, editar, borrar todo y borrar el perfil', async () => {
    const db = de(ANA)
    await assertSucceeds(setDoc(doc(db, `usuarios/${ANA}`), perfilNuevo()))
    await assertSucceeds(crearReceta(db, ANA, RECETA))
    await assertSucceeds(crearReceta(db, ANA, 'mia-otra12345'))
    await assertSucceeds(updateDoc(doc(db, `usuarios/${ANA}/recetas/${RECETA}`), { titulo: 'Nuevo nombre', actualizada: serverTimestamp() }))
    await assertSucceeds(crearInteraccion(db, ANA, SLUG))
    await assertSucceeds(setDoc(doc(db, `usuarios/${ANA}/interacciones/${SLUG}`), interaccion({ nota: 'Más sal', probada: '2026-11-04' })))
    await assertSucceeds(updateDoc(doc(db, `usuarios/${ANA}`), { lista: '{"recetas":[],"comprados":[]}' }))
    const perfil = (await assertSucceeds(getDoc(doc(db, `usuarios/${ANA}`)))).data()
    expect([perfil?.conteoRecetas, perfil?.conteoInteracciones]).toEqual([2, 1])
    await assertFails(deleteDoc(doc(db, `usuarios/${ANA}`)))
    await assertSucceeds(borrarReceta(db, ANA, RECETA))
    await assertSucceeds(borrarReceta(db, ANA, 'mia-otra12345'))
    await assertSucceeds(borrarInteraccion(db, ANA, SLUG))
    await assertSucceeds(deleteDoc(doc(db, `usuarios/${ANA}`)))
  })

  it('una receta borrada libera su lugar y se puede volver a llegar a 100', async () => {
    await sembrar({ [`usuarios/${ANA}`]: llena, [`usuarios/${ANA}/recetas/${RECETA}`]: receta({ creada: new Date(), actualizada: new Date() }) })
    const db = de(ANA)
    await assertSucceeds(borrarReceta(db, ANA, RECETA))
    await assertSucceeds(crearReceta(db, ANA, 'mia-nueva1234'))
  })
})

describe('tipo y tamaño de cada campo', () => {
  beforeEach(() => sembrar({ [`usuarios/${ANA}`]: perfilGuardado() }))

  it('una receta válida en el límite pasa', async () => {
    await assertSucceeds(
      crearReceta(
        de(ANA),
        ANA,
        RECETA,
        receta({
          titulo: 't'.repeat(80),
          resumen: 'r'.repeat(200),
          porcionesBase: 50,
          tiempoMin: 1440,
          ingredientes: Array.from({ length: 40 }, () => 'i'.repeat(300)),
          miseEnPlace: Array.from({ length: 30 }, () => 'm'.repeat(310)),
          pasos: Array.from({ length: 40 }, () => 'p'.repeat(650)),
        }),
      ),
    )
  })

  it.each([
    ['título vacío', { titulo: '' }],
    ['título largo', { titulo: 't'.repeat(81) }],
    ['título que no es texto', { titulo: 5 }],
    ['resumen largo', { resumen: 'r'.repeat(201) }],
    ['porciones en cero', { porcionesBase: 0 }],
    ['porciones con decimales', { porcionesBase: 1.5 }],
    ['tiempo que no es número', { tiempoMin: '60' }],
    ['sin ingredientes', { ingredientes: [] }],
    ['41 ingredientes', { ingredientes: Array.from({ length: 41 }, () => 'i') }],
    ['ingredientes demasiado largos', { ingredientes: ['i'.repeat(12_001)] }],
    ['un ingrediente que no es texto', { ingredientes: [{ gigante: true }] }],
    ['sin pasos', { pasos: [] }],
    ['41 pasos', { pasos: Array.from({ length: 41 }, () => 'p') }],
    ['pasos demasiado largos', { pasos: ['p'.repeat(26_001)] }],
    ['31 tareas', { miseEnPlace: Array.from({ length: 31 }, () => 'm') }],
    ['campos de más', { publica: true }],
    ['fecha inventada', { actualizada: new Date('2020-01-01') }],
  ])('rechaza una receta con %s', async (_, cambios) => {
    await assertFails(crearReceta(de(ANA), ANA, RECETA, receta(cambios)))
  })

  it.each([
    ['con mayúsculas', 'mia-ABCD1234'],
    ['sin el prefijo', 'abcd1234'],
    ['demasiado corto', 'mia-abc'],
  ])('rechaza un id de receta %s', async (_, id) => {
    await assertFails(crearReceta(de(ANA), ANA, id))
  })

  it.each([
    ['nota de 2001 caracteres', { nota: 'n'.repeat(2001) }],
    ['nota que no es texto', { nota: 5 }],
    ['favorita que no es sí o no', { favorita: 'si' }],
    ['fecha de prueba rara', { probada: 'ayer' }],
    ['campos de más', { puntaje: 5 }],
  ])('rechaza una interacción con %s', async (_, cambios) => {
    await assertFails(crearInteraccion(de(ANA), ANA, SLUG, interaccion(cambios)))
  })

  it('una nota de 2000 caracteres pasa', async () => {
    await assertSucceeds(crearInteraccion(de(ANA), ANA, SLUG, interaccion({ nota: 'n'.repeat(2000) })))
  })

  it('rechaza una interacción sobre un id raro', async () => {
    await assertFails(crearInteraccion(de(ANA), ANA, 'No Es Un Slug'))
    await assertFails(crearInteraccion(de(ANA), ANA, 'x'.repeat(81)))
  })

  it('la lista es un texto de hasta 16.000 caracteres', async () => {
    const perfil = doc(de(ANA), `usuarios/${ANA}`)
    await assertSucceeds(updateDoc(perfil, { lista: 'l'.repeat(16_000) }))
    await assertFails(updateDoc(perfil, { lista: 'l'.repeat(16_001) }))
    await assertFails(updateDoc(perfil, { lista: { recetas: [] } }))
  })

  it('el perfil no admite campos de más', async () => {
    await assertFails(updateDoc(doc(de(ANA), `usuarios/${ANA}`), { admin: true }))
  })

  it('una receta no cambia su fecha de creación al editarla', async () => {
    await crearReceta(de(ANA), ANA, RECETA)
    await assertFails(updateDoc(doc(de(ANA), `usuarios/${ANA}/recetas/${RECETA}`), { creada: new Date('2020-01-01'), actualizada: serverTimestamp() }))
  })
})
