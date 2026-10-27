# Roadmap

Pendientes anotados por fase, para que no se pierdan entre una y otra. El detalle de cada fase está en [CLAUDE.md](CLAUDE.md).

## Fase 1: estructura y diseño (`0.1.0`)
- [x] Sistema visual Berenjena: tokens, fuentes autoalojadas y tema claro / oscuro / sistema.
- [x] Componentes base, layout y router.
- [x] Un `index.html` por cada ruta fija, con título, descripción y canonical.
- [x] Datos de ejemplo (3 recetas) con validación, portada, galería con filtros en la URL y modo lectura.
- [x] Pantallas restantes: hoy, lista, contacto, acceso, mi cocina, nueva receta y acerca.
- [x] Modo cocina visual, probado a 375 px.
- [x] Verificación final, crítica de diseño, auditoría de accesibilidad, README, CHANGELOG y versión 0.1.0.
- [x] Push, primer despliegue y tag `v0.1.0`. Sitio desplegado probado: rutas directas, assets y 404.

## Fase 1.5: pulido del repo (`0.2.1`)
- [x] Imagen para compartir (1200 × 630), `apple-touch-icon` e íconos PNG del manifest.
- [x] `CONTRIBUTING.md`, plantilla de issues, `.editorconfig`, `.nvmrc` y metadatos en `package.json`.
- [ ] Metadatos del repo en GitHub (descripción, sitio y topics). Los pone el dueño desde la página del repo.
- [ ] Push y tag `v0.2.1` (con OK del dueño).

## Fase 2: cerebro de cálculo
- [x] Cerebro de cálculo en `src/lib/calculo/`: unidades (con densidad y peso por unidad), escalado, merma, costo en enteros y redondeo de cocina. Reemplaza al costo provisional.
- [x] El selector de porciones recalcula cantidades y costo; las porciones viven en la URL y pasan al modo cocina.
- [x] Push, despliegue y tag `v0.2.0`. Sitio desplegado probado.

## Fase 3: catálogo real y primeras recetas
- [ ] Reemplazar las 3 recetas y el catálogo de ejemplo por los reales, con imagen. La validación debe exigir la imagen cuando exista el modelo de imágenes.
- [ ] El modo lectura de una receta real debe ser indexable (hoy las de ejemplo llevan `noindex`).
- [ ] Prerenderizar `/recetas/:slug` cuando existan las recetas reales, y decidir si también `/recetas/:slug/cocinar`. En la Fase 1 solo se generan las rutas fijas: las recetas de ejemplo son ficticias y no vale la pena indexarlas. Mientras tanto, esas rutas se sirven desde `404.html`, con `noindex`.

## Fase 4: exportar y lista de compras
- [ ] Agregar recetas a la lista desde la ficha, con sus porciones (`sumarLista` ya escala, convierte y suma la merma).
- [ ] Mínimo de compra por ingrediente: no se venden 37 g de alcaparras, sino el frasco. Decidir si la lista redondea a la presentación que se vende.
- [ ] Activar «Exportar» en la ficha y en la lista (Excel, CSV y JSON).

## Fase 5: formulario de contacto
- [ ] Conectar el formulario de `/contacto` a EmailJS, con tope de envíos. Hoy solo valida.
- [ ] Agregar `sergio-velandia.dev` a los dominios permitidos de EmailJS.

## Fase 6: login y datos personales
- [ ] Conectar `/acceso`, `/mi-cocina` y `/mi-cocina/nueva` a Firebase. Hoy son pantallas con datos de ejemplo.
- [ ] Agregar `sergio-velandia.dev` a los dominios autorizados de Firebase Authentication.

## Fase 7: ¿Qué cocino hoy?
- [ ] Revisar `src/lib/recetas/hoy.ts` con las recetas reales (hoy cuenta ingredientes principales y ordena por lo que falta).

## Fase funcional del modo cocina
- [ ] Lógica de «Mantener pantalla encendida» en `src/features/cocina/usePantallaEncendida.ts` (Screen Wake Lock API). El botón y su estado «No disponible en este navegador» ya existen.
- [ ] Lógica de los temporizadores en `src/features/cocina/Temporizador.tsx` (hoy solo muestra el tiempo).

## Antes del lanzamiento
- [ ] Capturas del sitio para el README (se dejan para el final por si cambia el diseño).

## Fuera del repo
- [ ] Corregir en el ECOSISTEMA el hosting de Moss Taste: GitHub Pages en `/Moss-Taste`, Firebase solo para Auth y Firestore. Lo hace el dueño.
