// Escalado lineal de porciones. Los ingredientes «al gusto» también escalan, como referencia:
// la interfaz los sigue marcando para que cada quien ajuste.

/** Factor para pasar de las porciones base de la receta a las pedidas. */
export function factorPorciones(porcionesBase: number, porciones: number): number {
  if (!(porcionesBase > 0) || !(porciones > 0)) throw new RangeError('Las porciones deben ser mayores que 0')
  return porciones / porcionesBase
}

export function escalar(cantidad: number, porcionesBase: number, porciones: number): number {
  return cantidad * factorPorciones(porcionesBase, porciones)
}
