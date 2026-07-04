import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { RewardRedemption } from '../domain/rewardRedemption'
import type { WeekWithDetails } from '../domain/week'
import type { RewardRedemptionRepository } from './ports/RewardRedemptionRepository'
import { reconcileWeekRedemption } from './reconcileWeekRedemption'

const week: WeekWithDetails = {
  id: 1,
  userId: 1,
  startDate: new Date('2026-06-08T00:00:00.000Z'),
  endDate: new Date('2026-06-14T23:59:59.999Z'),
  isLocked: false,
  totalPointsEarned: 0,
  totalPenalties: 0,
  createdAt: new Date('2026-06-08T00:00:00.000Z'),
  weekHabits: [
    {
      id: 10,
      weekId: 1,
      habitId: 1,
      order: 0,
      snapshotName: 'Correr',
      snapshotEmoji: '🏃',
      snapshotPoints: 10,
      snapshotPenalty: 5,
      entries: [
        {
          id: 1,
          weekHabitId: 10,
          dayIndex: 0,
          status: 'completed',
          updatedAt: new Date('2026-06-10T10:00:00.000Z'),
        },
      ],
    },
  ],
}

const redemption: RewardRedemption = {
  id: 99,
  weekId: 1,
  rewardId: 2,
  pointsSpent: 39,
  redeemedAt: new Date('2026-06-10T12:00:00.000Z'),
}

describe('reconcileWeekRedemption', () => {
  let mockRepo: RewardRedemptionRepository

  beforeEach(() => {
    mockRepo = {
      findByWeekId: vi.fn(),
      hasRedemptionsForReward: vi.fn(),
      findRedeemedRewardIds: vi.fn(),
      deleteById: vi.fn().mockResolvedValue(redemption),
      redeem: vi.fn(),
    }
  })

  it('does nothing when there is no redemption', async () => {
    mockRepo.findByWeekId = vi.fn().mockResolvedValue([])

    const result = await reconcileWeekRedemption(week, mockRepo)

    expect(result).toEqual({ invalidated: false })
    expect(mockRepo.deleteById).not.toHaveBeenCalled()
  })

  it('does nothing when net points still cover the redemption', async () => {
    mockRepo.findByWeekId = vi.fn().mockResolvedValue([{ ...redemption, pointsSpent: 10 }])

    const result = await reconcileWeekRedemption(week, mockRepo)

    expect(result).toEqual({ invalidated: false })
    expect(mockRepo.deleteById).not.toHaveBeenCalled()
  })

  it('deletes redemption when net points are below points spent', async () => {
    mockRepo.findByWeekId = vi.fn().mockResolvedValue([redemption])

    const result = await reconcileWeekRedemption(week, mockRepo)

    expect(result.invalidated).toBe(true)
    expect(result.invalidatedRedemption).toEqual(redemption)
    expect(mockRepo.deleteById).toHaveBeenCalledWith(99)
  })
})
