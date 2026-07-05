import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ConflictError, NotFoundError, UnprocessableError } from '../domain/errors/appErrors'
import type { Reward } from '../domain/reward'
import type { RewardRedemption } from '../domain/rewardRedemption'
import type { RewardRedemptionRepository } from './ports/RewardRedemptionRepository'
import type { RewardRepository } from './ports/RewardRepository'
import { redeemReward } from './redeemReward'

describe('redeemReward', () => {
  const reward: Reward = {
    id: 2,
    userId: 1,
    emoji: '🎉',
    name: 'Tarde libre',
    description: 'Tarde sin obligaciones',
    cost: 50,
    isActive: true,
    createdAt: new Date('2026-06-10T10:00:00.000Z'),
  }

  const redemption: RewardRedemption = {
    id: 100,
    weekId: 1,
    rewardId: 2,
    pointsSpent: 50,
    redeemedAt: new Date('2026-06-10T12:00:00.000Z'),
  }

  let mockRewardRepo: RewardRepository
  let mockRedemptionRepo: RewardRedemptionRepository

  beforeEach(() => {
    vi.clearAllMocks()
    mockRewardRepo = {
      create: vi.fn(),
      findActiveByUserId: vi.fn(),
      findById: vi.fn().mockResolvedValue(reward),
      softDelete: vi.fn(),
    }
    mockRedemptionRepo = {
      findByWeekId: vi.fn().mockResolvedValue([]),
      hasRedemptionsForReward: vi.fn(),
      findRedeemedRewardIds: vi.fn(),
      deleteById: vi.fn(),
      redeem: vi.fn().mockResolvedValue(redemption),
    }
  })

  it('redeems reward when balance is sufficient (US-12 S1)', async () => {
    const result = await redeemReward(mockRedemptionRepo, mockRewardRepo, 1, 1, 2)

    expect(result).toEqual(redemption)
    expect(mockRewardRepo.findById).toHaveBeenCalledWith(2)
    expect(mockRedemptionRepo.redeem).toHaveBeenCalledOnce()
    expect(mockRedemptionRepo.redeem).toHaveBeenCalledWith({
      userId: 1,
      weekId: 1,
      rewardId: 2,
      rewardCost: 50,
    })
  })

  it('succeeds when balance equals cost exactly (US-12 edge)', async () => {
    const exactCostReward: Reward = { ...reward, cost: 50 }
    mockRewardRepo.findById = vi.fn().mockResolvedValue(exactCostReward)

    const result = await redeemReward(mockRedemptionRepo, mockRewardRepo, 1, 1, 2)

    expect(result).toEqual(redemption)
    expect(mockRedemptionRepo.redeem).toHaveBeenCalledWith(
      expect.objectContaining({ rewardCost: 50 })
    )
  })

  it('propagates INSUFFICIENT_POINTS from repo (US-12 S2)', async () => {
    mockRedemptionRepo.redeem = vi.fn().mockRejectedValue(
      new UnprocessableError('Puntos insuficientes', 'INSUFFICIENT_POINTS', {
        available: 30,
        required: 50,
      })
    )

    await expect(redeemReward(mockRedemptionRepo, mockRewardRepo, 1, 1, 2)).rejects.toThrow(
      UnprocessableError
    )
    await expect(redeemReward(mockRedemptionRepo, mockRewardRepo, 1, 1, 2)).rejects.toMatchObject({
      code: 'INSUFFICIENT_POINTS',
      details: { available: 30, required: 50 },
    })
  })

  it('propagates WEEK_LOCKED from repo (US-12 S3)', async () => {
    mockRedemptionRepo.redeem = vi.fn().mockRejectedValue(
      new ConflictError('No se puede modificar una semana bloqueada', 'WEEK_LOCKED')
    )

    await expect(redeemReward(mockRedemptionRepo, mockRewardRepo, 1, 1, 2)).rejects.toThrow(
      ConflictError
    )
    await expect(redeemReward(mockRedemptionRepo, mockRewardRepo, 1, 1, 2)).rejects.toMatchObject({
      code: 'WEEK_LOCKED',
      message: 'No se puede modificar una semana bloqueada',
    })
  })

  it('propagates WEEK_REDEMPTION_LIMIT from repo', async () => {
    mockRedemptionRepo.redeem = vi.fn().mockRejectedValue(
      new ConflictError('Solo se puede canjear una recompensa por semana', 'WEEK_REDEMPTION_LIMIT')
    )

    await expect(redeemReward(mockRedemptionRepo, mockRewardRepo, 1, 1, 2)).rejects.toThrow(
      ConflictError
    )
    await expect(redeemReward(mockRedemptionRepo, mockRewardRepo, 1, 1, 2)).rejects.toMatchObject({
      code: 'WEEK_REDEMPTION_LIMIT',
    })
  })

  it('throws REWARD_NOT_FOUND when reward belongs to another user (US-12 ownership)', async () => {
    mockRewardRepo.findById = vi.fn().mockResolvedValue({ ...reward, userId: 99 })

    await expect(redeemReward(mockRedemptionRepo, mockRewardRepo, 1, 1, 2)).rejects.toThrow(
      NotFoundError
    )
    await expect(redeemReward(mockRedemptionRepo, mockRewardRepo, 1, 1, 2)).rejects.toMatchObject({
      code: 'REWARD_NOT_FOUND',
      message: 'Recompensa no encontrada',
    })
    expect(mockRedemptionRepo.redeem).not.toHaveBeenCalled()
  })

  it('throws REWARD_NOT_FOUND when reward does not exist', async () => {
    mockRewardRepo.findById = vi.fn().mockResolvedValue(null)

    await expect(redeemReward(mockRedemptionRepo, mockRewardRepo, 1, 1, 999)).rejects.toThrow(
      NotFoundError
    )
    expect(mockRedemptionRepo.redeem).not.toHaveBeenCalled()
  })
})
