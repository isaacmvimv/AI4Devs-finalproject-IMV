import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NotFoundError } from '../domain/errors/appErrors'
import type { WeekWithDetails } from '../domain/week'
import { getWeekByOffset } from './getWeekByOffset'
import type { HabitRepository } from './ports/HabitRepository'
import type { WeekRepository } from './ports/WeekRepository'

vi.mock('./getCurrentWeekResponse', () => ({
  getCurrentWeekResponse: vi.fn(),
}))

import { getCurrentWeekResponse } from './getCurrentWeekResponse'

const mockGetCurrentWeekResponse = vi.mocked(getCurrentWeekResponse)

const now = new Date('2026-06-10T10:00:00.000Z')

const sampleResponse = {
  week: {
    id: 3,
    startDate: '2026-06-08T00:00:00.000Z',
    endDate: '2026-06-14T23:59:59.999Z',
    isLocked: false,
    totalPointsEarned: 0,
    totalPenalties: 0,
  },
  habits: [],
  stats: { thisWeekPoints: 0, penalties: 0, lastWeekPoints: 0, maxStreak: 0 },
  redemptions: [] as [],
}

const lockedWeek: WeekWithDetails = {
  id: 2,
  userId: 1,
  startDate: new Date('2026-06-01T00:00:00.000Z'),
  endDate: new Date('2026-06-07T23:59:59.999Z'),
  isLocked: true,
  totalPointsEarned: 50,
  totalPenalties: 5,
  createdAt: now,
  weekHabits: [
    {
      id: 20,
      weekId: 2,
      habitId: 1,
      order: 0,
      snapshotName: 'Yoga',
      snapshotEmoji: '💪',
      snapshotPoints: 10,
      snapshotPenalty: 5,
      entries: Array.from({ length: 7 }, (_, dayIndex) => ({
        id: 200 + dayIndex,
        weekHabitId: 20,
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
    findLastLockedWeekBefore: vi.fn(),
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

describe('getWeekByOffset', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('delegates to getCurrentWeekResponse when offset is 0 (US-09 S3)', async () => {
    mockGetCurrentWeekResponse.mockResolvedValue(sampleResponse)

    const result = await getWeekByOffset(makeWeekRepo(), makeHabitRepo(), 1, 0, now)

    expect(mockGetCurrentWeekResponse).toHaveBeenCalledWith(expect.anything(), expect.anything(), 1, now)
    expect(result).toEqual(sampleResponse)
  })

  it('returns locked historical week for offset -1 without lockWeekAndTransition (US-09 S5–6)', async () => {
    const weekRepo = makeWeekRepo({
      findWeekByUserAndStartDate: vi.fn().mockResolvedValue(lockedWeek),
      findLastLockedWeekBefore: vi.fn().mockResolvedValue(null),
    })

    const result = await getWeekByOffset(weekRepo, makeHabitRepo(), 1, -1, now)

    expect(weekRepo.findWeekByUserAndStartDate).toHaveBeenCalledWith(
      1,
      new Date('2026-06-01T00:00:00.000Z')
    )
    expect(result.week.isLocked).toBe(true)
    expect(result.habits[0].weekHabit.snapshotPoints).toBe(10)
    expect(mockGetCurrentWeekResponse).not.toHaveBeenCalled()
  })

  it('throws WEEK_NOT_FOUND when no week exists at offset (US-09 S6)', async () => {
    const weekRepo = makeWeekRepo({
      findWeekByUserAndStartDate: vi.fn().mockResolvedValue(null),
    })

    await expect(getWeekByOffset(weekRepo, makeHabitRepo(), 1, -5, now)).rejects.toThrow(NotFoundError)
    await expect(getWeekByOffset(weekRepo, makeHabitRepo(), 1, -5, now)).rejects.toMatchObject({
      code: 'WEEK_NOT_FOUND',
    })
  })
})
