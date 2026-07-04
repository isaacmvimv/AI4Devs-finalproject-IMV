import type { PrismaClient } from '@prisma/client'
import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createHabit } from '../../application/createHabit'
import { createReward } from '../../application/createReward'
import { redeemReward } from '../../application/redeemReward'
import { deactivateHabit } from '../../application/deactivateHabit'
import { getActiveHabits } from '../../application/getActiveHabits'
import { getActiveRewards } from '../../application/getActiveRewards'
import { getCurrentWeekResponse } from '../../application/getCurrentWeekResponse'
import { getWeekByOffset } from '../../application/getWeekByOffset'
import { getUserProfileById } from '../../application/getUserProfile'
import { softDeleteReward } from '../../application/softDeleteReward'
import { updateHabit } from '../../application/updateHabit'
import { updateHabitEntry } from '../../application/updateHabitEntry'
import {
  ConflictError,
  NotFoundError,
  UnprocessableError,
  ValidationError,
} from '../../domain/errors/appErrors'
import type { Habit } from '../../domain/habit'
import type { Reward } from '../../domain/reward'
import type { RewardRedemption } from '../../domain/rewardRedemption'
import type { HabitEntry } from '../../domain/week'
import type { UserProfile } from '../../domain/userProfile'
import { createApp } from './createApp'

vi.mock('../../application/getUserProfile', () => ({
  getUserProfileById: vi.fn(),
}))

vi.mock('../../application/createHabit', () => ({
  createHabit: vi.fn(),
}))

vi.mock('../../application/getActiveHabits', () => ({
  getActiveHabits: vi.fn(),
}))

vi.mock('../../application/updateHabit', () => ({
  updateHabit: vi.fn(),
}))

vi.mock('../../application/updateHabitEntry', () => ({
  updateHabitEntry: vi.fn(),
}))

vi.mock('../../application/deactivateHabit', () => ({
  deactivateHabit: vi.fn(),
}))

vi.mock('../../application/getCurrentWeekResponse', () => ({
  getCurrentWeekResponse: vi.fn(),
}))

vi.mock('../../application/getWeekByOffset', () => ({
  getWeekByOffset: vi.fn(),
}))

vi.mock('../../application/createReward', () => ({
  createReward: vi.fn(),
}))

vi.mock('../../application/getActiveRewards', () => ({
  getActiveRewards: vi.fn(),
}))

vi.mock('../../application/softDeleteReward', () => ({
  softDeleteReward: vi.fn(),
}))

vi.mock('../../application/redeemReward', () => ({
  redeemReward: vi.fn(),
}))

const mockGetUserProfileById = vi.mocked(getUserProfileById)
const mockCreateHabit = vi.mocked(createHabit)
const mockGetActiveHabits = vi.mocked(getActiveHabits)
const mockUpdateHabit = vi.mocked(updateHabit)
const mockUpdateHabitEntry = vi.mocked(updateHabitEntry)
const mockDeactivateHabit = vi.mocked(deactivateHabit)
const mockGetCurrentWeekResponse = vi.mocked(getCurrentWeekResponse)
const mockGetWeekByOffset = vi.mocked(getWeekByOffset)
const mockCreateReward = vi.mocked(createReward)
const mockGetActiveRewards = vi.mocked(getActiveRewards)
const mockSoftDeleteReward = vi.mocked(softDeleteReward)
const mockRedeemReward = vi.mocked(redeemReward)

function createPrismaStub(): PrismaClient {
  return {} as PrismaClient
}

const sampleHabit: Habit = {
  id: 1,
  userId: 1,
  emoji: '🏃',
  name: 'Correr',
  pointsPerDay: 10,
  penalty: 5,
  isActive: true,
  createdAt: new Date('2026-06-10T10:00:00.000Z'),
}

const sampleReward: Reward = {
  id: 1,
  userId: 1,
  emoji: '🎬',
  name: 'Ir al cine',
  description: 'Tarde de peli',
  cost: 50,
  isActive: true,
  createdAt: new Date('2026-06-10T10:00:00.000Z'),
}

