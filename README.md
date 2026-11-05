# Moss Taste

El recetario de la familia: las recetas de la casa con las cantidades y el costo en pesos colombianos para las porciones que vayas a servir. Pensado para la familia y los allegados que hoy cocinan con hojas de Excel y cuadernos.

- **Sitio:** https://sergio-velandia.dev/Moss-Taste/
- **Repositorio:** https://github.com/Sergio-Velandia/Moss-Taste

## Estado

| Fase | Qué incluye | Versión |
|---|---|---|
| 1 · Estructura y diseño | Sistema visual, todas las pantallas navegables y el modo cocina, con **3 recetas y precios de ejemplo** | `0.1.0` |
| 2 · Cerebro de cálculo | Porciones, unidades, merma y costo calculados de verdad, con pruebas | `0.2.0` |
| 1.5 · Pulido del repo | Imagen para compartir, íconos, convenciones y plantilla de issues | `0.2.1` |
| 3 · Recetas de la casa | Ajiaco santafereño, changua y arroz con leche, con ilustraciones y el catálogo real | `0.3.0` |
| 3 · Precios | Precios cotizados del catálogo | `0.3.1` |
| 4 · Exportar y lista de compras | Exportar a Excel, CSV y JSON; lista de compras con empaques y lo que se paga en caja | `0.4.0` |
| 5 · Formulario de contacto | Proponer recetas y escribir mensajes, enviados por EmailJS con tope de envíos | `0.5.0` |
| 6 · Cuentas | Cuentas con correo y Google, favoritos, notas, recetas personales, mis datos, política de privacidad y licencia | `0.6.0` |
| 7 · ¿Qué cocino hoy? | Sugerencias revisadas con las recetas reales, recetas personales incluidas y presupuesto que nunca se queda corto | `0.7.0` |
| 8 · Platos fuertes | Lentejas con chorizo, sudado de pollo y sobrebarriga en salsa criolla, **con precios pendientes** | `0.8.0` |
| 8 · Imágenes y precios | Ilustraciones de los platos fuertes y 9 de los 16 precios nuevos | `0.8.1` |

Lo que todavía no funciona (temporizadores y mantener la pantalla encendida) ya existe en la interfaz y avisa que llega en una próxima versión. El plan completo está en [ROADMAP.md](ROADMAP.md).

## Qué se puede hacer hoy

- Cocinar las recetas de la casa: ajiaco santafereño, changua y arroz con leche, con su costo estimado al 2 de noviembre de 2026; y lentejas con chorizo, sudado de pollo y sobrebarriga en salsa criolla, cuyo costo es parcial mientras se cotizan sus ingredientes.

- Buscar recetas por nombre o ingrediente y filtrarlas por categoría y presupuesto por porción. Los filtros quedan en la URL.
- Elegir las porciones y ver al instante las cantidades y el costo recalculados: convierte tazas, cucharadas y libras, suma lo que se pierde al limpiar o pelar y muestra el costo con rango de ±10 % y la fecha del precio.
- Leer una receta completa: ingredientes (con los opcionales y las alternativas marcados), lo que se deja listo antes de empezar, los pasos y las notas de la casa.
- Cocinarla en el **modo cocina**: un paso a la vez, con letra grande, los ingredientes de ese paso y botones grandes. Funciona con el teclado (flechas y Escape).
- Juntar varias recetas en la **lista de compras**: suma los ingredientes, dice cómo vienen en la tienda («1 frasco de 100 g») y muestra por separado lo que cuestan las recetas y lo que se paga hoy en caja. Se guarda en el navegador, sin cuenta.
- Exportar una receta o la lista a Excel, CSV (listo para Excel en español) o JSON, con las porciones elegidas.
- Proponer una receta o escribir un mensaje desde el formulario de contacto.
- Crear una cuenta, con correo o con Google, para guardar favoritas, notas, las recetas que ya probaste y tus recetas personales. Tu lista de compras pasa a la cuenta sin perder lo que había.
- Exportar tus datos o borrar tu cuenta desde Mi cocina.
- Ver qué se puede cocinar con los ingredientes que hay en casa, con tus recetas personales incluidas si tienes cuenta, o con lo que cabe en un presupuesto. El enlace con lo marcado se puede compartir.
- Tema claro (por defecto), oscuro o el del sistema.

