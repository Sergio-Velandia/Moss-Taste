# Moss Taste

Recetario familiar: calcula ingredientes y costo en pesos colombianos para cualquier número de porciones, y exporta la receta o una lista de compras. Lo usan la familia y allegados; cualquiera puede crear cuenta. Proyecto **aparte** de Moss y Nexus: comparte el apellido de la familia, no el tema.

- **Repo:** https://github.com/Sergio-Velandia/Moss-Taste
- **Sitio:** https://sergio-velandia.dev/Moss-Taste/ (GitHub Pages)
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
| 2026-10-26 | Fase 1 con **3 recetas de ejemplo** (una por categoría) en vez de 6 | Agilizar la fase; las reales llegan en la Fase 3 |
| 2026-10-27 | Medidas estándar por defecto (taza 240 ml, cucharada 15 ml, cucharadita 5 ml) y dos adicionales: libra colombiana (500 g) y pizca (1/16 de cucharadita) | Las estándar son las que se ofrecen primero; las adicionales son de uso común en Colombia |
| 2026-10-27 | Los ingredientes «al gusto» escalan como referencia y conservan la marca | Que la familia vea una cantidad orientativa y ajuste |
| 2026-10-27 | El costo es el de lo que se **compra** (uso + merma) | Es lo que sale del bolsillo |
| 2026-10-27 | Dinero: cada línea se redondea al peso y el total es la suma de las líneas; las cantidades se redondean solo para mostrar | Que lo que se ve cuadre; el costo usa la cantidad exacta |
| 2026-11-02 | Recetas: las cantidades son lo que va a la olla; la merma dice cuánto comprar. El pollo con hueso lleva merma 0 porque el hueso va al caldo. Lo que se cuenta por unidades lleva merma 0 | Lo acordó el dueño al revisar las recetas |
| 2026-11-02 | Opcionales suman al costo y se marcan en la fila, el precio y la tirilla; de las alternativas solo cuenta la principal | No inflar el costo y poder restar lo opcional de un vistazo |
| 2026-11-02 | Imágenes: ilustraciones SVG generadas por Claude (IA) en estilo común; se pueden reemplazar por fotos de Gemini sin tocar código | El SVG fuente queda en el repo y la imagen se regenera exacta; siempre se etiquetan como IA |
| 2026-11-02 | Un precio puede quedar en null mientras se cotiza: la ficha dice «Sin precio» y el costo «Pendiente», y el filtro de presupuesto no la deja pasar | Nunca asumir cero |
| 2026-11-02 | Precio del catálogo = punto medio del rango cotizado | El sitio ya muestra ±10 %, que cubre la mayor parte del rango |
| 2026-11-02 | Excel con `write-excel-file` (MIT, una sola dependencia, ~20 KB gzip cargados solo al exportar). Se usa **solo para el .xlsx**; CSV y JSON se generan a mano | Mantenida (4.1.1, junio de 2026) y liviana; lo simple no necesita librería |
| 2026-11-02 | CSV para Excel en español: UTF-8 con BOM, separador `;`, coma decimal y CRLF; el texto que empieza con `= + - @` se antepone con `'` | Que abra bien con doble clic y sin fórmulas inyectadas |
| 2026-11-02 | La lista muestra dos totales, nunca mezclados: «Lo que cuestan estas recetas» (proporcional a lo usado) y «Lo que pagas hoy en caja» (empaques completos, campo `empaque` del catálogo) | El costo de la receta sigue siendo proporcional; la caja es lo que sale del bolsillo ese día |
| 2026-11-02 | La lista se guarda en `localStorage` (`moss-taste:lista`) hasta la Fase 6, con topes (20 recetas, 200 marcas, 16 KB) y en memoria si el navegador no deja guardar | No exige cuenta; el sitio sigue funcionando en modo privado |
| 2026-11-02 | Contacto con la API REST de EmailJS, sin SDK. Servicio y plantilla compartidos con Moss y Moss Nexus (`tipo`, `nombre`, `correo`, `asunto`, `mensaje`); los tres identificadores en `src/sitio.ts`, como en los otros proyectos | Son públicos por diseño y así no se suma dependencia |
| 2026-11-02 | Tope de envíos por navegador: uno por minuto y cinco por día (`moss-taste:envios`), más el campo trampa. El límite real es el de EmailJS por IP | Frena el doble clic y el abuso casual; el del navegador se puede saltar |
| 2026-11-04 | Firebase cargado con `import()` y solo en `lib/cuentas/firebase.ts`; Firestore **lite** (67 KB gzip con Auth, frente a 172). Una prueba impide importarlo de forma estática | Quien solo mira recetas no descarga el SDK. Se pierde tiempo real y caché, y no quedan datos en un computador compartido |
| 2026-11-04 | `moss-taste:sesion` es solo una pista para cargar el SDK: nunca decide qué se muestra ni a qué ruta se entra | Ponerla a mano solo descarga el SDK de más |
| 2026-11-04 | Una cuenta sin documento de perfil es siempre no registrada, aunque exista en Authentication. El perfil guarda la autorización. Las reglas exigen el perfil para todo lo demás | Ningún camino la deja usable, ni cerrando la pestaña a mitad. Firebase crea la cuenta de Google antes de poder preguntar, y evitarlo exige Blaze |
| 2026-11-04 | Topes con contadores en el perfil: suben o bajan exactamente 1, en la misma escritura que crea o borra el documento, que se nombra en `ultimaReceta` o `ultimaInteraccion`. Borrar la cuenta es de a uno | Las reglas no cuentan documentos y el cliente no puede escribir el valor que quiera |
| 2026-11-04 | Las listas de una receta personal se guardan como textos JSON | Las reglas no tienen ciclos: así limitan el número (`size`) y el total de caracteres (`join`) |
| 2026-11-04 | `firestore.rules` es la única fuente de verdad; las pega el dueño en la consola y el CHANGELOG registra la fecha | Sin `firebase login` no queda en el equipo una sesión con permisos sobre todo el proyecto |
| 2026-11-04 | Combinar la lista: unión de recetas; mayor cantidad de porciones; primero las de la cuenta si no caben; una marca de comprado solo sobrevive si la cantidad no aumentó | No perder nada, ni decir que ya se tiene algo que falta |
| 2026-11-04 | La interfaz dice «otras cuentas no la ven», nunca «solo la ves tú» | Quien administra el proyecto puede ver los datos en la consola de Firebase; la política lo declara |
| 2026-11-04 | Licencia: MIT (`LICENSE`) para el código y CC BY 4.0 (`LICENSE-CONTENT`) para los textos, que permite el uso comercial con atribución. Imágenes de IA bajo CC BY solo en lo que haya derechos. OFL en las fuentes. Dos archivos, como en Nexus | Con todo en `LICENSE`, GitHub ya no reconoce la licencia MIT |
| 2026-11-04 | Un ingrediente escrito a mano que coincide con el catálogo toma su precio, y la línea lo dice con la fecha | Que se sepa de dónde salió el número |
| 2026-11-04 | El cambio de versión va siempre en su propio commit | Lo pidió el dueño tras la Fase 6, donde quedó mezclado |
| 2026-11-04 | No correr `npm audit fix --force`: ver `SECURITY.md` | Las alertas son de una dependencia solo de Node y el arreglo forzado baja Firebase a la versión 9 |
| 2026-11-04 | Cambiar la URL dentro de la misma página (porciones, filtros) usa `preventScrollReset` | No es ir a otra página: no debe volver arriba |
| 2026-11-04 | No se exige correo verificado | Nada importante depende hoy de que el correo sea de quien dice ser; se revisa si la app llega a mandar correos |
| 2026-11-04 | Responsable en la política: nombre, «Bogotá, Colombia» y `contacto@sergio-velandia.dev`, sin teléfono ni dirección | Decisión del dueño, que asume el riesgo frente al Decreto 1377 de 2013; no es asesoría jurídica |

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
| 1 | Estructura y diseño con datos de ejemplo | `0.1.0` | hecha y publicada |
| 1.5 | Pulido del repo (salió después de la Fase 2) | `0.2.1` | hecha y publicada |
| 2 | Cerebro de cálculo con pruebas | `0.2.0` | hecha y publicada |
| 3 | Catálogo real y las 3 primeras recetas con imagen | `0.3.0` y `0.3.1` (precios) | hecha y publicada |
| 4 | Exportar y lista de compras | `0.4.0` | hecha y publicada |
| 5 | Formulario de contacto con EmailJS | `0.5.0` | hecha y publicada |
| 6 | Login, favoritos, notas, recetas personales, mis datos y parte legal | `0.6.0` | hecha y publicada |
| 7 | «¿Qué cocino hoy?» | `0.7.0` | pendiente |
| 8 | Crecer de a poco, una receta por commit | `0.N.0` | pendiente |
| L | Fase Legal | `0.6.0` | hecha dentro de la Fase 6 |
| R | Repaso | `0.N.x` | pendiente |
| 🚀 | Documentarlo en Moss y mencionarlo en el portafolio | `1.0.0` | pendiente |

