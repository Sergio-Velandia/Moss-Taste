import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { RUTAS_FIJAS } from '../src/rutas.ts'
import { directorioDeRuta, htmlDePagina, sitemap } from './paginasEstaticas.ts'

// Se prueba contra el index.html real para que un cambio en sus metadatos no rompa el build en silencio.
const base = readFileSync(join(process.cwd(), 'index.html'), 'utf8')

describe('paginasEstaticas', () => {
  it('convierte rutas en carpetas con barra final', () => {
    expect(directorioDeRuta('/')).toBe('')
    expect(directorioDeRuta('/recetas')).toBe('recetas/')
    expect(directorioDeRuta('/mi-cocina/nueva')).toBe('mi-cocina/nueva/')
  })

  it('escribe título, descripción, canonical y Open Graph de cada ruta', () => {
    const html = htmlDePagina(base, { ruta: '/hoy', titulo: '¿Qué cocino hoy?', descripcion: 'Filtra por "lo que hay" & presupuesto.', indexable: true })
    expect(html).toContain('<title>¿Qué cocino hoy? · Moss Taste</title>')
    expect(html).toContain('<meta name="description" content="Filtra por &quot;lo que hay&quot; &amp; presupuesto."')
    expect(html).toContain('<link rel="canonical" href="https://sergio-velandia.dev/Moss-Taste/hoy/"')
    expect(html).toContain('<meta property="og:url" content="https://sergio-velandia.dev/Moss-Taste/hoy/"')
    expect(html).toContain('<meta name="twitter:title" content="¿Qué cocino hoy? · Moss Taste"')
    expect(html).not.toContain('noindex')
  })

  it('las pantallas personales llevan noindex', () => {
    const html = htmlDePagina(base, { ruta: '/mi-cocina', titulo: 'Mi cocina', descripcion: 'Tus recetas.', indexable: false })
    expect(html).toContain('<meta name="robots" content="noindex" />')
  })

  it('sin ruta (404.html) quita el canonical y og:url', () => {
    const html = htmlDePagina(base, { titulo: 'Página no encontrada', descripcion: 'No existe.', indexable: false })
    expect(html).not.toContain('rel="canonical"')
    expect(html).not.toContain('og:url')
    expect(html).toContain('noindex')
  })

  it('el sitemap incluye solo las rutas indexables', () => {
    const xml = sitemap(RUTAS_FIJAS)
    expect(xml).toContain('<loc>https://sergio-velandia.dev/Moss-Taste/</loc>')
    expect(xml).toContain('<loc>https://sergio-velandia.dev/Moss-Taste/recetas/</loc>')
    expect(xml).not.toContain('mi-cocina')
    expect(xml).not.toContain('acceso')
  })
})
