import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Habit } from '../domain/habit'
import type { Week, WeekWithDetails } from '../domain/week'
import { lockWeekAndTransition } from './lockWeekAndTransition'
import type { HabitRepository } from './ports/HabitRepository'
import type { WeekRepository } from './ports/WeekRepository'

const now = new Date('2026-06-10T10:00:00.000Z')
const currentWeekStart = new Date('2026-06-08T00:00:00.000Z')

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

const staleWeek: WeekWithDetails = {
  id: 5,
  userId: 1,
  startDate: new Date('2026-06-01T00:00:00.000Z'),
  endDate: new Date('2026-06-07T23:59:59.999Z'),
  isLocked: false,
  totalPointsEarned: 0,
  totalPenalties: 0,
  createdAt: new Date('2026-06-01T10:00:00.000Z'),
  weekHabits: [
    {
      id: 50,
      weekId: 5,
      habitId: 1,
      order: 0,
      snapshotName: 'Correr',
      snapshotEmoji: '💪',
      snapshotPoints: 10,
      snapshotPenalty: 5,
      entries: makePendingEntries(50),
    },
  ],
}

const currentWeek: WeekWithDetails = {
  id: 10,
  userId: 1,
  startDate: currentWeekStart,
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

function makeHabitRepo(overrides: Partial<HabitRepository> = {}): HabitRepository {
  return {
    create: vi.fn(),
    findActiveByUserId: vi.fn().mockResolvedValue([activeHabit]),
    findById: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
    ...overrides,
  }
}

function makeWeekRepo(overrides: Partial<WeekRepository> = {}): WeekRepository {
  return {
    findCurrentWeek: vi.fn().mockResolvedValue(null),
    findUnlockedWeekBefore: vi.fn().mockResolvedValue(null),
    lockWeek: vi.fn(),
    createWeekWithHabitsAndEntries: vi.fn().mockResolvedValue(currentWeek),
    findWeekByUserAndStartDate: vi.fn(),
    findLastLockedWeekBefore: vi.fn(),
    ...overrides,
  }
}

describe('lockWeekAndTransition', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('should_lock_stale_week_and_return_current_week', () => {
    it('locks stale week then returns current week via getCurrentWeek (US-09 S3)', async () => {
      const lockedWeek: Week = {
        ...staleWeek,
        isLocked: true,
        totalPointsEarned: 0,
        totalPenalties: 0,
      }
      const mockWeekRepo = makeWeekRepo({
        findUnlockedWeekBefore: vi.fn().mockResolvedValue(staleWeek),
        lockWeek: vi.fn().mockResolvedValue(lockedWeek),
        findCurrentWeek: vi.fn().mockResolvedValue(currentWeek),
      })
      const mockHabitRepo = makeHabitRepo()

      const result = await lockWeekAndTransition(mockWeekRepo, mockHabitRepo, 1, now)

      expect(mockWeekRepo.findUnlockedWeekBefore).toHaveBeenCalledWith(1, currentWeekStart)
      expect(mockWeekRepo.lockWeek).toHaveBeenCalledWith(staleWeek.id)
      expect(result).toEqual(currentWeek)
      expect(mockWeekRepo.createWeekWithHabitsAndEntries).not.toHaveBeenCalled()
    })
  })

  describe('should_not_relock_on_second_execution', () => {
    it('does not call lockWeek when no stale week exists (US-09 S4)', async () => {
      const mockWeekRepo = makeWeekRepo({
        findUnlockedWeekBefore: vi.fn().mockResolvedValue(null),
        findCurrentWeek: vi.fn().mockResolvedValue(currentWeek),
      })
      const mockHabitRepo = makeHabitRepo()

      const result = await lockWeekAndTransition(mockWeekRepo, mockHabitRepo, 1, now)

      expect(mockWeekRepo.lockWeek).not.toHaveBeenCalled()
      expect(result).toEqual(currentWeek)
    })
  })

  describe('should_preserve_locked_snapshots_after_habit_edit', () => {
    it('keeps snapshotPoints from lockWeek mock after habit master changes (US-09 S5)', async () => {
      const lockedSnapshots = {
        snapshotName: 'Correr',
        snapshotEmoji: '💪',
        snapshotPoints: 10,
        snapshotPenalty: 5,
      }
      const lockedWeek: Week = {
        ...staleWeek,
        isLocked: true,
        totalPointsEarned: 30,
        totalPenalties: 0,
      }
      const weekWithLockedSnapshots: WeekWithDetails = {
        ...currentWeek,
        weekHabits: [
          {
            ...currentWeek.weekHabits[0],
            ...lockedSnapshots,
          },
        ],
      }
      const mockWeekRepo = makeWeekRepo({
        findUnlockedWeekBefore: vi.fn().mockResolvedValue(staleWeek),
        lockWeek: vi.fn().mockImplementation(async () => {
          return lockedWeek
        }),
        findCurrentWeek: vi.fn().mockResolvedValue(weekWithLockedSnapshots),
      })
      const editedHabit: Habit = { ...activeHabit, pointsPerDay: 99, penalty: 99, name: 'Editado' }
      const mockHabitRepo = makeHabitRepo({
        findActiveByUserId: vi.fn().mockResolvedValue([editedHabit]),
      })

      const result = await lockWeekAndTransition(mockWeekRepo, mockHabitRepo, 1, now)

      expect(mockWeekRepo.lockWeek).toHaveBeenCalledWith(staleWeek.id)
      expect(result.weekHabits[0].snapshotPoints).toBe(10)
      expect(result.weekHabits[0].snapshotPenalty).toBe(5)
      expect(result.weekHabits[0].snapshotName).toBe('Correr')
    })
  })

  describe('should_lock_week_with_zero_totals_when_only_pending_entries', () => {
    it('lockWeek mock receives stale week with only pending entries → totales 0', async () => {
      const lockWeek = vi.fn().mockResolvedValue({
        ...staleWeek,
        isLocked: true,
        totalPointsEarned: 0,
        totalPenalties: 0,
      })
      const mockWeekRepo = makeWeekRepo({
        findUnlockedWeekBefore: vi.fn().mockResolvedValue(staleWeek),
        lockWeek,
        findCurrentWeek: vi.fn().mockResolvedValue(currentWeek),
      })
      const mockHabitRepo = makeHabitRepo()

      await lockWeekAndTransition(mockWeekRepo, mockHabitRepo, 1, now)

      expect(lockWeek).toHaveBeenCalledWith(staleWeek.id)
      expect(staleWeek.weekHabits[0].entries.every((e) => e.status === 'pending')).toBe(true)
    })
  })

  describe('should_delegate_to_getCurrentWeek_when_no_stale_week', () => {
    it('creates current week without calling lockWeek', async () => {
      const mockWeekRepo = makeWeekRepo({
        findUnlockedWeekBefore: vi.fn().mockResolvedValue(null),
        findCurrentWeek: vi.fn().mockResolvedValue(null),
        createWeekWithHabitsAndEntries: vi.fn().mockResolvedValue(currentWeek),
      })
      const mockHabitRepo = makeHabitRepo()

      const result = await lockWeekAndTransition(mockWeekRepo, mockHabitRepo, 1, now)

      expect(mockWeekRepo.lockWeek).not.toHaveBeenCalled()
      expect(mockWeekRepo.createWeekWithHabitsAndEntries).toHaveBeenCalled()
      expect(result).toEqual(currentWeek)
    })
  })
})
