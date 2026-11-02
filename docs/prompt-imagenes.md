# Imágenes de las recetas

Las imágenes de las recetas son generadas con IA y siguen un mismo estilo, para que se vean como una familia y se puedan rehacer. Son **ilustrativas**: pueden no coincidir con el plato real, y el sitio lo dice debajo de cada una («Imagen ilustrativa generada con IA»).

## Imágenes actuales

Las tres primeras recetas usan **ilustraciones vectoriales** dibujadas por Claude (IA) con el mismo estilo: vista cenital, mesa de madera clara, loza blanca y servilleta berenjena. La fuente de cada una es `src/data/recetas/<slug>/ilustracion.svg`, que se sube al repo; `npm run imagenes` la convierte en `imagen.webp` y `miniatura.webp`. Se pueden reemplazar por fotos de Gemini con el prompt de abajo, sin tocar código: un `original.png` en la carpeta gana sobre el SVG.

## Prompt base (para fotos con Gemini)

```
Fotografía cenital de <plato> servido en loza blanca sencilla, sobre una mesa de madera clara.
Luz natural suave de ventana, sombras tenues, sin manos ni personas.
Estilo de recetario casero colombiano, cálido y sin exceso de decoración.
Paleta: tonos crema y madera, con un detalle morado berenjena en el mantel o un pocillo al fondo.
Encuadre cuadrado, enfoque nítido en el plato, fondo ligeramente desenfocado.
Deja aire alrededor del plato: la imagen se recorta a 4:3 en el sitio.
```

`<plato>` de cada receta:

| Receta | `<plato>` |
|---|---|
| Ajiaco santafereño | un ajiaco santafereño con crema, alcaparras y aguacate al lado |
| Changua | una changua con huevo entero, cilantro fresco y calado al lado |
| Arroz con leche | un arroz con leche espolvoreado con canela |

## De la imagen generada al sitio

1. Genera la imagen con el prompt base y el `<plato>` de la receta. Revisa que no tenga texto, logos, manos ni personas.
2. Guárdala en la carpeta de la receta como `src/data/recetas/<slug>/original.png` (o `.jpg`). Los originales no se suben al repo.
3. Corre `npm run imagenes`: crea `imagen.webp` (1600 px) y `miniatura.webp` (400 px).
4. Escribe `imagenAlt` en el `receta.json`: qué se ve, en una frase. Por ejemplo: «Plato hondo de ajiaco con mazorca, y al lado pocillos con crema, alcaparras y aguacate.»
5. Corre `npm test`: falla si a una receta real le falta la imagen, la miniatura o el texto alternativo.

## Reglas

- **Etiqueta siempre como IA.** El sitio lo hace solo. Nunca presentes una imagen generada como si fuera una foto real del plato.
- **Términos de Google:** Google no reclama la propiedad de lo que se genera con sus servicios, pero pide no presentar contenido de IA como hecho por una persona, no usarlo para entrenar otros modelos y usar el propio criterio antes de publicarlo. Revisado el 2 de noviembre de 2026 en los [Términos del Servicio de Google](https://policies.google.com/terms) y la [ayuda de Gemini sobre imágenes](https://support.google.com/bard/answer/14286560). No es asesoría legal; se vuelve a revisar en la Fase Legal.
- **Respaldo por categoría:** las primeras recetas de cada categoría prestan su imagen a las recetas de esa categoría que todavía no tienen la suya (`imagenRespaldo` en `categorias.json`).
