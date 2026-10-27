import { Mail } from 'lucide-react'
import type { ReactNode } from 'react'
import { EncabezadoPagina } from '@/components/EncabezadoPagina'
import { BotonEnlace } from '@/components/ui/BotonEnlace'

function Bloque({ id, titulo, children }: { id: string; titulo: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="grid gap-3">
      <h2 id={id} className="text-3xl">
        {titulo}
      </h2>
      <div className="grid max-w-prose gap-3 text-lg leading-relaxed">{children}</div>
    </section>
  )
}

// Solo dice lo que el sitio hace hoy. Lo que está en camino se marca como tal.
export function Acerca() {
  return (
    <div className="grid gap-12">
      <EncabezadoPagina ruta="/acerca" titulo="Acerca de Moss Taste">
        Un recetario para dejar los Excel y los cuadernos: las recetas de la familia en un solo lugar, con cantidades y costos que se
        calculan solos.
      </EncabezadoPagina>

      <Bloque id="acerca-para-quien" titulo="Para quién es">
        <p>
          Para la familia y los allegados que cocinan estas recetas. Cualquiera puede verlas sin cuenta; la cuenta sirve para guardar lo
          personal: favoritos, notas y recetas propias.
        </p>
      </Bloque>

      <Bloque id="acerca-costos" titulo="Cómo se calcula el costo">
        <p>
          Cada ingrediente tiene un precio en pesos colombianos y la fecha de ese precio. La receta suma lo que usa y muestra un rango de
          más o menos 10 %, porque los precios cambian según el lugar y la semana. Al lado del costo siempre aparece la fecha del precio.
        </p>
        <p>Si un ingrediente no tiene precio, la receta lo dice y no lo cuenta como si costara cero.</p>
      </Bloque>

      <Bloque id="acerca-recetas" titulo="De dónde salen las recetas">
        <p>
          Las recetas del recetario las agrego yo, escritas con mis palabras. Se puede partir de una receta conocida, pero el texto de los
          pasos es propio. Si quieres que una receta entre, proponla con sus ingredientes y pasos.
        </p>
        <BotonEnlace to="/contacto" variante="secundario" className="justify-self-start" icono={<Mail aria-hidden="true" className="size-5" />}>
          Proponer una receta
        </BotonEnlace>
      </Bloque>

      <Bloque id="acerca-estado" titulo="En qué va">
        <p>
          Esta es la primera versión: muestra recetas y precios de ejemplo para probar el diseño. En las próximas llegan el cálculo
          completo de porciones, las recetas reales con sus fotos, la lista de compras, exportar a Excel y las cuentas.
        </p>
      </Bloque>
    </div>
  )
}
