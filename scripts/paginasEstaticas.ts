import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import type { Plugin } from 'vite'
import { crearCatalogo } from '../src/lib/recetas/crearCatalogo.ts'
import type { Receta } from '../src/lib/recetas/tipos.ts'
import { RUTAS_FIJAS, type RutaFija } from '../src/rutas.ts'
import { SITIO, tituloPagina, urlCanonica } from '../src/sitio.ts'

/**
 * GitHub Pages no conoce las rutas de React Router: sin esto, /Moss-Taste/recetas responde 404 y los
 * buscadores no la indexan. Tras el build se escribe un index.html por página, con su título, descripción,
 * canonical e imagen para compartir, para que responda 200:
 *   - cada ruta fija (src/rutas.ts),
 *   - cada receta (/recetas/:slug), indexable salvo las de ejemplo, con og.jpg si tiene imagen,
 *   - el modo cocina de cada receta (/recetas/:slug/cocinar), siempre con noindex.
 * También se generan 404.html (respaldo de la SPA) y sitemap.xml con las páginas indexables.
 */

export interface Pagina extends Pick<RutaFija, 'titulo' | 'descripcion' | 'indexable'> {
  /** Sin ruta (404.html) no lleva canonical ni og:url. */
  ruta?: string
  /** Imagen para compartir propia: URL absoluta y su descripción. */
  imagen?: { url: string; alt: string }
}

const escapar = (texto: string) =>
  texto.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** '/' → '', '/mi-cocina/nueva' → 'mi-cocina/nueva/' */
export function directorioDeRuta(ruta: string): string {
  const limpia = ruta.replace(/^\/+|\/+$/g, '')
  return limpia ? `${limpia}/` : ''
}

/** Copia el index.html del build cambiando título, descripción, canonical, Open Graph, imagen y robots. */
export function htmlDePagina(base: string, pagina: Pagina): string {
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
  if (pagina.imagen) {
    const { url: imagen, alt } = pagina.imagen
    cambios.push(
      [/(<meta property="og:image" content=")[^"]*/, `$1${escapar(imagen)}`],
      [/(<meta property="og:image:alt" content=")[^"]*/, `$1${escapar(alt)}`],
      [/(<meta name="twitter:image" content=")[^"]*/, `$1${escapar(imagen)}`],
      [/(<meta name="twitter:image:alt" content=")[^"]*/, `$1${escapar(alt)}`],
    )
  }

  let html = base
  for (const [patron, reemplazo] of cambios) {
    if (!patron.test(html)) throw new Error(`paginasEstaticas: no se encontró ${patron} en index.html`)
    html = reemplazo === null ? html.replace(new RegExp(`\\s*${patron.source}"[^>]*>`), '') : html.replace(patron, reemplazo)
  }
  if (!pagina.indexable) html = html.replace('</head>', '  <meta name="robots" content="noindex" />\n  </head>')
  return html
}

/** La ficha y el modo cocina de cada receta. `conImagen` dice si la receta tiene imagen propia. */
export function paginasDeRecetas(recetas: readonly Receta[], conImagen: (slug: string) => boolean): Pagina[] {
  return recetas.flatMap((receta) => {
    const ruta = `/recetas/${receta.id}`
    const imagen = conImagen(receta.id)
      ? { url: `${urlCanonica(ruta)}og.jpg`, alt: receta.imagenAlt ?? `${receta.titulo}, imagen ilustrativa generada con IA` }
      : undefined
    return [
      { ruta, titulo: receta.titulo, descripcion: receta.resumen, indexable: !receta.ejemplo, imagen },
      { ruta: `${ruta}/cocinar`, titulo: `Cocinando: ${receta.titulo}`, descripcion: `${receta.titulo} paso a paso, con letra grande.`, indexable: false, imagen },
    ]
  })
}

export function sitemap(paginas: readonly Pick<Pagina, 'ruta' | 'indexable'>[]): string {
  const urls = paginas.filter((p) => p.indexable && p.ruta !== undefined).map((p) => `  <url><loc>${urlCanonica(p.ruta ?? '/')}</loc></url>`)
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
}

/** Lee las recetas válidas del repo con la misma validación que el sitio. */
function leerRecetas(raiz: string): readonly Receta[] {
  const datos = join(raiz, 'src', 'data')
  const carpetas = join(datos, 'recetas')
  const leer = (ruta: string): unknown => JSON.parse(readFileSync(ruta, 'utf8'))
  const recetas = Object.fromEntries(
    readdirSync(carpetas, { withFileTypes: true })
      .filter((d) => d.isDirectory() && existsSync(join(carpetas, d.name, 'receta.json')))
      .map((d) => [d.name, leer(join(carpetas, d.name, 'receta.json'))]),
  )
  return crearCatalogo({ recetas, ingredientes: leer(join(datos, 'ingredientes.json')), categorias: leer(join(datos, 'categorias.json')) }).RECETAS
}

export function paginasEstaticas(): Plugin {
  let raiz = process.cwd()
  let salida = 'dist'
  return {
    name: 'moss-taste-paginas-estaticas',
    apply: 'build',
    configResolved(config) {
      raiz = config.root
      salida = resolve(config.root, config.build.outDir)
    },
    async closeBundle() {
      const base = readFileSync(join(salida, 'index.html'), 'utf8')
      const imagenDe = (slug: string) => join(raiz, 'src', 'data', 'recetas', slug, 'imagen.webp')
      const recetas = leerRecetas(raiz)
      const paginas: Pagina[] = [...RUTAS_FIJAS, ...paginasDeRecetas(recetas, (slug) => existsSync(imagenDe(slug)))]

      for (const pagina of paginas) {
        const carpeta = join(salida, directorioDeRuta(pagina.ruta ?? '/'))
        mkdirSync(carpeta, { recursive: true })
        writeFileSync(join(carpeta, 'index.html'), htmlDePagina(base, pagina))
      }

      // Imagen para compartir de cada receta con foto: JPEG de 1200 × 630, el formato que mejor leen las redes.
      const { default: sharp } = await import('sharp')
      for (const receta of recetas.filter((r) => existsSync(imagenDe(r.id)))) {
        await sharp(imagenDe(receta.id))
          .resize(1200, 630, { fit: 'cover' })
          .jpeg({ quality: 82, mozjpeg: true })
          .toFile(join(salida, 'recetas', receta.id, 'og.jpg'))
      }

      writeFileSync(
        join(salida, '404.html'),
        htmlDePagina(base, { titulo: 'Página no encontrada', descripcion: SITIO.descripcion, indexable: false }),
      )
      writeFileSync(join(salida, 'sitemap.xml'), sitemap(paginas))
    },
  }
}
