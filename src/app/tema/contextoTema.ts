import { createContext } from 'react'
import type { Tema } from './tema'

export interface ValorTema {
  tema: Tema
  cambiarTema: (tema: Tema) => void
}

export const ContextoTema = createContext<ValorTema | null>(null)
