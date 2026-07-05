import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ConflictError, NotFoundError } from '../domain/errors/appErrors'
import type { HabitEntry } from '../domain/week'
import type { HabitEntryRepository } from './ports/HabitEntryRepository'
import type { RewardRedemptionRepository } from './ports/RewardRedemptionRepository'
import type { WeekRepository } from './ports/WeekRepository'
import { updateHabitEntry } from './updateHabitEntry'

describe('updateHabitEntry', () => {
  const sampleEntry: HabitEntry = {
    id: 42,
    weekHabitId: 10,
    dayIndex: 0,
    status: 'pending',
    updatedAt: new Date('2026-06-10T10:00:00.000Z'),
  }

  const completedEntry: HabitEntry = {
    ...sampleEntry,
    status: 'completed',
    updatedAt: new Date('2026-06-10T11:00:00.000Z'),
  }

  const week = {
    id: 1,
    userId: 1,
    startDate: new Date('2026-06-08T00:00:00.000Z'),
    endDate: new Date('2026-06-14T23:59:59.999Z'),
    isLocked: false,
    totalPointsEarned: 0,
    totalPenalties: 0,
    createdAt: new Date('2026-06-08T00:00:00.000Z'),
    weekHabits: [],
  }

  let mockEntryRepo: HabitEntryRepository
  let mockWeekRepo: WeekRepository
  let mockRedemptionRepo: RewardRedemptionRepository

  beforeEach(() => {
    vi.clearAllMocks()
    mockEntryRepo = {
      findByIdWithWeek: vi.fn().mockResolvedValue({
        entry: sampleEntry,
        weekId: 1,
        weekUserId: 1,
        weekIsLocked: false,
      }),
      updateStatus: vi.fn().mockResolvedValue(completedEntry),
    }
    mockWeekRepo = {
      findCurrentWeek: vi.fn(),
      findUnlockedWeekBefore: vi.fn(),
      lockWeek: vi.fn(),
      createWeekWithHabitsAndEntries: vi.fn(),
      addHabitsToWeek: vi.fn(),
      removeHabitsFromWeek: vi.fn(),
      findById: vi.fn().mockResolvedValue(week),
      updateHabitSnapshotInWeek: vi.fn(),
      findWeekByUserAndStartDate: vi.fn(),
      findLastLockedWeekBefore: vi.fn(),
    }
    mockRedemptionRepo = {
      findByWeekId: vi.fn().mockResolvedValue([]),
      hasRedemptionsForReward: vi.fn(),
      findRedeemedRewardIds: vi.fn(),
      deleteById: vi.fn(),
      redeem: vi.fn(),
    }
  })

  it('updates entry status on happy path', async () => {
    const result = await updateHabitEntry(
      mockEntryRepo,
      mockWeekRepo,
      mockRedemptionRepo,
      1,
      42,
      { status: 'completed' }
    )

    expect(result.entry).toEqual(completedEntry)
    expect(result.redemptionInvalidated).toBe(false)
    expect(mockEntryRepo.updateStatus).toHaveBeenCalledWith(42, 'completed')
  })

  it('returns redemptionInvalidated when reconciliation removes a redemption', async () => {
    mockRedemptionRepo.findByWeekId = vi.fn().mockResolvedValue([
      { id: 99, weekId: 1, rewardId: 2, pointsSpent: 50, redeemedAt: new Date() },
    ])
    mockRedemptionRepo.deleteById = vi.fn().mockResolvedValue({
      id: 99,
      weekId: 1,
      rewardId: 2,
      pointsSpent: 50,
      redeemedAt: new Date(),
    })
    mockWeekRepo.findById = vi.fn().mockResolvedValue({
      ...week,
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
          entries: [{ ...sampleEntry, status: 'pending' }],
        },
      ],
    })

    const result = await updateHabitEntry(
      mockEntryRepo,
      mockWeekRepo,
      mockRedemptionRepo,
      1,
      42,
      { status: 'pending' }
    )

    expect(result.redemptionInvalidated).toBe(true)
    expect(mockRedemptionRepo.deleteById).toHaveBeenCalledWith(99)
  })

  it('throws ConflictError when week is locked', async () => {
    mockEntryRepo.findByIdWithWeek = vi.fn().mockResolvedValue({
      entry: sampleEntry,
      weekId: 1,
      weekUserId: 1,
      weekIsLocked: true,
    })

    await expect(
      updateHabitEntry(mockEntryRepo, mockWeekRepo, mockRedemptionRepo, 1, 42, {
        status: 'completed',
      })
    ).rejects.toMatchObject({ code: 'WEEK_LOCKED' })
    expect(mockEntryRepo.updateStatus).not.toHaveBeenCalled()
  })

  it('throws NotFoundError when entry does not exist', async () => {
    mockEntryRepo.findByIdWithWeek = vi.fn().mockResolvedValue(null)

    await expect(
      updateHabitEntry(mockEntryRepo, mockWeekRepo, mockRedemptionRepo, 1, 99999, {
        status: 'completed',
      })
    ).rejects.toMatchObject({ code: 'HABIT_ENTRY_NOT_FOUND' })
    expect(mockEntryRepo.updateStatus).not.toHaveBeenCalled()
  })
})
