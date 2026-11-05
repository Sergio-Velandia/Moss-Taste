# Moss Taste

El recetario de la familia: las recetas de la casa, con las cantidades y el costo en pesos colombianos para las porciones que vayas a servir, y un modo cocina pensado para las manos ocupadas. Hecho para la familia y los allegados que hoy cocinan con hojas de Excel y cuadernos.

- **Sitio:** https://sergio-velandia.dev/Moss-Taste/
- **Repositorio:** https://github.com/Sergio-Velandia/Moss-Taste
- **Versión:** `1.1.0` ([qué cambió](CHANGELOG.md))

## Vista previa

| Inicio | Una receta |
|---|---|
| ![Inicio de Moss Taste en tema oscuro: «El recetario de la familia», los botones Ver recetas y ¿Qué cocino hoy?, y tres recetas destacadas con su ilustración.](docs/capturas/inicio.png) | ![Ficha del ajiaco santafereño: selector de porciones, ingredientes con su cantidad y precio, lo que se deja listo antes de empezar y los pasos.](docs/capturas/receta.png) |

| Modo cocina | Cuenta |
|---|---|
| ![Modo cocina del ajiaco: lo que se deja listo, los ingredientes para 6 porciones y botones grandes para avanzar.](docs/capturas/modo-cocina.png) | ![Pantalla para entrar a la cuenta, con correo, contraseña y la opción de crear una cuenta.](docs/capturas/acceso.png) |

Las ilustraciones de los platos son generadas con IA y se etiquetan así en el sitio. El tema por defecto es el claro; estas capturas están en el oscuro.

## Qué se puede hacer

**Sin cuenta:**

- **Calcular cualquier receta:** eliges las porciones y las cantidades y el costo se recalculan al instante. Convierte tazas, cucharadas y libras, suma lo que se pierde al limpiar o pelar, y muestra el costo con un rango de ±10 % y la fecha del precio.
- **Cocinar en el modo cocina:** un paso a la vez, con letra grande y botones grandes, también con el teclado. Los temporizadores corren varios a la vez, suenan al terminar y no se pierden si se recarga la página. Iniciar uno mantiene la pantalla encendida.
- **Buscar y filtrar** por nombre, ingrediente, categoría y presupuesto por porción. Los filtros quedan en la dirección, para compartirlos.
- **Preguntar «¿Qué cocino hoy?»:** marca lo que tienes o elige un presupuesto, y salen primero las recetas a las que menos les falta.
- **Armar la lista de compras:** junta varias recetas, suma los ingredientes, dice cómo vienen en la tienda («1 frasco de 100 g») y muestra por separado lo que cuestan las recetas y lo que se paga hoy en caja.
- **Exportar** una receta o la lista a Excel, CSV (listo para Excel en español) o JSON.
- **Proponer una receta** o escribir un mensaje desde el formulario de contacto.
- Tema claro (por defecto), oscuro o el del sistema.

**Con cuenta** (correo o Google):

- Guardar favoritas, notas y las recetas que ya probaste.
- Crear **recetas personales**, privadas, con el mismo cálculo, la misma ficha y el mismo modo cocina. Un ingrediente que no esté en el catálogo queda «Sin precio» y el costo se avisa como parcial.
- Llevar la lista de compras a la cuenta, sin perder lo que había en el navegador.
- **Exportar tus datos** o **borrar tu cuenta** desde Mi cocina.

## Las recetas

| Receta | Categoría | Por porción | Estimado alto | Primer filtro que pasa |
|---|---|---|---|---|
| Arroz con leche | Postres | $ 2.262 | $ 2.488 | Hasta $ 5.000 |
| Changua | Desayunos | $ 2.936 | $ 3.229 | Hasta $ 5.000 |
| Lentejas con chorizo | Platos fuertes | $ 4.175 | $ 4.593 | Hasta $ 5.000 |
| Sudado de pollo | Platos fuertes | $ 5.332 | $ 5.865 | Hasta $ 10.000 |
| Ajiaco santafereño | Sopas | $ 8.922 | $ 9.815 | Hasta $ 10.000 |
| Sobrebarriga en salsa criolla | Platos fuertes | $ 10.207 | $ 11.227 | Hasta $ 20.000 |

