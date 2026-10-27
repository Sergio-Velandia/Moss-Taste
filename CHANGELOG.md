# Changelog

Todos los cambios visibles de Moss Taste. Formato [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y versionado [SemVer](https://semver.org/lang/es/).

## [Sin publicar]

## [0.2.1] - 2026-10-27

Pulido del repo (Fase 1.5) y ajustes al cálculo de porciones.

### Añadido

- Imagen para compartir el sitio en redes y mensajería, e íconos para agregarlo a la pantalla de inicio en iPhone y Android.
- Convenciones del repo en CONTRIBUTING.md y plantilla para reportar problemas en GitHub.

### Cambiado

- La ficha dice para cuántas porciones es la receta original y ofrece volver a ellas después de cambiarlas. El texto también sale al imprimir.
- En la ficha ya no aparece el chip de porciones, que confundía al elegir otras.

## [0.2.0] - 2026-10-27

Cerebro de cálculo: porciones, unidades, merma y costo calculados de verdad.

### Añadido

- Al cambiar las porciones, la receta recalcula las cantidades y el costo. Las porciones quedan en la dirección de la página, se pueden compartir y pasan al modo cocina.
- Conversión de medidas de cocina: taza (240 ml), cucharada (15 ml) y cucharadita (5 ml) como estándar, más la libra colombiana (500 g) y la pizca. Pasa de volumen a peso con la densidad de cada ingrediente y de unidades a peso con lo que pesa una.
- Merma: la ficha dice cuánto comprar cuando al limpiar o pelar se pierde parte del ingrediente, y el costo es el de lo que se compra.
- Cantidades redondeadas como se miden en la cocina: «335 g», «1,6 kg», «1½ tazas».
- Cuando un ingrediente no se puede calcular, la ficha dice por qué: sin precio, sin equivalencia o fuera del catálogo.

### Cambiado

- La lista de compras suma lo que hay que comprar, con la merma incluida, y junta el mismo ingrediente aunque las recetas lo pidan en medidas distintas.
- El presupuesto por porción de la galería y de «¿Qué cocino hoy?» usa el cálculo real.
- Las recetas de ejemplo usan libras, tazas y cucharadas.
- La página «Acerca» explica cómo se calcula el costo.

### Eliminado

- El aviso de que el ajuste de porciones llegaba en una próxima versión.

## [0.1.0] - 2026-10-27

Primera versión: estructura y diseño con datos de ejemplo.

### Añadido

- Identidad visual Berenjena: colores para tema claro y oscuro con contraste AA verificado por pruebas, y tipografías Young Serif y Atkinson Hyperlegible Next autoalojadas.
- Selector de tema claro, oscuro o sistema, que recuerda la elección. Claro por defecto.
- Cabecera con menú móvil, pie y enlace para saltar al contenido.
- Portada con recetas destacadas y acceso a «¿Qué cocino hoy?».
- Galería de recetas con buscador sin tildes y filtros por categoría, ingrediente y presupuesto por porción, guardados en la URL.
- Modo lectura de cada receta: ingredientes con cantidad y precio, costo estimado con rango de ±10 % y fecha del precio, mise en place y pasos. Se puede imprimir.
- Modo cocina: un paso a la vez a pantalla completa, con letra grande, los ingredientes del paso, temporizador visual, progreso y navegación con el teclado.
- «¿Qué cocino hoy?», lista de compras de ejemplo, contacto, acceso, mi cocina, nueva receta y acerca, con validación de formularios.
- Tres recetas de ejemplo con precios ficticios, marcadas como tales, y validación automática de los datos.
- Página 404, un `index.html` por cada ruta fija con su título y descripción, y sitemap.
- Despliegue automático en GitHub Pages y actualizaciones de dependencias con Dependabot.

[Sin publicar]: https://github.com/Sergio-Velandia/Moss-Taste/compare/v0.2.1...HEAD
[0.2.1]: https://github.com/Sergio-Velandia/Moss-Taste/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/Sergio-Velandia/Moss-Taste/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/Sergio-Velandia/Moss-Taste/releases/tag/v0.1.0
