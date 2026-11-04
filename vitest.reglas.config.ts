import { defineConfig } from 'vitest/config'

// Pruebas de las reglas de Firestore. Necesitan el emulador y Java 21: corren con `npm run test:reglas`,
// aparte de `npm test`. El proyecto «demo-» nunca toca el Firebase real.
export default defineConfig({
  test: {
    include: ['reglas/**/*.test.ts'],
    environment: 'node',
    testTimeout: 20_000,
    hookTimeout: 30_000,
    // Todas comparten el mismo emulador y lo limpian entre pruebas.
    fileParallelism: false,
  },
})
