import type { PrismaClient } from '@prisma/client'
import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createHabit } from '../../application/createHabit'
import { getActiveHabits } from '../../application/getActiveHabits'
import { getUserProfileById } from '../../application/getUserProfile'
import { NotFoundError, ValidationError } from '../../domain/errors/appErrors'
import type { Habit } from '../../domain/habit'
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

const mockGetUserProfileById = vi.mocked(getUserProfileById)
const mockCreateHabit = vi.mocked(createHabit)
const mockGetActiveHabits = vi.mocked(getActiveHabits)

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
})
