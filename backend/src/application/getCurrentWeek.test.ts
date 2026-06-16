import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Habit } from '../domain/habit'
import type { WeekWithDetails } from '../domain/week'
import { getCurrentWeek } from './getCurrentWeek'
import type { HabitRepository } from './ports/HabitRepository'
import type { WeekRepository } from './ports/WeekRepository'

const now = new Date('2026-06-10T10:00:00.000Z')

const activeHabit: Habit = {
  id: 1,
  userId: 1,
  emoji: '🏃',
  name: 'Correr',
  pointsPerDay: 10,
  penalty: 5,
  isActive: true,
  createdAt: new Date('2026-06-01T10:00:00.000Z'),
}

function makePendingEntries(weekHabitId: number) {
  return Array.from({ length: 7 }, (_, dayIndex) => ({
    id: weekHabitId * 10 + dayIndex,
    weekHabitId,
    dayIndex,
    status: 'pending' as const,
    updatedAt: now,
  }))
}

const createdWeek: WeekWithDetails = {
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
      habitId: 1,
      order: 0,
      snapshotName: 'Correr',
      snapshotEmoji: '💪',
      snapshotPoints: 10,
      snapshotPenalty: 5,
      entries: makePendingEntries(100),
    },
  ],
}

describe('getCurrentWeek', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('should_create_week_with_habits_and_entries_when_none_exists', () => {
    it('creates week with 7 pending entries per active habit (US-09 S1)', async () => {
      const mockWeekRepo: WeekRepository = {
        findCurrentWeek: vi.fn().mockResolvedValue(null),
        findUnlockedWeekBefore: vi.fn(),
        lockWeek: vi.fn(),
        createWeekWithHabitsAndEntries: vi.fn().mockResolvedValue(createdWeek),
      }
      const mockHabitRepo: HabitRepository = {
        create: vi.fn(),
        findActiveByUserId: vi.fn().mockResolvedValue([activeHabit]),
        findById: vi.fn(),
        update: vi.fn(),
        softDelete: vi.fn(),
      }

      const result = await getCurrentWeek(mockWeekRepo, mockHabitRepo, 1, now)

      expect(result).toEqual(createdWeek)
      expect(mockWeekRepo.findCurrentWeek).toHaveBeenCalledWith(
        1,
        new Date('2026-06-08T00:00:00.000Z')
      )
      expect(mockHabitRepo.findActiveByUserId).toHaveBeenCalledWith(1)
      expect(mockWeekRepo.createWeekWithHabitsAndEntries).toHaveBeenCalledWith(
        1,
        new Date('2026-06-08T00:00:00.000Z'),
        new Date('2026-06-14T23:59:59.999Z'),
        [activeHabit]
      )
      expect(result.weekHabits[0].entries).toHaveLength(7)
      expect(result.weekHabits[0].entries.every((e) => e.status === 'pending')).toBe(true)
    })
  })

  describe('should_return_existing_week_without_creating', () => {
    it('returns existing week and does not invoke create (US-09 S2)', async () => {
      const existingWeek: WeekWithDetails = { ...createdWeek, id: 5 }
      const mockWeekRepo: WeekRepository = {
        findCurrentWeek: vi.fn().mockResolvedValue(existingWeek),
        findUnlockedWeekBefore: vi.fn(),
        lockWeek: vi.fn(),
        createWeekWithHabitsAndEntries: vi.fn(),
      }
      const mockHabitRepo: HabitRepository = {
        create: vi.fn(),
        findActiveByUserId: vi.fn(),
        findById: vi.fn(),
        update: vi.fn(),
        softDelete: vi.fn(),
      }

      const result = await getCurrentWeek(mockWeekRepo, mockHabitRepo, 1, now)

      expect(result).toEqual(existingWeek)
      expect(mockHabitRepo.findActiveByUserId).not.toHaveBeenCalled()
      expect(mockWeekRepo.createWeekWithHabitsAndEntries).not.toHaveBeenCalled()
    })
  })

  describe('should_create_empty_week_when_no_active_habits', () => {
    it('creates week without week habits', async () => {
      const emptyWeek: WeekWithDetails = {
        ...createdWeek,
        weekHabits: [],
      }
      const mockWeekRepo: WeekRepository = {
        findCurrentWeek: vi.fn().mockResolvedValue(null),
        findUnlockedWeekBefore: vi.fn(),
        lockWeek: vi.fn(),
        createWeekWithHabitsAndEntries: vi.fn().mockResolvedValue(emptyWeek),
      }
      const mockHabitRepo: HabitRepository = {
        create: vi.fn(),
        findActiveByUserId: vi.fn().mockResolvedValue([]),
        findById: vi.fn(),
        update: vi.fn(),
        softDelete: vi.fn(),
      }

      const result = await getCurrentWeek(mockWeekRepo, mockHabitRepo, 1, now)

      expect(result.weekHabits).toHaveLength(0)
      expect(mockWeekRepo.createWeekWithHabitsAndEntries).toHaveBeenCalledWith(
        1,
        new Date('2026-06-08T00:00:00.000Z'),
        new Date('2026-06-14T23:59:59.999Z'),
        []
      )
    })
  })

  describe('should_propagate_error_when_transactional_create_fails', () => {
    it('propagates error from createWeekWithHabitsAndEntries (rollback expected)', async () => {
      const txError = new Error('Transaction failed')
      const mockWeekRepo: WeekRepository = {
        findCurrentWeek: vi.fn().mockResolvedValue(null),
        findUnlockedWeekBefore: vi.fn(),
        lockWeek: vi.fn(),
        createWeekWithHabitsAndEntries: vi.fn().mockRejectedValue(txError),
      }
      const mockHabitRepo: HabitRepository = {
        create: vi.fn(),
        findActiveByUserId: vi.fn().mockResolvedValue([activeHabit]),
        findById: vi.fn(),
        update: vi.fn(),
        softDelete: vi.fn(),
      }

      await expect(getCurrentWeek(mockWeekRepo, mockHabitRepo, 1, now)).rejects.toThrow(
        'Transaction failed'
      )
    })
  })
})
