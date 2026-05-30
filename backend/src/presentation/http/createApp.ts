import cors from 'cors'
import express, { type Express } from 'express'
import type { UserReadRepository } from '../../application/ports/UserReadRepository'
import { getUserProfileById } from '../../application/getUserProfile'

export interface CreateAppDeps {
  userRepository: UserReadRepository
  corsOrigin?: string
}

export function createApp(deps: CreateAppDeps): Express {
  const app = express()
  const origin = deps.corsOrigin ?? 'http://localhost:5173'

  app.use(
    cors({
      origin,
      credentials: false,
    })
  )

  app.get('/api/profile', async (_req, res) => {
    try {
      const user = await getUserProfileById(deps.userRepository, 1)

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
