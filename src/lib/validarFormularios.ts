// Validación de los formularios. Cada mensaje dice qué falta y cómo corregirlo, sin disculpas.

export type Errores<K extends string> = Partial<Record<K, string>>

const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function validarCorreo(valor: string): string | undefined {
  if (!valor.trim()) return 'Escribe tu correo para poder responderte.'
  if (!CORREO.test(valor.trim())) return 'Revisa el correo: debe verse como nombre@correo.com.'
  return undefined
}

export interface DatosContacto {
  motivo: 'receta' | 'mensaje'
  nombre: string
  correo: string
  receta: string
  mensaje: string
}

export type CampoContacto = 'nombre' | 'correo' | 'receta' | 'mensaje'

export function validarContacto(datos: DatosContacto): Errores<CampoContacto> {
  const errores: Errores<CampoContacto> = {}
  const nombre = datos.nombre.trim()
  if (nombre.length < 2) errores.nombre = 'Escribe tu nombre, con al menos 2 letras.'
  else if (nombre.length > 80) errores.nombre = 'Acorta el nombre a 80 caracteres o menos.'
  const correo = validarCorreo(datos.correo)
  if (correo) errores.correo = correo
  if (datos.motivo === 'receta' && datos.receta.trim().length < 3) errores.receta = 'Escribe el nombre de la receta que propones.'
  const mensaje = datos.mensaje.trim()
  const minimo = datos.motivo === 'receta' ? 30 : 10
  if (mensaje.length < minimo)
    errores.mensaje =
      datos.motivo === 'receta'
        ? 'Cuenta los ingredientes y los pasos, con al menos 30 caracteres.'
        : 'Escribe tu mensaje, con al menos 10 caracteres.'
  else if (mensaje.length > 3000) errores.mensaje = 'Acorta el mensaje a 3000 caracteres o menos.'
  return errores
}

export type CampoAcceso = 'correo' | 'contrasena'

export function validarAcceso(correo: string, contrasena: string, creando: boolean): Errores<CampoAcceso> {
  const errores: Errores<CampoAcceso> = {}
  const errorCorreo = validarCorreo(correo)
  if (errorCorreo) errores.correo = errorCorreo
  if (!contrasena) errores.contrasena = 'Escribe tu contraseña.'
  else if (creando && contrasena.length < 8) errores.contrasena = 'Usa al menos 8 caracteres.'
  return errores
}
