import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ConflictError, NotFoundError } from '../domain/errors/appErrors'
import type { Reward } from '../domain/reward'
import type { RewardRedemptionRepository } from './ports/RewardRedemptionRepository'
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

  let mockRewardRepo: RewardRepository
  let mockRedemptionRepo: RewardRedemptionRepository

  beforeEach(() => {
    vi.clearAllMocks()
    mockRewardRepo = {
      create: vi.fn(),
      findActiveByUserId: vi.fn(),
      findById: vi.fn().mockResolvedValue(existingReward),
      softDelete: vi.fn().mockResolvedValue(deactivatedReward),
    }
    mockRedemptionRepo = {
      findByWeekId: vi.fn(),
      hasRedemptionsForReward: vi.fn().mockResolvedValue(false),
      findRedeemedRewardIds: vi.fn(),
      deleteById: vi.fn(),
      redeem: vi.fn(),
    }
  })

  it('soft-deletes reward when owned by user and never redeemed', async () => {
    const result = await softDeleteReward(mockRewardRepo, mockRedemptionRepo, 1, 5)

    expect(result).toEqual(deactivatedReward)
    expect(result.isActive).toBe(false)
    expect(mockRewardRepo.findById).toHaveBeenCalledWith(5)
    expect(mockRedemptionRepo.hasRedemptionsForReward).toHaveBeenCalledWith(5)
    expect(mockRewardRepo.softDelete).toHaveBeenCalledWith(5)
  })

  it('throws ConflictError when reward has been redeemed', async () => {
    mockRedemptionRepo.hasRedemptionsForReward = vi.fn().mockResolvedValue(true)

    await expect(softDeleteReward(mockRewardRepo, mockRedemptionRepo, 1, 5)).rejects.toThrow(
      ConflictError
    )
    await expect(softDeleteReward(mockRewardRepo, mockRedemptionRepo, 1, 5)).rejects.toMatchObject({
      code: 'REWARD_ALREADY_REDEEMED',
    })
    expect(mockRewardRepo.softDelete).not.toHaveBeenCalled()
  })

  it('throws NotFoundError when reward belongs to another user', async () => {
    mockRewardRepo.findById = vi.fn().mockResolvedValue({ ...existingReward, userId: 2 })

    await expect(softDeleteReward(mockRewardRepo, mockRedemptionRepo, 1, 5)).rejects.toThrow(
      NotFoundError
    )
    await expect(softDeleteReward(mockRewardRepo, mockRedemptionRepo, 1, 5)).rejects.toMatchObject({
      code: 'REWARD_NOT_FOUND',
    })
    expect(mockRewardRepo.softDelete).not.toHaveBeenCalled()
  })

  it('throws NotFoundError when reward does not exist', async () => {
    mockRewardRepo.findById = vi.fn().mockResolvedValue(null)

    await expect(softDeleteReward(mockRewardRepo, mockRedemptionRepo, 1, 999)).rejects.toThrow(
      NotFoundError
    )
    await expect(softDeleteReward(mockRewardRepo, mockRedemptionRepo, 1, 999)).rejects.toMatchObject({
      code: 'REWARD_NOT_FOUND',
    })
    expect(mockRewardRepo.softDelete).not.toHaveBeenCalled()
  })
})
