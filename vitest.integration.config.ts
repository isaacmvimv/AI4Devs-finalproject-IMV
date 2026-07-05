import { defineConfig } from 'vitest/config'
import { config } from 'dotenv'

config({ path: '.env.test' })

export default defineConfig({
  test: {
    include: ['backend/src/**/*.integration.test.ts'],
    environment: 'node',
    testTimeout: 15000,
    hookTimeout: 15000,
    fileParallelism: false,
  },
})
