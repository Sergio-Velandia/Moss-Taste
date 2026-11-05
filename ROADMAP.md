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
- [x] Precios cotizados con fecha (0.3.1): punto medio de cada rango que cotizó el dueño, mostrado con ±10 %. Empaques confirmados; la canela en polvo es de 40 g.
- [x] README, CHANGELOG, versión 0.3.0 y push.
- [ ] Opcional: reemplazar las ilustraciones por fotos de Gemini con el prompt de `docs/prompt-imagenes.md`.

## Deuda técnica
- [ ] Revisar en cada actualización de `firebase` si ya no arrastra `@grpc/grpc-js` vulnerable, y borrar la nota de `SECURITY.md` (ver ese archivo).
- [x] La prueba de Escape del modo cocina fallaba de vez en cuando bajo carga: la tecla llegaba antes de que el modo cocina escuchara el teclado. Ahora la prueba repite la tecla hasta que responde (0.5.0).

## Fase 4: exportar y lista de compras (`0.4.0`)
- [x] Agregar recetas a la lista desde la ficha, con sus porciones; la lista se guarda en el navegador con topes y funciona en memoria si no se puede guardar.
- [x] Mínimo de compra: la lista dice cómo viene en la tienda («1 frasco de 100 g») y muestra dos totales separados, lo que cuestan las recetas (proporcional) y lo que se paga hoy en caja (empaques completos).
- [x] «Exportar» en la ficha y en la lista: Excel (`write-excel-file`, cargado al pedirlo), CSV y JSON generados a mano.
- [x] README, CHANGELOG y versión 0.4.0.

## Fase 5: formulario de contacto (`0.5.0`)
- [x] Conectar el formulario de `/contacto` a EmailJS (API REST, sin SDK), con estados de envío, error y sin conexión.
- [x] Tope de envíos por navegador (uno por minuto, cinco por día) y aviso de privacidad bajo el botón.
- [x] README, CHANGELOG y versión 0.5.0.
- [x] Envío real probado por el dueño en el sitio publicado: el mensaje llega.
- [x] Correo directo probado por el dueño desde otra cuenta: llega. Ver README, «Probar el correo de contacto».
- [x] Límite de envíos por IP confirmado por el dueño en el panel de EmailJS.

## Fase 6: cuentas, favoritos, notas y recetas personales (`0.6.0`)
- [x] Cuentas con correo y Google, autorización de datos, recuperar contraseña y rutas protegidas.
- [x] Favoritos, notas y «ya la probé», con estado optimista y reversión.
- [x] Recetas personales con ingredientes fuera del catálogo: «Sin precio» y costo parcial avisado.
- [x] Migrar la lista de compras a la cuenta, sin perder lo que había en el navegador.
- [x] Reglas de Firestore con topes y contadores, con pruebas contra el emulador.
- [x] Exportar mis datos y borrar mi cuenta.
- [x] Parte legal: auditoría, `/privacidad`, `/licencia` y casilla de autorización, también en el formulario de contacto.
- [x] Probado en vivo: recorrido completo y aislamiento entre cuentas contra el Firebase real; Google, recuperar contraseña y borrar cuenta, por el dueño.
- [ ] Precio propio por ingrediente en las recetas personales.
- [ ] Decidir en el Repaso si hace falta App Check: la restricción de la clave no frena a un script, que puede crear cuentas sin pasar por la casilla. Esas cuentas no pueden usar nada (las reglas exigen el perfil), pero ocupan lugar en Authentication.
- [ ] Si la app llega a mandar correos a los usuarios, revisar: hoy no se exige correo verificado, así que nada importante puede depender de que el correo sea de quien dice ser.

## Fase 7: ¿Qué cocino hoy? (`0.7.0`)
- [x] Revisar `src/lib/recetas/hoy.ts` con las recetas reales: el agua, los opcionales y las alternativas.
- [x] El presupuesto usa el extremo alto del estimado, también en la galería. Lo parcial sale aparte.
- [x] Recetas personales marcadas como «Tuya», con sus nombres libres aparte del catálogo.
- [ ] Mostrar la alternativa también en la lista de compras: ya está en el catálogo, falta decidir si se quiere.
- [ ] Que tener la alternativa cuente como tener el ingrediente. Hoy es solo texto: si tienes pan tostado sigue diciendo «Calado (o pan tostado)» y la receta no sube en el orden. Con tres recetas da igual; con unas veinte, una receta que sí se puede cocinar queda debajo de una que no. Ese es el momento de arreglarlo.

## Fase Legal
- [x] Se hizo dentro de la Fase 6: la política se escribió auditando el código real.
- [ ] Revisar la política en la Fase R y cada vez que cambie lo que se guarda o a quién se le envía. Si el proyecto deja de ser familiar, revisarla con un profesional: no es asesoría jurídica.

## Fase 8: crecer el recetario
- [x] Lentejas con chorizo, sudado de pollo y sobrebarriga en salsa criolla, con la categoría Platos fuertes (`0.8.0`).
- [x] Precios de lentejas, chorizo, tocineta, pollo en presas, sobrebarriga, yuca, pimentón, aceite y cerveza (`0.8.1`). Son precios de referencia promedio; se pueden ajustar al comprar.
- [x] Precios de zanahoria, tomate, cebolla cabezona, comino, color, pimienta y laurel, con los tamaños reales de sus empaques (`0.8.2`).
- [ ] Cambiar por precios de tienda los mayoristas de Corabastos (zanahoria, tomate y cebolla cabezona), con un recibo: hoy los estimados pueden quedarse cortos en la tienda.
- [ ] Pesar una zanahoria, un tomate, una cebolla cabezona y una hoja de laurel, y corregir `gramosPorUnidad`: los valores actuales (80 g, 120 g, 150 g y 0,2 g) son referencias generales, no pesados.
- [ ] Pesar lo que se recorta de la sobrebarriga al comprarla y corregir su merma (hoy 10 % estimado).
- [x] Ilustraciones de las tres recetas, en SVG, con el estilo de las demás (`0.8.1`).
- [x] Tabla de estimados altos completa: los tres filtros de presupuesto separan tres, dos y una receta (`0.8.2`).
- [ ] Categorías Acompañamientos y Bebidas: entran cuando haya recetas que las llenen. Una categoría sin recetas es una galería vacía y no tiene imagen de respaldo.
- [ ] Filtro de categorías en `/hoy`: hoy solo existe en la galería.

## Fase funcional del modo cocina (`0.9.0`)
- [x] «Mantener pantalla encendida» con Screen Wake Lock: se vuelve a pedir al regresar a la pestaña y se suelta al salir.
- [x] Temporizadores: varios a la vez, por hora de fin, con pausa, un minuto más, alarma y silencio. Sobreviven a una recarga.
- [ ] Probar en un teléfono real el sonido, la vibración y la pantalla encendida. Lo hace el dueño.
- [ ] Decidir en el Repaso si los temporizadores deben avisar con el teléfono bloqueado: exige notificaciones y un service worker.
- [ ] Decidir si la alarma debe sonar también fuera del modo cocina (por ejemplo, en la ficha de la receta).

## Antes del lanzamiento
- [ ] Capturas del sitio para el README (se dejan para el final por si cambia el diseño).

## Fuera del repo
- [ ] Corregir en el ECOSISTEMA el hosting de Moss Taste: GitHub Pages en `/Moss-Taste`, Firebase solo para Auth y Firestore. Lo hace el dueño.
