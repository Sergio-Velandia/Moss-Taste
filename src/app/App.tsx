import { ProveedorTema } from './tema/ProveedorTema'
import { SelectorTema } from './tema/SelectorTema'

// Provisional: el layout con cabecera y rutas llega en el siguiente paso.
export function App() {
  return (
    <ProveedorTema>
      <main className="mx-auto grid max-w-3xl gap-6 px-4 py-12">
        <h1 className="text-4xl">Moss Taste</h1>
        <SelectorTema />
      </main>
    </ProveedorTema>
  )
}
