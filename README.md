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

Lo que todavía no funciona (cuentas, temporizadores y mantener la pantalla encendida) ya existe en la interfaz y avisa que llega en una próxima versión. El plan completo está en [ROADMAP.md](ROADMAP.md).

## Qué se puede hacer hoy

- Cocinar las primeras recetas de la casa: ajiaco santafereño, changua y arroz con leche, con su costo estimado al 2 de noviembre de 2026.

- Buscar recetas por nombre o ingrediente y filtrarlas por categoría y presupuesto por porción. Los filtros quedan en la URL.
- Elegir las porciones y ver al instante las cantidades y el costo recalculados: convierte tazas, cucharadas y libras, suma lo que se pierde al limpiar o pelar y muestra el costo con rango de ±10 % y la fecha del precio.
- Leer una receta completa: ingredientes (con los opcionales y las alternativas marcados), lo que se deja listo antes de empezar, los pasos y las notas de la casa.
- Cocinarla en el **modo cocina**: un paso a la vez, con letra grande, los ingredientes de ese paso y botones grandes. Funciona con el teclado (flechas y Escape).
- Juntar varias recetas en la **lista de compras**: suma los ingredientes, dice cómo vienen en la tienda («1 frasco de 100 g») y muestra por separado lo que cuestan las recetas y lo que se paga hoy en caja. Se guarda en el navegador, sin cuenta.
- Exportar una receta o la lista a Excel, CSV (listo para Excel en español) o JSON, con las porciones elegidas.
- Proponer una receta o escribir un mensaje desde el formulario de contacto.
- Ver qué se puede cocinar con los ingredientes que hay en casa.
- Tema claro (por defecto), oscuro o el del sistema.

## Desarrollo

Requiere Node.js 22.12 o superior.

```bash
npm install
npm run dev        # http://localhost:5173/Moss-Taste/
npm test           # pruebas: datos, contraste de colores, lógica y pantallas
npm run lint       # oxlint
npm run build      # typecheck + build + un index.html por ruta fija
npm run preview    # sirve el build en http://localhost:4173/Moss-Taste/
```

Cada push a `main` corre pruebas, lint y build, y publica en GitHub Pages ([workflow](.github/workflows/desplegar.yml)).

## Cómo agregar una receta

1. Crea la carpeta `src/data/recetas/<slug>/` con un `receta.json`. El `id` debe ser igual al nombre de la carpeta.
2. Si usa ingredientes nuevos, agrégalos a `src/data/ingredientes.json` con su precio en pesos (entero) y la fecha del precio. Si la receta los pide en tazas o cucharadas y se venden por peso, agrega su `densidad`; si los pide por unidad y se venden por peso, `gramosPorUnidad`.
3. Agrega la imagen: `ilustracion.svg` u `original.png` en la carpeta, `npm run imagenes` y una descripción en `imagenAlt`. Ver [docs/prompt-imagenes.md](docs/prompt-imagenes.md).
4. Corre `npm test`: si algo está mal, dice el archivo, el campo y qué corregir.

No hace falta tocar ningún componente. Una receta inválida se omite del sitio sin romperlo. Las recetas se escriben con palabras propias.

## Cómo participar

- **Proponer una receta:** desde el [formulario del sitio](https://sergio-velandia.dev/Moss-Taste/contacto/), con sus ingredientes y pasos.
- **Reportar un problema:** abre un [issue](https://github.com/Sergio-Velandia/Moss-Taste/issues/new/choose).
- **Convenciones del repo** (ramas, commits, versiones, contenido y diseño): [CONTRIBUTING.md](CONTRIBUTING.md).

## Stack

React 19, Vite, TypeScript estricto, Tailwind CSS 4, React Router, Motion (solo en el modo cocina), Lucide, Vitest con Testing Library y oxlint. `write-excel-file` solo para el .xlsx, cargado al exportar. Fuentes autoalojadas: Young Serif y Atkinson Hyperlegible Next (licencia OFL). Más detalle, decisiones y mapa del código en [CLAUDE.md](CLAUDE.md).

## Licencia

Por definir en la Fase Legal. Hasta entonces, todos los derechos reservados.
