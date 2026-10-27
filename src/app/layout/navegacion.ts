// Enlaces de la navegación principal y del pie, en un solo lugar.
export const NAV_PRINCIPAL = [
  { a: '/recetas', texto: 'Recetas' },
  { a: '/hoy', texto: '¿Qué cocino hoy?' },
  { a: '/lista', texto: 'Lista de compras' },
  { a: '/mi-cocina', texto: 'Mi cocina' },
] as const

export const NAV_PIE = [
  { a: '/acerca', texto: 'Acerca' },
  { a: '/contacto', texto: 'Contacto' },
] as const
