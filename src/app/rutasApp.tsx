import type { RouteObject } from 'react-router-dom'
import { ErrorRuta } from './ErrorRuta'
import { Layout } from './Layout'
import { RutaProtegida } from './RutaProtegida'

// Cada página se carga cuando se visita (code splitting). Las rutas fijas coinciden con RUTAS_FIJAS.
export const rutasApp: RouteObject[] = [
  {
    // El modo cocina va a pantalla completa, sin cabecera ni pie.
    path: 'recetas/:slug/cocinar',
    errorElement: <ErrorRuta />,
    lazy: () => import('@/pages/Cocinar').then((m) => ({ Component: m.Cocinar })),
  },
  {
    // El modo cocina de una receta personal: igual, pero solo con sesión.
    path: 'mi-cocina/receta/:id/cocinar',
    element: <RutaProtegida />,
    errorElement: <ErrorRuta />,
    children: [{ index: true, lazy: () => import('@/pages/CocinarMia').then((m) => ({ Component: m.CocinarMia })) }],
  },
  {
    element: <Layout />,
    errorElement: <ErrorRuta />,
    children: [
      { index: true, lazy: () => import('@/pages/Inicio').then((m) => ({ Component: m.Inicio })) },
      { path: 'recetas', lazy: () => import('@/pages/Recetas').then((m) => ({ Component: m.Recetas })) },
      { path: 'recetas/:slug', lazy: () => import('@/pages/Receta').then((m) => ({ Component: m.Receta })) },
      { path: 'hoy', lazy: () => import('@/pages/Hoy').then((m) => ({ Component: m.Hoy })) },
      { path: 'lista', lazy: () => import('@/pages/Lista').then((m) => ({ Component: m.Lista })) },
      { path: 'contacto', lazy: () => import('@/pages/Contacto').then((m) => ({ Component: m.Contacto })) },
      { path: 'acceso', lazy: () => import('@/pages/Acceso').then((m) => ({ Component: m.Acceso })) },
      {
        element: <RutaProtegida />,
        children: [
          { path: 'mi-cocina', lazy: () => import('@/pages/MiCocina').then((m) => ({ Component: m.MiCocina })) },
          { path: 'mi-cocina/nueva', lazy: () => import('@/pages/NuevaReceta').then((m) => ({ Component: m.NuevaReceta })) },
          { path: 'mi-cocina/editar/:id', lazy: () => import('@/pages/NuevaReceta').then((m) => ({ Component: m.NuevaReceta })) },
          { path: 'mi-cocina/receta/:id', lazy: () => import('@/pages/RecetaMia').then((m) => ({ Component: m.RecetaMia })) },
        ],
      },
      { path: 'privacidad', lazy: () => import('@/pages/Privacidad').then((m) => ({ Component: m.Privacidad })) },
      { path: 'licencia', lazy: () => import('@/pages/Licencia').then((m) => ({ Component: m.Licencia })) },
      { path: 'acerca', lazy: () => import('@/pages/Acerca').then((m) => ({ Component: m.Acerca })) },
      { path: '*', lazy: () => import('@/pages/NoEncontrada').then((m) => ({ Component: m.NoEncontrada })) },
    ],
  },
]
