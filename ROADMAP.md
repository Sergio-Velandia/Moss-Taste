# Roadmap

Pendientes anotados por fase, para que no se pierdan entre una y otra. El detalle de cada fase está en [CLAUDE.md](CLAUDE.md).

## Fase 1: estructura y diseño (`0.1.0`)
- [ ] Sistema visual Berenjena: tokens, fuentes autoalojadas y tema claro / oscuro / sistema.
- [ ] Componentes base, layout y router.
- [ ] Un `index.html` por cada ruta fija, con título, descripción y canonical.
- [ ] Pantallas navegables con 6 recetas de ejemplo.
- [ ] Modo cocina visual, probado a 375 px.

## Fase 3: catálogo real y primeras recetas
- [ ] Prerenderizar `/recetas/:slug` (y decidir si `/recetas/:slug/cocinar`) cuando existan las recetas reales. En la Fase 1 solo se generan las rutas fijas: las recetas de ejemplo son ficticias y no vale la pena indexarlas.

## Fase 5: formulario de contacto
- [ ] Agregar `sergio-velandia.dev` a los dominios permitidos de EmailJS.

## Fase 6: login y datos personales
- [ ] Agregar `sergio-velandia.dev` a los dominios autorizados de Firebase Authentication.

## Fase funcional del modo cocina
- [ ] Lógica de «Mantener pantalla encendida» (Screen Wake Lock API), con su estado «No disponible en este navegador» cuando la API no exista.
- [ ] Lógica de los temporizadores.

## Fuera del repo
- [ ] Corregir en el ECOSISTEMA el hosting de Moss Taste: GitHub Pages en `/Moss-Taste`, Firebase solo para Auth y Firestore. Lo hace el dueño.
