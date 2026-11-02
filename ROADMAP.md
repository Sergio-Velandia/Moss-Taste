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
- [x] Metadatos del repo en GitHub (descripción, sitio y topics).
- [x] Push, despliegue y tag `v0.2.1`.

## Fase 2: cerebro de cálculo
- [x] Cerebro de cálculo en `src/lib/calculo/`: unidades (con densidad y peso por unidad), escalado, merma, costo en enteros y redondeo de cocina. Reemplaza al costo provisional.
- [x] El selector de porciones recalcula cantidades y costo; las porciones viven en la URL y pasan al modo cocina.
- [x] Push, despliegue y tag `v0.2.0`. Sitio desplegado probado.

## Fase 3: catálogo real y primeras recetas
- [x] Las 3 recetas de la casa (ajiaco santafereño, changua y arroz con leche) reemplazan a las de ejemplo, con ilustraciones SVG generadas con IA, imagen y miniatura.
- [x] Catálogo real con empaques, mermas y densidades aproximadas aprobadas; agua y sal no se costean.
- [x] Imágenes de respaldo por categoría y validación que exige imagen, miniatura y texto alternativo.
- [x] Opcionales, alternativas y valores estimados visibles en la ficha; notas de la casa.
- [x] Prerenderizado de `/recetas/:slug` (indexable) y `/recetas/:slug/cocinar` (con `noindex`), con imagen para compartir propia.
- [ ] **Precios reales con fecha** en `src/data/ingredientes.json` (hoy en `null`; la ficha dice «Sin precio» y el costo «Pendiente»). La 0.3.0 salió sin ellos por decisión del dueño; llegan en una versión PATCH. Confirmar también los empaques supuestos: manojo de cebolla larga de 8 tallos, paquete de 10 calados, sobre de 3 astillas de canela y frasco de 50 g de canela en polvo.
- [x] README, CHANGELOG, versión 0.3.0 y push.
- [ ] Opcional: reemplazar las ilustraciones por fotos de Gemini con el prompt de `docs/prompt-imagenes.md`.

## Deuda técnica
- [ ] La prueba de Escape del modo cocina falló 1 de cada 14 corridas bajo carga (la ficha se carga bajo demanda). Se ampliaron las esperas; si vuelve a fallar en CI, revisar la carga diferida en las pruebas en vez de seguir subiendo tiempos.

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
