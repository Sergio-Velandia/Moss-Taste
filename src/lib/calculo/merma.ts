// Merma: lo que se compra no es lo que se usa. Si al pelar o limpiar se pierde el 10 %,
// para usar 900 g hay que comprar 1000 g: compra = uso ÷ (1 − merma).

export function cantidadACompra(uso: number, merma: number): number {
  if (!(merma >= 0 && merma < 1)) throw new RangeError('La merma debe estar entre 0 y menos de 1')
  return uso / (1 - merma)
}
