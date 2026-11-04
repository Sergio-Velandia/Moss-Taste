import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import { crearAlmacenCuenta, leerTextoLista, textoLista, ESPERA_GUARDADO_MS } from '@/lib/lista/almacenCuenta'
import { combinarListas } from '@/lib/lista/combinar'
import type { Ingrediente } from '@/lib/recetas/tipos'
import { traducirError } from './errores'
import { misDatosAJSON } from './misDatos'
import { docAReceta, FORM_VACIO, hayErrores, nuevoIdReceta, recetaADoc, recetaAForm, resolverIngrediente, validarFormReceta, type FormReceta } from './recetaPersonal'

const CATALOGO: Ingrediente[] = [
  { id: 'papa-criolla', nombre: 'Papa criolla', unidadBase: 'g', precio: 5000, porCantidad: 1000, fechaPrecio: '2026-11-02', merma: 0 },
  { id: 'cilantro', nombre: 'Cilantro', unidadBase: 'g', precio: 2000, porCantidad: 100, fechaPrecio: '2026-11-02', merma: 0 },
]
const ID = 'mia-abcd1234'

const form = (cambios: Partial<FormReceta> = {}): FormReceta => ({
  ...FORM_VACIO,
  titulo: 'Sancocho ficticio',
  categoria: 'sopas',
  porciones: '4',
  tiempo: '60',
  ingredientes: [{ nombre: 'papa criolla', cantidad: '1,5', unidad: 'kg', alGusto: false }],
  pasos: [{ texto: 'Hierve todo.', minutos: '30' }],
  ...cambios,
})

describe('errores de Firebase', () => {
  it.each([
    ['auth/email-already-in-use', 'correo', /Ya hay una cuenta con ese correo/],
    ['auth/weak-password', 'contrasena', /muy débil/],
    ['auth/invalid-credential', 'contrasena', /no coinciden/],
    ['auth/popup-blocked', undefined, /bloqueó la ventana/],
    ['auth/requests-from-referer-https://otro.dev-are-blocked.', undefined, /problema de configuración/],
    ['permission-denied', undefined, /el servidor no lo permitió/],
    ['firestore/unavailable', undefined, /No hay conexión/],
  ])('%s dice qué pasó, en español y junto a su campo', (code, campo, mensaje) => {
    const t = traducirError({ code })
    expect(t.mensaje).toMatch(mensaje)
    expect(t.campo).toBe(campo)
  })

  it('un error desconocido nunca muestra el código crudo', () => {
    const t = traducirError({ code: 'auth/algo-raro-en-ingles' })
    expect(t.mensaje).not.toContain('auth/')
    expect(t.mensaje).toMatch(/Algo falló/)
    expect(traducirError(null).mensaje).toMatch(/Algo falló/)
  })
})

describe('combinar la lista del navegador con la de la cuenta', () => {
  // Cada porción de arroz pide 100 de «arroz»; cada porción de sopa, 50 de «arroz» y 10 de «sal».
  const cantidades = (recetas: { id: string; porciones: number }[]) => {
    const m = new Map<string, number>()
    for (const { id, porciones } of recetas) {
      if (id === 'arroz') m.set('arroz', (m.get('arroz') ?? 0) + porciones * 100)
      if (id === 'sopa') {
        m.set('arroz', (m.get('arroz') ?? 0) + porciones * 50)
        m.set('sal', (m.get('sal') ?? 0) + porciones * 10)
      }
    }
    return m
  }

  it('no pierde nada: une las recetas de los dos lados', () => {
    const { estado, sinEspacio } = combinarListas({ recetas: [{ id: 'arroz', porciones: 4 }], comprados: [] }, { recetas: [{ id: 'sopa', porciones: 2 }], comprados: [] }, cantidades)
    expect(estado.recetas).toEqual([
      { id: 'arroz', porciones: 4 },
      { id: 'sopa', porciones: 2 },
    ])
    expect(sinEspacio).toEqual([])
  })

  it.each([
    [4, 8, 8],
    [8, 4, 8],
  ])('si la receta está en ambos (%i y %i porciones), gana la mayor', (enCuenta, enNavegador, gana) => {
    const { estado } = combinarListas({ recetas: [{ id: 'arroz', porciones: enCuenta }], comprados: [] }, { recetas: [{ id: 'arroz', porciones: enNavegador }], comprados: [] }, cantidades)
    expect(estado.recetas).toEqual([{ id: 'arroz', porciones: gana }])
  })

  it('una marca de comprado solo sobrevive si no aumentó la cantidad', () => {
    const cuenta = { recetas: [{ id: 'arroz', porciones: 4 }], comprados: ['arroz'] }
    const navegador = { recetas: [{ id: 'sopa', porciones: 2 }], comprados: ['sal'] }
    // El arroz sube (400 → 500): la marca se pierde. La sal sigue igual (20): la marca se queda.
    expect(combinarListas(cuenta, navegador, cantidades).estado.comprados).toEqual(['sal'])
  })

  it('una marca sobrevive si la misma lista ya pedía esa cantidad', () => {
    const lado = { recetas: [{ id: 'arroz', porciones: 4 }], comprados: ['arroz'] }
    expect(combinarListas(lado, lado, cantidades).estado).toEqual(lado)
  })

  it('si no caben, van primero las de la cuenta y avisa cuáles quedaron fuera', () => {
    const veinte = Array.from({ length: 20 }, (_, i) => ({ id: `r${i}`, porciones: 1 }))
    const { estado, sinEspacio } = combinarListas({ recetas: veinte, comprados: [] }, { recetas: [{ id: 'arroz', porciones: 1 }], comprados: [] }, cantidades)
    expect(estado.recetas).toHaveLength(20)
    expect(estado.recetas.some((r) => r.id === 'arroz')).toBe(false)
    expect(sinEspacio).toEqual(['arroz'])
  })
})

