import { describe, expect, it } from 'vitest'
import { INGREDIENTES, recetaPorSlug, RECETAS } from './recetas/catalogo'
import { sugerirRecetas } from './recetas/hoy'
import { sumarLista } from './recetas/lista'
import type { Receta } from './recetas/tipos'
import { validarAcceso, validarContacto, validarCorreo, type DatosContacto } from './validarFormularios'

describe('sugerirRecetas', () => {
  const ids = (tengo: string[], max: number | null = null) => sugerirRecetas(RECETAS, tengo, max, INGREDIENTES).map((s) => s.receta.id)

  it('sin ingredientes marcados no sugiere nada', () => {
    expect(ids([])).toEqual([])
  })

  it('ordena por lo que menos falta y dice qué falta', () => {
    const [primera] = sugerirRecetas(RECETAS, ['leche', 'arroz', 'azucar', 'canela', 'mantequilla'], null, INGREDIENTES)
    expect(primera?.receta.id).toBe('arroz-con-leche')
    expect(primera?.faltan).toEqual([])
    expect(ids(['leche'])).toEqual(expect.arrayContaining(['arroz-con-leche', 'arepas-de-queso']))
  })

  it('los ingredientes al gusto no cuentan como faltantes', () => {
    const arepas = sugerirRecetas(RECETAS, ['harina-maiz', 'leche', 'queso-campesino', 'mantequilla'], null, INGREDIENTES).find(
      (s) => s.receta.id === 'arepas-de-queso',
    )
    expect(arepas?.faltan).toEqual([])
  })

  it('respeta el presupuesto por porción', () => {
    expect(ids(['pechuga-pollo', 'leche'], 5000)).not.toContain('ajiaco-santafereno')
  })
})

describe('sumarLista', () => {
  it('junta el mismo ingrediente de varias recetas', () => {
    const recetas = [recetaPorSlug('arepas-de-queso'), recetaPorSlug('arroz-con-leche')].filter((r): r is Receta => r !== undefined)
    const lista = sumarLista(recetas.map((receta) => ({ receta, porciones: receta.porcionesBase })), INGREDIENTES)
    const leche = lista.find((i) => i.idIngrediente === 'leche')
    expect(leche?.cantidad).toBe(2100)
    expect(leche?.recetas).toEqual(['Arepas de queso', 'Arroz con leche'])
    expect(leche?.subtotal).toBe(8820)
    // 3 cucharadas + 1½ cucharadas de mantequilla, a 0,91 g/ml
    expect(lista.find((i) => i.idIngrediente === 'mantequilla')?.cantidad).toBeCloseTo(61.43, 2)
  })

  it('escala con las porciones de cada receta y suma la merma', () => {
    const ajiaco = recetaPorSlug('ajiaco-santafereno')
    if (!ajiaco) throw new Error('falta el ajiaco de ejemplo')
    const pollo = sumarLista([{ receta: ajiaco, porciones: 8 }], INGREDIENTES).find((i) => i.idIngrediente === 'pechuga-pollo')
    expect(pollo?.unidad).toBe('g')
    expect(pollo?.cantidad).toBeCloseTo(1777.78, 2)
    expect(pollo?.subtotal).toBe(32000)
  })

  it('una lista sin recetas está vacía', () => {
    expect(sumarLista([], INGREDIENTES)).toEqual([])
  })
})

describe('formularios', () => {
  const contacto: DatosContacto = { motivo: 'mensaje', nombre: 'Ana', correo: 'ana@correo.co', receta: '', mensaje: 'Hola, una pregunta.' }

  it('acepta un mensaje completo', () => {
    expect(validarContacto(contacto)).toEqual({})
  })

  it('pide los campos con mensajes que dicen cómo corregir', () => {
    const errores = validarContacto({ ...contacto, nombre: ' ', correo: 'ana@', mensaje: 'hola' })
    expect(errores.nombre).toMatch(/Escribe tu nombre/)
    expect(errores.correo).toMatch(/nombre@correo\.com/)
    expect(errores.mensaje).toMatch(/al menos 10/)
  })

  it('al proponer una receta exige su nombre y más detalle', () => {
    const errores = validarContacto({ ...contacto, motivo: 'receta', mensaje: 'Una receta rica.' })
    expect(errores.receta).toBeDefined()
    expect(errores.mensaje).toMatch(/ingredientes y los pasos/)
  })

  it('valida correos con espacios y sin dominio', () => {
    expect(validarCorreo('  ana@correo.co  ')).toBeUndefined()
    expect(validarCorreo('ana correo@x.co')).toBeDefined()
    expect(validarCorreo('ana@correo')).toBeDefined()
  })

  it('al crear cuenta exige contraseña de 8 caracteres; al entrar, solo que exista', () => {
    expect(validarAcceso('ana@correo.co', 'corta', true).contrasena).toMatch(/8 caracteres/)
    expect(validarAcceso('ana@correo.co', 'corta', false)).toEqual({})
  })
})
