import type { ReactNode } from 'react'
import { EncabezadoPagina } from '@/components/EncabezadoPagina'

const REPO = 'https://github.com/Sergio-Velandia/Moss-Taste/blob/main'
const ENLACE = 'font-bold text-accent underline underline-offset-4'

function Bloque({ id, titulo, children }: { id: string; titulo: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="grid max-w-prose gap-3">
      <h2 id={id} className="text-2xl">
        {titulo}
      </h2>
      {children}
    </section>
  )
}

export function Licencia() {
  return (
    <div className="grid gap-10">
      <EncabezadoPagina ruta="/licencia" />
      <Bloque id="l-codigo" titulo="El código">
        <p>
          Licencia MIT:{' '}
          <a href={`${REPO}/LICENSE`} className={ENLACE}>
            archivo LICENSE
          </a>
          .
        </p>
      </Bloque>
      <Bloque id="l-textos" titulo="Los textos de las recetas">
        <p>
          La redacción de las recetas, los pasos y las notas está bajo{' '}
          <a href="https://creativecommons.org/licenses/by/4.0/deed.es" className={ENLACE}>
            Creative Commons Atribución 4.0
          </a>
          . Puedes usarla y adaptarla, también con fines comerciales, siempre que des crédito a Moss Taste. Detalle en el{' '}
          <a href={`${REPO}/LICENSE-CONTENT`} className={ENLACE}>
            archivo LICENSE-CONTENT
          </a>
          .
        </p>
        <p>No se reclama autoría sobre los platos clásicos: son de todos. Lo propio es cómo están escritos.</p>
      </Bloque>
      <Bloque id="l-imagenes" titulo="Las imágenes">
        <p>Son ilustraciones generadas con IA y se etiquetan así. Pueden no coincidir con el plato real. Se ofrecen bajo la misma licencia CC BY solo en lo que haya derechos que ceder.</p>
      </Bloque>
      <Bloque id="l-fuentes" titulo="Las fuentes">
        <p>Young Serif y Atkinson Hyperlegible Next, bajo SIL Open Font License 1.1. Sus licencias están junto a las fuentes en el repositorio.</p>
      </Bloque>
      <Bloque id="l-tus-recetas" titulo="Tus recetas y notas">
        <p>Lo que escribes en tu cuenta sigue siendo tuyo. No se publica ni se usa para el recetario. Una receta solo entra si tú la propones por el formulario de contacto.</p>
      </Bloque>
    </div>
  )
}