describe('la lista en la cuenta', () => {
  const vacia = { recetas: [], comprados: [] }

  it('guarda poco después de cada cambio, una sola vez', async () => {
    vi.useFakeTimers()
    const guardar = vi.fn(async () => {})
    const a = crearAlmacenCuenta(vacia, guardar)
    a.cambiar({ recetas: [{ id: 'a', porciones: 1 }], comprados: [] })
    a.cambiar({ recetas: [{ id: 'a', porciones: 2 }], comprados: [] })
    expect(guardar).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(ESPERA_GUARDADO_MS)
    expect(guardar).toHaveBeenCalledOnce()
    expect(guardar).toHaveBeenCalledWith(textoLista({ recetas: [{ id: 'a', porciones: 2 }], comprados: [] }))
    vi.useRealTimers()
  })

  it('si falla, conserva la lista y lo dice; el siguiente cambio reintenta', async () => {
    const guardar = vi.fn(async () => {}).mockRejectedValueOnce(new Error('sin red'))
    const a = crearAlmacenCuenta(vacia, guardar)
    a.cambiar({ recetas: [{ id: 'a', porciones: 1 }], comprados: [] })
    await a.guardarPendiente()
    expect(a.persistente()).toBe(false)
    expect(a.leer().recetas).toHaveLength(1)
    a.cambiar({ recetas: [{ id: 'a', porciones: 2 }], comprados: [] })
    await a.guardarPendiente()
    expect(a.persistente()).toBe(true)
  })

  it('trae lo de otro dispositivo, salvo si aquí hay algo sin guardar', async () => {
    const a = crearAlmacenCuenta(vacia, async () => {})
    const deOtro = textoLista({ recetas: [{ id: 'b', porciones: 3 }], comprados: [] })
    a.recibir(deOtro)
    expect(a.leer().recetas[0]?.id).toBe('b')
    a.cambiar({ recetas: [{ id: 'c', porciones: 1 }], comprados: [] })
    a.recibir(textoLista({ recetas: [{ id: 'd', porciones: 1 }], comprados: [] }))
    expect(a.leer().recetas[0]?.id).toBe('c')
    await a.guardarPendiente()
  })

  it('un texto dañado se lee como lista vacía', () => {
    expect(leerTextoLista('{no es json')).toEqual(vacia)
    expect(leerTextoLista('')).toEqual(vacia)
    expect(leerTextoLista('{"recetas":[{"id":"BAD ID","porciones":1},{"id":"ok","porciones":2}]}').recetas).toEqual([{ id: 'ok', porciones: 2 }])
  })
})

