import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import { configDefaults } from 'vitest/config'
import { paginasEstaticas } from './scripts/paginasEstaticas.ts'

// GitHub Pages sirve el sitio en /Moss-Taste/ (el nombre del repo). Se usa la misma base en
// desarrollo y en preview para que las rutas y los assets se comporten igual que en producción.
export default defineConfig({
  base: '/Moss-Taste/',
  plugins: [react(), tailwindcss(), paginasEstaticas()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: {
    // Las pruebas de interfaz piden jsdom con el comentario `// @vitest-environment jsdom`.
    environment: 'node',
    // Las reglas de Firestore necesitan el emulador: corren aparte con `npm run test:reglas`.
    exclude: [...configDefaults.exclude, 'reglas/**'],
    setupFiles: ['./src/test/configuracion.ts'],
    // Más que la espera de Testing Library (10 s): con muchas pruebas en paralelo, una carga diferida puede
    // tardar, y si los dos límites son iguales la prueba falla sin margen.
    testTimeout: 20_000,
  },
})
