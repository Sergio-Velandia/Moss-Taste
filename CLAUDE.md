# Moss Taste

Recetario familiar: calcula ingredientes y costo en pesos colombianos para cualquier número de porciones, y exporta la receta o una lista de compras. Lo usan la familia y allegados; cualquiera puede crear cuenta. Proyecto **aparte** de Moss y Nexus: comparte el apellido de la familia, no el tema.

- **Repo:** https://github.com/Sergio-Velandia/Moss-Taste
- **Sitio:** `https://sergio-velandia.dev/Moss-Taste/` (GitHub Pages; aún sin desplegar)
- **Documentos base (fuera del repo):** PLAYBOOK, ECOSISTEMA, CONTEXTO-Moss-Taste y la guía maestra de diseño web. Si algo de aquí choca con el PLAYBOOK, gana este archivo, pero hay que avisarlo.
- **Pendientes por fase:** [ROADMAP.md](ROADMAP.md).

---

## Reglas de trabajo

- Se hace **solo la fase pedida**. Cada fase empieza con un plan corto y espera confirmación.
- Una fase = una rama corta que se integra a `main` al terminar.
- Commits en español con Conventional Commits (`tipo(ámbito): descripción en imperativo`, ≤ 70 caracteres). Un commit = un cambio lógico, y cada uno deja el proyecto compilando.
- **Sin push, sin tags y sin dependencias nuevas sin OK del dueño.**
- No afirmar que algo funciona sin ejecutar `npm test`, `npm run lint` y `npm run build`.
- Sincronía obligatoria: `package.json` ⇄ `CHANGELOG.md` ⇄ tag ⇄ tabla de estado del README.
- Datos de ejemplo siempre ficticios y marcados como tales. Nada de datos personales en lo público.

## Stack

React 19 + Vite + TypeScript estricto, Tailwind CSS 4, React Router, Motion, Lucide, Vitest (+ Testing Library y jsdom para pruebas de interfaz) y oxlint. npm. Alias `@/` → `src/`. `base` de Vite: `/Moss-Taste/`.

Firebase se usa **solo** para Authentication y Firestore, desde el sitio estático. Plan gratuito (Spark); nunca Blaze sin preguntar.

## Decisiones

| Fecha | Decisión | Por qué |
|---|---|---|
| 2026-10-26 | Hosting en GitHub Pages, ruta `/Moss-Taste` del dominio | Igual que Moss y Nexus; Firebase solo para Auth y Firestore |
| 2026-10-26 | Tema **claro por defecto**, selector claro / oscuro / sistema | Excepción deliberada al ECOSISTEMA: es una app de cocina que se usa de día |
| 2026-10-26 | Identidad visual **Berenjena** (ver abajo) | La franja cálida del círculo ya la ocupan Nexus (carmesí y ámbar) y el portafolio (dorado); la berenjena queda en el hueco más amplio |
| 2026-10-26 | Tipografía propia, **sin Inter** | Es un recetario, no una herramienta técnica como Moss y Nexus |
| 2026-10-26 | Fuentes autoalojadas en `src/assets/fonts/`, sin paquete | La IP del visitante no sale hacia un tercero y no suma dependencias |
| 2026-10-26 | Un `index.html` por ruta fija, con script propio | Que los buscadores indexen las rutas; `/recetas/:slug` se prerenderiza en la Fase 3 |
| 2026-10-26 | Recetas públicas en el repo y escritas con palabras propias; recetas personales privadas en Firestore | Lo público no es secreto; el login protege solo lo personal |
| 2026-10-26 | Contacto solo por formulario (EmailJS → `contacto@sergio-velandia.dev`), sin WhatsApp ni teléfono | Ningún dato personal visible |
| — | Licencia | Se decide en la Fase Legal |
| — | Librería de Excel | Se decide en la Fase 4, verificando mantenimiento y licencia (no `xlsx` sin comprobarlo) |

## Identidad visual: Berenjena