describe('recetas personales', () => {
  it('un nombre del catálogo se convierte en su id, sin importar tildes ni mayúsculas', () => {
    expect(resolverIngrediente('PAPA CRIOLLA', CATALOGO)).toBe('papa-criolla')
    expect(resolverIngrediente('  Ñame de la finca ', CATALOGO)).toBe('Ñame de la finca')
  })

  it('arma la receta con cantidades con coma y temporizador', () => {
    const { errores, receta } = validarFormReceta(form({ tareas: 'Pela las papas.\n\n  Corta el cilantro. ' }), CATALOGO, ID)
    expect(hayErrores(errores)).toBe(false)
    expect(receta).toMatchObject({
      id: ID,
      porcionesBase: 4,
      ingredientes: [{ ingrediente: 'papa-criolla', cantidad: 1.5, unidad: 'kg' }],
      miseEnPlace: ['Pela las papas.', 'Corta el cilantro.'],
      pasos: [{ texto: 'Hierve todo.', temporizadorMin: 30 }],
    })
  })

  it('un ingrediente fuera del catálogo guarda su nombre', () => {
    const { receta } = validarFormReceta(form({ ingredientes: [{ nombre: 'Ñame de la finca', cantidad: '2', unidad: 'unidad', alGusto: true }] }), CATALOGO, ID)
    expect(receta?.ingredientes[0]).toEqual({ ingrediente: 'Ñame de la finca', cantidad: 2, unidad: 'unidad', ajustarAlGusto: true })
  })

  it('valida cada campo con un mensaje claro, junto a su fila', () => {
    const { errores, receta } = validarFormReceta(
      form({
        titulo: ' ',
        categoria: '',
        porciones: '0',
        tiempo: 'mucho',
        resumen: 'r'.repeat(201),
        ingredientes: [
          { nombre: 'n'.repeat(61), cantidad: '1', unidad: 'g', alGusto: false },
          { nombre: 'Sal', cantidad: 'un poco', unidad: 'g', alGusto: false },
          { nombre: '', cantidad: '3', unidad: 'g', alGusto: false },
          { nombre: 'Sal', cantidad: '1', unidad: 'g', alGusto: false },
        ],
        pasos: [{ texto: 'p'.repeat(601), minutos: '' }, { texto: 'Bien', minutos: '0' }],
      }),
      CATALOGO,
      ID,
    )
    expect(receta).toBeUndefined()
    expect(errores.titulo).toMatch(/nombre de la receta/)
    expect(errores.categoria).toBeTruthy()
    expect(errores.porciones).toMatch(/1 a 50/)
    expect(errores.tiempo).toMatch(/minutos/)
    expect(errores.resumen).toMatch(/200/)
    expect(errores.ingredientes[0]?.nombre).toMatch(/60 caracteres/)
    expect(errores.ingredientes[1]?.cantidad).toMatch(/mayor que 0/)
    expect(errores.ingredientes[2]?.nombre).toMatch(/Escribe el ingrediente/)
    expect(errores.ingredientes[3]?.nombre).toMatch(/ya está en la receta/)
    expect(errores.pasos[0]?.texto).toMatch(/600/)
    expect(errores.pasos[1]?.minutos).toMatch(/1 a 600/)
  })

  it('exige al menos un ingrediente y un paso, y respeta los topes', () => {
    const vacia = validarFormReceta(form({ ingredientes: [{ nombre: '', cantidad: '', unidad: 'g', alGusto: false }], pasos: [{ texto: '', minutos: '' }] }), CATALOGO, ID).errores
    expect(vacia.ingredientes[0]?.nombre).toMatch(/al menos un ingrediente/)
    expect(vacia.pasos[0]?.texto).toMatch(/al menos un paso/)
    const muchos = Array.from({ length: 41 }, (_, i) => ({ nombre: `Cosa ${i}`, cantidad: '1', unidad: 'g' as const, alGusto: false }))
    expect(validarFormReceta(form({ ingredientes: muchos }), CATALOGO, ID).errores.ingredientes[40]?.nombre).toMatch(/40 ingredientes/)
    const pasos = Array.from({ length: 41 }, () => ({ texto: 'Paso', minutos: '' }))
    expect(validarFormReceta(form({ pasos }), CATALOGO, ID).errores.pasos[40]?.texto).toMatch(/40 pasos/)
  })

  it('un paso lleno de comillas que al guardarse supera el tope se avisa antes de escribir', () => {
    const pasos = Array.from({ length: 40 }, () => ({ texto: '"'.repeat(600), minutos: '' }))
    expect(validarFormReceta(form({ pasos }), CATALOGO, ID).errores.pasos[0]?.texto).toMatch(/demasiado largos/)
  })

  it('va al documento de Firestore y vuelve igual', () => {
    const { receta } = validarFormReceta(form({ tareas: 'Pela.' }), CATALOGO, ID)
    if (!receta) throw new Error('La receta debía ser válida')
    const doc = recetaADoc(receta)
    expect(doc.ingredientes.every((t) => typeof t === 'string')).toBe(true)
    expect(docAReceta(ID, doc)).toEqual(receta)
  })

  it.each([
    ['sin título', { titulo: '' }],
    ['ingrediente con JSON dañado', { ingredientes: ['{roto'] }],
    ['ingrediente con unidad inventada', { ingredientes: ['{"ingrediente":"a","cantidad":1,"unidad":"barril"}'] }],
    ['cantidad negativa', { ingredientes: ['{"ingrediente":"a","cantidad":-1,"unidad":"g"}'] }],
    ['paso vacío', { pasos: ['{"texto":""}'] }],
    ['porciones en cero', { porcionesBase: 0 }],
  ])('un documento %s no se muestra', (_, cambios) => {
    const base = { titulo: 'T', resumen: '', categoria: 'sopas', porcionesBase: 2, tiempoMin: 5, ingredientes: ['{"ingrediente":"a","cantidad":1,"unidad":"g"}'], miseEnPlace: [], pasos: ['{"texto":"Hazlo"}'] }
    expect(docAReceta(ID, base)).not.toBeNull()
    expect(docAReceta(ID, { ...base, ...cambios })).toBeNull()
  })

  it('al editar, el formulario muestra el nombre del catálogo y la coma decimal', () => {
    const { receta } = validarFormReceta(form(), CATALOGO, ID)
    if (!receta) throw new Error('La receta debía ser válida')
    const editable = recetaAForm(receta, new Map(CATALOGO.map((i) => [i.id, i])))
    expect(editable.ingredientes[0]).toEqual({ nombre: 'Papa criolla', cantidad: '1,5', unidad: 'kg', alGusto: false })
    expect(editable.pasos[0]).toEqual({ texto: 'Hierve todo.', minutos: '30' })
  })

  it('los ids cumplen lo que exigen las reglas y la lista de compras', () => {
    expect(nuevoIdReceta()).toMatch(/^mia-[a-z0-9]{8,32}$/)
  })
})

