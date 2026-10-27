import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import type { Plugin } from 'vite'
import { RUTAS_FIJAS, type RutaFija } from '../src/rutas.ts'
import { SITIO, tituloPagina, urlCanonica } from '../src/sitio.ts'

/**
 * GitHub Pages no conoce las rutas de React Router: sin esto, /Moss-Taste/recetas responde 404 y los
 * buscadores no la indexan. Tras el build se escribe un index.html por ruta fija, con su título,
 * descripción y canonical, para que responda 200. También se generan 404.html (respaldo de la SPA para
 * las rutas dinámicas, como /recetas/:slug) y sitemap.xml con las rutas indexables.
 *
 * Las recetas (/recetas/:slug) se prerenderizan en la Fase 3, cuando existan las reales (ver ROADMAP).
 */

const escapar = (texto: string) =>
  texto.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** '/' → '', '/mi-cocina/nueva' → 'mi-cocina/nueva/' */
export function directorioDeRuta(ruta: string): string {
  const limpia = ruta.replace(/^\/+|\/+$/g, '')
  return limpia ? `${limpia}/` : ''
}

/** Copia el index.html del build cambiando título, descripción, canonical, Open Graph y robots. */
export function htmlDePagina(base: string, pagina: Pick<RutaFija, 'titulo' | 'descripcion' | 'indexable'> & { ruta?: string }): string {
  const titulo = escapar(tituloPagina(pagina.titulo))
  const descripcion = escapar(pagina.descripcion)
  const url = pagina.ruta === undefined ? null : urlCanonica(pagina.ruta)

  const cambios: [RegExp, string | null][] = [
    [/<title>[^<]*<\/title>/, `<title>${titulo}</title>`],
    [/(<meta name="description" content=")[^"]*/, `$1${descripcion}`],
    [/(<meta property="og:title" content=")[^"]*/, `$1${titulo}`],
    [/(<meta property="og:description" content=")[^"]*/, `$1${descripcion}`],
    [/(<meta name="twitter:title" content=")[^"]*/, `$1${titulo}`],
    [/(<meta name="twitter:description" content=")[^"]*/, `$1${descripcion}`],
    // Sin URL propia (404.html) se quitan el canonical y og:url.
    [/(<link rel="canonical" href=")[^"]*/, url && `$1${url}`],
    [/(<meta property="og:url" content=")[^"]*/, url && `$1${url}`],
  ]

  let html = base
  for (const [patron, reemplazo] of cambios) {
    if (!patron.test(html)) throw new Error(`paginasEstaticas: no se encontró ${patron} en index.html`)
    html = reemplazo === null ? html.replace(new RegExp(`\\s*${patron.source}"[^>]*>`), '') : html.replace(patron, reemplazo)
  }
  if (!pagina.indexable) html = html.replace('</head>', '  <meta name="robots" content="noindex" />\n  </head>')
  return html
}

export function sitemap(rutas: readonly RutaFija[]): string {
  const urls = rutas.filter((r) => r.indexable).map((r) => `  <url><loc>${urlCanonica(r.ruta)}</loc></url>`)
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
}

export function paginasEstaticas(): Plugin {
  let salida = 'dist'
  return {
    name: 'moss-taste-paginas-estaticas',
    apply: 'build',
    configResolved(config) {
      salida = resolve(config.root, config.build.outDir)
    },
    closeBundle() {
      const base = readFileSync(join(salida, 'index.html'), 'utf8')
      for (const pagina of RUTAS_FIJAS) {
        const carpeta = join(salida, directorioDeRuta(pagina.ruta))
        mkdirSync(carpeta, { recursive: true })
        writeFileSync(join(carpeta, 'index.html'), htmlDePagina(base, pagina))
      }
      writeFileSync(
        join(salida, '404.html'),
        htmlDePagina(base, { titulo: 'Página no encontrada', descripcion: SITIO.descripcion, indexable: false }),
      )
      writeFileSync(join(salida, 'sitemap.xml'), sitemap(RUTAS_FIJAS))
    },
  }
}
