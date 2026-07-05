import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NotFoundError, ValidationError } from '../domain/errors/appErrors'
import type { Habit } from '../domain/habit'
import type { HabitRepository } from './ports/HabitRepository'
import type { RewardRedemptionRepository } from './ports/RewardRedemptionRepository'
import type { WeekRepository } from './ports/WeekRepository'
import { updateHabit } from './updateHabit'

describe('updateHabit', () => {
  const existingHabit: Habit = {
    id: 5,
    userId: 1,
    emoji: '🏃',
    name: 'Correr',
    pointsPerDay: 10,
    penalty: 5,
    isActive: true,
    createdAt: new Date('2026-06-10T10:00:00.000Z'),
  }

  const updatedHabit: Habit = {
    ...existingHabit,
    pointsPerDay: 15,
  }

  let mockHabitRepo: HabitRepository
  let mockWeekRepo: WeekRepository
  let mockRedemptionRepo: RewardRedemptionRepository

  beforeEach(() => {
    vi.clearAllMocks()
    mockHabitRepo = {
      create: vi.fn(),
      findActiveByUserId: vi.fn(),
      findById: vi.fn().mockResolvedValue(existingHabit),
      update: vi.fn().mockResolvedValue(updatedHabit),
      softDelete: vi.fn(),
    }
    mockWeekRepo = {
      findCurrentWeek: vi.fn().mockResolvedValue(null),
      findUnlockedWeekBefore: vi.fn(),
      lockWeek: vi.fn(),
      createWeekWithHabitsAndEntries: vi.fn(),
      addHabitsToWeek: vi.fn(),
      removeHabitsFromWeek: vi.fn(),
      findById: vi.fn(),
      updateHabitSnapshotInWeek: vi.fn(),
      findWeekByUserAndStartDate: vi.fn(),
      findLastLockedWeekBefore: vi.fn(),
    }
    mockRedemptionRepo = {
      findByWeekId: vi.fn(),
      hasRedemptionsForReward: vi.fn(),
      findRedeemedRewardIds: vi.fn(),
      deleteById: vi.fn(),
      redeem: vi.fn(),
    }
  })

  it('updates habit when owned by user and input is valid', async () => {
    const result = await updateHabit(mockHabitRepo, mockWeekRepo, mockRedemptionRepo, 1, 5, {
      pointsPerDay: 15,
    })

    expect(result).toEqual({ habit: updatedHabit, redemptionInvalidated: false })
    expect(mockHabitRepo.update).toHaveBeenCalledWith(5, { pointsPerDay: 15 })
  })

  it('throws NotFoundError when habit belongs to another user', async () => {
    mockHabitRepo.findById = vi.fn().mockResolvedValue({ ...existingHabit, userId: 2 })

    await expect(
      updateHabit(mockHabitRepo, mockWeekRepo, mockRedemptionRepo, 1, 5, { pointsPerDay: 15 })
    ).rejects.toMatchObject({ code: 'HABIT_NOT_FOUND' })
    expect(mockHabitRepo.update).not.toHaveBeenCalled()
  })

  it('throws ValidationError when input is invalid', async () => {
    await expect(
      updateHabit(mockHabitRepo, mockWeekRepo, mockRedemptionRepo, 1, 5, {})
    ).rejects.toThrow(ValidationError)
    expect(mockHabitRepo.update).not.toHaveBeenCalled()
  })
})
