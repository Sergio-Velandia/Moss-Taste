# Changelog

Todos los cambios visibles de Moss Taste. Formato [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y versionado [SemVer](https://semver.org/lang/es/).

## [Sin publicar]

## [1.1.1] - 2026-11-05

### Añadido

- El temporizador del modo cocina avisa, desde antes de iniciarlo, que la alarma suena solo con esa pantalla abierta y no con el teléfono bloqueado.
- «Acerca» explica cómo filtra el presupuesto y qué esperar de los temporizadores.
- El README cuenta por qué existe el proyecto: digitalizar las recetas y dejar el papeleo y las hojas de cálculo.

### Cambiado

- El README deja solo lo que no vive en otro lado, y queda en cerca de la mitad. Cómo agregar una receta y las alternativas pasan a `CONTRIBUTING.md`.
- La versión ya no se sincroniza con el README.

## [1.1.0] - 2026-11-04

### Añadido

- Pantalla de entrada de 2,6 s: los granos se juntan en la berenjena y el nombre se condensa del vapor. Sale al llegar de afuera, se salta con un toque o una tecla, y no aparece al recargar, en el modo cocina ni con movimiento reducido. No guarda nada en el navegador.

### Cambiado

- Imagen para compartir y vista previa del repo nuevas, en la línea de Moss, Moss Nexus y el portafolio: fondo oscuro y una berenjena hecha de granos de la que sube vapor.

## [1.0.0] - 2026-11-04

La primera versión estable. Se probó en un teléfono real, con el modo cocina incluido.

### Añadido

- Capturas del sitio en el README, y una imagen para compartir que muestra el modo cocina.
- El texto alternativo de la imagen también para las tarjetas de Twitter/X.

### Cambiado

- «Acerca» cuenta lo que hay hoy y aclara que los precios son de referencia y que algunas verduras tienen precio mayorista.
- El README se reescribió completo.
- El ROADMAP separa lo que falta fuera de este repo de lo que puede venir después.

## [0.9.0] - 2026-11-04

El modo cocina ya funciona de verdad.

### Añadido

- Temporizadores en los pasos que los llevan: iniciar, pausar, reanudar, un minuto más y reiniciar.
- Varios a la vez: una franja acompaña todos los pasos, y desde ella se vuelve al paso de cada uno. Las lentejas lo necesitan, con 30 minutos corriendo mientras se trabaja en el paso siguiente.
- Al terminar suena una alarma, vibra donde se pueda y se queda el aviso hasta darle «Listo». Suena un minuto como mucho, y se puede silenciar.
- «Mantener pantalla encendida» funciona, y se activa al iniciar un temporizador, avisándolo y con opción de apagarla.
- Los temporizadores no se pierden si se recarga la página. Si uno terminó mientras no mirabas, al volver dice hace cuánto.

### Privacidad

- La política declara lo nuevo que se guarda en el navegador: la receta, el paso y la hora de fin de cada temporizador, y si la alarma está silenciada.

### Limitaciones

- Con el teléfono bloqueado o el navegador cerrado la alarma no suena, y fuera del modo cocina tampoco.

## [0.8.2] - 2026-11-04

Los platos fuertes ya tienen su costo completo.

### Añadido

- Precios de zanahoria, tomate, cebolla cabezona, comino, color, pimienta y laurel. Ninguna receta queda con costo parcial, y las tres nuevas pasan el filtro de presupuesto que les corresponde.

### Cambiado

- Tamaños reales de los empaques: comino 25 g, color 55 g, pimienta 60 g y laurel 20 g.
- Pesos de referencia por unidad: zanahoria 80 g y cebolla cabezona 150 g. El tomate sigue en 120 g y la hoja de laurel en 0,2 g.
- La pimienta del catálogo ahora se llama «Pimienta negra molida»: la de 60 g no es pura.

### A tener en cuenta

- **Zanahoria, tomate y cebolla cabezona tienen precio mayorista de Corabastos** (29 y 30 de octubre, y 15 de octubre la cebolla). En tienda salen más caros, así que estos estimados pueden quedarse cortos. Aun con esas tres verduras al doble, las lentejas seguirían dentro de «Hasta $ 5.000».
- Las recetas que usan esos precios dicen «Estimado al 15 de octubre de 2026», por la cebolla: la ficha muestra siempre el precio más antiguo.

Estimados por porción de esta versión, para comparar cuando cambien los precios:

| Receta | Por porción | Estimado alto | Primer filtro que pasa |
|---|---|---|---|
| Arroz con leche | $ 2.262 | $ 2.488 | Hasta $ 5.000 |
| Changua | $ 2.936 | $ 3.229 | Hasta $ 5.000 |
| Lentejas con chorizo | $ 4.175 | $ 4.593 | Hasta $ 5.000 |
| Sudado de pollo | $ 5.332 | $ 5.865 | Hasta $ 10.000 |
| Ajiaco santafereño | $ 8.922 | $ 9.815 | Hasta $ 10.000 |
| Sobrebarriga en salsa criolla | $ 10.207 | $ 11.227 | Hasta $ 20.000 |

## [0.8.1] - 2026-11-04

Imágenes y la mayoría de los precios de los platos fuertes.

### Añadido

- Ilustraciones de lentejas con chorizo, sudado de pollo y sobrebarriga en salsa criolla, generadas con IA en el mismo estilo que las demás y etiquetadas así.
- Precios de 9 de los 16 ingredientes nuevos, con fecha del 4 de noviembre de 2026: lentejas, chorizo, tocineta, pollo en presas, sobrebarriga, yuca, pimentón, aceite y cerveza. Son precios de referencia promedio de Bogotá.
- Los empaques de comino, color, pimienta y laurel, todavía sin precio.

### Pendiente

- Faltan los precios de zanahoria, tomate, cebolla cabezona, comino, color, pimienta y laurel. Por eso las tres recetas siguen con costo parcial y salen aparte al filtrar por presupuesto.

Estimados por porción de esta versión. Los de las tres últimas son parciales: **el costo final será mayor**.

| Receta | Estimado alto por porción | Primer filtro que pasa |
|---|---|---|
| Arroz con leche | $ 2.488 | Hasta $ 5.000 |
| Changua | $ 3.229 | Hasta $ 5.000 |
| Ajiaco santafereño | $ 9.815 | Hasta $ 10.000 |
| Lentejas con chorizo | Al menos $ 4.252 (parcial) | No se puede saber |
| Sudado de pollo | Al menos $ 5.479 (parcial) | No se puede saber |
| Sobrebarriga en salsa criolla | Al menos $ 10.769 (parcial) | No se puede saber |

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

[Sin publicar]: https://github.com/Sergio-Velandia/Moss-Taste/compare/v1.1.1...HEAD
[1.1.1]: https://github.com/Sergio-Velandia/Moss-Taste/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/Sergio-Velandia/Moss-Taste/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/Sergio-Velandia/Moss-Taste/compare/v0.9.0...v1.0.0
[0.9.0]: https://github.com/Sergio-Velandia/Moss-Taste/compare/v0.8.2...v0.9.0
[0.8.2]: https://github.com/Sergio-Velandia/Moss-Taste/compare/v0.8.1...v0.8.2
[0.8.1]: https://github.com/Sergio-Velandia/Moss-Taste/compare/v0.8.0...v0.8.1
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
