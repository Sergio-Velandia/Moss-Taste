// Une clases condicionales sin dependencias: cx('a', cond && 'b') → 'a b'.
export function cx(...clases: (string | false | null | undefined)[]): string {
  return clases.filter(Boolean).join(' ')
}
