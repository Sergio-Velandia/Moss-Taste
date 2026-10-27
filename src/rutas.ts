// Rutas fijas: una sola fuente para el router, los metadatos de cada página y el script que genera
// un index.html por ruta en el build. Sin React ni DOM para que el script de Node pueda importarlo.

export interface RutaFija {
  ruta: string
  titulo: string
  descripcion: string
  /** false → la página lleva noindex y no entra al sitemap (pantallas personales). */
  indexable: boolean
}

export const RUTAS_FIJAS = [
  {
    ruta: '/',
    titulo: 'Moss Taste, el recetario de la familia',
    descripcion: 'Recetas de la familia con cantidades y costo en pesos colombianos para cualquier número de porciones.',
    indexable: true,
  },
  {
    ruta: '/recetas',
    titulo: 'Recetas',
    descripcion: 'Busca recetas por categoría, ingrediente o presupuesto.',
    indexable: true,
  },
  {
    ruta: '/hoy',
    titulo: '¿Qué cocino hoy?',
    descripcion: 'Encuentra una receta con los ingredientes que tienes en casa y el presupuesto que manejas.',
    indexable: true,
  },
  {
    ruta: '/lista',
    titulo: 'Lista de compras',
    descripcion: 'Junta varias recetas en una sola lista de compras con las cantidades sumadas.',
    indexable: true,
  },
  {
    ruta: '/contacto',
    titulo: 'Contacto',
    descripcion: 'Propón una receta para el recetario o escríbeme.',
    indexable: true,
  },
  {
    ruta: '/acceso',
    titulo: 'Entrar',
    descripcion: 'Entra o crea tu cuenta para guardar favoritos, notas y tus propias recetas.',
    indexable: false,
  },
  {
    ruta: '/mi-cocina',
    titulo: 'Mi cocina',
    descripcion: 'Tus favoritos, notas, recetas probadas y recetas personales.',
    indexable: false,
  },
  {
    ruta: '/mi-cocina/nueva',
    titulo: 'Nueva receta',
    descripcion: 'Crea o edita una receta personal, privada en tu cuenta.',
    indexable: false,
  },
  {
    ruta: '/acerca',
    titulo: 'Acerca de Moss Taste',
    descripcion: 'Qué es Moss Taste, para quién es y cómo se agregan las recetas.',
    indexable: true,
  },
] as const satisfies readonly RutaFija[]

export type RutaConocida = (typeof RUTAS_FIJAS)[number]['ruta']

export function rutaFija(ruta: RutaConocida): RutaFija {
  const encontrada = RUTAS_FIJAS.find((r) => r.ruta === ruta)
  if (!encontrada) throw new Error(`Ruta sin registrar en RUTAS_FIJAS: ${ruta}`)
  return encontrada
}
