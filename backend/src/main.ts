/**
 * API HTTP para ConRutina. Proceso Node (no navegador): Prisma + PostgreSQL.
 * El frontend en Vite (:5173) llama a /api/*; en desarrollo Vite hace proxy aquí.
 */

import './loadEnv.js'
import { config } from './config.js'

import { PrismaClient } from '@prisma/client'
import { ensureDemoUser } from './infrastructure/ensureDemoUser'
import { createApp } from './presentation/http/createApp'

async function start(): Promise<void> {
  const prisma = new PrismaClient()
  const demoUserCreated = await ensureDemoUser(prisma)
  const app = createApp(prisma)

  const port = config.apiPort

  if (config.nodeEnv !== 'production') {
    try {
      const u = new URL(config.databaseUrl.replace(/^postgresql:/, 'http:'))
      const dbName = u.pathname.replace(/^\//, '') || '(default)'
      console.log(`[API] PostgreSQL → base de datos: ${dbName}`)
    } catch {
      /* ignore parse errors */
    }
  }

  if (demoUserCreated) {
    console.log('[API] Usuario demo creado (id=1) — base de datos vacía')
  }

  const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`)
  })

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.error(
        `[API] El puerto ${port} ya está en uso. Cierra la otra instancia de "npm run dev:api" (u otro proceso en ese puerto) o define otro API_PORT en .env.`
      )
    }
    process.exit(1)
  })
}

start().catch((err) => {
  console.error('[API] Error al arrancar:', err)
  process.exit(1)
})
