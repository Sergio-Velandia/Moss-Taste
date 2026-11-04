# Seguridad

## Reportar un problema

Escribe a contacto@sergio-velandia.dev. No abras un issue público si el problema expone datos de alguien.

## Lo que reporta `npm audit` y por qué no hay que «arreglarlo»

**Última revisión: 2026-11-04, con `firebase` 13.2.0.**

`npm audit` reporta **4 vulnerabilidades altas**. Es una sola causa, repetida en la cadena de dependencias:

```
@grpc/grpc-js 1.9.16  ← la vulnerable
└─ @firebase/firestore (pide ~1.9.0)
   ├─ @firebase/firestore-compat
   └─ firebase
```

**No afectan al sitio publicado**, por tres razones que se pueden comprobar:

1. **No llega al navegador.** `@grpc/grpc-js` solo lo usa Firestore cuando corre en Node. El sitio usa `firebase/firestore/lite` en el navegador, que habla por HTTP. Para verificarlo, después de `npm run build`:
   ```bash
   grep -c "grpc-js" dist/assets/firebase-*.js   # debe dar 0
   ```
2. **Las fallas son de servidores gRPC** (`getAuthContext` y los errores de los manejadores de métodos). Este proyecto no tiene servidor: es un sitio estático.
3. **En desarrollo** solo lo cargan las pruebas de las reglas, contra un emulador local.

### No correr `npm audit fix --force`

Propone bajar `firebase` a la versión 9, que no es compatible con el código ni con `@firebase/rules-unit-testing`. Rompería las cuentas sin arreglar ningún riesgo real.

### Qué hacer cuando vuelva a aparecer

- **Si sigue siendo esta misma cadena:** no hacer nada. Revisar en cada actualización de `firebase` si ya subió `@grpc/grpc-js`, y cuando desaparezca, borrar esta sección.
- **Si aparece otro paquete, o `grep` deja de dar 0:** no aplica esta nota. Hay que revisarlo de verdad.

## Qué protege los datos

La configuración de Firebase no es secreta. Los datos los protegen las reglas de Firestore ([firestore.rules](firestore.rules), con sus pruebas en [reglas/](reglas/)) y la restricción de la clave de API por dominio. Ver el README, «Cuentas con Firebase».
