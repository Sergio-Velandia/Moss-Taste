import { Link } from 'react-router-dom'

// Logotipo de texto. translate="no": es un nombre propio.
export function Marca() {
  return (
    <Link to="/" translate="no" className="inline-flex min-h-11 items-center font-display text-2xl leading-none text-ink">
      Moss Taste
    </Link>
  )
}
