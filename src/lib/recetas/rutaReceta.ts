// Las recetas personales (id «mia-…») viven bajo /mi-cocina; las públicas, bajo /recetas.
export const esRecetaPersonal = (id: string) => id.startsWith('mia-')

export const rutaDeReceta = (id: string) => (esRecetaPersonal(id) ? `/mi-cocina/receta/${id}` : `/recetas/${id}`)