## Desarrollo

Requiere Node.js 22.12 o superior.

```bash
npm install
npm run dev        # http://localhost:5173/Moss-Taste/
npm test           # pruebas: datos, contraste de colores, lógica y pantallas
npm run test:reglas # reglas de Firestore contra el emulador (necesita Java 21)
npm run lint       # oxlint
npm run build      # typecheck + build + un index.html por ruta fija
npm run preview    # sirve el build en http://localhost:4173/Moss-Taste/
```

Cada push a `main` corre pruebas, lint y build, y publica en GitHub Pages ([workflow](.github/workflows/desplegar.yml)).

## Cómo funciona el filtro de presupuesto

Decisión del dueño, para no tener que reconstruirla mirando el código. Vale para `/hoy` y para la galería:

- **Se compara el extremo ALTO del estimado.** Una receta de $ 4.800 con ±10 % va de $ 4.320 a $ 5.280, así que **no pasa** «Hasta $ 5.000». Salen menos recetas, y es lo correcto: quien sale con $ 5.000 confiando en el filtro no puede encontrarse con una cuenta de $ 5.280. Mejor mostrar de menos que dejarlo tirado en la tienda.
- **Por eso las tarjetas dicen de dónde sale:** «Alrededor de $ 4.800 por porción, estimado hasta $ 5.280».
- **Una receta con costo parcial no pasa**, porque le falta el precio de algún ingrediente y no se sabe cuánto cuesta. Pero no desaparece en silencio: sale aparte, al final, bajo «No se puede saber si caben», diciendo qué le falta.

El código está en `topePorPorcion` (`src/lib/calculo/costo.ts`).

## Cómo funcionan las alternativas

Lo que puede reemplazar a un ingrediente, sin sumarse al costo, se escribe en dos niveles:

- **En el catálogo** (`alternativa` en `ingredientes.json`): «pan tostado» para el calado. Vale para todas las recetas que lo usen.
- **En la receta** (`alternativa` en `receta.json`), solo si depende de su cantidad: «o 150 g de azúcar».

**La de la receta manda sobre la del catálogo.** El código está en `alternativaDe` (`src/lib/recetas/alternativa.ts`). Por ahora es solo texto: tener la alternativa no cuenta como tener el ingrediente (ver [ROADMAP.md](ROADMAP.md)).

## Cuentas con Firebase

Authentication y Firestore, en plan gratuito (Spark). Sin configuración el sitio funciona, pero sin cuentas.

**La configuración de Firebase no es un secreto.** En un sitio estático viaja al navegador de todos modos. Lo que protege los datos son las reglas de Firestore ([firestore.rules](firestore.rules)) y la restricción de la clave de API por dominio.

**Para desarrollar:** copia `.env.example` como `.env` y llena los cuatro valores.

**Para publicar:** GitHub Actions compila en sus servidores, donde `.env` no existe. En **Settings → Secrets and variables → Actions → pestaña Variables** (no Secrets: GitHub enmascara los secretos y puede romper el build) deben estar:

`VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID`

**Las reglas:** `firestore.rules` es la única fuente de verdad. No se despliegan solas: se pegan en la consola (Firestore → Reglas), y cada vez se anota la fecha en el [CHANGELOG](CHANGELOG.md). Si la consola y el repo no coinciden, gana el repo.

**Probar las reglas:** `npm run test:reglas` usa el emulador, con un proyecto `demo-` que nunca toca el Firebase real. Necesita Java 21. `firebase-tools` no está en `package.json`: lo trae `npx` con versión fija. Si tienes otra versión de Java, no hace falta cambiarla: descomprime un JDK 21 (por ejemplo, Temurin) en cualquier carpeta y, en Git Bash, antes de correr el comando:

