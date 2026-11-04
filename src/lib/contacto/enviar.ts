import { SITIO } from '@/sitio'
import type { DatosContacto } from '@/lib/validarFormularios'

/*
 * Envío del formulario de contacto con la API REST de EmailJS, sin su SDK para no sumar dependencias.
 * La plantilla la comparten Moss, Moss Nexus y Moss Taste: recibe tipo, nombre, correo, asunto y mensaje.
 * El correo de destino no está en el código: se configura en la plantilla de EmailJS.
 */

export const URL_EMAILJS = 'https://api.emailjs.com/api/v1.0/email/send'

export interface ParametrosCorreo {
  tipo: string
  nombre: string
  correo: string
  asunto: string
  mensaje: string
}

const AUTORIZO = 'Autorizó el tratamiento de sus datos para recibir respuesta.'

export function armarCorreo(datos: DatosContacto): ParametrosCorreo {
  const nombre = datos.nombre.trim()
  const mensaje = datos.mensaje.trim()
  if (datos.motivo === 'receta') {
    const receta = datos.receta.trim()
    return {
      tipo: 'Propuesta de receta',
      nombre,
      correo: datos.correo.trim(),
      asunto: `[Moss Taste] Receta propuesta: ${receta}`,
      mensaje: `Receta: ${receta}\n\nIngredientes y pasos:\n${mensaje}\n\n${AUTORIZO}`,
    }
  }
  return { tipo: 'Mensaje', nombre, correo: datos.correo.trim(), asunto: `[Moss Taste] Mensaje de ${nombre}`, mensaje: `${mensaje}\n\n${AUTORIZO}` }
}

export const emailjsListo = () => Boolean(SITIO.emailjs.serviceId && SITIO.emailjs.templateId && SITIO.emailjs.publicKey)

/** Por qué falló un envío: sin conexión, EmailJS frenó por exceso de envíos o cualquier otro error. */
export type FalloEnvio = 'sin-conexion' | 'limite-servicio' | 'error'

export class ErrorEnvio extends Error {
  readonly motivo: FalloEnvio
  constructor(motivo: FalloEnvio) {
    super(`No se pudo enviar el correo: ${motivo}`)
    this.motivo = motivo
  }
}

export async function enviarCorreo(parametros: ParametrosCorreo, fetchImpl: typeof fetch = fetch): Promise<void> {
  const { serviceId, templateId, publicKey } = SITIO.emailjs
  let respuesta: Response
  try {
    respuesta = await fetchImpl(URL_EMAILJS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ service_id: serviceId, template_id: templateId, user_id: publicKey, template_params: parametros }),
    })
  } catch {
    // fetch solo rechaza cuando la petición no sale: sin red, DNS o CORS.
    throw new ErrorEnvio('sin-conexion')
  }
  if (respuesta.status === 429) throw new ErrorEnvio('limite-servicio')
  if (!respuesta.ok) throw new ErrorEnvio('error')
}
