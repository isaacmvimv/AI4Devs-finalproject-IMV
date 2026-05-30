/**
 * API HTTP para ConRutina. Proceso Node (no navegador): Prisma + PostgreSQL.
 * El frontend en Vite (:5173) llama a /api/*; en desarrollo Vite hace proxy aquí.
 */

import './loadEnv.js'

import { PrismaClient } from '@prisma/client'
import { createApp } from './presentation/http/createApp'

const prisma = new PrismaClient()
const app = createApp(prisma)

const port = Number(process.env.API_PORT) || 3001

if (process.env.NODE_ENV !== 'production' && process.env.DATABASE_URL) {
  try {
    const u = new URL(process.env.DATABASE_URL.replace(/^postgresql:/, 'http:'))
    const dbName = u.pathname.replace(/^\//, '') || '(default)'
    console.log(`[API] PostgreSQL → base de datos: ${dbName}`)
  } catch {
    /* ignore parse errors */
  }
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
