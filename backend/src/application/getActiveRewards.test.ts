import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Reward } from '../domain/reward'
import { getActiveRewards } from './getActiveRewards'
import type { RewardRedemptionRepository } from './ports/RewardRedemptionRepository'
import type { RewardRepository } from './ports/RewardRepository'

describe('getActiveRewards', () => {
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

  let mockRewardRepo: RewardRepository
  let mockRedemptionRepo: RewardRedemptionRepository

  beforeEach(() => {
    vi.clearAllMocks()
    mockRewardRepo = {
      create: vi.fn(),
      findActiveByUserId: vi.fn().mockResolvedValue(rewards),
      findById: vi.fn(),
      softDelete: vi.fn(),
    }
    mockRedemptionRepo = {
      findByWeekId: vi.fn(),
      hasRedemptionsForReward: vi.fn(),
      findRedeemedRewardIds: vi.fn().mockResolvedValue([2]),
      deleteById: vi.fn(),
      redeem: vi.fn(),
    }
  })

  it('returns active rewards with redemption status', async () => {
    const result = await getActiveRewards(mockRewardRepo, mockRedemptionRepo, 1)

    expect(result).toEqual([
      expect.objectContaining({ id: 1, hasBeenRedeemed: false }),
      expect.objectContaining({ id: 2, hasBeenRedeemed: true }),
    ])
    expect(mockRewardRepo.findActiveByUserId).toHaveBeenCalledWith(1)
    expect(mockRedemptionRepo.findRedeemedRewardIds).toHaveBeenCalledWith([1, 2])
  })

  it('returns empty array when repository returns no rewards', async () => {
    mockRewardRepo.findActiveByUserId = vi.fn().mockResolvedValue([])

    const result = await getActiveRewards(mockRewardRepo, mockRedemptionRepo, 1)

    expect(result).toEqual([])
    expect(mockRedemptionRepo.findRedeemedRewardIds).not.toHaveBeenCalled()
  })
})
