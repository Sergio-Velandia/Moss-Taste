import { MAX_COMPRADOS, MAX_RECETAS, type EntradaGuardada, type EstadoLista } from './almacen'

/*
 * Combina la lista del navegador con la de la cuenta al iniciar sesión, sin perder lo que había:
 * - Se unen las recetas de los dos lados.
 * - Si una receta está en ambos, gana la mayor cantidad de porciones: sobra antes que faltar.
 * - Si no caben (tope de 20), primero van las de la cuenta; las que quedan fuera se devuelven para avisarlo.
 * - Una marca de «comprado» sobrevive solo si la cantidad de ese ingrediente no aumentó al combinar. Si no,
 *   la lista diría que ya tienes algo que todavía te falta.
 */

export interface ResultadoCombinar {
  estado: EstadoLista
  /** Ids de las recetas del navegador que no cupieron. */
  sinEspacio: string[]
}

export function combinarListas(cuenta: EstadoLista, navegador: EstadoLista, cantidades: (recetas: EntradaGuardada[]) => ReadonlyMap<string, number>): ResultadoCombinar {
  const recetas = cuenta.recetas.map((r) => ({ ...r }))
  const sinEspacio: string[] = []
  for (const entrada of navegador.recetas) {
    const existente = recetas.find((r) => r.id === entrada.id)
    if (existente) existente.porciones = Math.max(existente.porciones, entrada.porciones)
    else if (recetas.length < MAX_RECETAS) recetas.push({ ...entrada })
    else sinEspacio.push(entrada.id)
  }

  const despues = cantidades(recetas)
  const sigueCubierta = (clave: string, lado: EstadoLista) => {
    if (!lado.comprados.includes(clave)) return false
    const ahora = despues.get(clave)
    const entonces = cantidades(lado.recetas).get(clave)
    return ahora !== undefined && entonces !== undefined && ahora <= entonces + 1e-9
  }
  const comprados = [...new Set([...cuenta.comprados, ...navegador.comprados])].filter((clave) => sigueCubierta(clave, cuenta) || sigueCubierta(clave, navegador)).slice(0, MAX_COMPRADOS)

  return { estado: { recetas, comprados }, sinEspacio }
}
