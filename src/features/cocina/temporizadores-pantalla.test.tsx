// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { rutasApp } from '@/app/rutasApp'
import { ProveedorTema } from '@/app/tema/ProveedorTema'
import { CLAVE_SILENCIO, CLAVE_TEMPORIZADORES, MINUTO_MS } from './temporizadores'

// Datos fijos de prueba. En arroz-con-leche, el paso 3 lleva 8 minutos y el paso 2, otro temporizador.
vi.mock('@/lib/recetas/catalogo', () => import('@/test/catalogoPrueba'))

const RECETA = 'arroz-con-leche'
const oscilaciones = vi.fn()

class AudioFalso {
  currentTime = 0
  destination = {}
  resume = vi.fn(async () => {})
  createOscillator() {
    oscilaciones()
    return { type: '', frequency: { value: 0 }, connect: vi.fn(), start: vi.fn(), stop: vi.fn() }
  }
  createGain() {
    return { gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() }, connect: vi.fn() }
  }
}

function candadoFalso() {
  const oyentes: (() => void)[] = []
  return {
    addEventListener: (_: string, o: () => void) => void oyentes.push(o),
    release: vi.fn(async () => oyentes.forEach((o) => o())),
    soltarDesdeElNavegador: () => oyentes.forEach((o) => o()),
  }
}

function instalarWakeLock() {
  const pedido = vi.fn(async () => candadoFalso())
  Object.defineProperty(navigator, 'wakeLock', { value: { request: pedido }, configurable: true })
  return pedido
}

beforeEach(() => {
  localStorage.clear()
  oscilaciones.mockClear()
  vi.stubGlobal('AudioContext', AudioFalso)
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.unstubAllGlobals()
  Reflect.deleteProperty(navigator, 'wakeLock')
})

async function cocinar(busqueda = '?paso=3') {
  const router = createMemoryRouter(rutasApp, { initialEntries: [`/recetas/${RECETA}/cocinar${busqueda}`] })
  render(
    <ProveedorTema>
      <RouterProvider router={router} />
    </ProveedorTema>,
  )
  await screen.findByRole('heading', { level: 1, name: 'Arroz con leche' })
  await act(async () => {})
  return router
}

/** A partir de aquí el reloj lo mueve la prueba. Solo el reloj: las esperas de Testing Library siguen reales. */
const congelarReloj = () => vi.useFakeTimers({ toFake: ['Date', 'setInterval', 'clearInterval', 'setTimeout', 'clearTimeout'], shouldAdvanceTime: false })
const avanzar = (ms: number) => act(async () => void (await vi.advanceTimersByTimeAsync(ms)))
const guardados = () => JSON.parse(localStorage.getItem(CLAVE_TEMPORIZADORES) ?? '[]')
const iniciar = () => fireEvent.click(screen.getByRole('button', { name: 'Iniciar' }))
const reloj = () => within(screen.getByRole('region', { name: 'Temporizador' })).getByRole('timer').textContent