describe('GET /api/profile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 200 with full UserProfile on happy path', async () => {
    const profile: UserProfile = {
      id: 1,
      name: 'Ana',
      email: 'a@test.com',
      avatarUrl: 'https://example.com/avatar.png',
    }
    mockGetUserProfileById.mockResolvedValue(profile)

    const app = createApp(createPrismaStub())
    const response = await request(app).get('/api/profile')

    expect(response.status).toBe(200)
    expect(response.body).toEqual(profile)
    expect(mockGetUserProfileById).toHaveBeenCalledWith(expect.anything(), 1)
  })

  it('returns 404 with USER_NOT_FOUND when user not found', async () => {
    mockGetUserProfileById.mockRejectedValue(new NotFoundError('Usuario no encontrado'))

    const app = createApp(createPrismaStub())
    const response = await request(app).get('/api/profile')

    expect(response.status).toBe(404)
    expect(response.body).toMatchObject({
      code: 'USER_NOT_FOUND',
      message: 'Usuario no encontrado',
    })
    expect(response.body).not.toHaveProperty('error')
  })

  it('preserves name: null in response', async () => {
    const profile: UserProfile = {
      id: 2,
      name: null,
      email: 'b@test.com',
      avatarUrl: null,
    }
    mockGetUserProfileById.mockResolvedValue(profile)

    const app = createApp(createPrismaStub())
    const response = await request(app).get('/api/profile')

    expect(response.status).toBe(200)
    expect(response.body).toEqual(profile)
    expect(response.body.name).toBeNull()
  })
})

describe('GET /api/habits', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 200 with active habits on happy path', async () => {
    mockGetActiveHabits.mockResolvedValue([sampleHabit])

    const app = createApp(createPrismaStub())
    const response = await request(app).get('/api/habits')

    expect(response.status).toBe(200)
    expect(response.body).toHaveLength(1)
    expect(response.body[0]).toMatchObject({
      id: 1,
      emoji: '🏃',
      name: 'Correr',
      pointsPerDay: 10,
      penalty: 5,
      isActive: true,
      createdAt: '2026-06-10T10:00:00.000Z',
    })
    expect(mockGetActiveHabits).toHaveBeenCalledWith(expect.anything(), 1)
  })

  it('returns 200 with empty array when no active habits', async () => {
    mockGetActiveHabits.mockResolvedValue([])

    const app = createApp(createPrismaStub())
    const response = await request(app).get('/api/habits')

    expect(response.status).toBe(200)
    expect(response.body).toEqual([])
  })
})

describe('POST /api/habits', () => {
  const validBody = {
    emoji: '🏃',
    name: 'Correr',
    pointsPerDay: 10,
    penalty: 5,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 201 with created habit on happy path', async () => {
    mockCreateHabit.mockResolvedValue(sampleHabit)

    const app = createApp(createPrismaStub())
    const response = await request(app).post('/api/habits').send(validBody)

    expect(response.status).toBe(201)
    expect(response.body).toMatchObject({
      id: 1,
      userId: 1,
      emoji: '🏃',
      name: 'Correr',
      pointsPerDay: 10,
      penalty: 5,
      isActive: true,
      createdAt: '2026-06-10T10:00:00.000Z',
    })
    expect(mockCreateHabit).toHaveBeenCalledWith(expect.anything(), 1, validBody)
  })

  it('returns 400 VALIDATION_ERROR when name is invalid', async () => {
    mockCreateHabit.mockRejectedValue(
      new ValidationError('Datos inválidos', [{ field: 'name', message: 'El nombre es obligatorio' }])
    )

    const app = createApp(createPrismaStub())
    const response = await request(app)
      .post('/api/habits')
      .send({ ...validBody, name: '' })

    expect(response.status).toBe(400)
    expect(response.body).toMatchObject({
      code: 'VALIDATION_ERROR',
      message: 'Datos inválidos',
      details: [{ field: 'name', message: 'El nombre es obligatorio' }],
    })
  })

  it('returns 400 VALIDATION_ERROR when pointsPerDay is invalid', async () => {
    mockCreateHabit.mockRejectedValue(
      new ValidationError('Datos inválidos', [
        { field: 'pointsPerDay', message: 'Los puntos por día deben ser mayores que 0' },
      ])
    )

    const app = createApp(createPrismaStub())
    const response = await request(app)
      .post('/api/habits')
      .send({ ...validBody, pointsPerDay: 0 })

    expect(response.status).toBe(400)
    expect(response.body).toMatchObject({
      code: 'VALIDATION_ERROR',
      details: expect.arrayContaining([
        expect.objectContaining({ field: 'pointsPerDay' }),
      ]),
    })
  })

  it('returns 400 VALIDATION_ERROR when emoji is invalid', async () => {
    mockCreateHabit.mockRejectedValue(
      new ValidationError('Datos inválidos', [{ field: 'emoji', message: 'El emoji es obligatorio' }])
    )

    const app = createApp(createPrismaStub())
    const response = await request(app)
      .post('/api/habits')
      .send({ ...validBody, emoji: '' })

    expect(response.status).toBe(400)
    expect(response.body).toMatchObject({
      code: 'VALIDATION_ERROR',
      details: expect.arrayContaining([expect.objectContaining({ field: 'emoji' })]),
    })
  })

  it('returns 400 VALIDATION_ERROR via middleware without invoking use case', async () => {
    const app = createApp(createPrismaStub())
    const response = await request(app).post('/api/habits').send({ emoji: '🏃' })

    expect(response.status).toBe(400)
    expect(response.body).toMatchObject({
      code: 'VALIDATION_ERROR',
      message: 'Datos inválidos',
    })
    expect(response.body.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'name' }),
        expect.objectContaining({ field: 'pointsPerDay' }),
      ])
    )
    expect(mockCreateHabit).not.toHaveBeenCalled()
  })
})