## Fuera de alcance

Subir fotos (Cloud Storage exige Blaze), publicar recetas desde la app, backend propio, Blaze o servicios de pago, subir archivos Excel, feed con algoritmo, dominio aparte y términos largos mientras sea de uso familiar.

## Convenciones

Ramas, commits, versiones y reglas de contenido y diseño: [CONTRIBUTING.md](CONTRIBUTING.md). Formato del editor en `.editorconfig`; versión de Node en `.nvmrc` (la misma que usa CI).

## Mapa del código

Se completa a medida que se construye.

```
index.html              metadatos base, script que aplica el tema antes de pintar, precarga de fuentes
public/                 favicon.svg, site.webmanifest, og-imagen.png (para compartir), apple-touch-icon.png, icono-192/512.png
docs/imagenes.md        cómo se generaron las imágenes del sitio
docs/prompt-imagenes.md prompt base, flujo de las imágenes de recetas y revisión de los términos de Google
scripts/
└─ paginasEstaticas.ts  plugin de Vite: index.html por ruta fija, 404.html y sitemap.xml
firestore.rules         reglas de Firestore, la única fuente de verdad; firebase.json configura los emuladores
reglas/firestore.test.ts pruebas de las reglas contra el emulador (npm run test:reglas, con vitest.reglas.config.ts)
.github/
├─ workflows/desplegar.yml  pruebas, lint y build en cada push y PR; despliegue a GitHub Pages desde main
├─ dependabot.yml           PR semanal con dependencias y mensual con acciones
└─ ISSUE_TEMPLATE/          plantilla para reportar problemas; las recetas se proponen en /contacto
src/
├─ main.tsx             punto de entrada
├─ sitio.ts             nombre, URL pública y helpers de título y canonical
├─ rutas.ts             RUTAS_FIJAS: fuente única para el router, los metadatos y el plugin de páginas
├─ app/
│  ├─ App.tsx           tema + MotionConfig (respeta reduced motion) + router con basename /Moss-Taste/
│  ├─ rutasApp.tsx      árbol de rutas con carga bajo demanda; el modo cocina va fuera del layout
│  ├─ Layout.tsx        salto al contenido, cabecera, main, pie; foco al h1 al navegar
│  ├─ ErrorRuta.tsx     error inesperado de una ruta
│  ├─ RutaProtegida.tsx sin sesión o sin autorización, a /acceso y de vuelta adonde iba
│  ├─ layout/           Cabecera (con menú móvil), Pie, Marca, navegacion.ts
│  └─ tema/             tema.ts (preferencia y almacenamiento), ProveedorTema, useTema, SelectorTema
├─ components/
│  ├─ EncabezadoPagina.tsx  h1 + entrada de una página fija, con sus metadatos
│  └─ ui/               Boton, BotonEnlace, Campo, CampoArea, CampoSelect, Chip, GrupoChips, EstadoVacio, EstadoError, Cargando, AvisoEnVivo
├─ components/receta/   TarjetaReceta, ImagenReceta (imagen + aviso de IA + respaldo), IlustracionCategoria, MetaReceta,
│                       SelectorPorciones, ListaIngredientes, ResumenCosto (la «tirilla»), MiseEnPlace, Pasos, AvisoEjemplo,
│                       FichaReceta (el modo lectura, común a las públicas y a las personales)
├─ components/exportar/ MenuExportar: botón con Excel, CSV y JSON; cada página le pasa su función generar
├─ components/cuenta/   CasillaAutorizacion, ConfirmarIdentidad, PanelReceta (favorita, probada y nota), MisDatos
├─ data/
│  ├─ recetas/<slug>/      receta.json + ilustracion.svg (o original.png sin subir) → imagen.webp y miniatura.webp
│  ├─ ingredientes.json            catálogo con precio en COP entero, fecha, merma, densidad, gramosPorUnidad y empaque
│  └─ categorias.json
├─ features/cocina/     ModoCocina (pasos, progreso, teclado, transición), Temporizador y BotonPantalla (visuales),
│                       usePantallaEncendida (gancho pendiente de la fase funcional)
├─ pages/               una por ruta
├─ lib/
│  ├─ recetas/          tipos, validar (propia, sin dependencias), crearCatalogo (validación + imágenes, reutilizable),
│  │                    catalogo (datos reales con import.meta.glob),
│  │                    filtrar (filtros de la galería ⇄ URL), hoy (sugerencias), lista (suma de compras),
│  │                    porciones (?porciones= en la URL)
│  ├─ calculo/          CEREBRO DE CÁLCULO, puro y sin React: unidades, escalar, merma, costo, redondeo,
│  │                    empaques (cómo se compra en la tienda y lo que se paga en caja)
│  ├─ exportar/         tabla (hojas propias), hojas (receta y lista), csv y json (a mano), excel (write-excel-file,
│  │                    carga bajo demanda), descargar (Blob + enlace)
│  ├─ lista/            almacen (localStorage validado, topes y respaldo en memoria), almacenCuenta, activa (cuál se usa),
│  │                    combinar (al iniciar sesión), useListaCompras
│  ├─ cuentas/          firebase (el único que importa el SDK), sesion (estados, sin SDK), datos (lo de la cuenta en memoria),
│  │                    recetaPersonal (formulario ⇄ receta ⇄ Firestore), errores (códigos → español), pista, misDatos, config, tipos
│  ├─ formato.ts        COP, cantidades, tiempo, fecha y normalizar (búsqueda sin tildes)
│  ├─ contacto/         enviar (armar el correo y API de EmailJS, con el motivo del fallo), limite (tope por navegador)
│  ├─ validarFormularios.ts  contacto y acceso
│  └─ clases.ts, useMetadatos.ts
├─ test/
│  ├─ configuracion.ts  espera de hasta 10 s para las cargas bajo demanda en las pruebas
│  ├─ datos/            recetas, ingredientes y categorías ficticios y fijos para las pruebas
│  ├─ catalogoPrueba.ts catálogo de prueba; las pruebas de pantallas lo usan con vi.mock('@/lib/recetas/catalogo', …)
│  └─ cuentasFalsas.ts  Firebase en memoria para las pruebas de pantallas, con vi.mock('@/lib/cuentas/firebase', …)
├─ assets/fonts/        .woff2 (subconjunto latino) + licencias OFL
└─ styles/
   ├─ tokens.css        color (claro, oscuro, sistema), tipografía, radios, sombras y movimiento → utilidades de Tailwind
   ├─ tokens.test.ts    verifica el contraste AA de cada par de tokens
   ├─ fuentes.css       @font-face
   └─ index.css         estilos base y movimiento reducido
```