describe('exportar mis datos', () => {
  it('trae favoritos, notas, probadas, recetas, autorización y lista', () => {
    const texto = misDatosAJSON(
      {
        usuario: { uid: 'u', correo: 'ana@correo.co', nombre: null, proveedores: ['password'], creada: 'hoy' },
        autorizacion: { version: '2026-11-04', fecha: '2026-11-04T00:00:00.000Z' },
        interacciones: { a: { favorita: true, probada: '', nota: '' }, b: { favorita: false, probada: '2026-11-01', nota: 'Más sal' } },
        recetas: [],
        ilegibles: {},
        lista: { recetas: [{ id: 'a', porciones: 2 }], comprados: [] },
      },
      '2026-11-04',
    )
    const datos = JSON.parse(texto)
    expect(datos.cuenta.correo).toBe('ana@correo.co')
    expect(datos.favoritos).toEqual(['a'])
    expect(datos.probadas).toEqual([{ receta: 'b', fecha: '2026-11-01' }])
    expect(datos.notas).toEqual([{ receta: 'b', nota: 'Más sal' }])
    expect(datos.recetasPersonales).toEqual([])
    expect(datos.autorizacion.version).toBe('2026-11-04')
    expect(datos.listaDeCompras.recetas).toHaveLength(1)
    expect(datos.recetasIlegibles).toBeUndefined()
  })
})

// Quien solo mira recetas no descarga el SDK: Firebase vive en un solo archivo, y ese archivo se carga con import().
describe('carga diferida de Firebase', () => {
  function archivos(carpeta: string): string[] {
    return readdirSync(carpeta).flatMap((nombre) => {
      const ruta = join(carpeta, nombre)
      return statSync(ruta).isDirectory() ? archivos(ruta) : /\.tsx?$/.test(nombre) && !/\.test\.tsx?$/.test(nombre) ? [ruta] : []
    })
  }
  const fuentes = archivos('src').filter((r) => !r.replaceAll('\\', '/').startsWith('src/test/'))

  it('solo lib/cuentas/firebase.ts importa el paquete firebase', () => {
    const conFirebase = fuentes.filter((r) => /from '(firebase|@firebase)[/']/.test(readFileSync(r, 'utf8')))
    expect(conFirebase.map((r) => r.replaceAll('\\', '/'))).toEqual(['src/lib/cuentas/firebase.ts'])
  })

  it('nadie importa ese archivo de forma estática', () => {
    const estaticos = fuentes.filter((r) => /^import [^(]*from '(\.\/|@\/lib\/cuentas\/)firebase'/m.test(readFileSync(r, 'utf8')))
    expect(estaticos).toEqual([])
  })
})
