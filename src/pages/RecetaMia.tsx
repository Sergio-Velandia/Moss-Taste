import { Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FichaReceta } from '@/components/receta/FichaReceta'
import { AvisoEnVivo } from '@/components/ui/AvisoEnVivo'
import { Boton } from '@/components/ui/Boton'
import { BotonEnlace } from '@/components/ui/BotonEnlace'
import { borrarRecetaPersonal, useDatosCuenta } from '@/lib/cuentas/datos'
import { mensajeDeError } from '@/lib/cuentas/errores'
import type { Receta } from '@/lib/recetas/tipos'
import { NoEncontrada } from './NoEncontrada'

// Una receta personal: la misma ficha de las públicas, con editar y borrar. Solo existe dentro de la cuenta.
export function RecetaMia() {
  const { id = '' } = useParams()
  const { recetas } = useDatosCuenta()
  const receta = recetas.find((r) => r.id === id)
  if (!receta) return <NoEncontrada />
  return <FichaReceta key={receta.id} receta={receta} volver={{ a: '/mi-cocina', texto: 'Mi cocina' }} extra={<AccionesMia receta={receta} />} />
}

function AccionesMia({ receta }: { receta: Receta }) {
  const navigate = useNavigate()
  const [confirmar, setConfirmar] = useState(false)
  const [ocupado, setOcupado] = useState(false)
  const [aviso, setAviso] = useState('')

  async function borrar() {
    setOcupado(true)
    setAviso('')
    try {
      await borrarRecetaPersonal(receta.id)
      navigate('/mi-cocina', { replace: true })
    } catch (error) {
      setAviso(mensajeDeError(error))
      setOcupado(false)
    }
  }

  return (
    <div className="grid gap-3">
      <p className="text-ink-soft">Esta receta es privada: otras cuentas no la ven.</p>
      <div className="flex flex-wrap items-center gap-2">
        {confirmar ? (
          <>
            <span className="font-bold">¿Borrar esta receta?</span>
            <Boton variante="secundario" cargando={ocupado} onClick={() => void borrar()}>
              Borrar receta
            </Boton>
            <Boton variante="fantasma" onClick={() => setConfirmar(false)}>
              Conservar
            </Boton>
          </>
        ) : (
          <>
            <BotonEnlace to={`/mi-cocina/editar/${receta.id}`} variante="secundario" icono={<Pencil aria-hidden="true" className="size-5" />}>
              Editar
            </BotonEnlace>
            <Boton variante="fantasma" icono={<Trash2 aria-hidden="true" className="size-5" />} onClick={() => setConfirmar(true)}>
              Borrar
            </Boton>
          </>
        )}
      </div>
      <AvisoEnVivo mensaje={aviso} />
    </div>
  )
}