describe('un temporizador en el modo cocina', () => {
  it('cuenta, pausa, reanuda, suma un minuto y se reinicia', async () => {
    await cocinar()
    congelarReloj()
    expect(reloj()).toBe('08:00')
    iniciar()
    await avanzar(60_000)
    expect(reloj()).toBe('07:00')

    fireEvent.click(screen.getByRole('button', { name: 'Pausar' }))
    await avanzar(5 * 60_000)
    expect(reloj()).toBe('07:00')
    expect(screen.getByText('En pausa')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Reanudar' }))
    await avanzar(60_000)
    expect(reloj()).toBe('06:00')

    fireEvent.click(screen.getByRole('button', { name: 'Un minuto más' }))
    expect(reloj()).toBe('07:00')

    // Reiniciar pide confirmar: un toque de más no borra lo contado.
    fireEvent.click(screen.getByRole('button', { name: 'Reiniciar' }))
    expect(reloj()).toBe('07:00')
    fireEvent.click(screen.getByRole('button', { name: 'Conservar' }))
    expect(reloj()).toBe('07:00')
    fireEvent.click(screen.getByRole('button', { name: 'Reiniciar' }))
    fireEvent.click(screen.getByRole('button', { name: 'Sí, reiniciar' }))
    expect(reloj()).toBe('08:00')
    expect(localStorage.getItem(CLAVE_TEMPORIZADORES)).toBeNull()
  })

  it('guarda solo la receta, el paso y la hora de fin', async () => {
    await cocinar()
    iniciar()
    const [uno] = guardados()
    expect(Object.keys(uno).sort()).toEqual(['fin', 'paso', 'receta', 'restanteMs'])
    expect(uno.receta).toBe(RECETA)
    expect(uno.paso).toBe(3)
    expect(uno.restanteMs).toBeNull()
  })

  it('sobrevive a una recarga con el tiempo que realmente pasó', async () => {
    localStorage.setItem(CLAVE_TEMPORIZADORES, JSON.stringify([{ receta: RECETA, paso: 3, fin: Date.now() + 2 * MINUTO_MS, restanteMs: null }]))
    await cocinar()
    expect(reloj()).toMatch(/^0[12]:/)
    expect(screen.queryByRole('button', { name: 'Iniciar' })).toBeNull()
  })

  it('sigue corriendo en otro paso, en la franja, y desde ahí se vuelve a su paso', async () => {
    const router = await cocinar()
    iniciar()
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }))
    await waitFor(() => expect(router.state.location.search).toBe('?paso=4'))
    const franja = screen.getByRole('region', { name: 'Temporizadores de esta receta' })
    fireEvent.click(within(franja).getByRole('button', { name: /Ir al paso 3/ }))
    await waitFor(() => expect(router.state.location.search).toBe('?paso=3'))
  })

  it('al terminar suena, lo anuncia y se queda hasta darle «Listo»', async () => {
    await cocinar()
    congelarReloj()
    iniciar()
    expect(oscilaciones).not.toHaveBeenCalled()
    await avanzar(8 * 60_000)
    expect(oscilaciones).toHaveBeenCalled()
    const franja = screen.getByRole('region', { name: 'Temporizadores de esta receta' })
    expect(within(franja).getByText(/Terminó el paso 3/)).toBeTruthy()
    expect(screen.getByText('Terminó el temporizador del paso 3.')).toBeTruthy()

    const antes = oscilaciones.mock.calls.length
    fireEvent.click(within(franja).getByRole('button', { name: 'Listo, paso 3' }))
    await avanzar(5000)
    expect(oscilaciones.mock.calls.length).toBe(antes)
    expect(localStorage.getItem(CLAVE_TEMPORIZADORES)).toBeNull()
    expect(reloj()).toBe('08:00')
  })

  it('deja de sonar solo después de un minuto, pero el aviso se queda', async () => {
    await cocinar()
    congelarReloj()
    iniciar()
    await avanzar(8 * 60_000)
    expect(oscilaciones).toHaveBeenCalled()
    await avanzar(61_000)
    const antes = oscilaciones.mock.calls.length
    await avanzar(10_000)
    expect(oscilaciones.mock.calls.length).toBe(antes)
    expect(screen.getByText(/Terminó el paso 3/)).toBeTruthy()
  })

  it('con la alarma silenciada no suena, y el silencio se recuerda', async () => {
    await cocinar()
    congelarReloj()
    iniciar()
    fireEvent.click(screen.getByRole('button', { name: 'Silenciar alarma' }))
    expect(localStorage.getItem(CLAVE_SILENCIO)).toBe('1')
    await avanzar(8 * 60_000)
    expect(oscilaciones).not.toHaveBeenCalled()
    expect(screen.getByText(/Terminó el paso 3/)).toBeTruthy()
  })

  it('silenciar detiene la alarma que ya estaba sonando', async () => {
    await cocinar()
    congelarReloj()
    iniciar()
    await avanzar(8 * 60_000)
    fireEvent.click(screen.getByRole('button', { name: 'Silenciar alarma' }))
    const antes = oscilaciones.mock.calls.length
    await avanzar(5000)
    expect(oscilaciones.mock.calls.length).toBe(antes)
  })

  it('si terminó hace rato, al volver lo dice sin hacer sonar la alarma', async () => {
    localStorage.setItem(CLAVE_TEMPORIZADORES, JSON.stringify([{ receta: RECETA, paso: 3, fin: Date.now() - 3 * MINUTO_MS, restanteMs: null }]))
    await cocinar()
    expect(screen.getAllByText(/hace 3 minutos/).length).toBeGreaterThan(0)
    expect(oscilaciones).not.toHaveBeenCalled()
  })

  it('un minuto más sobre uno terminado lo vuelve a poner a correr', async () => {
    await cocinar()
    congelarReloj()
    iniciar()
    await avanzar(8 * 60_000)
    fireEvent.click(screen.getByRole('button', { name: 'Un minuto más' }))
    expect(reloj()).toBe('01:00')
    expect(screen.queryByText(/Terminó el paso 3/)).toBeNull()
  })

  it('abrir el modo cocina no toca la vibración: solo vibra al sonar, y al parar la apaga', async () => {
    const vibrar = vi.fn(() => true)
    Object.defineProperty(navigator, 'vibrate', { value: vibrar, configurable: true })
    try {
      await cocinar()
      expect(vibrar).not.toHaveBeenCalled()
      congelarReloj()
      iniciar()
      await avanzar(8 * 60_000)
      expect(vibrar).toHaveBeenCalledWith([300, 150, 300])
      fireEvent.click(screen.getByRole('button', { name: 'Listo, paso 3' }))
      await avanzar(0)
      expect(vibrar).toHaveBeenLastCalledWith(0)
    } finally {
      Reflect.deleteProperty(navigator, 'vibrate')
    }
  })

  it('funciona sin AudioContext, sin vibración y sin almacenamiento', async () => {
    vi.stubGlobal('AudioContext', undefined)
    const original = Storage.prototype.setItem
    Storage.prototype.setItem = () => {
      throw new DOMException('Cuota', 'QuotaExceededError')
    }
    try {
      await cocinar()
      congelarReloj()
      iniciar()
      await avanzar(8 * 60_000)
      expect(screen.getByText(/Terminó el paso 3/)).toBeTruthy()
      // Sin almacenamiento vive en memoria: se quita para que no pase a la siguiente prueba.
      fireEvent.click(screen.getByRole('button', { name: 'Listo, paso 3' }))
    } finally {
      Storage.prototype.setItem = original
    }
  })
})