describe('PATCH /api/habits/:id', () => {
  const updatedHabit: Habit = {
    ...sampleHabit,
    id: 5,
    pointsPerDay: 15,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 200 with updated habit on happy path', async () => {
    mockUpdateHabit.mockResolvedValue({ habit: updatedHabit, redemptionInvalidated: false })

    const app = createApp(createPrismaStub())
    const response = await request(app)
      .patch('/api/habits/5')
      .send({ pointsPerDay: 15 })

    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({
      id: 5,
      pointsPerDay: 15,
      redemptionInvalidated: false,
    })
    expect(mockUpdateHabit).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.anything(),
      1,
      5,
      { pointsPerDay: 15 }
    )
  })

  it('returns 400 VALIDATION_ERROR when validation fails', async () => {
    mockUpdateHabit.mockRejectedValue(
      new ValidationError('Datos inválidos', [{ field: 'input', message: 'Debe proporcionar al menos un campo para actualizar' }])
    )

    const app = createApp(createPrismaStub())
    const response = await request(app).patch('/api/habits/5').send({})

    expect(response.status).toBe(400)
    expect(response.body).toMatchObject({
      code: 'VALIDATION_ERROR',
      message: 'Datos inválidos',
    })
  })

  it('returns 404 HABIT_NOT_FOUND when habit not found', async () => {
    mockUpdateHabit.mockRejectedValue(
      new NotFoundError('Hábito no encontrado', 'HABIT_NOT_FOUND')
    )

    const app = createApp(createPrismaStub())
    const response = await request(app)
      .patch('/api/habits/5')
      .send({ pointsPerDay: 15 })

    expect(response.status).toBe(404)
    expect(response.body).toMatchObject({
      code: 'HABIT_NOT_FOUND',
      message: 'Hábito no encontrado',
    })
  })

  it('returns 404 without invoking use case when id is invalid', async () => {
    const app = createApp(createPrismaStub())
    const response = await request(app)
      .patch('/api/habits/abc')
      .send({ pointsPerDay: 15 })

    expect(response.status).toBe(404)
    expect(response.body).toMatchObject({
      code: 'HABIT_NOT_FOUND',
    })
    expect(mockUpdateHabit).not.toHaveBeenCalled()
  })
})

