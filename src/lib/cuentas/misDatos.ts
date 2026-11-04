import type { EstadoLista } from '@/lib/lista/almacen'
import type { Receta } from '@/lib/recetas/tipos'
import { SITIO } from '@/sitio'
import type { Interaccion, PerfilGuardado, UsuarioSesion } from './tipos'

// «Exportar mis datos»: todo lo que el recetario guarda de una cuenta, en un JSON para llevárselo.
// En el plan gratuito no hay copias automáticas de la base: esta es la copia de cada persona.

export interface ContenidoMisDatos {
  usuario: UsuarioSesion
  autorizacion: PerfilGuardado['autorizacion'] | null
  interacciones: Readonly<Record<string, Interaccion>>
  recetas: readonly Receta[]
  /** Documentos que no se pudieron leer como receta: también son datos de la persona. */
  ilegibles: Readonly<Record<string, unknown>>
  lista: EstadoLista
}

export function misDatosAJSON({ usuario, autorizacion, interacciones, recetas, ilegibles, lista }: ContenidoMisDatos, fecha: string): string {
  const entradas = Object.entries(interacciones)
  return JSON.stringify(
    {
      generadoPor: SITIO.nombre,
      sitio: SITIO.url,
      exportado: fecha,
      cuenta: { correo: usuario.correo, nombre: usuario.nombre, proveedores: usuario.proveedores, creada: usuario.creada },
      autorizacion,
      favoritos: entradas.filter(([, i]) => i.favorita).map(([receta]) => receta),
      probadas: entradas.filter(([, i]) => i.probada).map(([receta, i]) => ({ receta, fecha: i.probada })),
      notas: entradas.filter(([, i]) => i.nota).map(([receta, i]) => ({ receta, nota: i.nota })),
      recetasPersonales: recetas,
      ...(Object.keys(ilegibles).length ? { recetasIlegibles: ilegibles } : {}),
      listaDeCompras: lista,
    },
    null,
    2,
  )
}
