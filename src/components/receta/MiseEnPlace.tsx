import { CircleCheck } from 'lucide-react'

// Lo que se deja listo antes de prender el fogón. No es una secuencia: lleva íconos, no números.
export function MiseEnPlace({ tareas }: { tareas: string[] }) {
  return (
    <ul className="grid gap-3">
      {tareas.map((tarea) => (
        <li key={tarea} className="grid grid-cols-[1.25rem_minmax(0,1fr)] gap-3">
          <CircleCheck aria-hidden="true" className="mt-1 size-5 text-accent" strokeWidth={1.75} />
          <span>{tarea}</span>
        </li>
      ))}
    </ul>
  )
}
