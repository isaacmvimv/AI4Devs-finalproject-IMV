import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NotFoundError } from '../domain/errors/appErrors'
import type { UserProfile } from '../domain/userProfile'
import { getUserProfileById } from './getUserProfile'
import type { UserReadRepository } from './ports/UserReadRepository'

describe('getUserProfileById', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('should_return_profile_when_user_exists', () => {
    it('returns UserProfile when repository finds user including avatarUrl', async () => {
      const profile: UserProfile = {
        id: 1,
        name: 'Ana',
        email: 'a@test.com',
        avatarUrl: 'https://example.com/avatar.png',
      }
      const mockRepo: UserReadRepository = {
        findById: vi.fn().mockResolvedValue(profile),
      }

      const result = await getUserProfileById(mockRepo, 1)

      expect(result).toEqual(profile)
      expect(mockRepo.findById).toHaveBeenCalledWith(1)
    })
  })

  describe('should_throw_not_found_when_user_missing', () => {
    it('throws NotFoundError with USER_NOT_FOUND when repository returns null', async () => {
      const mockRepo: UserReadRepository = {
        findById: vi.fn().mockResolvedValue(null),
      }

      await expect(getUserProfileById(mockRepo, 99)).rejects.toThrow(NotFoundError)
      await expect(getUserProfileById(mockRepo, 99)).rejects.toMatchObject({
        code: 'USER_NOT_FOUND',
        message: 'Usuario no encontrado',
      })
      expect(mockRepo.findById).toHaveBeenCalledWith(99)
    })
  })

  describe('should_preserve_nullable_fields', () => {
    it('preserves name and avatarUrl null when present in repository result', async () => {
      const profile: UserProfile = {
        id: 2,
        name: null,
        email: 'b@test.com',
        avatarUrl: null,
      }
      const mockRepo: UserReadRepository = {
        findById: vi.fn().mockResolvedValue(profile),
      }

      const result = await getUserProfileById(mockRepo, 2)

      expect(result).toEqual({
        id: 2,
        name: null,
        email: 'b@test.com',
        avatarUrl: null,
      })
    })
  })
})
