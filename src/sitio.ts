// Datos del sitio en un solo lugar. Lo usan la app y el script de páginas estáticas (sin React ni DOM).
export const SITIO = {
  nombre: 'Moss Taste',
  /** URL pública con barra final. GitHub Pages sirve el repo en /Moss-Taste/ del dominio. */
  url: 'https://sergio-velandia.dev/Moss-Taste/',
  descripcion: 'Recetario familiar: ingredientes y costo en pesos colombianos para cualquier número de porciones.',
  /**
   * Envío del formulario de /contacto (API REST de EmailJS). Los tres valores son públicos por diseño de EmailJS:
   * viajan al navegador. El destino se configura en la plantilla. Si falta alguno, el formulario avisa que no envía.
   */
  emailjs: { serviceId: 'service_ykyb3t9', templateId: 'template_qn6edjb', publicKey: '0arvWc2vnvpI6rFgd' },
} as const

/** «Recetas · Moss Taste». La portada usa su propio título completo. */
export function tituloPagina(titulo: string): string {
  return titulo.startsWith(SITIO.nombre) ? titulo : `${titulo} · ${SITIO.nombre}`
}

/** '/recetas' → 'https://sergio-velandia.dev/Moss-Taste/recetas/' (con barra final, como la sirve GitHub Pages). */
export function urlCanonica(ruta: string): string {
  const limpia = ruta.replace(/^\/+|\/+$/g, '')
  return limpia ? `${SITIO.url}${limpia}/` : SITIO.url
}
