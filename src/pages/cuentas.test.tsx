// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { rutasApp } from '@/app/rutasApp'
import { ProveedorTema } from '@/app/tema/ProveedorTema'
import { CLAVE_PISTA } from '@/lib/cuentas/pista'
import { asegurarSesion, leerSesion } from '@/lib/cuentas/sesion'
import { almacenNavegador } from '@/lib/lista/activa'
import { CLAVE_LISTA, LISTA_VACIA } from '@/lib/lista/almacen'
import { banco, reiniciarBanco, sembrarCuenta } from '@/test/cuentasFalsas'

// Datos fijos y Firebase en memoria: nada de esto toca el servicio real.
vi.mock('@/lib/recetas/catalogo', () => import('@/test/catalogoPrueba'))
vi.mock('@/lib/cuentas/firebase', () => import('@/test/cuentasFalsas'))

const CORREO = 'ana@correo.co'
const CLAVE = 'una-clave-larga'
const RECETA = '/recetas/arroz-con-leche'

beforeAll(() => {
  for (const nombre of ['API_KEY', 'AUTH_DOMAIN', 'PROJECT_ID', 'APP_ID']) vi.stubEnv(`VITE_FIREBASE_${nombre}`, 'ficticio')
  URL.createObjectURL = vi.fn((blob: Blob) => {
    ultimoBlob = blob
    return 'blob:prueba'
  })
  URL.revokeObjectURL = vi.fn()
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
})
afterAll(() => vi.unstubAllEnvs())

let ultimoBlob: Blob | null = null

beforeEach(async () => {
  localStorage.clear()
  almacenNavegador.recargar()
  await act(async () => {
    reiniciarBanco()
    asegurarSesion()
  })
  await waitFor(() => expect(leerSesion().fase).toBe('anonima'))
  banco.llamadas = []
})
afterEach(cleanup)

async function visitar(ruta: string) {
  const router = createMemoryRouter(rutasApp, { initialEntries: [ruta] })
  render(
    <ProveedorTema>
      <RouterProvider router={router} />
    </ProveedorTema>,
  )
  await screen.findByRole('heading', { level: 1 })
  // Bajo carga, el h1 aparece antes de que React corra sus efectos (las suscripciones a la sesión y a los datos).
  // Se vacían aquí para que la prueba toque la pantalla ya conectada, como pasa a velocidad humana.
  await act(async () => {})
  return router
}

/** Abre sesión sin pasar por la pantalla, y espera a que queden cargados sus datos. */
async function entrarComo(correo: string) {
  const cuenta = banco.cuentas.get(correo)
  if (!cuenta) throw new Error(`No existe ${correo}`)
  await act(async () => {
    banco.actual = cuenta
    banco.oyentes.forEach((o) => o(cuenta.usuario))
  })
  await waitFor(() => expect(['activa', 'pendiente']).toContain(leerSesion().fase))
}

function llenarAcceso(correo: string, contrasena: string) {
  fireEvent.change(screen.getByLabelText('Correo'), { target: { value: correo } })
  fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: contrasena } })
}
const modoCrear = () => fireEvent.click(screen.getByRole('radio', { name: 'Crear cuenta' }))
const casilla = () => screen.getByRole('checkbox', { name: /autorizo el tratamiento/i })