```bash
export JAVA_HOME="/ruta/al/jdk-21"
export PATH="$JAVA_HOME/bin:$PATH"
npm run test:reglas
```

También corren en CI, en cada push.

## Cómo agregar una receta

1. Crea la carpeta `src/data/recetas/<slug>/` con un `receta.json`. El `id` debe ser igual al nombre de la carpeta.
2. Si usa ingredientes nuevos, agrégalos a `src/data/ingredientes.json` con su precio en pesos (entero) y la fecha del precio. Si se pueden reemplazar, su `alternativa` va ahí mismo («pan tostado»); en el `receta.json` solo si depende de la cantidad de esa receta («o 150 g de azúcar»). Si la receta los pide en tazas o cucharadas y se venden por peso, agrega su `densidad`; si los pide por unidad y se venden por peso, `gramosPorUnidad`.
3. Agrega la imagen: `ilustracion.svg` u `original.png` en la carpeta, `npm run imagenes` y una descripción en `imagenAlt`. Ver [docs/prompt-imagenes.md](docs/prompt-imagenes.md).
4. Corre `npm test`: si algo está mal, dice el archivo, el campo y qué corregir.

Dos reglas al escribirla:

- **Las cantidades son lo que va a la olla**, ya limpio y pelado. La merma del catálogo calcula cuánto comprar. Solo cuenta lo que se quita antes de cocinar (cáscara, recorte), nunca lo que se pierde cocinando.
- **El tiempo total incluye la preparación**, no solo los temporizadores.

No hace falta tocar ningún componente. Una receta inválida se omite del sitio sin romperlo. Las recetas se escriben con palabras propias.

## Probar el correo de contacto

`contacto@sergio-velandia.dev` pasa por Cloudflare Email Routing, que lo reenvía a Gmail. Para probarlo, **escribe desde una cuenta distinta a la de destino**: lo que un Gmail se manda a sí mismo no aparece en la bandeja de entrada, porque Gmail lo deduplica. No ver el mensaje en ese caso no significa que el canal esté roto.

## Cómo participar

- **Proponer una receta:** desde el [formulario del sitio](https://sergio-velandia.dev/Moss-Taste/contacto/), con sus ingredientes y pasos.
- **Reportar un problema:** abre un [issue](https://github.com/Sergio-Velandia/Moss-Taste/issues/new/choose).
- **Convenciones del repo** (ramas, commits, versiones, contenido y diseño): [CONTRIBUTING.md](CONTRIBUTING.md).

## Stack

React 19, Vite, TypeScript estricto, Tailwind CSS 4, React Router, Motion (solo en el modo cocina), Lucide, Vitest con Testing Library y oxlint. Firebase (Authentication y Firestore lite), cargado solo si hace falta una cuenta. `write-excel-file` solo para el .xlsx, cargado al exportar. Fuentes autoalojadas: Young Serif y Atkinson Hyperlegible Next (licencia OFL). Más detalle, decisiones y mapa del código en [CLAUDE.md](CLAUDE.md).

## Seguridad

Antes de correr `npm audit fix`, lee [SECURITY.md](SECURITY.md): hoy reporta 4 vulnerabilidades altas que no llegan al navegador, y `--force` rompería el proyecto.

## Licencia

- **Código:** [MIT](LICENSE).
- **Textos de las recetas:** [CC BY 4.0](LICENSE-CONTENT), que permite el uso comercial con atribución. No se reclama autoría sobre los platos clásicos: lo propio es la redacción.
- **Imágenes:** generadas con IA y etiquetadas como tales; bajo CC BY 4.0 solo en lo que haya derechos que ceder.
- **Fuentes:** SIL Open Font License 1.1, con sus licencias en `src/assets/fonts/`.

Privacidad: [política del sitio](https://sergio-velandia.dev/Moss-Taste/privacidad/).
