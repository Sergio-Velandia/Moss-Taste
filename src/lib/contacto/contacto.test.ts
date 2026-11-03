import { describe, expect, it, vi } from 'vitest'
import { SITIO } from '@/sitio'
import { armarCorreo, emailjsListo, enviarCorreo, ErrorEnvio, URL_EMAILJS } from './enviar'
import { bloqueo, CLAVE_ENVIOS, crearLimite, ESPERA_MS, MAX_POR_DIA } from './limite'

const RECETA = { motivo: 'receta', nombre: ' Ana ', correo: 'ana@correo.co ', receta: ' Sancocho ', mensaje: ' 1 gallina, 3 papas… ' } as const
const MINUTO = ESPERA_MS
const HORA = 60 * MINUTO

describe('armarCorreo', () => {
  it('una receta propuesta lleva su nombre en el asunto y en el cuerpo', () => {
    expect(armarCorreo(RECETA)).toEqual({
      tipo: 'Propuesta de receta',
      nombre: 'Ana',
      correo: 'ana@correo.co',
      asunto: '[Moss Taste] Receta propuesta: Sancocho',
      mensaje: 'Receta: Sancocho\n\nIngredientes y pasos:\n1 gallina, 3 papas…',
    })
  })

  it('un mensaje ignora el campo de receta', () => {
    const correo = armarCorreo({ ...RECETA, motivo: 'mensaje', mensaje: 'Hola' })
    expect(correo).toMatchObject({ tipo: 'Mensaje', asunto: '[Moss Taste] Mensaje de Ana', mensaje: 'Hola' })
  })
})

describe('enviarCorreo', () => {
  const parametros = armarCorreo(RECETA)

  it('está configurado y manda la plantilla a la API de EmailJS', async () => {
    expect(emailjsListo()).toBe(true)
    const fetchFalso = vi.fn(async () => new Response('OK', { status: 200 }))
    await enviarCorreo(parametros, fetchFalso)
    const [url, opciones] = fetchFalso.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe(URL_EMAILJS)
    expect(JSON.parse(opciones.body as string)).toEqual({
      service_id: SITIO.emailjs.serviceId,
      template_id: SITIO.emailjs.templateId,
      user_id: SITIO.emailjs.publicKey,
      template_params: parametros,
    })
  })

  it.each([
    ['sin-conexion', () => Promise.reject(new TypeError('Failed to fetch'))],
    ['limite-servicio', async () => new Response('Too many requests', { status: 429 })],
    ['error', async () => new Response('Bad request', { status: 400 })],
  ] as const)('distingue el fallo %s', async (motivo, respuesta) => {
    const error = await enviarCorreo(parametros, vi.fn(respuesta)).catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ErrorEnvio)
    expect((error as ErrorEnvio).motivo).toBe(motivo)
  })
})

function storageFalso(inicial: Record<string, string> = {}): Storage {
  const datos = new Map(Object.entries(inicial))
  return {
    getItem: (k) => datos.get(k) ?? null,
    setItem: (k, v) => void datos.set(k, v),
    removeItem: (k) => void datos.delete(k),
    clear: () => datos.clear(),
    key: () => null,
    get length() {
      return datos.size
    },
  }
}

describe('tope de envíos', () => {
  it('pide esperar un minuto entre envíos y dice cuántos segundos faltan', () => {
    expect(bloqueo([], 0)).toBeNull()
    expect(bloqueo([1000], 1000 + 20_000)).toEqual({ motivo: 'espera', segundos: 40 })
    expect(bloqueo([1000], 1000 + MINUTO)).toBeNull()
  })

  it('admite cinco por día y vuelve a dejar enviar a las 24 horas', () => {
    const horas = Array.from({ length: MAX_POR_DIA }, (_, i) => i * HORA)
    expect(bloqueo(horas, 5 * HORA)).toEqual({ motivo: 'dia' })
    expect(bloqueo(horas, 24 * HORA)).toBeNull()
  })

  it('guarda las horas en el navegador y descarta datos dañados', () => {
    const storage = storageFalso({ [CLAVE_ENVIOS]: '["x", 5, null]' })
    const limite = crearLimite(() => storage)
    expect(limite.bloqueo(10 * HORA)).toBeNull()
    limite.registrar(10 * HORA)
    expect(JSON.parse(storage.getItem(CLAVE_ENVIOS) ?? '[]')).toEqual([5, 10 * HORA])
    expect(limite.bloqueo(10 * HORA + 1000)?.motivo).toBe('espera')
  })

  it('sin almacenamiento, o si falla al guardar, el tope sigue en memoria', () => {
    const sinStorage = crearLimite(() => undefined)
    sinStorage.registrar(0)
    expect(sinStorage.bloqueo(1000)?.motivo).toBe('espera')

    const lleno = storageFalso()
    lleno.setItem = () => {
      throw new DOMException('Cuota', 'QuotaExceededError')
    }
    const conFallo = crearLimite(() => lleno)
    conFallo.registrar(0)
    expect(conFallo.bloqueo(1000)?.motivo).toBe('espera')
  })
})