describe('crear cuenta y entrar', () => {
  it('sin la casilla no se crea la cuenta, ni con correo ni con Google', async () => {
    await visitar('/acceso')
    modoCrear()
    expect((casilla() as HTMLInputElement).checked).toBe(false)
    llenarAcceso(CORREO, CLAVE)
    fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }))
    expect(screen.getByText('Marca la casilla para crear tu cuenta.')).toBeTruthy()
    expect(document.activeElement).toBe(casilla())
    fireEvent.click(screen.getByRole('button', { name: 'Continuar con Google' }))
    expect(banco.llamadas).toEqual([])
    expect(banco.cuentas.size).toBe(0)
  })

  it('la política se puede leer antes de registrarse', async () => {
    await visitar('/acceso')
    expect(screen.getByRole('link', { name: 'política de privacidad' }).getAttribute('href')).toBe('/privacidad')
    modoCrear()
    expect(screen.getByRole('link', { name: /Política de privacidad/ }).getAttribute('href')).toBe('/privacidad')
  })

  it('con la casilla crea la cuenta, guarda la autorización y vuelve adonde iba', async () => {
    const router = await visitar('/acceso?volver=%2Fmi-cocina%2Fnueva')
    modoCrear()
    llenarAcceso(CORREO, CLAVE)
    fireEvent.click(casilla())
    fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/mi-cocina/nueva'))
    expect(banco.cuentas.get(CORREO)?.perfil?.autorizacion.version).toBe('2026-11-04')
    expect(localStorage.getItem(CLAVE_PISTA)).toBe('1')
  })

  it('una dirección de vuelta ajena se ignora', async () => {
    sembrarCuenta(CORREO, CLAVE)
    const router = await visitar('/acceso?volver=%2F%2Fsitio-ajeno.example')
    llenarAcceso(CORREO, CLAVE)
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/mi-cocina'))
  })

  it('los errores de Firebase salen en español junto a su campo, nunca el código', async () => {
    sembrarCuenta(CORREO, CLAVE)
    await visitar('/acceso')
    modoCrear()
    llenarAcceso(CORREO, CLAVE)
    fireEvent.click(casilla())
    fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }))
    await screen.findByText(/Ya hay una cuenta con ese correo/)
    expect(screen.getByLabelText('Correo').getAttribute('aria-invalid')).toBe('true')
    expect(document.body.textContent).not.toContain('auth/')
    cleanup()

    await visitar('/acceso')
    llenarAcceso(CORREO, 'otra-clave-mala')
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))
    await screen.findByText(/no coinciden/)
    expect(document.activeElement).toBe(screen.getByLabelText('Contraseña'))
  })

  it('recuperar contraseña no revela si la cuenta existe', async () => {
    await visitar('/acceso')
    fireEvent.click(screen.getByRole('button', { name: 'Olvidé mi contraseña' }))
    expect(screen.getByText('Escribe tu correo arriba para enviarte el enlace.')).toBeTruthy()
    expect(banco.llamadas).toEqual([])
    fireEvent.change(screen.getByLabelText('Correo'), { target: { value: 'nadie@correo.co' } })
    fireEvent.click(screen.getByRole('button', { name: 'Olvidé mi contraseña' }))
    await screen.findByText(/Si hay una cuenta con nadie@correo.co/)
  })

  it('sin sesión, /mi-cocina va a /acceso y vuelve adonde iba', async () => {
    sembrarCuenta(CORREO, CLAVE)
    const router = await visitar('/mi-cocina')
    await waitFor(() => expect(router.state.location.pathname).toBe('/acceso'))
    expect(router.state.location.search).toBe('?volver=%2Fmi-cocina')
    await screen.findByLabelText('Correo')
    llenarAcceso(CORREO, CLAVE)
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))
    await screen.findByRole('heading', { name: 'Mis datos' })
    expect(router.state.location.pathname).toBe('/mi-cocina')
  })

  it('cerrar sesión deja de mostrar lo propio y quita la pista', async () => {
    sembrarCuenta(CORREO, CLAVE)
    await entrarComo(CORREO)
    const router = await visitar('/mi-cocina')
    await screen.findByRole('heading', { name: 'Mis datos' })
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }))
    await waitFor(() => expect(leerSesion().fase).toBe('anonima'))
    await waitFor(() => expect(router.state.location.pathname).toBe('/acceso'))
    expect(localStorage.getItem(CLAVE_PISTA)).toBeNull()
  })
})

describe('la pista de sesión no decide nada', () => {
  it('ponerla a mano no da acceso: Firebase responde que no hay sesión y se borra', async () => {
    localStorage.setItem(CLAVE_PISTA, '1')
    const router = await visitar('/mi-cocina')
    await waitFor(() => expect(router.state.location.pathname).toBe('/acceso'))
    await act(async () => {
      banco.oyentes.forEach((o) => o(null))
    })
    await waitFor(() => expect(localStorage.getItem(CLAVE_PISTA)).toBeNull())
  })
})