**Los costos son estimados de referencia.** Los precios son valores promedio de Bogotá, cotizados entre octubre y noviembre de 2026; los de zanahoria, tomate y cebolla cabezona son mayoristas de Corabastos, así que en una tienda pueden salir más caros. La merma y el peso de una medida también son aproximados. La ficha siempre muestra la fecha del precio más antiguo que usa.

## Estado

| Fase | Qué incluye | Versión |
|---|---|---|
| 1 · Estructura y diseño | Sistema visual, todas las pantallas navegables y el modo cocina, con datos de ejemplo | `0.1.0` |
| 2 · Cerebro de cálculo | Porciones, unidades, merma y costo calculados de verdad, con pruebas | `0.2.0` |
| 1.5 · Pulido del repo | Imagen para compartir, íconos, convenciones y plantilla de issues | `0.2.1` |
| 3 · Recetas de la casa | Ajiaco, changua y arroz con leche, con ilustraciones, catálogo real y precios | `0.3.0` y `0.3.1` |
| 4 · Exportar y lista de compras | Excel, CSV y JSON; lista con empaques y lo que se paga en caja | `0.4.0` |
| 5 · Formulario de contacto | Proponer recetas y escribir mensajes, con tope de envíos | `0.5.0` |
| 6 · Cuentas y parte legal | Correo y Google, favoritos, notas, recetas personales, mis datos, política de privacidad y licencia | `0.6.0` |
| 7 · ¿Qué cocino hoy? | Sugerencias con las recetas reales y un presupuesto que no se queda corto | `0.7.0` |
| 8 · Platos fuertes | Lentejas, sudado y sobrebarriga, con sus ilustraciones y precios | `0.8.0` a `0.8.2` |
| 9 · Modo cocina funcional | Temporizadores que suenan, varios a la vez, y pantalla que no se apaga | `0.9.0` |
| R · Repaso y lanzamiento | Todo lo que dice el sitio sigue siendo cierto; imagen para compartir y README con capturas | `1.0.0` |
| Pantalla de entrada | Animación de 2,6 s al llegar al sitio e imagen para compartir nueva | `1.1.0` |

Lo que puede venir después está en [ROADMAP.md](ROADMAP.md).

## Cómo funciona

### El filtro de presupuesto

Vale para `/hoy` y para la galería, y es una decisión a propósito:

- **Se compara el extremo ALTO del estimado.** Una receta de $ 4.800 con ±10 % va de $ 4.320 a $ 5.280, así que **no pasa** «Hasta $ 5.000». Salen menos recetas, y es lo correcto: quien sale con $ 5.000 confiando en el filtro no puede encontrarse con una cuenta de $ 5.280.
- **Por eso las tarjetas dicen de dónde sale:** «Alrededor de $ 4.800 por porción, estimado hasta $ 5.280».
- **Una receta con costo parcial no pasa**, porque no se sabe cuánto cuesta. Pero no desaparece en silencio: sale aparte, al final, bajo «No se puede saber si caben», diciendo qué le falta.

El código está en `topePorPorcion` (`src/lib/calculo/costo.ts`).

### Los temporizadores

- **Suenan solo con la página abierta en el modo cocina.** Con el teléfono bloqueado o el navegador cerrado no suenan: avisar en ese caso exigiría notificaciones y un service worker. Al volver, el sitio dice «Terminó hace 3 minutos». Por eso iniciar un temporizador mantiene la pantalla encendida.
- **Siguen contando aunque salgas a la ficha de la receta**, pero solo avisan al volver al modo cocina.
- **La pantalla encendida** depende del navegador (Screen Wake Lock). Donde no existe, el sitio lo dice.
- En iPhone no hay vibración, y el interruptor de silencio puede apagar el sonido.

### Las alternativas

Lo que puede reemplazar a un ingrediente, sin sumarse al costo, se escribe en dos niveles:

- **En el catálogo** (`alternativa` en `ingredientes.json`): «pan tostado» para el calado. Vale para todas las recetas que lo usen.
- **En la receta** (`alternativa` en `receta.json`), solo si depende de su cantidad: «o 150 g de azúcar».

**La de la receta manda sobre la del catálogo** (`alternativaDe`, en `src/lib/recetas/alternativa.ts`). Es solo texto: tener la alternativa no cuenta como tener el ingrediente.

## Desarrollo

Requiere Node.js 22.12 o superior.

