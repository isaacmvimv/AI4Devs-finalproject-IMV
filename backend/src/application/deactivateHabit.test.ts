import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NotFoundError } from '../domain/errors/appErrors'
import type { Habit } from '../domain/habit'
import type { WeekWithDetails } from '../domain/week'
import { deactivateHabit } from './deactivateHabit'
import type { HabitRepository } from './ports/HabitRepository'
import type { RewardRedemptionRepository } from './ports/RewardRedemptionRepository'
import type { WeekRepository } from './ports/WeekRepository'

describe('deactivateHabit', () => {
  const now = new Date('2026-06-10T10:00:00.000Z')

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

  const deactivatedHabit: Habit = {
    ...existingHabit,
    isActive: false,
  }

  const currentWeek: WeekWithDetails = {
    id: 10,
    userId: 1,
    startDate: new Date('2026-06-08T00:00:00.000Z'),
    endDate: new Date('2026-06-14T23:59:59.999Z'),
    isLocked: false,
    totalPointsEarned: 0,
    totalPenalties: 0,
    createdAt: now,
    weekHabits: [
      {
        id: 100,
        weekId: 10,
        habitId: 5,
        order: 0,
        snapshotName: 'Correr',
        snapshotEmoji: '🏃',
        snapshotPoints: 10,
        snapshotPenalty: 5,
        entries: [],
      },
    ],
  }

  function makeWeekRepo(overrides: Partial<WeekRepository> = {}): WeekRepository {
    return {
      findCurrentWeek: vi.fn().mockResolvedValue(currentWeek),
      findUnlockedWeekBefore: vi.fn(),
      lockWeek: vi.fn(),
      createWeekWithHabitsAndEntries: vi.fn(),
      addHabitsToWeek: vi.fn(),
      removeHabitsFromWeek: vi.fn().mockResolvedValue({ ...currentWeek, weekHabits: [] }),
      findById: vi.fn(),
      updateHabitSnapshotInWeek: vi.fn(),
      findWeekByUserAndStartDate: vi.fn(),
      findLastLockedWeekBefore: vi.fn(),
      ...overrides,
    }
  }

  function makeHabitRepo(overrides: Partial<HabitRepository> = {}): HabitRepository {
    return {
      create: vi.fn(),
      findActiveByUserId: vi.fn(),
      findById: vi.fn().mockResolvedValue(existingHabit),
      update: vi.fn(),
      softDelete: vi.fn().mockResolvedValue(deactivatedHabit),
      ...overrides,
    }
  }

  function makeRedemptionRepo(
    overrides: Partial<RewardRedemptionRepository> = {}
  ): RewardRedemptionRepository {
    return {
      findByWeekId: vi.fn().mockResolvedValue([]),
      hasRedemptionsForReward: vi.fn(),
      findRedeemedRewardIds: vi.fn(),
      deleteById: vi.fn(),
      redeem: vi.fn(),
      ...overrides,
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('soft-deletes habit and removes it from the current unlocked week', async () => {
    const mockHabitRepo = makeHabitRepo()
    const mockWeekRepo = makeWeekRepo()

    const result = await deactivateHabit(
      mockHabitRepo,
      mockWeekRepo,
      makeRedemptionRepo(),
      1,
      5,
      now
    )

    expect(result).toEqual({ habit: deactivatedHabit, redemptionInvalidated: false })
    expect(mockHabitRepo.softDelete).toHaveBeenCalledWith(5)
    expect(mockWeekRepo.removeHabitsFromWeek).toHaveBeenCalledWith(10, [5])
  })

  it('throws NotFoundError when habit belongs to another user', async () => {
    const mockHabitRepo = makeHabitRepo({
      findById: vi.fn().mockResolvedValue({ ...existingHabit, userId: 2 }),
    })

    await expect(
      deactivateHabit(mockHabitRepo, makeWeekRepo(), makeRedemptionRepo(), 1, 5, now)
    ).rejects.toThrow(NotFoundError)
  })

  it('does not remove week habits when there is no current unlocked week', async () => {
    const mockWeekRepo = makeWeekRepo({
      findCurrentWeek: vi.fn().mockResolvedValue(null),
    })

    const result = await deactivateHabit(
      makeHabitRepo(),
      mockWeekRepo,
      makeRedemptionRepo(),
      1,
      5,
      now
    )

    expect(result.redemptionInvalidated).toBe(false)
    expect(mockWeekRepo.removeHabitsFromWeek).not.toHaveBeenCalled()
  })
})