describe('mantener la pantalla encendida', () => {
  it('el botón la enciende y la apaga', async () => {
    const pedido = instalarWakeLock()
    await cocinar('')
    const boton = screen.getByRole('button', { name: /Mantener pantalla encendida/ })
    fireEvent.click(boton)
    await waitFor(() => expect(boton.getAttribute('aria-pressed')).toBe('true'))
    expect(pedido).toHaveBeenCalledWith('screen')
    expect(boton.textContent).toContain('La pantalla no se apagará')
    fireEvent.click(boton)
    await waitFor(() => expect(boton.getAttribute('aria-pressed')).toBe('false'))
  })

  it('iniciar un temporizador la enciende y lo avisa', async () => {
    const pedido = instalarWakeLock()
    await cocinar()
    iniciar()
    await waitFor(() => expect(pedido).toHaveBeenCalledOnce())
    expect(screen.getByText(/Mantenemos la pantalla encendida/)).toBeTruthy()
    await waitFor(() => expect(screen.getByRole('button', { name: 'Mantener pantalla encendida' }).getAttribute('aria-pressed')).toBe('true'))
  })

  it('tras una recarga con un temporizador corriendo, la vuelve a pedir', async () => {
    const pedido = instalarWakeLock()
    localStorage.setItem(CLAVE_TEMPORIZADORES, JSON.stringify([{ receta: RECETA, paso: 3, fin: Date.now() + 5 * MINUTO_MS, restanteMs: null }]))
    await cocinar()
    await waitFor(() => expect(pedido).toHaveBeenCalledOnce())
  })

  it('con uno en pausa o ya terminado no la pide sola', async () => {
    const pedido = instalarWakeLock()
    localStorage.setItem(CLAVE_TEMPORIZADORES, JSON.stringify([{ receta: RECETA, paso: 3, fin: null, restanteMs: 5 * MINUTO_MS }, { receta: RECETA, paso: 2, fin: Date.now() - MINUTO_MS, restanteMs: null }]))
    await cocinar()
    await act(async () => {})
    expect(pedido).not.toHaveBeenCalled()
  })

  it('si la apagan a mano, otro temporizador no la vuelve a encender', async () => {
    const pedido = instalarWakeLock()
    const router = await cocinar('?paso=2')
    iniciar()
    await waitFor(() => expect(pedido).toHaveBeenCalledOnce())
    const interruptor = screen.getByRole('button', { name: 'Mantener pantalla encendida' })
    await waitFor(() => expect(interruptor.getAttribute('aria-pressed')).toBe('true'))
    fireEvent.click(interruptor)
    await waitFor(() => expect(interruptor.getAttribute('aria-pressed')).toBe('false'))
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }))
    await waitFor(() => expect(router.state.location.search).toBe('?paso=3'))
    await screen.findByRole('button', { name: 'Iniciar' })
    iniciar()
    await act(async () => {})
    expect(pedido).toHaveBeenCalledOnce()
  })

  it('se vuelve a pedir al regresar a la pestaña', async () => {
    const candado = candadoFalso()
    const pedido = vi.fn(async () => candado)
    Object.defineProperty(navigator, 'wakeLock', { value: { request: pedido }, configurable: true })
    await cocinar('')
    const boton = screen.getByRole('button', { name: /Mantener pantalla encendida/ })
    fireEvent.click(boton)
    await waitFor(() => expect(boton.getAttribute('aria-pressed')).toBe('true'))
    // El navegador la suelta al salir de la pestaña.
    await act(async () => candado.soltarDesdeElNavegador())
    expect(boton.getAttribute('aria-pressed')).toBe('false')
    await act(async () => void document.dispatchEvent(new Event('visibilitychange')))
    await waitFor(() => expect(pedido).toHaveBeenCalledTimes(2))
    await waitFor(() => expect(boton.getAttribute('aria-pressed')).toBe('true'))
  })

  it('se suelta al salir del modo cocina', async () => {
    const candado = candadoFalso()
    Object.defineProperty(navigator, 'wakeLock', { value: { request: vi.fn(async () => candado) }, configurable: true })
    const router = await cocinar('')
    const boton = screen.getByRole('button', { name: /Mantener pantalla encendida/ })
    fireEvent.click(boton)
    await waitFor(() => expect(boton.getAttribute('aria-pressed')).toBe('true'))
    await act(async () => {
      await router.navigate(`/recetas/${RECETA}`)
    })
    await waitFor(() => expect(candado.release).toHaveBeenCalled())
  })

  it('si el navegador la niega, lo dice', async () => {
    Object.defineProperty(navigator, 'wakeLock', { value: { request: vi.fn(async () => Promise.reject(new Error('Batería baja'))) }, configurable: true })
    await cocinar('')
    const boton = screen.getByRole('button', { name: /Mantener pantalla encendida/ })
    fireEvent.click(boton)
    await waitFor(() => expect(boton.textContent).toContain('El navegador no lo permitió'))
    expect(boton.getAttribute('aria-pressed')).toBe('false')
  })

  it('sin Wake Lock, el temporizador avisa que la pantalla se puede apagar', async () => {
    await cocinar()
    iniciar()
    expect(screen.getByText(/no puede mantener la pantalla encendida: si se apaga, la alarma no suena/)).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Mantener pantalla encendida' })).toBeNull()
  })
})