```bash
npm install
npm run dev         # http://localhost:5173/Moss-Taste/
npm test            # datos, contraste de colores, cálculo y pantallas
npm run test:reglas # reglas de Firestore contra el emulador (necesita Java 21)
npm run lint        # oxlint
npm run build       # typecheck + build + un index.html por ruta fija y por receta
npm run preview     # sirve el build en http://localhost:4173/Moss-Taste/
npm run imagenes    # genera imagen.webp y miniatura.webp de las recetas
```

Cada push a `main` corre pruebas, reglas, lint y build, y publica en GitHub Pages ([workflow](.github/workflows/desplegar.yml)).

### Cuentas con Firebase

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

### Probar el correo de contacto

`contacto@sergio-velandia.dev` pasa por Cloudflare Email Routing, que lo reenvía a Gmail. Para probarlo, **escribe desde una cuenta distinta a la de destino**: lo que un Gmail se manda a sí mismo no aparece en la bandeja de entrada, porque Gmail lo deduplica. No ver el mensaje en ese caso no significa que el canal esté roto.

## Cómo agregar una receta

1. Crea la carpeta `src/data/recetas/<slug>/` con un `receta.json`. El `id` debe ser igual al nombre de la carpeta.
2. Si usa ingredientes nuevos, agrégalos a `src/data/ingredientes.json` con su precio en pesos (entero) y la fecha del precio. Si se pueden reemplazar, su `alternativa` va ahí mismo («pan tostado»); en el `receta.json` solo si depende de la cantidad de esa receta («o 150 g de azúcar»). Si la receta los pide en tazas o cucharadas y se venden por peso, agrega su `densidad`; si los pide por unidad y se venden por peso, `gramosPorUnidad`.
3. Agrega la imagen: `ilustracion.svg` u `original.png` en la carpeta, `npm run imagenes` y una descripción en `imagenAlt`. Ver [docs/prompt-imagenes.md](docs/prompt-imagenes.md).
4. Corre `npm test`: si algo está mal, dice el archivo, el campo y qué corregir.

Dos reglas al escribirla:

- **Las cantidades son lo que va a la olla**, ya limpio y pelado. La merma del catálogo calcula cuánto comprar. Solo cuenta lo que se quita antes de cocinar (cáscara, recorte), nunca lo que se pierde cocinando.
- **El tiempo total incluye la preparación**, no solo los temporizadores.

No hace falta tocar ningún componente. Una receta inválida se omite del sitio sin romperlo. Las recetas se escriben con palabras propias.

## Cómo participar

- **Proponer una receta:** desde el [formulario del sitio](https://sergio-velandia.dev/Moss-Taste/contacto/), con sus ingredientes y pasos.
- **Reportar un problema:** abre un [issue](https://github.com/Sergio-Velandia/Moss-Taste/issues/new/choose).
- **Convenciones del repo** (ramas, commits, versiones, contenido y diseño): [CONTRIBUTING.md](CONTRIBUTING.md).

## Stack

React 19, Vite, TypeScript estricto, Tailwind CSS 4, React Router, Motion (solo en el modo cocina), Lucide, Vitest con Testing Library y oxlint. Firebase (Authentication y Firestore lite), cargado solo si hace falta una cuenta. `write-excel-file` solo para el .xlsx, cargado al exportar. Fuentes autoalojadas: Young Serif y Atkinson Hyperlegible Next. Más detalle, decisiones y mapa del código en [CLAUDE.md](CLAUDE.md).

## Seguridad y privacidad

- **Privacidad:** qué se guarda, dónde y cómo ejercer tus derechos, en la [política del sitio](https://sergio-velandia.dev/Moss-Taste/privacidad/).
- **`npm audit`:** antes de correr `npm audit fix`, lee [SECURITY.md](SECURITY.md). Hoy reporta 4 vulnerabilidades altas que no llegan al navegador, y `--force` rompería el proyecto.

## Licencia

- **Código:** [MIT](LICENSE).
- **Textos de las recetas:** [CC BY 4.0](LICENSE-CONTENT), que permite el uso comercial con atribución. No se reclama autoría sobre los platos clásicos: lo propio es la redacción.
- **Imágenes:** generadas con IA y etiquetadas como tales; bajo CC BY 4.0 solo en lo que haya derechos que ceder.
- **Fuentes:** SIL Open Font License 1.1, con sus licencias en `src/assets/fonts/`.

Moss Taste no está afiliado a Google, Firebase, EmailJS, Cloudflare ni GitHub; sus nombres pertenecen a sus dueños.
