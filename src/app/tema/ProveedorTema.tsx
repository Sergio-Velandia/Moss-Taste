import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { ContextoTema } from './contextoTema'
import { aplicarTema, guardarTema, leerTema, type Tema } from './tema'

export function ProveedorTema({ children }: { children: ReactNode }) {
  const [tema, setTema] = useState<Tema>(leerTema)

  useEffect(() => {
    aplicarTema(tema)
    if (tema !== 'system' || typeof matchMedia !== 'function') return
    // Con "sistema", el color de la barra del navegador sigue los cambios del sistema operativo.
    const consulta = matchMedia('(prefers-color-scheme: dark)')
    const alCambiar = () => aplicarTema('system')
    consulta.addEventListener('change', alCambiar)
    return () => consulta.removeEventListener('change', alCambiar)
  }, [tema])

  const cambiarTema = useCallback((nuevo: Tema) => {
    guardarTema(nuevo)
    setTema(nuevo)
  }, [])

  const valor = useMemo(() => ({ tema, cambiarTema }), [tema, cambiarTema])
  return <ContextoTema value={valor}>{children}</ContextoTema>
}
