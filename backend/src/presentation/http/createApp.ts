import type { PrismaClient } from '@prisma/client'
import cors from 'cors'
import express, { type Express } from 'express'
import { getUserProfileById } from '../../application/getUserProfile'
import { createPrismaUserRepository } from '../../infrastructure/prismaUserRepository'

export function createApp(prisma: PrismaClient): Express {
  const app = express()
  const userRepository = createPrismaUserRepository(prisma)
  const origin = process.env.CORS_ORIGIN ?? 'http://localhost:5173'

  app.use(
    cors({
      origin,
      credentials: false,
    })
  )

  app.use(express.json())

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  app.get('/api/profile', async (_req, res) => {
    try {
      const user = await getUserProfileById(userRepository, 1)

      if (!user) {
        return res.status(404).json({ error: 'Usuario con id 1 no encontrado' })
      }

      return res.json({
        id: user.id,
        name: user.name,
        email: user.email,
      })
    } catch (err) {
      console.error('[api/profile]', err)
      return res.status(500).json({ error: 'Error al leer el usuario' })
    }
  })

  return app
}