describe('GET /api/rewards', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 200 with 3 active rewards on happy path', async () => {
    const rewards = [
      { ...sampleReward, id: 1, hasBeenRedeemed: false },
      { ...sampleReward, id: 2, name: 'Cena especial', hasBeenRedeemed: true },
      { ...sampleReward, id: 3, name: 'Tarde libre', hasBeenRedeemed: false },
    ]
    mockGetActiveRewards.mockResolvedValue(rewards)

    const app = createApp(createPrismaStub())
    const response = await request(app).get('/api/rewards')

    expect(response.status).toBe(200)
    expect(response.body).toHaveLength(3)
    expect(response.body[0]).toMatchObject({ hasBeenRedeemed: false })
    expect(response.body[1]).toMatchObject({ hasBeenRedeemed: true })
    expect(mockGetActiveRewards).toHaveBeenCalledWith(expect.anything(), expect.anything(), 1)
  })

  it('returns 200 with empty array when no active rewards', async () => {
    mockGetActiveRewards.mockResolvedValue([])

    const app = createApp(createPrismaStub())
    const response = await request(app).get('/api/rewards')

    expect(response.status).toBe(200)
    expect(response.body).toEqual([])
  })
})

describe('POST /api/rewards', () => {
  const validBody = {
    emoji: '🎬',
    name: 'Ir al cine',
    description: 'Tarde de peli',
    cost: 50,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 201 with created reward on happy path', async () => {
    mockCreateReward.mockResolvedValue(sampleReward)

    const app = createApp(createPrismaStub())
    const response = await request(app).post('/api/rewards').send(validBody)

    expect(response.status).toBe(201)
    expect(response.body).toMatchObject({
      id: 1,
      userId: 1,
      emoji: '🎬',
      name: 'Ir al cine',
      description: 'Tarde de peli',
      cost: 50,
      isActive: true,
      createdAt: '2026-06-10T10:00:00.000Z',
    })
    expect(mockCreateReward).toHaveBeenCalledWith(expect.anything(), 1, validBody)
  })

  it('returns 400 VALIDATION_ERROR when cost is zero via middleware without invoking use case', async () => {
    const app = createApp(createPrismaStub())
    const response = await request(app)
      .post('/api/rewards')
      .send({ emoji: '🎬', name: 'Test', description: 'Test', cost: 0 })

    expect(response.status).toBe(400)
    expect(response.body).toMatchObject({
      code: 'VALIDATION_ERROR',
      message: 'Datos inválidos',
    })
    expect(response.body.details).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'cost' })])
    )
    expect(mockCreateReward).not.toHaveBeenCalled()
  })
})

describe('DELETE /api/rewards/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 204 with empty body on happy path', async () => {
    mockSoftDeleteReward.mockResolvedValue({ ...sampleReward, id: 3, isActive: false })

    const app = createApp(createPrismaStub())
    const response = await request(app).delete('/api/rewards/3')

    expect(response.status).toBe(204)
    expect(response.body).toEqual({})
    expect(mockSoftDeleteReward).toHaveBeenCalledWith(expect.anything(), expect.anything(), 1, 3)
  })

  it('returns 409 REWARD_ALREADY_REDEEMED when reward has been redeemed', async () => {
    mockSoftDeleteReward.mockRejectedValue(
      new ConflictError('No se puede eliminar una recompensa ya canjeada', 'REWARD_ALREADY_REDEEMED')
    )

    const app = createApp(createPrismaStub())
    const response = await request(app).delete('/api/rewards/3')

    expect(response.status).toBe(409)
    expect(response.body).toMatchObject({
      code: 'REWARD_ALREADY_REDEEMED',
      message: 'No se puede eliminar una recompensa ya canjeada',
    })
  })

  it('returns 404 REWARD_NOT_FOUND when reward not found', async () => {
    mockSoftDeleteReward.mockRejectedValue(
      new NotFoundError('Recompensa no encontrada', 'REWARD_NOT_FOUND')
    )

    const app = createApp(createPrismaStub())
    const response = await request(app).delete('/api/rewards/3')

    expect(response.status).toBe(404)
    expect(response.body).toMatchObject({
      code: 'REWARD_NOT_FOUND',
      message: 'Recompensa no encontrada',
    })
  })

  it('returns 404 without invoking use case when id is invalid', async () => {
    const app = createApp(createPrismaStub())
    const response = await request(app).delete('/api/rewards/abc')

    expect(response.status).toBe(404)
    expect(response.body).toMatchObject({
      code: 'REWARD_NOT_FOUND',
    })
    expect(mockSoftDeleteReward).not.toHaveBeenCalled()
  })
})

