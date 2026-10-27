import { useEffect } from 'react'
import { tituloPagina, urlCanonica } from '@/sitio'

interface Metadatos {
  titulo: string
  descripcion: string
  /** Ruta canónica ('/recetas'). Sin ella no se toca el canonical. */
  ruta?: string
  indexable?: boolean
}

function fijarMeta(selector: string, crear: () => HTMLElement, atributo: string, valor: string | null) {
  let elemento = document.head.querySelector<HTMLElement>(selector)
  if (valor === null) {
    elemento?.remove()
    return
  }
  if (!elemento) {
    elemento = crear()
    document.head.append(elemento)
  }
  elemento.setAttribute(atributo, valor)
}

// Mantiene título, descripción, canonical y robots al navegar dentro de la SPA.
// El build ya los escribe en el index.html de cada ruta fija; esto cubre la navegación posterior.
export function useMetadatos({ titulo, descripcion, ruta, indexable = true }: Metadatos): void {
  useEffect(() => {
    document.title = tituloPagina(titulo)
    fijarMeta('meta[name="description"]', () => Object.assign(document.createElement('meta'), { name: 'description' }), 'content', descripcion)
    if (ruta !== undefined) {
      fijarMeta('link[rel="canonical"]', () => Object.assign(document.createElement('link'), { rel: 'canonical' }), 'href', urlCanonica(ruta))
    }
    fijarMeta(
      'meta[name="robots"]',
      () => Object.assign(document.createElement('meta'), { name: 'robots' }),
      'content',
      indexable ? null : 'noindex',
    )
  }, [titulo, descripcion, ruta, indexable])
}
