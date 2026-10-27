// Datos del sitio en un solo lugar. Lo usan la app y el script de páginas estáticas (sin React ni DOM).
export const SITIO = {
  nombre: 'Moss Taste',
  /** URL pública con barra final. GitHub Pages sirve el repo en /Moss-Taste/ del dominio. */
  url: 'https://sergio-velandia.dev/Moss-Taste/',
  descripcion: 'Recetario familiar: ingredientes y costo en pesos colombianos para cualquier número de porciones.',
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