describe('DELETE /api/habits/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 200 with redemptionInvalidated flag on happy path', async () => {
    mockDeactivateHabit.mockResolvedValue({
      habit: { ...sampleHabit, isActive: false },
      redemptionInvalidated: false,
    })

    const app = createApp(createPrismaStub())
    const response = await request(app).delete('/api/habits/5')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ redemptionInvalidated: false })
    expect(mockDeactivateHabit).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.anything(),
      1,
      5
    )
  })

  it('returns 404 HABIT_NOT_FOUND when habit not found', async () => {
    mockDeactivateHabit.mockRejectedValue(
      new NotFoundError('Hábito no encontrado', 'HABIT_NOT_FOUND')
    )

    const app = createApp(createPrismaStub())
    const response = await request(app).delete('/api/habits/5')

    expect(response.status).toBe(404)
    expect(response.body).toMatchObject({
      code: 'HABIT_NOT_FOUND',
      message: 'Hábito no encontrado',
    })
  })
})

const sampleWeekPayload = {
  week: {
    id: 3,
    startDate: '2026-06-08T00:00:00.000Z',
    endDate: '2026-06-14T23:59:59.999Z',
    isLocked: false,
    totalPointsEarned: 0,
    totalPenalties: 0,
  },
  habits: [
    {
      weekHabit: {
        id: 10,
        habitId: 1,
        order: 0,
        snapshotName: 'Correr',
        snapshotEmoji: '💪',
        snapshotPoints: 10,
        snapshotPenalty: 5,
      },
      entries: [{ id: 1, dayIndex: 0, status: 'pending' }],
    },
  ],
  stats: { thisWeekPoints: 0, penalties: 0, lastWeekPoints: 0, maxStreak: 0 },
  redemptions: [] as [],
}

describe('GET /api/weeks/current', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 200 with week, habits, stats and redemptions (US-09 S3)', async () => {
    mockGetCurrentWeekResponse.mockResolvedValue(sampleWeekPayload)

    const app = createApp(createPrismaStub())
    const response = await request(app).get('/api/weeks/current')

    expect(response.status).toBe(200)
    expect(response.body).toEqual(sampleWeekPayload)
    expect(mockGetCurrentWeekResponse).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.anything(),
      1
    )
  })

  it('returns same week on two consecutive calls (US-09 S4)', async () => {
    mockGetCurrentWeekResponse.mockResolvedValue(sampleWeekPayload)

    const app = createApp(createPrismaStub())
    const first = await request(app).get('/api/weeks/current')
    const second = await request(app).get('/api/weeks/current')

    expect(first.status).toBe(200)
    expect(second.status).toBe(200)
    expect(first.body.week.id).toBe(second.body.week.id)
    expect(mockGetCurrentWeekResponse).toHaveBeenCalledTimes(2)
  })
})

describe('GET /api/weeks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 200 with locked historical week for offset=-1 (US-09 S5–6)', async () => {
    const lockedPayload = {
      ...sampleWeekPayload,
      week: { ...sampleWeekPayload.week, id: 2, isLocked: true },
    }
    mockGetWeekByOffset.mockResolvedValue(lockedPayload)

    const app = createApp(createPrismaStub())
    const response = await request(app).get('/api/weeks?offset=-1')

    expect(response.status).toBe(200)
    expect(response.body.week.isLocked).toBe(true)
    expect(mockGetWeekByOffset).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.anything(),
      1,
      -1
    )
  })

  it('returns 404 WEEK_NOT_FOUND for offset=-5 (US-09 S6)', async () => {
    mockGetWeekByOffset.mockRejectedValue(new NotFoundError('Semana no encontrada', 'WEEK_NOT_FOUND'))

    const app = createApp(createPrismaStub())
    const response = await request(app).get('/api/weeks?offset=-5')

    expect(response.status).toBe(404)
    expect(response.body).toMatchObject({
      code: 'WEEK_NOT_FOUND',
      message: 'Semana no encontrada',
    })
  })

  it('returns 400 VALIDATION_ERROR for invalid offset', async () => {
    const app = createApp(createPrismaStub())
    const response = await request(app).get('/api/weeks?offset=abc')

    expect(response.status).toBe(400)
    expect(response.body).toMatchObject({
      code: 'VALIDATION_ERROR',
    })
    expect(mockGetWeekByOffset).not.toHaveBeenCalled()
  })
})

