import { categoria, imagenDe } from '@/lib/recetas/catalogo'
import type { Receta } from '@/lib/recetas/tipos'
import { cx } from '@/lib/clases'
import { IlustracionCategoria } from './IlustracionCategoria'

interface Props {
  receta: Receta
  /** portada: la imagen grande de la ficha, con su pie. tarjeta: la miniatura de la galería. */
  variante: 'portada' | 'tarjeta'
  className?: string
}

// Las imágenes son generadas con IA y se dicen así: pueden no coincidir con el plato real.
// Sin imagen propia se usa la de respaldo de la categoría, y sin esa, la ilustración por categoría.
export function ImagenReceta({ receta, variante, className }: Props) {
  const img = imagenDe(receta)
  if (!img) return <IlustracionCategoria categoria={receta.categoria} className={cx('aspect-[4/3]', variante === 'portada' && 'rounded-xl', className)} />

  const fuentes = `${img.miniatura} 400w, ${img.imagen} 1600w`

  if (variante === 'tarjeta')
    return (
      <div className={cx('relative aspect-[4/3] overflow-hidden bg-accent-soft', className)}>
        {/* En la tarjeta el título ya nombra el plato: la imagen es decorativa. */}
        <img
          src={img.miniatura}
          srcSet={fuentes}
          sizes="(min-width: 1024px) 22rem, (min-width: 640px) 50vw, 100vw"
          width={400}
          height={300}
          loading="lazy"
          decoding="async"
          alt=""
          className="size-full object-cover"
        />
        <span className="absolute bottom-2 left-2 rounded-full bg-surface px-2.5 py-0.5 text-sm font-bold text-ink">Ilustración con IA</span>
      </div>
    )

  const nombreCategoria = categoria(receta.categoria)?.nombre.toLocaleLowerCase('es') ?? receta.categoria
  return (
    <figure className={cx('grid gap-2', className)}>
      <img
        src={img.imagen}
        srcSet={fuentes}
        sizes="(min-width: 1024px) 28rem, 100vw"
        width={1600}
        height={1200}
        fetchPriority="high"
        decoding="async"
        alt={img.alt}
        className="aspect-[4/3] w-full rounded-xl bg-accent-soft object-cover"
      />
      <figcaption className="text-sm text-ink-soft">
        {img.propia ? 'Imagen ilustrativa generada con IA.' : `Imagen de ${nombreCategoria}, ilustrativa y generada con IA.`}
      </figcaption>
    </figure>
  )
}
