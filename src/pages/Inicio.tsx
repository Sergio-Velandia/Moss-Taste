import { EncabezadoPagina } from '@/components/EncabezadoPagina'

export function Inicio() {
  return (
    <div className="grid gap-10">
      <EncabezadoPagina ruta="/" titulo="El recetario de la familia" />
    </div>
  )
}
