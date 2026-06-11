import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { WeekWithDetails } from '../domain/week'
import { getCurrentWeekResponse } from './getCurrentWeekResponse'
import type { HabitRepository } from './ports/HabitRepository'
import type { WeekRepository } from './ports/WeekRepository'

vi.mock('./lockWeekAndTransition', () => ({
  lockWeekAndTransition: vi.fn(),
}))

vi.mock('./getCurrentWeek', () => ({
  getCurrentWeek: vi.fn(),
}))

import { getCurrentWeek } from './getCurrentWeek'
import { lockWeekAndTransition } from './lockWeekAndTransition'

const mockLockWeekAndTransition = vi.mocked(lockWeekAndTransition)
const mockGetCurrentWeek = vi.mocked(getCurrentWeek)

const now = new Date('2026-06-10T10:00:00.000Z')

const currentWeek: WeekWithDetails = {
  id: 3,
  userId: 1,
  startDate: new Date('2026-06-08T00:00:00.000Z'),
  endDate: new Date('2026-06-14T23:59:59.999Z'),
  isLocked: false,
  totalPointsEarned: 0,
  totalPenalties: 0,
  createdAt: now,
  weekHabits: [
    {
      id: 30,
      weekId: 3,
      habitId: 1,
      order: 0,
      snapshotName: 'Correr',
      snapshotPoints: 10,
      snapshotPenalty: 5,
      entries: Array.from({ length: 7 }, (_, dayIndex) => ({
        id: 300 + dayIndex,
        weekHabitId: 30,
        dayIndex,
        status: 'pending' as const,
        updatedAt: now,
      })),
    },
  ],
}

function makeWeekRepo(overrides: Partial<WeekRepository> = {}): WeekRepository {
  return {
    findCurrentWeek: vi.fn(),
    findUnlockedWeekBefore: vi.fn(),
    lockWeek: vi.fn(),
    createWeekWithHabitsAndEntries: vi.fn(),
    findWeekByUserAndStartDate: vi.fn(),
    findLastLockedWeekBefore: vi.fn().mockResolvedValue({ id: 2, totalPointsEarned: 75 } as never),
    ...overrides,
  }
}

function makeHabitRepo(): HabitRepository {
  return {
    create: vi.fn(),
    findActiveByUserId: vi.fn(),
    findById: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
  }
}

describe('getCurrentWeekResponse', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('orchestrates lockWeekAndTransition and returns full DTO (US-09 S3)', async () => {
    mockLockWeekAndTransition.mockResolvedValue(currentWeek)

    const result = await getCurrentWeekResponse(makeWeekRepo(), makeHabitRepo(), 1, now)

    expect(mockLockWeekAndTransition).toHaveBeenCalledWith(expect.anything(), expect.anything(), 1, now)
    expect(result.week.id).toBe(3)
    expect(result).toHaveProperty('habits')
    expect(result).toHaveProperty('stats')
    expect(result.redemptions).toEqual([])
    expect(result.stats.lastWeekPoints).toBe(75)
  })

  it('retries getCurrentWeek once if lockWeekAndTransition fails (design §7)', async () => {
    mockLockWeekAndTransition.mockRejectedValue(new Error('partial lock failure'))
    mockGetCurrentWeek.mockResolvedValue(currentWeek)

    const result = await getCurrentWeekResponse(makeWeekRepo(), makeHabitRepo(), 1, now)

    expect(mockGetCurrentWeek).toHaveBeenCalledTimes(1)
    expect(result.week.id).toBe(3)
  })

  it('returns same week id on consecutive calls (US-09 S4)', async () => {
    mockLockWeekAndTransition.mockResolvedValue(currentWeek)
    const weekRepo = makeWeekRepo()

    const first = await getCurrentWeekResponse(weekRepo, makeHabitRepo(), 1, now)
    const second = await getCurrentWeekResponse(weekRepo, makeHabitRepo(), 1, now)

    expect(first.week.id).toBe(second.week.id)
  })
})
