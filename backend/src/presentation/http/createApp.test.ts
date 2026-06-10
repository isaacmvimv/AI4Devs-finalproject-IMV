import type { PrismaClient } from '@prisma/client'
import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getUserProfileById } from '../../application/getUserProfile'
import { NotFoundError } from '../../domain/errors/appErrors'
import type { UserProfile } from '../../domain/userProfile'
import { createApp } from './createApp'

vi.mock('../../application/getUserProfile', () => ({
  getUserProfileById: vi.fn(),
}))

const mockGetUserProfileById = vi.mocked(getUserProfileById)

function createPrismaStub(): PrismaClient {
  return {} as PrismaClient
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
