import { describe, expect, it } from 'vitest'
import type { WeekWithDetails } from '../domain/week'
import { calculateWeekAvailableBalance } from './calculateWeekAvailableBalance'

const now = new Date('2026-06-10T10:00:00.000Z')

function makeWeek(
  entries: Array<{ dayIndex: number; status: 'pending' | 'completed' | 'failed' }>,
  snapshotPoints = 10,
  snapshotPenalty = 5
): WeekWithDetails {
  return {
    id: 1,
    userId: 1,
    startDate: new Date('2026-06-08T00:00:00.000Z'),
    endDate: new Date('2026-06-14T23:59:59.999Z'),
    isLocked: false,
    totalPointsEarned: 0,
    totalPenalties: 0,
    createdAt: now,
    weekHabits: [
      {
        id: 10,
        weekId: 1,
        habitId: 1,
        order: 0,
        snapshotName: 'Correr',
        snapshotEmoji: '🏃',
        snapshotPoints,
        snapshotPenalty,
        entries: entries.map((e, i) => ({
          id: i + 1,
          weekHabitId: 10,
          dayIndex: e.dayIndex,
          status: e.status,
          updatedAt: now,
        })),
      },
    ],
  }
}

describe('calculateWeekAvailableBalance', () => {
  it('returns earned minus penalties minus prior redemptions', () => {
    const week = makeWeek([
      { dayIndex: 0, status: 'completed' },
      { dayIndex: 1, status: 'completed' },
      { dayIndex: 2, status: 'completed' },
      { dayIndex: 3, status: 'failed' },
    ])

    expect(calculateWeekAvailableBalance(week, 0)).toBe(25)
    expect(calculateWeekAvailableBalance(week, 10)).toBe(15)
  })

  it('returns zero when only pending entries and no redemptions', () => {
    const week = makeWeek([
      { dayIndex: 0, status: 'pending' },
      { dayIndex: 1, status: 'pending' },
    ])

    expect(calculateWeekAvailableBalance(week, 0)).toBe(0)
  })

  it('returns negative when redemptions exceed earned balance', () => {
    const week = makeWeek([{ dayIndex: 0, status: 'completed' }])

    expect(calculateWeekAvailableBalance(week, 15)).toBe(-5)
  })
})
