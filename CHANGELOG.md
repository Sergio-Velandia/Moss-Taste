# Changelog

Todos los cambios visibles de Moss Taste. Formato [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y versionado [SemVer](https://semver.org/lang/es/).

## [Sin publicar]

## [0.8.0] - 2026-11-04

Tres platos fuertes, publicados antes de tener todos sus precios e imágenes.

### Añadido

- Lentejas con chorizo, sudado de pollo y sobrebarriga en salsa criolla, en la nueva categoría Platos fuertes.
- 16 ingredientes nuevos en el catálogo, **todavía sin precio**: las tres recetas muestran costo parcial y «Sin precio» en lo que falta. Nunca se asume cero. Con presupuesto salen aparte, bajo «No se puede saber si caben».
- Alternativas: yuca por más papa, y color o achiote por cúrcuma, avisando que no da el mismo color.
- Mientras llegan sus imágenes, las tres recetas usan la ilustración de su categoría.

### Corregido

- `npm test` no veía una carpeta de receta nueva por un caché de las pruebas, así que no podía decir qué fallaba en ella.
- Un ingrediente sin precio ya no se presenta como «Suelto, por peso»: todavía no se sabe cómo se vende.

Estimados altos por porción de esta versión:

| Receta | Estimado alto por porción | Primer filtro que pasa |
|---|---|---|
| Arroz con leche | $ 2.488 | Hasta $ 5.000 |
| Changua | $ 3.229 | Hasta $ 5.000 |
| Ajiaco santafereño | $ 9.815 | Hasta $ 10.000 |
| Lentejas con chorizo | Pendiente de precios | No se puede saber |
| Sudado de pollo | Pendiente de precios | No se puede saber |
| Sobrebarriga en salsa criolla | Pendiente de precios | No se puede saber |

## [0.7.0] - 2026-11-04

«¿Qué cocino hoy?» revisado con las recetas reales.

### Añadido

- Con cuenta, tus recetas personales aparecen en «¿Qué cocino hoy?», marcadas como «Tuya». Los ingredientes que escribiste tú salen aparte de los del catálogo.
- Elegir solo un presupuesto ya lista las recetas que caben, sin marcar ingredientes.
- Las alternativas viven en el catálogo de ingredientes. Lo que falta dice, por ejemplo, «Calado (o pan tostado)».
- Las tarjetas dicen hasta dónde llega el estimado: «Alrededor de $ 2.936 por porción, estimado hasta $ 3.229».

### Cambiado

- El filtro de presupuesto, en «¿Qué cocino hoy?» y en la galería, compara el extremo alto del estimado (+10 %): salen menos recetas, pero ninguna se pasa de lo que elegiste.
- Una receta con costo parcial no pasa el filtro de presupuesto. Sale aparte, al final, diciendo qué precio le falta.

Estimados altos por porción con los precios de esta versión (cotizados el 2026-11-02), para comparar cuando cambien:

| Receta | Estimado alto por porción | Primer filtro que pasa |
|---|---|---|
| Arroz con leche | $ 2.488 | Hasta $ 5.000 |
| Changua | $ 3.229 | Hasta $ 5.000 |
| Ajiaco santafereño | $ 9.815 | Hasta $ 10.000 |

### Corregido

- El agua ya no aparece como ingrediente que falta, ni entre las opciones para marcar.
- Los ingredientes que solo son opcionales ya no salen entre las opciones: marcarlos no encontraba nada.
- «Quitar el presupuesto» solo aparece si elegiste uno, y un ingrediente inventado en la dirección se ignora.

## [0.6.0] - 2026-11-04

Cuentas, datos personales y la parte legal.

### Añadido

- Cuentas con correo y contraseña o con Google, con recuperar contraseña y mensajes de error en español. Las recetas se siguen viendo sin cuenta.
- Autorización del tratamiento de datos, sin marcar por defecto, para crear una cuenta y para enviar el formulario de contacto. Una cuenta sin autorización no puede usar nada.
- Favoritas, notas y «ya la probé» en cada receta.
- Mi cocina y recetas personales privadas: crear, editar y borrar, con el mismo cálculo, la ficha, el modo cocina, la lista y las exportaciones de las públicas. Un ingrediente que no está en el catálogo queda «Sin precio».
- Al entrar, la lista de compras del navegador pasa a la cuenta y se combina con la que hubiera.
- Exportar mis datos en JSON y borrar mi cuenta y mis datos desde la app.
- Política de privacidad y licencia. Código bajo MIT, textos bajo CC BY 4.0.

### Cambiado

- Si falta el precio de una línea, el costo se dice parcial en la ficha, la tarjeta, la lista y las exportaciones. El precio que falta queda vacío, nunca en cero.

### Corregido

- Cambiar las porciones, filtrar la galería o marcar ingredientes en «¿Qué cocino hoy?» ya no devuelve la página al inicio.

### Seguridad

- Reglas de Firestore: cada persona solo lee y escribe lo suyo, con validación por campo y topes. Reglas pegadas en la consola el 2026-11-04 a las 17:45 (hora de Colombia), desde `firestore.rules` de esta versión.

## [0.5.0] - 2026-11-02

El formulario de contacto ya envía.

### Añadido

- Proponer una receta o escribir un mensaje desde `/contacto`: llega por correo a través de EmailJS. Mientras se envía el botón queda ocupado; al terminar, el formulario agradece y se limpia.
- Si el envío falla, el formulario dice si fue por falta de conexión o por otra razón, y conserva lo escrito para intentar de nuevo.
- Tope de envíos desde cada navegador: uno por minuto y cinco por día.
- Aviso bajo el botón de enviar: el nombre y el correo se usan solo para responder, y el envío pasa por EmailJS.

## [0.4.0] - 2026-11-02

Exportar y la lista de compras.

### Añadido

- Exportar una receta con las porciones elegidas: Excel (receta, ingredientes, costo y compras en hojas separadas), CSV que abre bien en Excel en español y JSON con los datos completos.
- «Agregar a la lista» en cada receta. La lista suma los ingredientes de varias recetas, deja marcar lo comprado y cambiar las porciones, y se exporta en los mismos tres formatos.
- La lista dice cómo viene cada ingrediente en la tienda («1 frasco de 100 g», «Suelto, por peso») y muestra dos totales separados: lo que cuestan las recetas (proporcional a lo que se usa) y lo que se paga hoy en caja (empaques completos).
- La lista se guarda en el navegador, sin cuenta. Si el navegador no deja guardar (por ejemplo, en una ventana privada), funciona igual y lo avisa.

## [0.3.1] - 2026-11-02

### Añadido

- Precios de todos los ingredientes del catálogo, cotizados el 2 de noviembre de 2026. Las tres recetas ya muestran su costo estimado: el ajiaco sale entre $ 8.030 y $ 9.815 por porción; la changua, entre $ 2.642 y $ 3.229; y el arroz con leche, entre $ 2.036 y $ 2.488.

## [0.3.0] - 2026-11-02

Las primeras recetas de la casa, con el catálogo real.

### Añadido

- Tres recetas de la casa: ajiaco santafereño, changua y arroz con leche, con sus pasos, temporizadores y notas de la casa.
- Ilustraciones de cada receta, generadas con IA y etiquetadas así en la ficha y en las tarjetas. Cada categoría tiene una imagen de respaldo para las recetas que todavía no tienen la suya.
- Catálogo real de ingredientes con sus empaques, mermas y densidades aproximadas. Los precios se están cotizando: mientras tanto la ficha dice «Sin precio» y el costo aparece como pendiente.
- Ingredientes opcionales, marcados en la fila, en su precio y en el costo total; y alternativas («o pan tostado») que no se suman.
- Los valores estimados se ven en la ficha: el peso aproximado de una medida («≈ 15 g») y la merma con que se calcula la compra.
- Cada receta tiene su propia página para buscadores y su imagen para compartir.

### Cambiado

- El agua y la sal no se cuentan en el costo.
- Al filtrar por presupuesto, una receta sin precios no aparece como si costara cero.

### Eliminado

- Las recetas y los precios de ejemplo.

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

[Sin publicar]: https://github.com/Sergio-Velandia/Moss-Taste/compare/v0.8.0...HEAD
[0.8.0]: https://github.com/Sergio-Velandia/Moss-Taste/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/Sergio-Velandia/Moss-Taste/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/Sergio-Velandia/Moss-Taste/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/Sergio-Velandia/Moss-Taste/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/Sergio-Velandia/Moss-Taste/compare/v0.3.1...v0.4.0
[0.3.1]: https://github.com/Sergio-Velandia/Moss-Taste/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/Sergio-Velandia/Moss-Taste/compare/v0.2.1...v0.3.0
[0.2.1]: https://github.com/Sergio-Velandia/Moss-Taste/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/Sergio-Velandia/Moss-Taste/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/Sergio-Velandia/Moss-Taste/releases/tag/v0.1.0
