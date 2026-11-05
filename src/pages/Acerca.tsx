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
          Cada ingrediente tiene un precio en pesos colombianos y la fecha de ese precio. Al elegir las porciones, la receta escala las
          cantidades, convierte tazas, cucharadas y libras a la unidad en que se vende cada ingrediente, y suma lo que se pierde al
          limpiar o pelar: el costo es el de lo que se compra, no solo el de lo que se usa. Esa pérdida (la merma) y lo que pesa
          una taza de cada ingrediente son estimados de cocina, así que las cantidades a comprar son aproximadas.
        </p>
        <p>
          Los precios son valores de referencia de Bogotá, y algunas verduras tienen precio mayorista, así que en tu tienda pueden salir
          más caros. Por eso el resultado se muestra con un rango de más o menos 10 % y siempre con la fecha del precio. Los ingredientes al gusto, como la sal, también se escalan, pero solo como referencia.
        </p>
        <p>Si un ingrediente no tiene precio, la receta lo dice y no lo cuenta como si costara cero.</p>
      </Bloque>

      <Bloque id="acerca-presupuesto" titulo="Cómo filtra el presupuesto">
        <p>
          El filtro compara tu presupuesto con el extremo alto del estimado. Por ejemplo, una receta de $ 4.800 con el rango de 10 % puede
          llegar a $ 5.280, así que no aparece en «Hasta $ 5.000». Salen menos recetas, y es a propósito: si sales con $ 5.000 confiando en
          el filtro, no deberías encontrarte con una cuenta de $ 5.280.
        </p>
        <p>Si a una receta le falta algún precio, no se sabe cuánto cuesta. Por eso no pasa el filtro, pero sale aparte, al final, diciendo qué le falta.</p>
      </Bloque>

      <Bloque id="acerca-temporizadores" titulo="Lo que debes saber de los temporizadores">
        <p>
          Puedes tener varios a la vez. Siguen contando si sales a la ficha de la receta o recargas la página, pero solo suenan con el modo
          cocina abierto. Con el teléfono bloqueado o el navegador cerrado no suenan; al volver, el sitio te dice hace cuánto terminaron.
        </p>
        <p>
          Por eso, iniciar un temporizador mantiene la pantalla encendida, si tu navegador lo permite; si no, te lo avisa. En iPhone no hay
          vibración, y el interruptor de silencio puede apagar el sonido.
        </p>
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
          Ya están seis recetas de la casa, con ilustraciones generadas con IA, la lista de compras, el modo cocina con temporizadores
          y la opción de exportar a Excel, CSV o JSON. Puedes proponer recetas desde el formulario de contacto y crear una cuenta para
          guardar favoritos, notas y tus propias recetas. Las recetas nuevas van llegando de a poco.
        </p>
      </Bloque>
    </div>
  )
}
