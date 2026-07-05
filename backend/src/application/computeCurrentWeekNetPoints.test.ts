import { describe, expect, it } from 'vitest'
import { computeCurrentWeekNetPoints } from './computeCurrentWeekNetPoints'
import type { WeekWithDetails } from '../domain/week'

function makeWeek(entries: Array<{ status: string; points?: number; penalty?: number }>): WeekWithDetails {
  return {
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
        snapshotPoints: entries[0]?.points ?? 10,
        snapshotPenalty: entries[0]?.penalty ?? 5,
        entries: entries.map((entry, dayIndex) => ({
          id: dayIndex + 1,
          weekHabitId: 10,
          dayIndex,
          status: entry.status as 'pending' | 'completed' | 'failed',
          updatedAt: new Date('2026-06-10T10:00:00.000Z'),
        })),
      },
    ],
  }
}

describe('computeCurrentWeekNetPoints', () => {
  it('returns earned minus penalties for current week entries', () => {
    const week = makeWeek([
      { status: 'completed' },
      { status: 'completed' },
      { status: 'failed' },
    ])

    expect(computeCurrentWeekNetPoints(week)).toBe(15)
  })
})