describe('Google y la autorización', () => {
  it('desde «Crear cuenta», con la casilla, entra de una', async () => {
    const router = await visitar('/acceso')
    modoCrear()
    fireEvent.click(casilla())
    fireEvent.click(screen.getByRole('button', { name: 'Continuar con Google' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/mi-cocina'))
    expect(banco.cuentas.get(banco.google)?.perfil).not.toBeNull()
  })

  it('alguien nuevo que entra por «Entrar» ve la autorización y no queda nada guardado hasta aceptar', async () => {
    const router = await visitar('/acceso')
    fireEvent.click(screen.getByRole('button', { name: 'Continuar con Google' }))
    await screen.findByRole('heading', { name: 'Un último paso' })
    expect(banco.cuentas.get(banco.google)?.perfil).toBeNull()
    expect(banco.llamadas).not.toContain('crearPerfil')

    fireEvent.click(screen.getByRole('button', { name: 'Aceptar y continuar' }))
    expect(screen.getByText('Marca la casilla para terminar de crear tu cuenta.')).toBeTruthy()
    fireEvent.click(casilla())
    fireEvent.click(screen.getByRole('button', { name: 'Aceptar y continuar' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/mi-cocina'))
    expect(banco.cuentas.get(banco.google)?.perfil?.autorizacion.version).toBe('2026-11-04')
  })

  it('quien ya aceptó entra sin ver la autorización otra vez', async () => {
    const cuenta = sembrarCuenta('vieja@correo.co', CLAVE)
    banco.google = 'vieja@correo.co'
    const version = cuenta.perfil?.autorizacion
    const router = await visitar('/acceso')
    fireEvent.click(screen.getByRole('button', { name: 'Continuar con Google' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/mi-cocina'))
    expect(banco.llamadas).not.toContain('crearPerfil')
    expect(cuenta.perfil?.autorizacion).toBe(version)
  })

  it('si no acepta, la cuenta se borra', async () => {
    await visitar('/acceso')
    fireEvent.click(screen.getByRole('button', { name: 'Continuar con Google' }))
    await screen.findByRole('heading', { name: 'Un último paso' })
    fireEvent.click(screen.getByRole('button', { name: 'No acepto' }))
    fireEvent.click(screen.getByRole('button', { name: 'Borrar la cuenta' }))
    await waitFor(() => expect(banco.cuentas.has(banco.google)).toBe(false))
    await waitFor(() => expect(leerSesion().fase).toBe('anonima'))
  })

  it('si la sesión es vieja, confirma identidad antes de borrar', async () => {
    sembrarCuenta('sin-autorizar@correo.co', CLAVE, { autorizada: false })
    banco.pedirConfirmacion = true
    await entrarComo('sin-autorizar@correo.co')
    await visitar('/acceso')
    fireEvent.click(screen.getByRole('button', { name: 'No acepto' }))
    fireEvent.click(screen.getByRole('button', { name: 'Borrar la cuenta' }))
    fireEvent.change(await screen.findByLabelText('Tu contraseña'), { target: { value: CLAVE } })
    fireEvent.click(screen.getByRole('button', { name: 'Borrar la cuenta' }))
    await waitFor(() => expect(banco.cuentas.has('sin-autorizar@correo.co')).toBe(false))
  })
})

describe('quien cerró la pestaña a mitad, sin autorización', () => {
  const CORREO_MITAD = 'mitad@correo.co'

  it('vuelve a ver la autorización y no puede entrar a nada', async () => {
    sembrarCuenta(CORREO_MITAD, CLAVE, { autorizada: false })
    await entrarComo(CORREO_MITAD)
    expect(leerSesion().fase).toBe('pendiente')

    // Ruta protegida directa: va a /acceso, que le pide autorizar.
    const router = await visitar('/mi-cocina')
    await screen.findByRole('heading', { name: 'Un último paso' })
    expect(router.state.location.pathname).toBe('/acceso')
    expect(screen.queryByRole('heading', { name: 'Mis datos' })).toBeNull()
    cleanup()

    // En una receta no puede marcar favoritas: solo le ofrece terminar.
    await visitar(RECETA)
    expect(screen.queryByRole('button', { name: 'Favorita' })).toBeNull()
    expect(screen.getByText('Termina de crear tu cuenta para guardar favoritos y notas.')).toBeTruthy()
    cleanup()

    // Su lista no se pasa a la cuenta ni se le leen datos.
    expect(banco.llamadas).not.toContain('leerInteracciones')
    expect(banco.llamadas).not.toContain('guardarLista')
  })

  it('al aceptar queda registrada', async () => {
    sembrarCuenta(CORREO_MITAD, CLAVE, { autorizada: false })
    await entrarComo(CORREO_MITAD)
    const router = await visitar('/acceso?volver=%2Fmi-cocina')
    fireEvent.click(casilla())
    fireEvent.click(screen.getByRole('button', { name: 'Aceptar y continuar' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/mi-cocina'))
    expect(leerSesion().fase).toBe('activa')
  })

  it('si no se puede leer el perfil, no se le da paso', async () => {
    sembrarCuenta(CORREO_MITAD, CLAVE)
    banco.fallas.leerPerfil = 'unavailable'
    await entrarComo(CORREO_MITAD).catch(() => {})
    await waitFor(() => expect(leerSesion().fase).toBe('error'))
    await visitar('/mi-cocina')
    expect(screen.getByText('No pudimos revisar tu cuenta')).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'Mis datos' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Intentar de nuevo' }))
    await screen.findByRole('heading', { name: 'Mis datos' })
  })
})

describe('favoritos, notas y «ya la probé»', () => {
  beforeEach(async () => {
    sembrarCuenta(CORREO, CLAVE)
    await entrarComo(CORREO)
  })
  const cuenta = () => banco.cuentas.get(CORREO)

  it('sin sesión la receta solo invita a entrar', async () => {
    await act(async () => {
      banco.actual = null
      banco.oyentes.forEach((o) => o(null))
    })
    await visitar(RECETA)
    expect(screen.queryByRole('button', { name: 'Favorita' })).toBeNull()
    expect(screen.getByText('Con una cuenta guardas favoritos y notas de esta receta.')).toBeTruthy()
  })

  it('marca al instante y lo guarda en la cuenta', async () => {
    await visitar(RECETA)
    const boton = screen.getByRole('button', { name: 'Favorita' })
    fireEvent.click(boton)
    expect(boton.getAttribute('aria-pressed')).toBe('true')
    await waitFor(() => expect(cuenta()?.interacciones['arroz-con-leche']?.favorita).toBe(true))
    await screen.findByText('Agregaste la receta a tus favoritas.')

    fireEvent.click(screen.getByRole('button', { name: 'Ya la probé' }))
    await waitFor(() => expect(cuenta()?.interacciones['arroz-con-leche']?.probada).toMatch(/^\d{4}-\d{2}-\d{2}$/))
  })

  it('si la escritura falla, vuelve atrás y dice por qué', async () => {
    banco.fallas.crearInteraccion = 'permission-denied'
    await visitar(RECETA)
    const boton = screen.getByRole('button', { name: 'Favorita' })
    fireEvent.click(boton)
    expect(boton.getAttribute('aria-pressed')).toBe('true')
    await screen.findByText(/el servidor no lo permitió/)
    expect(boton.getAttribute('aria-pressed')).toBe('false')
    expect(cuenta()?.interacciones['arroz-con-leche']).toBeUndefined()
  })

  it('al quitar lo último, el documento se borra y libera el tope', async () => {
    await visitar(RECETA)
    fireEvent.click(screen.getByRole('button', { name: 'Favorita' }))
    await waitFor(() => expect(cuenta()?.interacciones['arroz-con-leche']).toBeTruthy())
    fireEvent.click(screen.getByRole('button', { name: 'Favorita' }))
    await waitFor(() => expect(cuenta()?.interacciones['arroz-con-leche']).toBeUndefined())
    expect(banco.llamadas).toContain('borrarInteraccion')
  })

  it('guarda la nota y aparece en Mi cocina junto con la favorita', async () => {
    const router = await visitar(RECETA)
    fireEvent.change(screen.getByLabelText(/Tu nota/), { target: { value: 'Con menos azúcar queda mejor.' } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar nota' }))
    await screen.findByText('Guardaste tu nota.')
    fireEvent.click(screen.getByRole('button', { name: 'Favorita' }))
    await waitFor(() => expect(cuenta()?.interacciones['arroz-con-leche']?.favorita).toBe(true))

    await act(async () => {
      await router.navigate('/mi-cocina')
    })
    await screen.findByRole('heading', { name: 'Mis datos' })
    expect(screen.getByText('Con menos azúcar queda mejor.')).toBeTruthy()
    const favoritas = screen.getByRole('heading', { name: 'Favoritas' }).closest('section') as HTMLElement
    expect(within(favoritas).getByRole('link', { name: 'Arroz con leche' })).toBeTruthy()
  })
})

describe('recetas personales', () => {
  beforeEach(async () => {
    sembrarCuenta(CORREO, CLAVE)
    await entrarComo(CORREO)
  })
  const cuenta = () => banco.cuentas.get(CORREO)

  async function crearReceta(router: Awaited<ReturnType<typeof visitar>>) {
    fireEvent.change(screen.getByLabelText('Nombre de la receta'), { target: { value: 'Sancocho ficticio' } })
    fireEvent.change(screen.getByLabelText('Categoría'), { target: { value: 'postres' } })
    fireEvent.change(screen.getByLabelText(/Tiempo total/), { target: { value: '60' } })
    fireEvent.change(screen.getByLabelText('Ingrediente 1'), { target: { value: 'leche entera' } })
    expect(screen.getByText(/^Está en el catálogo: usa su precio, al /)).toBeTruthy()
    fireEvent.change(screen.getByLabelText('Cantidad'), { target: { value: '500' } })
    fireEvent.change(screen.getByLabelText('Unidad'), { target: { value: 'ml' } })
    fireEvent.click(screen.getByRole('button', { name: 'Agregar ingrediente' }))
    fireEvent.change(screen.getByLabelText('Ingrediente 2'), { target: { value: 'Ñame de la finca' } })
    expect(screen.getByText('No está en el catálogo: quedará «Sin precio».')).toBeTruthy()
    fireEvent.change(screen.getAllByLabelText('Cantidad')[1] as HTMLElement, { target: { value: '2' } })
    fireEvent.change(screen.getByLabelText('Paso 1'), { target: { value: 'Hierve todo.' } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar receta' }))
    await waitFor(() => expect(router.state.location.pathname).toMatch(/^\/mi-cocina\/receta\/mia-/))
    await screen.findByRole('heading', { level: 1, name: 'Sancocho ficticio' })
  }

  it('valida junto a cada campo y enfoca el primero', async () => {
    await visitar('/mi-cocina/nueva')
    fireEvent.click(screen.getByRole('button', { name: 'Guardar receta' }))
    expect(screen.getByText('Escribe el nombre de la receta.')).toBeTruthy()
    expect(screen.getByText('Agrega al menos un ingrediente con su cantidad.')).toBeTruthy()
    expect(document.activeElement).toBe(screen.getByLabelText('Nombre de la receta'))
    expect(banco.llamadas).not.toContain('crearReceta')
  })

  it('crea una receta con el mismo cálculo; lo que no está en el catálogo queda sin precio y el costo, parcial', async () => {
    const router = await visitar('/mi-cocina/nueva')
    await crearReceta(router)
    expect(Object.keys(cuenta()?.recetas ?? {})).toHaveLength(1)
    expect(screen.getByText('Ñame de la finca')).toBeTruthy()
    expect(screen.getByText('Sin precio')).toBeTruthy()
    expect(screen.getByText('Costo parcial: falta el precio de Ñame de la finca.')).toBeTruthy()
    expect(screen.getByText('Esta receta es privada: otras cuentas no la ven.')).toBeTruthy()
    // El ingrediente escrito a mano que coincide con el catálogo dice de dónde salió su precio.
    expect(screen.getByText(/^Precio del catálogo, al \d+ de \w+ de \d{4}$/)).toBeTruthy()
    // Usa la imagen de respaldo de su categoría.
    expect(screen.getByText('Imagen de postres, ilustrativa y generada con IA.')).toBeTruthy()
    await waitFor(() => expect(document.head.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex'))
  })

  it('no se puede publicar: no hay ninguna opción para hacerlo', async () => {
    const router = await visitar('/mi-cocina/nueva')
    await crearReceta(router)
    expect(screen.queryByRole('button', { name: /publicar/i })).toBeNull()
    expect(screen.queryByRole('link', { name: /publicar/i })).toBeNull()
  })

  it('al exportar, el precio queda vacío y no en cero, y el total se marca como parcial', async () => {
    const router = await visitar('/mi-cocina/nueva')
    await crearReceta(router)
    fireEvent.click(screen.getByRole('button', { name: 'Exportar' }))
    fireEvent.click(screen.getByRole('button', { name: /^CSV/ }))
    await screen.findByText(/^Descargaste mia-.*\.csv\.$/)
    const texto = (await ultimoBlob?.text()) ?? ''
    const fila = texto.split('\r\n').find((l) => l.startsWith('Ñame de la finca;')) ?? ''
    const celdas = fila.split(';')
    expect(celdas[5]).toBe('') // Precio del catálogo.
    expect(celdas[7]).toBe('') // Subtotal.
    expect(fila).toContain('Sin precio')
    expect(texto).toContain('Total parcial: faltan precios')
    expect(texto).not.toContain('Total estimado')

    fireEvent.click(screen.getByRole('button', { name: 'Exportar' }))
    fireEvent.click(screen.getByRole('button', { name: /^JSON/ }))
    await screen.findByText(/^Descargaste mia-.*\.json\.$/)
    const datos = JSON.parse((await ultimoBlob?.text()) ?? '{}')
    expect(datos.costo.completo).toBe(false)
    expect(datos.ingredientes.find((i: { nombre: string }) => i.nombre === 'Ñame de la finca').subtotal).toBeNull()
  })

  it('en la lista de compras aparece igual, con los totales marcados como parciales', async () => {
    const router = await visitar('/mi-cocina/nueva')
    await crearReceta(router)
    fireEvent.click(screen.getByRole('button', { name: 'Agregar a la lista' }))
    await act(async () => {
      await router.navigate('/lista')
    })
    await screen.findByRole('heading', { name: 'Recetas en la lista' })
    expect(screen.getByRole('link', { name: 'Sancocho ficticio' }).getAttribute('href')).toMatch(/^\/mi-cocina\/receta\/mia-/)
    expect(screen.getByRole('checkbox', { name: /Ñame de la finca.*Sin datos de la tienda/ })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Lo que cuestan estas recetas (parcial)' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Lo que pagas hoy en caja (parcial)' })).toBeTruthy()
    expect(screen.getByText('Totales parciales: falta el precio de Ñame de la finca.')).toBeTruthy()
  })

  it('edita y borra; al borrarla sale también de la lista', async () => {
    const router = await visitar('/mi-cocina/nueva')
    await crearReceta(router)
    fireEvent.click(screen.getByRole('button', { name: 'Agregar a la lista' }))

    fireEvent.click(screen.getByRole('link', { name: 'Editar' }))
    await screen.findByRole('heading', { level: 1, name: 'Editar receta' })
    expect((screen.getByLabelText('Ingrediente 1') as HTMLInputElement).value).toBe('Leche entera')
    fireEvent.change(screen.getByLabelText('Nombre de la receta'), { target: { value: 'Sancocho editado' } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar receta' }))
    await screen.findByRole('heading', { level: 1, name: 'Sancocho editado' })
    expect(banco.llamadas).toContain('actualizarReceta')

    fireEvent.click(screen.getByRole('button', { name: 'Borrar' }))
    fireEvent.click(screen.getByRole('button', { name: 'Borrar receta' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/mi-cocina'))
    expect(Object.keys(cuenta()?.recetas ?? {})).toHaveLength(0)
    await screen.findByRole('heading', { name: 'Todavía no tienes recetas propias' })
  })

  it('si falla al guardar, lo dice y conserva lo escrito', async () => {
    banco.fallas.crearReceta = 'unavailable'
    await visitar('/mi-cocina/nueva')
    fireEvent.change(screen.getByLabelText('Nombre de la receta'), { target: { value: 'Sancocho ficticio' } })
    fireEvent.change(screen.getByLabelText('Categoría'), { target: { value: 'postres' } })
    fireEvent.change(screen.getByLabelText(/Tiempo total/), { target: { value: '60' } })
    fireEvent.change(screen.getByLabelText('Ingrediente 1'), { target: { value: 'Sal' } })
    fireEvent.change(screen.getByLabelText('Cantidad'), { target: { value: '1' } })
    fireEvent.change(screen.getByLabelText('Paso 1'), { target: { value: 'Hierve.' } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar receta' }))
    await screen.findByText(/No hay conexión con el servidor. Revisa tu internet e intenta de nuevo. Lo que escribiste sigue aquí/)
    expect((screen.getByLabelText('Nombre de la receta') as HTMLInputElement).value).toBe('Sancocho ficticio')
  })

  it('el modo cocina funciona con una receta personal y vuelve a su ficha', async () => {
    const router = await visitar('/mi-cocina/nueva')
    await crearReceta(router)
    const ficha = router.state.location.pathname
    const [enlace] = screen.getAllByRole('link', { name: 'Cocinar paso a paso' })
    fireEvent.click(enlace as HTMLElement)
    await waitFor(() => expect(router.state.location.pathname).toBe(`${ficha}/cocinar`))
    fireEvent.click(await screen.findByRole('link', { name: 'Salir' }))
    await waitFor(() => expect(router.state.location.pathname).toBe(ficha))
  })
})

describe('la lista del navegador pasa a la cuenta', () => {
  const guardarLocal = (estado: object) => {
    localStorage.setItem(CLAVE_LISTA, JSON.stringify(estado))
    almacenNavegador.recargar()
  }

  it('se combina con la de la cuenta, sin perder nada, y el navegador queda limpio', async () => {
    sembrarCuenta(CORREO, CLAVE, { lista: JSON.stringify({ recetas: [{ id: 'ajiaco-santafereno', porciones: 4 }], comprados: [] }) })
    guardarLocal({ recetas: [{ id: 'arroz-con-leche', porciones: 12 }, { id: 'ajiaco-santafereno', porciones: 8 }], comprados: [] })
    await entrarComo(CORREO)
    await waitFor(() => expect(leerSesion().fase).toBe('activa'))

    const guardada = JSON.parse(banco.cuentas.get(CORREO)?.perfil?.lista ?? '{}')
    expect(guardada.recetas).toEqual([
      { id: 'ajiaco-santafereno', porciones: 8 },
      { id: 'arroz-con-leche', porciones: 12 },
    ])
    expect(almacenNavegador.leer()).toEqual(LISTA_VACIA)

    // Después de entrar se llega a Mi cocina: ahí también se avisa.
    await visitar('/mi-cocina')
    await screen.findByRole('heading', { name: 'Mis datos' })
    expect(screen.getByText(/Pasamos a tu cuenta la lista/)).toBeTruthy()
    cleanup()

    await visitar('/lista')
    expect(screen.getByRole('link', { name: 'Arroz con leche' })).toBeTruthy()
    expect(screen.getByText(/Pasamos a tu cuenta la lista/)).toBeTruthy()
  })

  it('si no se puede guardar en la cuenta, no se borra del navegador', async () => {
    sembrarCuenta(CORREO, CLAVE)
    guardarLocal({ recetas: [{ id: 'arroz-con-leche', porciones: 12 }], comprados: [] })
    banco.fallas.guardarLista = 'unavailable'
    await entrarComo(CORREO)
    await waitFor(() => expect(leerSesion().fase).toBe('activa'))
    expect(almacenNavegador.leer().recetas).toHaveLength(1)
    await visitar('/lista')
    expect(screen.getByText(/No se pudo pasar a tu cuenta la lista/)).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Arroz con leche' })).toBeTruthy()
  })

  it('al cerrar sesión, la lista se queda en la cuenta y no en el navegador', async () => {
    sembrarCuenta(CORREO, CLAVE)
    await entrarComo(CORREO)
    await visitar(RECETA)
    fireEvent.click(screen.getByRole('button', { name: 'Agregar a la lista' }))
    expect(localStorage.getItem(CLAVE_LISTA)).toBeNull()
    fireEvent.click(screen.getAllByRole('button', { name: 'Salir' })[0] as HTMLElement)
    await waitFor(() => expect(leerSesion().fase).toBe('anonima'))
    expect(JSON.parse(banco.cuentas.get(CORREO)?.perfil?.lista ?? '{}').recetas).toEqual([{ id: 'arroz-con-leche', porciones: 6 }])
    expect(almacenNavegador.leer()).toEqual(LISTA_VACIA)
  })
})

describe('mis datos', () => {
  beforeEach(async () => {
    const cuenta = sembrarCuenta(CORREO, CLAVE, { lista: JSON.stringify({ recetas: [{ id: 'arroz-con-leche', porciones: 2 }], comprados: [] }) })
    cuenta.interacciones['arroz-con-leche'] = { favorita: true, probada: '', nota: 'Mi nota' }
    cuenta.recetas['mia-abcd1234'] = { titulo: 'Mía', resumen: '', categoria: 'postres', porcionesBase: 2, tiempoMin: 5, ingredientes: ['{"ingrediente":"Sal","cantidad":1,"unidad":"g"}'], miseEnPlace: [], pasos: ['{"texto":"Hazlo"}'] }
    await entrarComo(CORREO)
  })

  it('exporta favoritos, notas, recetas y lista en JSON', async () => {
    await visitar('/mi-cocina')
    await screen.findByRole('heading', { name: 'Mis datos' })
    fireEvent.click(screen.getByRole('button', { name: 'Exportar mis datos' }))
    await screen.findByText(/^Descargaste mis-datos-moss-taste-.*\.json\.$/)
    const datos = JSON.parse((await ultimoBlob?.text()) ?? '{}')
    expect(datos.cuenta.correo).toBe(CORREO)
    expect(datos.favoritos).toEqual(['arroz-con-leche'])
    expect(datos.notas[0].nota).toBe('Mi nota')
    expect(datos.recetasPersonales[0].titulo).toBe('Mía')
    expect(datos.listaDeCompras.recetas).toHaveLength(1)
  })

  it('borrar la cuenta pide la contraseña y borra todo', async () => {
    await visitar('/mi-cocina')
    await screen.findByRole('heading', { name: 'Mis datos' })
    fireEvent.click(screen.getByRole('button', { name: 'Borrar mi cuenta y mis datos' }))
    fireEvent.click(screen.getByRole('button', { name: 'Borrar mi cuenta y mis datos' }))
    expect(screen.getByText('Escribe tu contraseña para confirmar que eres tú.')).toBeTruthy()
    expect(banco.cuentas.has(CORREO)).toBe(true)

    fireEvent.change(screen.getByLabelText('Tu contraseña'), { target: { value: 'una-mala' } })
    fireEvent.click(screen.getByRole('button', { name: 'Borrar mi cuenta y mis datos' }))
    await screen.findByText(/no coinciden/)
    expect(banco.cuentas.has(CORREO)).toBe(true)

    const cuenta = banco.cuentas.get(CORREO)
    fireEvent.change(screen.getByLabelText('Tu contraseña'), { target: { value: CLAVE } })
    fireEvent.click(screen.getByRole('button', { name: 'Borrar mi cuenta y mis datos' }))
    await waitFor(() => expect(banco.cuentas.has(CORREO)).toBe(false))
    expect(cuenta?.recetas).toEqual({})
    expect(cuenta?.interacciones).toEqual({})
    expect(cuenta?.perfil).toBeNull()
    await waitFor(() => expect(leerSesion().fase).toBe('anonima'))
    expect(localStorage.getItem(CLAVE_PISTA)).toBeNull()
  })

  it('si falla a mitad, lo dice y se puede repetir', async () => {
    banco.fallas.borrarReceta = 'unavailable'
    await visitar('/mi-cocina')
    await screen.findByRole('heading', { name: 'Mis datos' })
    fireEvent.click(screen.getByRole('button', { name: 'Borrar mi cuenta y mis datos' }))
    fireEvent.change(screen.getByLabelText('Tu contraseña'), { target: { value: CLAVE } })
    fireEvent.click(screen.getByRole('button', { name: 'Borrar mi cuenta y mis datos' }))
    await waitFor(() => expect(banco.llamadas).toContain('borrarReceta'))
    await waitFor(() => expect(leerSesion().fase).toBe('activa'))
    expect(banco.cuentas.has(CORREO)).toBe(true)
    expect(banco.cuentas.get(CORREO)?.interacciones).toEqual({})
    expect(Object.keys(banco.cuentas.get(CORREO)?.recetas ?? {})).toHaveLength(1)
  })
})
