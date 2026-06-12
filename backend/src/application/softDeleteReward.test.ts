import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NotFoundError } from '../domain/errors/appErrors'
import type { Reward } from '../domain/reward'
import type { RewardRepository } from './ports/RewardRepository'
import { softDeleteReward } from './softDeleteReward'

describe('softDeleteReward', () => {
  const existingReward: Reward = {
    id: 5,
    userId: 1,
    emoji: '🎁',
    name: 'Helado',
    description: 'Un helado de vainilla',
    cost: 50,
    isActive: true,
    createdAt: new Date('2026-06-10T10:00:00.000Z'),
  }

  const deactivatedReward: Reward = {
    ...existingReward,
    isActive: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('soft-deletes reward when owned by user', async () => {
    const mockRepo: RewardRepository = {
      create: vi.fn(),
      findActiveByUserId: vi.fn(),
      findById: vi.fn().mockResolvedValue(existingReward),
      softDelete: vi.fn().mockResolvedValue(deactivatedReward),
    }

    const result = await softDeleteReward(mockRepo, 1, 5)

    expect(result).toEqual(deactivatedReward)
    expect(result.isActive).toBe(false)
    expect(mockRepo.findById).toHaveBeenCalledWith(5)
    expect(mockRepo.softDelete).toHaveBeenCalledWith(5)
  })

  it('throws NotFoundError when reward belongs to another user', async () => {
    const mockRepo: RewardRepository = {
      create: vi.fn(),
      findActiveByUserId: vi.fn(),
      findById: vi.fn().mockResolvedValue({ ...existingReward, userId: 2 }),
      softDelete: vi.fn(),
    }

    await expect(softDeleteReward(mockRepo, 1, 5)).rejects.toThrow(NotFoundError)
    await expect(softDeleteReward(mockRepo, 1, 5)).rejects.toMatchObject({
      code: 'REWARD_NOT_FOUND',
    })
    expect(mockRepo.softDelete).not.toHaveBeenCalled()
  })

  it('throws NotFoundError when reward does not exist', async () => {
    const mockRepo: RewardRepository = {
      create: vi.fn(),
      findActiveByUserId: vi.fn(),
      findById: vi.fn().mockResolvedValue(null),
      softDelete: vi.fn(),
    }

    await expect(softDeleteReward(mockRepo, 1, 999)).rejects.toThrow(NotFoundError)
    await expect(softDeleteReward(mockRepo, 1, 999)).rejects.toMatchObject({
      code: 'REWARD_NOT_FOUND',
    })
    expect(mockRepo.softDelete).not.toHaveBeenCalled()
  })
})
