import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { EncabezadoPagina } from '@/components/EncabezadoPagina'
import { VERSION_POLITICA } from '@/lib/cuentas/config'
import { formatoFecha } from '@/lib/formato'

function Bloque({ id, titulo, children }: { id: string; titulo: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="grid max-w-prose gap-3">
      <h2 id={id} className="text-2xl">
        {titulo}
      </h2>
      {children}
    </section>
  )
}

const ENLACE = 'font-bold text-accent underline underline-offset-4'
const CORREO = 'contacto@sergio-velandia.dev'

// Escrita a partir de la auditoría del código: dice solo lo que el sitio hace de verdad.
// Si cambia lo que se guarda o a quién se le envía, se actualiza en el mismo cambio, junto con VERSION_POLITICA.
export function Privacidad() {
  return (
    <div className="grid gap-10">
      <EncabezadoPagina ruta="/privacidad">Qué datos guarda Moss Taste, para qué, dónde, por cuánto tiempo y quién los ve.</EncabezadoPagina>
      <p className="text-sm text-ink-soft">Última actualización: {formatoFecha(VERSION_POLITICA)}.</p>

      <Bloque id="p-resumen" titulo="En corto">
        <ul className="grid list-disc gap-2 pl-5">
          <li>Para ver recetas no necesitas cuenta y no guardamos nada tuyo en ningún servidor.</li>
          <li>Si creas una cuenta, guardamos tu correo y lo que tú escribas o marques. Puedes exportarlo y borrarlo cuando quieras desde Mi cocina.</li>
          <li>No hay analítica, publicidad ni cookies de este sitio. No vendemos ni compartimos tus datos con nadie más que los servicios que se nombran aquí.</li>
        </ul>
      </Bloque>

      <Bloque id="p-responsable" titulo="Quién responde por tus datos">
        <p>
          El responsable del tratamiento es Sergio Andres Ramirez Velandia, en Bogotá, Colombia. Correo:{' '}
          <a href={`mailto:${CORREO}`} className={ENLACE}>
            {CORREO}
          </a>
          . Moss Taste es un proyecto personal y familiar, sin ánimo comercial.
        </p>
      </Bloque>

      <Bloque id="p-navegador" titulo="Lo que queda solo en tu navegador">
        <p>Se guarda en el almacenamiento local de tu navegador y no se envía a ningún lado, salvo lo que se indica:</p>
        <ul className="grid list-disc gap-2 pl-5">
          <li>
            <strong className="font-bold">Tema</strong> (<code>moss-taste:tema</code>): si prefieres claro, oscuro o el del sistema.
          </li>
          <li>
            <strong className="font-bold">Lista de compras sin cuenta</strong> (<code>moss-taste:lista</code>): las recetas, sus porciones y lo que marcaste como comprado. Al iniciar sesión pasa a tu cuenta y se borra del navegador.
          </li>
          <li>
            <strong className="font-bold">Tope de envíos</strong> (<code>moss-taste:envios</code>): las horas de tus últimos envíos del formulario, para limitar a uno por minuto y cinco por día. No guarda lo que escribiste.
          </li>
          <li>
            <strong className="font-bold">Pista de sesión</strong> (<code>moss-taste:sesion</code>): recuerda que este navegador tenía una sesión, para no descargar el código de las cuentas a quien solo mira recetas.
          </li>
          <li>
            <strong className="font-bold">Sesión de Firebase</strong> (en el almacenamiento <code>firebaseLocalStorageDb</code>, solo si inicias sesión): el identificador y los datos de tu cuenta, para que no tengas que entrar cada vez. Se borra al cerrar sesión. Con ella, el código de Firebase crea <code>firebase-heartbeat-database</code>, un registro técnico suyo.
          </li>
          <li>
            <strong className="font-bold">Posición en la página</strong> (en <code>sessionStorage</code>): para volver al mismo punto al regresar. Se borra al cerrar la pestaña.
          </li>
        </ul>
        <p>Puedes borrar todo esto en cualquier momento desde la configuración de tu navegador. Los filtros y las porciones quedan en la dirección de la página, y los archivos que exportas se generan en tu navegador, sin pasar por un servidor.</p>
      </Bloque>

      <Bloque id="p-cuenta" titulo="Si creas una cuenta">
        <p>
          <strong className="font-bold">Qué se guarda.</strong> En Firebase Authentication: tu correo, un identificador, el método de acceso, y las fechas de creación y de último acceso. Si usas contraseña, la maneja Firebase: este sitio no la guarda ni puede leerla. Si
          entras con Google, recibimos tu correo y el nombre de tu perfil; Firebase también guarda la dirección de tu foto de perfil, que este sitio no usa.
        </p>
        <p>
          En la base de datos (Firestore): la fecha y la versión de tu autorización, tus favoritos, las recetas que marcaste como probadas, tus notas, tus recetas personales y tu lista de compras.
        </p>
        <p>
          <strong className="font-bold">Para qué.</strong> Solo para que puedas usar tu cuenta y guardar esas cosas, y para demostrar que autorizaste el tratamiento. No enviamos correos publicitarios. El único correo automático es el de recuperar la contraseña, si lo pides.
        </p>
        <p>
          <strong className="font-bold">Quién lo ve.</strong> Otras cuentas no pueden leer ni cambiar tus datos: lo impiden las reglas de la base de datos. Tus datos no están cifrados de forma que nadie más pueda abrirlos: quien administra el proyecto (el responsable de arriba) técnicamente
          puede verlos en la consola de Firebase, y solo lo haría para atender una solicitud tuya o resolver un problema. Por eso, no escribas en las notas nada que no quieras que se pueda leer.
        </p>
        <p>
          <strong className="font-bold">Quién lo procesa.</strong> Google, a través de Firebase, actúa como encargado del tratamiento (<a href="https://firebase.google.com/support/privacy" className={ENLACE}>
            privacidad de Firebase
          </a>
          ). Authentication funciona desde centros de datos en Estados Unidos, y puede usar tu dirección IP y tu navegador para prevenir abusos. La base de datos está en São Paulo, Brasil. Por eso tus datos salen de Colombia, y al aceptar autorizas esa transferencia.
        </p>
        <p>
          <strong className="font-bold">Por cuánto tiempo.</strong> Hasta que borres tu cuenta: el sitio no borra por sí solo las cuentas inactivas. Según Firebase, las direcciones IP se conservan unas semanas, y al borrar una cuenta sus datos de Authentication salen de sus sistemas activos y
          de respaldo en un máximo de 180 días. El plan gratuito no incluye copias automáticas de la base: guarda tu copia con «Exportar mis datos».
        </p>
      </Bloque>

      <Bloque id="p-formulario" titulo="Si escribes por el formulario de contacto">
        <p>
          Tu nombre, tu correo y tu mensaje (y la receta que propongas) se envían al pulsar «Enviar» a{' '}
          <a href="https://www.emailjs.com/legal/privacy-policy/" className={ENLACE}>
            EmailJS
          </a>
          , un encargado que los convierte en un correo y lo entrega en el buzón {CORREO}. EmailJS trata esos datos y los técnicos de la conexión, como la dirección IP, según su política, y puede hacerlo fuera de Colombia. Antes de enviar, nada sale de tu navegador.
        </p>
        <p>Se usan solo para responderte y, si propones una receta, para revisarla. Si entra al recetario, se escribe con otras palabras y sin tus datos. Los mensajes se conservan en el buzón mientras hagan falta para responderte; puedes pedir que se borren.</p>
      </Bloque>

      <Bloque id="p-hosting" titulo="Alojamiento">
        <p>
          El sitio está alojado en GitHub Pages. Como cualquier servidor web, GitHub recibe tu dirección IP y los datos técnicos de cada visita, según{' '}
          <a href="https://docs.github.com/es/site-policy/privacy-policies/github-general-privacy-statement" className={ENLACE}>
            su política de privacidad
          </a>
          . Las fuentes tipográficas se sirven desde el mismo sitio: tu navegador no las pide a un tercero. Si entras con Google o usas una cuenta, tu navegador se conecta también a los servicios de Google que hacen falta para eso.
        </p>
      </Bloque>

      <Bloque id="p-menores" titulo="Menores de edad">
        <p>
          La ley colombiana protege de forma especial los datos de niñas, niños y adolescentes. Para crear una cuenta debes ser mayor de edad o tener la autorización de quien te representa. Si un menor creó una cuenta sin esa autorización, escríbenos y la borramos.
        </p>
      </Bloque>

      <Bloque id="p-derechos" titulo="Tus derechos y cómo ejercerlos">
        <p>Según la Ley 1581 de 2012, puedes consultar, actualizar y rectificar tus datos, pedir prueba de tu autorización, saber cómo se han usado, revocar la autorización y pedir que se supriman, y presentar quejas ante la Superintendencia de Industria y Comercio.</p>
        <ul className="grid list-disc gap-2 pl-5">
          <li>
            <strong className="font-bold">Consultar y llevarte tus datos:</strong> «Exportar mis datos» en <Link to="/mi-cocina" className={ENLACE}>Mi cocina</Link>.
          </li>
          <li>
            <strong className="font-bold">Actualizar y rectificar:</strong> tus notas, favoritos y recetas se cambian desde la app.
          </li>
          <li>
            <strong className="font-bold">Suprimir y revocar:</strong> «Borrar mi cuenta y mis datos» en Mi cocina borra todo lo de tu cuenta.
          </li>
          <li>
            <strong className="font-bold">Lo demás</strong> (por ejemplo, cambiar el correo de la cuenta o borrar mensajes del formulario) se hace a mano: escribe a{' '}
            <a href={`mailto:${CORREO}`} className={ENLACE}>
              {CORREO}
            </a>
            .
          </li>
        </ul>
        <p>Las consultas se responden en un máximo de 10 días hábiles y los reclamos en un máximo de 15, como fija la ley.</p>
      </Bloque>

      <Bloque id="p-cambios" titulo="Cambios">
        <p>Si cambia lo que se guarda o a quién se le envía, esta página se actualiza antes y muestra la nueva fecha.</p>
      </Bloque>
    </div>
  )
}
