import type { PrismaClient } from '@prisma/client'
import cors from 'cors'
import express, { type Express } from 'express'
import { config } from '../../config.js'
import { createHabit } from '../../application/createHabit'
import { getActiveHabits } from '../../application/getActiveHabits'
import { getUserProfileById } from '../../application/getUserProfile'
import { createPrismaHabitRepository } from '../../infrastructure/prismaHabitRepository'
import { createPrismaUserRepository } from '../../infrastructure/prismaUserRepository'
import { asyncHandler } from './middleware/asyncHandler'
import { errorHandler } from './middleware/errorHandler'

export function createApp(prisma: PrismaClient): Express {
  const app = express()
  const userRepository = createPrismaUserRepository(prisma)
  const habitRepository = createPrismaHabitRepository(prisma)
  const origin = config.corsOrigin

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

  app.get(
    '/api/profile',
    asyncHandler(async (_req, res) => {
      const user = await getUserProfileById(userRepository, 1)
      return res.json(user)
    })
  )

  app.get(
    '/api/habits',
    asyncHandler(async (_req, res) => {
      const habits = await getActiveHabits(habitRepository, 1)
      return res.status(200).json(habits)
    })
  )

  app.post(
    '/api/habits',
    asyncHandler(async (req, res) => {
      const habit = await createHabit(habitRepository, 1, req.body)
      return res.status(201).json(habit)
    })
  )

  app.use(errorHandler)

  return app
}
