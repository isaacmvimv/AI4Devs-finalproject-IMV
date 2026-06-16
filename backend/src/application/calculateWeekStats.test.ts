import { describe, expect, it } from 'vitest'
import { calculateWeekStats, getCurrentDayIndex } from './calculateWeekStats'
import type { WeekWithDetails } from '../domain/week'

const now = new Date('2026-06-10T10:00:00.000Z')

function makeWeek(entries: Array<{ dayIndex: number; status: 'pending' | 'completed' | 'failed' }>): WeekWithDetails {
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
        snapshotEmoji: '💪',
        snapshotPoints: 10,
        snapshotPenalty: 5,
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

describe('getCurrentDayIndex', () => {
  it('returns 2 for Wednesday in the week', () => {
    const weekStart = new Date('2026-06-08T00:00:00.000Z')
    expect(getCurrentDayIndex(weekStart, now)).toBe(2)
  })

  it('caps at 6 for dates after the week', () => {
    const weekStart = new Date('2026-06-08T00:00:00.000Z')
    const afterWeek = new Date('2026-06-20T00:00:00.000Z')
    expect(getCurrentDayIndex(weekStart, afterWeek)).toBe(6)
  })
})

describe('calculateWeekStats', () => {
  it('returns zeros for week with only pending entries (US-13 S5 edge)', () => {
    const week = makeWeek([
      { dayIndex: 0, status: 'pending' },
      { dayIndex: 1, status: 'pending' },
    ])

    const stats = calculateWeekStats(week, 0, 2)

    expect(stats).toEqual({
      thisWeekPoints: 0,
      penalties: 0,
      lastWeekPoints: 0,
      maxStreak: 0,
    })
  })

  it('sums points and penalties from completed and failed entries', () => {
    const week = makeWeek([
      { dayIndex: 0, status: 'completed' },
      { dayIndex: 1, status: 'completed' },
      { dayIndex: 2, status: 'completed' },
      { dayIndex: 3, status: 'failed' },
    ])

    const stats = calculateWeekStats(week, 75, 2)

    expect(stats.thisWeekPoints).toBe(30)
    expect(stats.penalties).toBe(5)
    expect(stats.lastWeekPoints).toBe(75)
    expect(stats.maxStreak).toBe(3)
  })
})
