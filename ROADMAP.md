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
- [ ] Push, primer despliegue y tag `v0.1.0` (con OK del dueño). Probar el sitio desplegado: rutas directas, assets y 404.

## Fase 1.5: pulido del repo
- [ ] Imagen para Open Graph (PNG 1200 × 630) y `apple-touch-icon` en PNG. Por ahora solo hay favicon en SVG y la tarjeta para compartir es `summary` sin imagen.

## Fase 2: cerebro de cálculo
- [ ] Reemplazar `src/lib/recetas/costoProvisional.ts` por el cálculo real: escalar porciones, convertir unidades (con densidad), aplicar merma.
- [ ] Hacer que el selector de porciones recalcule cantidades y costo, y quitar el aviso «El ajuste automático llega en una próxima versión».

## Fase 3: catálogo real y primeras recetas
- [ ] Reemplazar las 3 recetas y el catálogo de ejemplo por los reales, con imagen. La validación debe exigir la imagen cuando exista el modelo de imágenes.
- [ ] El modo lectura de una receta real debe ser indexable (hoy las de ejemplo llevan `noindex`).
- [ ] Prerenderizar `/recetas/:slug` cuando existan las recetas reales, y decidir si también `/recetas/:slug/cocinar`. En la Fase 1 solo se generan las rutas fijas: las recetas de ejemplo son ficticias y no vale la pena indexarlas. Mientras tanto, esas rutas se sirven desde `404.html`, con `noindex`.

## Fase 4: exportar y lista de compras
- [ ] Reemplazar `src/lib/recetas/lista.ts` (suma provisional en porciones base) por el cálculo real, y agregar recetas a la lista desde la ficha.
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

## Fuera del repo
- [ ] Corregir en el ECOSISTEMA el hosting de Moss Taste: GitHub Pages en `/Moss-Taste`, Firebase solo para Auth y Firestore. Lo hace el dueño.