describe('PATCH /api/habit-entries/:id', () => {
  const sampleEntry: HabitEntry = {
    id: 42,
    weekHabitId: 10,
    dayIndex: 0,
    status: 'completed',
    updatedAt: new Date('2026-06-10T11:00:00.000Z'),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 200 with updated entry on happy path', async () => {
    mockUpdateHabitEntry.mockResolvedValue({ entry: sampleEntry, redemptionInvalidated: false })

    const app = createApp(createPrismaStub())
    const response = await request(app)
      .patch('/api/habit-entries/42')
      .send({ status: 'completed' })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      id: 42,
      status: 'completed',
      updatedAt: '2026-06-10T11:00:00.000Z',
      redemptionInvalidated: false,
    })
    expect(mockUpdateHabitEntry).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.anything(),
      1,
      42,
      { status: 'completed' }
    )
  })

  it('returns 400 VALIDATION_ERROR for invalid status without invoking use case', async () => {
    const app = createApp(createPrismaStub())
    const response = await request(app)
      .patch('/api/habit-entries/42')
      .send({ status: 'done' })

    expect(response.status).toBe(400)
    expect(response.body).toMatchObject({
      code: 'VALIDATION_ERROR',
      message: 'Datos inválidos',
    })
    expect(response.body.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: 'status',
          message: 'Debe ser pending, completed o failed',
        }),
      ])
    )
    expect(mockUpdateHabitEntry).not.toHaveBeenCalled()
  })

  it('returns 404 HABIT_ENTRY_NOT_FOUND when entry not found', async () => {
    mockUpdateHabitEntry.mockRejectedValue(
      new NotFoundError('Entrada de hábito no encontrada', 'HABIT_ENTRY_NOT_FOUND')
    )

    const app = createApp(createPrismaStub())
    const response = await request(app)
      .patch('/api/habit-entries/42')
      .send({ status: 'completed' })

    expect(response.status).toBe(404)
    expect(response.body).toMatchObject({
      code: 'HABIT_ENTRY_NOT_FOUND',
      message: 'Entrada de hábito no encontrada',
    })
  })

  it('returns 409 WEEK_LOCKED when week is locked', async () => {
    mockUpdateHabitEntry.mockRejectedValue(
      new ConflictError('No se puede modificar una semana bloqueada', 'WEEK_LOCKED')
    )

    const app = createApp(createPrismaStub())
    const response = await request(app)
      .patch('/api/habit-entries/42')
      .send({ status: 'completed' })

    expect(response.status).toBe(409)
    expect(response.body).toMatchObject({
      code: 'WEEK_LOCKED',
      message: 'No se puede modificar una semana bloqueada',
    })
  })

  it('returns 404 without invoking use case when id is invalid', async () => {
    const app = createApp(createPrismaStub())
    const response = await request(app)
      .patch('/api/habit-entries/abc')
      .send({ status: 'completed' })

    expect(response.status).toBe(404)
    expect(response.body).toMatchObject({
      code: 'HABIT_ENTRY_NOT_FOUND',
    })
    expect(mockUpdateHabitEntry).not.toHaveBeenCalled()
  })
})

