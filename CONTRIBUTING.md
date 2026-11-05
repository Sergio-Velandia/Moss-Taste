# Cómo se trabaja en Moss Taste

Moss Taste es un proyecto familiar. Las recetas públicas las agrega el dueño del repositorio; si quieres proponer una, usa el [formulario del sitio](https://sergio-velandia.dev/Moss-Taste/contacto/). Para reportar algo que no funciona, abre un [issue](https://github.com/Sergio-Velandia/Moss-Taste/issues/new/choose).

Este archivo resume las convenciones del repo. El detalle técnico, las decisiones y el mapa del código están en [CLAUDE.md](CLAUDE.md); el plan, en [ROADMAP.md](ROADMAP.md).

## Ramas

- `main` siempre está lista para publicar: cada push a `main` despliega el sitio.
- Una rama corta por tema, con prefijo: `feat/…`, `fix/…`, `docs/…`, `chore/…`. Se integra a `main` al terminar y se borra.

## Commits

[Conventional Commits](https://www.conventionalcommits.org/es/v1.0.0/) en español: `tipo(ámbito): descripción`, en minúscula, en imperativo y con 70 caracteres o menos.

```
feat(receta): recalcula cantidades y costo al cambiar porciones
fix(recetas): pliega los filtros en móvil
docs: actualiza el readme con el cálculo de porciones
```

Tipos: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`.

- Un commit es un cambio lógico. No se mezclan datos, estilos y documentación.
- Cada commit deja el proyecto compilando y con las pruebas en verde.
- Cada receta nueva va en su propio commit: `feat(receta): agrega sancocho de gallina`.

## Versiones

[SemVer](https://semver.org/lang/es/). Mientras sea `0.x`: MINOR para una fase o una función nueva, PATCH para correcciones y documentación. Las recetas se acumulan en el CHANGELOG y suben una versión MINOR cada diez, más o menos.

`package.json`, [CHANGELOG.md](CHANGELOG.md), el tag `vX.Y.Z` y la tabla de estado del README siempre dicen la misma versión. El CHANGELOG sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/), con la sección `[Sin publicar]` arriba.

## Antes de cada commit

```bash
npm test        # datos, contraste de colores, cálculo y pantallas
npm run test:reglas  # reglas de Firestore, si se tocaron (necesita Java 21; ver el README)
npm run lint
npm run build   # incluye el typecheck
```

El workflow corre lo mismo en cada push y en cada pull request.

## Contenido

- Las recetas se escriben **con palabras propias**. Se puede partir de una receta conocida, pero el texto de los pasos no se copia de otros sitios.
- Los precios salen del catálogo (`src/data/ingredientes.json`), en pesos enteros y con su fecha. No se inventan.
- Los datos de ejemplo y de prueba son ficticios y se marcan como tales. Nunca datos reales de personas.
- Nada de secretos ni datos personales en el repo: ni claves, ni correos personales, ni teléfonos.

## Agregar una receta

1. Crea la carpeta `src/data/recetas/<slug>/` con un `receta.json`. El `id` debe ser igual al nombre de la carpeta.
2. Si usa ingredientes nuevos, agrégalos a `src/data/ingredientes.json` con su precio en pesos (entero) y la fecha del precio. Si la receta los pide en tazas o cucharadas y se venden por peso, agrega su `densidad`; si los pide por unidad y se venden por peso, `gramosPorUnidad`.
3. Agrega la imagen: `ilustracion.svg` u `original.png` en la carpeta, `npm run imagenes` y una descripción en `imagenAlt`. Ver [docs/prompt-imagenes.md](docs/prompt-imagenes.md).
4. Corre `npm test`: si algo está mal, dice el archivo, el campo y qué corregir.

No hace falta tocar ningún componente. Una receta inválida se omite del sitio sin romperlo.

Al escribirla:

- **Las cantidades son lo que va a la olla**, ya limpio y pelado. La merma del catálogo calcula cuánto comprar. Solo cuenta lo que se quita antes de cocinar (cáscara, recorte), nunca lo que se pierde cocinando.
- **El tiempo total incluye la preparación**, no solo los temporizadores.

### Las alternativas

Lo que puede reemplazar a un ingrediente, sin sumarse al costo, se escribe en dos niveles:

- **En el catálogo** (`alternativa` en `ingredientes.json`): «pan tostado» para el calado. Vale para todas las recetas que lo usen.
- **En la receta** (`alternativa` en `receta.json`), solo si depende de su cantidad: «o 150 g de azúcar».

La de la receta manda sobre la del catálogo. Es solo texto: tener la alternativa no cuenta como tener el ingrediente.

## Diseño

- Colores, tipografía, radios y sombras salen de los tokens en `src/styles/tokens.css`. Nada de colores sueltos en los componentes.
- Contraste AA en los dos temas (lo verifica `npm test`), todo usable con teclado y áreas táctiles de 44 px o más.
- Solo se animan `transform` y `opacity`, y se respeta `prefers-reduced-motion`.
- Textos en español, en voz activa, con verbos concretos. Los errores dicen qué pasó y cómo arreglarlo.
- Sin dependencias nuevas sin acordarlo antes.
