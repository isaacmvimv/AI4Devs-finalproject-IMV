import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Reward } from '../domain/reward'
import { getActiveRewards } from './getActiveRewards'
import type { RewardRepository } from './ports/RewardRepository'

describe('getActiveRewards', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('should_return_active_rewards_from_repository', () => {
    it('returns the same array the repository provides', async () => {
      const rewards: Reward[] = [
        {
          id: 1,
          userId: 1,
          emoji: '🎁',
          name: 'Helado',
          description: 'Un helado de vainilla',
          cost: 50,
          isActive: true,
          createdAt: new Date('2026-06-10T10:00:00.000Z'),
        },
        {
          id: 2,
          userId: 1,
          emoji: '🎬',
          name: 'Película',
          description: 'Una noche de cine',
          cost: 100,
          isActive: true,
          createdAt: new Date('2026-06-10T11:00:00.000Z'),
        },
      ]
      const mockRepo: RewardRepository = {
        create: vi.fn(),
        findActiveByUserId: vi.fn().mockResolvedValue(rewards),
        findById: vi.fn(),
        softDelete: vi.fn(),
      }

      const result = await getActiveRewards(mockRepo, 1)

      expect(result).toEqual(rewards)
      expect(mockRepo.findActiveByUserId).toHaveBeenCalledWith(1)
    })
  })

  describe('should_return_empty_array_when_no_active_rewards', () => {
    it('returns empty array when repository returns no rewards', async () => {
      const mockRepo: RewardRepository = {
        create: vi.fn(),
        findActiveByUserId: vi.fn().mockResolvedValue([]),
        findById: vi.fn(),
        softDelete: vi.fn(),
      }

      const result = await getActiveRewards(mockRepo, 1)

      expect(result).toEqual([])
      expect(mockRepo.findActiveByUserId).toHaveBeenCalledWith(1)
    })
  })
})
