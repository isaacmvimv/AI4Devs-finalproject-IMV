import type { PrismaClient } from '@prisma/client'
import cors from 'cors'
import express, { type Express } from 'express'
import { config } from '../../config.js'
import { createHabit } from '../../application/createHabit'
import { createReward } from '../../application/createReward'
import { redeemReward } from '../../application/redeemReward'
import { deactivateHabit } from '../../application/deactivateHabit'
import { getActiveHabits } from '../../application/getActiveHabits'
import { getActiveRewards } from '../../application/getActiveRewards'
import { getCurrentWeekResponse } from '../../application/getCurrentWeekResponse'
import { getWeekByOffset } from '../../application/getWeekByOffset'
import { getUserProfileById } from '../../application/getUserProfile'
import { parseWeekOffsetQuery } from '../../application/parseWeekOffsetQuery'
import { updateHabit } from '../../application/updateHabit'
import { softDeleteReward } from '../../application/softDeleteReward'
import { updateHabitEntry } from '../../application/updateHabitEntry'
import { createHabitSchema, updateHabitSchema } from '../../application/validation/habit'
import { updateHabitEntrySchema } from '../../application/validation/habitEntry'
import { redeemRewardSchema } from '../../application/validation/rewardRedemption'
import { createRewardSchema } from '../../application/validation/reward'
import { NotFoundError } from '../../domain/errors/appErrors'
import { createPrismaHabitEntryRepository } from '../../infrastructure/prismaHabitEntryRepository'
import { createPrismaHabitRepository } from '../../infrastructure/prismaHabitRepository'
import { createPrismaRewardRedemptionRepository } from '../../infrastructure/prismaRewardRedemptionRepository'
import { createPrismaRewardRepository } from '../../infrastructure/prismaRewardRepository'
import { createPrismaUserRepository } from '../../infrastructure/prismaUserRepository'
import { createPrismaWeekRepository } from '../../infrastructure/prismaWeekRepository'
import { asyncHandler } from './middleware/asyncHandler'
import { errorHandler } from './middleware/errorHandler'
import { validateBody } from './middleware/validateBody'

function parseHabitIdParam(id: string): number {
  const habitId = Number.parseInt(id, 10)
  if (Number.isNaN(habitId)) {
    throw new NotFoundError('Hábito no encontrado', 'HABIT_NOT_FOUND')
  }
  return habitId
}

function parseHabitEntryIdParam(id: string): number {
  const entryId = Number.parseInt(id, 10)
  if (Number.isNaN(entryId)) {
    throw new NotFoundError('Entrada de hábito no encontrada', 'HABIT_ENTRY_NOT_FOUND')
  }
  return entryId
}

function parseRewardIdParam(id: string): number {
  const rewardId = Number.parseInt(id, 10)
  if (Number.isNaN(rewardId)) {
    throw new NotFoundError('Recompensa no encontrada', 'REWARD_NOT_FOUND')
  }
  return rewardId
}

function parseWeekIdParam(id: string): number {
  const weekId = Number.parseInt(id, 10)
  if (Number.isNaN(weekId)) {
    throw new NotFoundError('Semana no encontrada', 'WEEK_NOT_FOUND')
  }
  return weekId
}

export function createApp(prisma: PrismaClient): Express {
  const app = express()
  const userRepository = createPrismaUserRepository(prisma)
  const habitRepository = createPrismaHabitRepository(prisma)
  const weekRepository = createPrismaWeekRepository(prisma)
  const habitEntryRepository = createPrismaHabitEntryRepository(prisma)
  const rewardRepository = createPrismaRewardRepository(prisma)
  const rewardRedemptionRepository = createPrismaRewardRedemptionRepository(prisma)
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
    validateBody(createHabitSchema),
    asyncHandler(async (req, res) => {
      const habit = await createHabit(habitRepository, 1, req.body)
      return res.status(201).json(habit)
    })
  )

  app.patch(
    '/api/habits/:id',
    validateBody(updateHabitSchema),
    asyncHandler(async (req, res) => {
      const habitId = parseHabitIdParam(req.params.id)
      const habit = await updateHabit(habitRepository, 1, habitId, req.body)
      return res.status(200).json(habit)
    })
  )

  app.delete(
    '/api/habits/:id',
    asyncHandler(async (req, res) => {
      const habitId = parseHabitIdParam(req.params.id)
      await deactivateHabit(habitRepository, weekRepository, 1, habitId)
      return res.status(204).send()
    })
  )

  app.get(
    '/api/rewards',
    asyncHandler(async (_req, res) => {
      const rewards = await getActiveRewards(rewardRepository, 1)
      return res.status(200).json(rewards)
    })
  )

  app.post(
    '/api/rewards',
    validateBody(createRewardSchema),
    asyncHandler(async (req, res) => {
      const reward = await createReward(rewardRepository, 1, req.body)
      return res.status(201).json(reward)
    })
  )

  app.delete(
    '/api/rewards/:id',
    asyncHandler(async (req, res) => {
      const rewardId = parseRewardIdParam(req.params.id)
      await softDeleteReward(rewardRepository, 1, rewardId)
      return res.status(204).send()
    })
  )

  app.get(
    '/api/weeks/current',
    asyncHandler(async (_req, res) => {
      const payload = await getCurrentWeekResponse(weekRepository, habitRepository, 1)
      return res.status(200).json(payload)
    })
  )

  app.get(
    '/api/weeks',
    asyncHandler(async (req, res) => {
      const offset = parseWeekOffsetQuery(req.query.offset)
      const payload = await getWeekByOffset(weekRepository, habitRepository, 1, offset)
      return res.status(200).json(payload)
    })
  )

  app.patch(
    '/api/habit-entries/:id',
    validateBody(updateHabitEntrySchema),
    asyncHandler(async (req, res) => {
      const entryId = parseHabitEntryIdParam(req.params.id)
      const entry = await updateHabitEntry(habitEntryRepository, 1, entryId, req.body)
      return res.status(200).json({
        id: entry.id,
        status: entry.status,
        updatedAt: entry.updatedAt.toISOString(),
      })
    })
  )

  app.post(
    '/api/weeks/:weekId/redemptions',
    validateBody(redeemRewardSchema),
    asyncHandler(async (req, res) => {
      const weekId = parseWeekIdParam(req.params.weekId)
      const redemption = await redeemReward(
        rewardRedemptionRepository,
        rewardRepository,
        1,
        weekId,
        req.body.rewardId
      )
      return res.status(201).json({
        id: redemption.id,
        weekId: redemption.weekId,
        rewardId: redemption.rewardId,
        pointsSpent: redemption.pointsSpent,
        redeemedAt: redemption.redeemedAt.toISOString(),
      })
    })
  )

  app.use(errorHandler)

  return app
}
