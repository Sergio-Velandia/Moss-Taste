// Preferencia de tema. Debe coincidir con el script en línea de index.html, que la aplica antes de pintar.
export const CLAVE_TEMA = 'moss-taste:tema'
export const TEMAS = ['light', 'dark', 'system'] as const
export type Tema = (typeof TEMAS)[number]
export const TEMA_POR_DEFECTO: Tema = 'light'

const COLOR_BARRA: Record<'light' | 'dark', string> = { light: '#faf7f2', dark: '#17120f' }

export function esTema(valor: unknown): valor is Tema {
  return typeof valor === 'string' && (TEMAS as readonly string[]).includes(valor)
}

export function leerTema(): Tema {
  try {
    const guardado = localStorage.getItem(CLAVE_TEMA)
    return esTema(guardado) ? guardado : TEMA_POR_DEFECTO
  } catch {
    return TEMA_POR_DEFECTO
  }
}

export function guardarTema(tema: Tema): void {
  try {
    localStorage.setItem(CLAVE_TEMA, tema)
  } catch {
    // Almacenamiento bloqueado (modo privado): el tema se aplica igual, solo no se recuerda.
  }
}

export function sistemaEsOscuro(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches
}

export function aplicarTema(tema: Tema): void {
  const raiz = document.documentElement
  raiz.dataset.theme = tema
  const efectivo = tema === 'system' ? (sistemaEsOscuro() ? 'dark' : 'light') : tema
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', COLOR_BARRA[efectivo])
}
