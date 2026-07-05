import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: [
      'backend/src/**/*.test.ts',
      'frontend/src/**/*.test.ts',
      'frontend/src/**/*.test.tsx',
    ],
    exclude: [
      'backend/src/**/*.integration.test.ts',
      'node_modules',
    ],
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reportsDirectory: 'coverage',
      reporter: ['text', 'html', 'lcov'],
      include: [
        'frontend/src/domain/**/*.ts',
        'frontend/src/domain/**/*.tsx',
        'backend/src/domain/**/*.ts',
      ],
      thresholds: {
        lines: 80,
      },
    },
  },
})