describe('POST /api/weeks/:weekId/redemptions', () => {
  const sampleRedemption: RewardRedemption = {
    id: 7,
    weekId: 1,
    rewardId: 2,
    pointsSpent: 80,
    redeemedAt: new Date('2026-06-12T14:30:00.000Z'),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 201 with redemption on happy path (US-12 S1)', async () => {
    mockRedeemReward.mockResolvedValue(sampleRedemption)

    const app = createApp(createPrismaStub())
    const response = await request(app)
      .post('/api/weeks/1/redemptions')
      .send({ rewardId: 2 })

    expect(response.status).toBe(201)
    expect(response.body).toEqual({
      id: 7,
      weekId: 1,
      rewardId: 2,
      pointsSpent: 80,
      redeemedAt: '2026-06-12T14:30:00.000Z',
    })
    expect(mockRedeemReward).toHaveBeenCalledWith(expect.anything(), expect.anything(), 1, 1, 2)
  })

  it('returns 422 INSUFFICIENT_POINTS with details (US-12 S2)', async () => {
    mockRedeemReward.mockRejectedValue(
      new UnprocessableError('Puntos insuficientes', 'INSUFFICIENT_POINTS', {
        available: 30,
        required: 50,
      })
    )

    const app = createApp(createPrismaStub())
    const response = await request(app)
      .post('/api/weeks/1/redemptions')
      .send({ rewardId: 2 })

    expect(response.status).toBe(422)
    expect(response.body).toMatchObject({
      code: 'INSUFFICIENT_POINTS',
      message: 'Puntos insuficientes',
      details: { available: 30, required: 50 },
    })
  })

  it('returns 409 WEEK_LOCKED when week is locked (US-12 S3)', async () => {
    mockRedeemReward.mockRejectedValue(
      new ConflictError('No se puede modificar una semana bloqueada', 'WEEK_LOCKED')
    )

    const app = createApp(createPrismaStub())
    const response = await request(app)
      .post('/api/weeks/1/redemptions')
      .send({ rewardId: 2 })

    expect(response.status).toBe(409)
    expect(response.body).toMatchObject({
      code: 'WEEK_LOCKED',
      message: 'No se puede modificar una semana bloqueada',
    })
  })

  it('returns 409 WEEK_REDEMPTION_LIMIT when week already has a redemption', async () => {
    mockRedeemReward.mockRejectedValue(
      new ConflictError('Solo se puede canjear una recompensa por semana', 'WEEK_REDEMPTION_LIMIT')
    )

    const app = createApp(createPrismaStub())
    const response = await request(app)
      .post('/api/weeks/1/redemptions')
      .send({ rewardId: 2 })

    expect(response.status).toBe(409)
    expect(response.body).toMatchObject({
      code: 'WEEK_REDEMPTION_LIMIT',
      message: 'Solo se puede canjear una recompensa por semana',
    })
  })

  it('returns 404 WEEK_NOT_FOUND when week not found', async () => {
    mockRedeemReward.mockRejectedValue(
      new NotFoundError('Semana no encontrada', 'WEEK_NOT_FOUND')
    )

    const app = createApp(createPrismaStub())
    const response = await request(app)
      .post('/api/weeks/1/redemptions')
      .send({ rewardId: 2 })

    expect(response.status).toBe(404)
    expect(response.body).toMatchObject({
      code: 'WEEK_NOT_FOUND',
      message: 'Semana no encontrada',
    })
  })

  it('returns 404 REWARD_NOT_FOUND when reward not found', async () => {
    mockRedeemReward.mockRejectedValue(
      new NotFoundError('Recompensa no encontrada', 'REWARD_NOT_FOUND')
    )

    const app = createApp(createPrismaStub())
    const response = await request(app)
      .post('/api/weeks/1/redemptions')
      .send({ rewardId: 2 })

    expect(response.status).toBe(404)
    expect(response.body).toMatchObject({
      code: 'REWARD_NOT_FOUND',
      message: 'Recompensa no encontrada',
    })
  })

  it('returns 400 VALIDATION_ERROR for invalid body without invoking use case', async () => {
    const app = createApp(createPrismaStub())
    const response = await request(app).post('/api/weeks/1/redemptions').send({})

    expect(response.status).toBe(400)
    expect(response.body).toMatchObject({
      code: 'VALIDATION_ERROR',
      message: 'Datos inválidos',
    })
    expect(response.body.details).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'rewardId' })])
    )
    expect(mockRedeemReward).not.toHaveBeenCalled()
  })

  it('returns 400 VALIDATION_ERROR for non-positive rewardId without invoking use case', async () => {
    const app = createApp(createPrismaStub())
    const response = await request(app)
      .post('/api/weeks/1/redemptions')
      .send({ rewardId: 0 })

    expect(response.status).toBe(400)
    expect(response.body).toMatchObject({
      code: 'VALIDATION_ERROR',
    })
    expect(mockRedeemReward).not.toHaveBeenCalled()
  })

  it('returns 404 without invoking use case when weekId is invalid', async () => {
    const app = createApp(createPrismaStub())
    const response = await request(app)
      .post('/api/weeks/abc/redemptions')
      .send({ rewardId: 2 })

    expect(response.status).toBe(404)
    expect(response.body).toMatchObject({
      code: 'WEEK_NOT_FOUND',
    })
    expect(mockRedeemReward).not.toHaveBeenCalled()
  })
})
