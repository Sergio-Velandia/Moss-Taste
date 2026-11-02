import { ChevronDown, Download, FileJson, FileSpreadsheet, FileText } from 'lucide-react'
import { useId, useState } from 'react'
import { AvisoEnVivo } from '@/components/ui/AvisoEnVivo'
import { Boton } from '@/components/ui/Boton'
import { descargar, TIPOS } from '@/lib/exportar/descargar'
import type { TamanoBoton } from '@/components/ui/estilosBoton'

export type Formato = keyof typeof TIPOS

interface Props {
  /** Nombre del archivo sin extensión: «ajiaco-santafereno-8-porciones». */
  nombre: string
  /** Genera el contenido de cada formato. El .xlsx es asíncrono porque carga la librería al pedirlo. */
  generar: (formato: Formato) => Promise<Blob | string> | Blob | string
  tamano?: TamanoBoton
  className?: string
}

const OPCIONES: { formato: Formato; etiqueta: string; detalle: string; Icono: typeof FileSpreadsheet }[] = [
  { formato: 'xlsx', etiqueta: 'Excel', detalle: 'Hojas con la receta, los ingredientes, el costo y las compras', Icono: FileSpreadsheet },
  { formato: 'csv', etiqueta: 'CSV', detalle: 'Una tabla que abre en Excel o en Google Sheets', Icono: FileText },
  { formato: 'json', etiqueta: 'JSON', detalle: 'Los datos completos, para otras herramientas', Icono: FileJson },
]

// Botón que despliega los tres formatos. Todo se genera en el navegador, sin servidor.
export function MenuExportar({ nombre, generar, tamano = 'lg', className }: Props) {
  const id = useId()
  const [abierto, setAbierto] = useState(false)
  const [generando, setGenerando] = useState<Formato | null>(null)
  const [aviso, setAviso] = useState('')

  async function exportar(formato: Formato) {
    setGenerando(formato)
    setAviso('')
    try {
      const archivo = `${nombre}.${formato}`
      descargar(archivo, await generar(formato), TIPOS[formato])
      setAviso(`Descargaste ${archivo}.`)
      setAbierto(false)
    } catch (error) {
      console.error(error)
      setAviso('No se pudo generar el archivo. Intenta de nuevo; si sigue fallando, prueba con otro formato.')
    } finally {
      setGenerando(null)
    }
  }

  return (
    <div className={className}>
      <Boton
        variante="secundario"
        tamano={tamano}
        aria-expanded={abierto}
        aria-controls={id}
        onClick={() => setAbierto((a) => !a)}
        icono={<Download aria-hidden="true" className="size-5" />}
      >
        Exportar
        <ChevronDown aria-hidden="true" className={abierto ? 'size-5 rotate-180' : 'size-5'} />
      </Boton>
      <div id={id} hidden={!abierto} className="mt-2 grid max-w-sm gap-1 rounded-lg border border-line bg-surface p-2 shadow-2">
        {OPCIONES.map(({ formato, etiqueta, detalle, Icono }) => (
          <Boton
            key={formato}
            variante="fantasma"
            cargando={generando === formato}
            disabled={generando !== null && generando !== formato}
            onClick={() => exportar(formato)}
            className="h-auto w-full justify-start py-2 text-left no-underline hover:no-underline"
            icono={<Icono aria-hidden="true" className="size-5" />}
          >
            <span className="grid">
              <span className="text-ink">{etiqueta}</span>
              <span className="text-sm font-normal text-ink-soft">{detalle}</span>
            </span>
          </Boton>
        ))}
      </div>
      <AvisoEnVivo mensaje={aviso} className="mt-2" />
    </div>
  )
}