Los valores viven como tokens en `src/styles/tokens.css`. **Ningún componente usa hex sueltos.**

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `bg` | `#FAF7F2` harina | `#17120F` fogón | Fondo |
| `surface` | `#FFFFFF` loza | `#221B17` | Superficies |
| `line` | `#E6DED3` | `#3A3029` | Bordes y separadores |
| `ink` | `#2A2320` carbón | `#F4EEE6` | Texto |
| `ink-soft` | `#5E5550` | `#C2B7AA` | Texto secundario |
| `accent` | `#6B3A8C` berenjena | `#C9A0EA` | Botón principal, enlaces, foco, progreso |
| `accent-soft` | `#EFE6F5` | `#2E2236` | Chips y fondos suaves |
| `on-accent` | `#FFFFFF` | `#17120F` | Texto sobre el acento |

Contraste verificado (WCAG AA): texto 14,45 / 16,13; secundario 6,80 / 9,42; acento 7,53 / 8,59; texto sobre acento 8,05 / 8,59.

- **Títulos:** Young Serif (400). Serif gruesa de bajo contraste, de recetario impreso.
- **Cuerpo e interfaz:** Atkinson Hyperlegible Next (400 y 700). Legible a un brazo de distancia en el modo cocina.
- Cifras con `tabular-nums`, nunca monoespaciada.
- **Momento protagonista:** el modo cocina. El resto, sobrio.
- Solo se anima `transform` y `opacity`; nada de `transition: all`; `prefers-reduced-motion` respetado, incluidos los retrasos.

## Fases

| Fase | Qué se hace | Versión | Estado |
|---|---|---|---|
| 1 | Estructura y diseño con datos de ejemplo | `0.1.0` | en curso |
| 1.5 | Pulido del repo | `0.1.1` | pendiente |
| 2 | Cerebro de cálculo con pruebas | `0.2.0` | pendiente |
| 3 | Catálogo real y las 3 primeras recetas con imagen | `0.3.0` | pendiente |
| 4 | Exportar y lista de compras | `0.4.0` | pendiente |
| 5 | Formulario de contacto con EmailJS | `0.5.0` | pendiente |
| 6 | Login, favoritos, notas y recetas personales | `0.6.0` | pendiente |
| 7 | «¿Qué cocino hoy?» | `0.7.0` | pendiente |
| 8 | Crecer de a poco, una receta por commit | `0.N.0` | pendiente |
| L | Fase Legal | `0.N.0` | pendiente |
| R | Repaso | `0.N.x` | pendiente |
| 🚀 | Documentarlo en Moss y mencionarlo en el portafolio | `1.0.0` | pendiente |

## Fuera de alcance

Subir fotos (Cloud Storage exige Blaze), publicar recetas desde la app, backend propio, Blaze o servicios de pago, subir archivos Excel, feed con algoritmo, dominio aparte y términos largos mientras sea de uso familiar.

## Mapa del código

Se completa a medida que se construye.

```
index.html              script que aplica el tema guardado antes de pintar + precarga de fuentes
src/
├─ main.tsx             punto de entrada
├─ app/
│  ├─ App.tsx           raíz de la app
│  └─ tema/             tema.ts (preferencia y almacenamiento), ProveedorTema, useTema, SelectorTema
├─ assets/fonts/        .woff2 (subconjunto latino) + licencias OFL
└─ styles/
   ├─ tokens.css        color (claro, oscuro, sistema), tipografía, radios, sombras y movimiento → utilidades de Tailwind
   ├─ tokens.test.ts    verifica el contraste AA de cada par de tokens
   ├─ fuentes.css       @font-face
   └─ index.css         estilos base y movimiento reducido
```

- Pruebas de interfaz: comentario `// @vitest-environment jsdom` al inicio del archivo. Las demás corren en Node.
- `tsconfig.test.json` cubre los `*.test.ts(x)` con tipos de Node; `tsconfig.app.json` los excluye.
- Clave de almacenamiento del tema: `moss-taste:tema` (la usan `tema.ts` y el script de `index.html`; una prueba verifica que coincidan).