- Lo que todavía no funciona (temporizadores, pantalla encendida) existe en la interfaz y avisa con `AvisoEnVivo` que llega después. Los datos ficticios se marcan con `AvisoEjemplo`.
- **Cálculo:** todo pasa por `calcularReceta(receta, porciones, catalogo)` en `src/lib/calculo/costo.ts`. Si una línea no se puede calcular, trae `motivo` (`sin-ingrediente`, `sin-precio`, `sin-conversion`) y no suma al total. Para mostrar cantidades se usa `formatoCantidad`, que aplica el redondeo de cocina.
- **Agregar una receta:** crear `src/data/recetas/<slug>/receta.json` (el `id` igual al nombre de la carpeta) y, si hace falta, sus ingredientes en `ingredientes.json`. Si la receta usa tazas o cucharadas de algo que se vende por peso, el ingrediente necesita `densidad`; si usa unidades de algo que se vende por peso, `gramosPorUnidad`; si se vende en frasco, bolsa o caja, `empaque` con su nombre en singular y plural (sin él, la lista lo trata como suelto). Una prueba falla si alguna medida no se puede convertir. La imagen: `ilustracion.svg` u `original.png` en la carpeta y `npm run imagenes` (ver `docs/prompt-imagenes.md`), más `imagenAlt` en el `receta.json`. No se toca ningún componente. `npm test` dice qué falla y dónde; una receta inválida se omite del sitio sin romperlo.
- **Cambiar lo que se guarda o a quién se le envía:** se actualiza `src/pages/Privacidad.tsx` y `VERSION_POLITICA` (`lib/cuentas/config.ts`) en el mismo cambio. Si cambia un tope, se cambia en `firestore.rules` y en `TOPES`, y las reglas se vuelven a pegar en la consola.
- **Correo de contacto:** Cloudflare Email Routing reenvía a Gmail. Se prueba desde otra cuenta: lo que un Gmail se manda a sí mismo no se ve.
- **Agregar una ruta fija:** se registra en `src/rutas.ts` y en `src/app/rutasApp.tsx`. La prueba de humo (`rutas.test.tsx`) falla si una ruta fija no abre con un solo h1 y su título.
- Pruebas de interfaz: comentario `// @vitest-environment jsdom` al inicio del archivo. Las demás corren en Node.
- `tsconfig.test.json` cubre los `*.test.ts(x)` de `src/` con tipos de Node; `tsconfig.app.json` los excluye; `tsconfig.node.json` cubre `vite.config.ts` y `scripts/`.
- Clave de almacenamiento del tema: `moss-taste:tema` (la usan `tema.ts` y el script de `index.html`; una prueba verifica que coincidan).
- En Windows el sistema de archivos no distingue mayúsculas: no crear archivos que solo difieran en ellas (por ejemplo `boton.ts` y `Boton.tsx`).

## Despliegue

- GitHub Pages con Actions (`.github/workflows/desplegar.yml`). En el repo, **Settings → Pages → Source** debe estar en **GitHub Actions**.
- El dominio propio se configura solo en el repo raíz (`Sergio-Velandia.github.io`); este repo hereda `/Moss-Taste/`.
