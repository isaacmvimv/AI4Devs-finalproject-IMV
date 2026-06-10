import { describe, expect, it } from 'vitest'
import type { CompletionStatus, Habit, HabitStats } from './habit'
import {
  calculateHabitStats,
  calculateTodayProgressPercent,
  computeStreakFromStatus,
  createHabitFromFormInput,
  toggleHabitDayCompletion,
  totalPointsFromStats,
} from './habit'

function buildHabit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: '1',
    emoji: '🏃',
    name: 'Correr',
    pointsPerDay: 10,
    penalty: 5,
    streak: 0,
    completionStatus: [
      'pending',
      'pending',
      'pending',
      'pending',
      'pending',
      'pending',
      'pending',
    ],
    ...overrides,
  }
}

describe('toggleHabitDayCompletion', () => {
  it('cycles pending → completed → failed → pending (US-13 S1)', () => {
    const habit = buildHabit()

    const afterFirst = toggleHabitDayCompletion(habit, 2)
    expect(afterFirst.completionStatus[2]).toBe('completed')

    const afterSecond = toggleHabitDayCompletion(afterFirst, 2)
    expect(afterSecond.completionStatus[2]).toBe('failed')

    const afterThird = toggleHabitDayCompletion(afterSecond, 2)
    expect(afterThird.completionStatus[2]).toBe('pending')
  })

  it('returns habit unchanged when dayIndex is out of range', () => {
    const habit = buildHabit({
      completionStatus: [
        'completed',
        'pending',
        'pending',
        'pending',
        'pending',
        'pending',
        'pending',
      ],
    })

    expect(toggleHabitDayCompletion(habit, -1)).toEqual(habit)
    expect(toggleHabitDayCompletion(habit, 7)).toEqual(habit)
    expect(habit.completionStatus[0]).toBe('completed')
  })

  it('does not mutate the original habit', () => {
    const habit = buildHabit()
    const originalStatus = [...habit.completionStatus]

    toggleHabitDayCompletion(habit, 2)

    expect(habit.completionStatus).toEqual(originalStatus)
  })
})

describe('calculateHabitStats', () => {
  it('aggregates points and penalties (US-13 S2)', () => {
    const habit = buildHabit({
      pointsPerDay: 10,
      penalty: 5,
      completionStatus: [
        'completed',
        'completed',
        'failed',
        'pending',
        'pending',
        'pending',
        'pending',
      ],
    })

    expect(calculateHabitStats([habit])).toEqual({
      thisWeekPoints: 20,
      lastWeekPoints: 0,
      penalties: 5,
      maxStreak: 0,
    })
  })

  it('returns zeros for empty habits array (US-13 S5)', () => {
    expect(calculateHabitStats([])).toEqual({
      thisWeekPoints: 0,
      lastWeekPoints: 0,
      penalties: 0,
      maxStreak: 0,
    })
  })
})

describe('calculateTodayProgressPercent', () => {
  it('returns decimal percent with two decimals (US-13 S3)', () => {
    const habits = [
      buildHabit({ completionStatus: weekStatus(['pending', 'pending', 'completed']) }),
      buildHabit({ id: '2', completionStatus: weekStatus(['pending', 'pending', 'completed']) }),
      buildHabit({ id: '3', completionStatus: weekStatus(['pending', 'pending', 'pending']) }),
    ]

    expect(calculateTodayProgressPercent(habits, 2)).toBe(66.67)
  })

  it('returns 0 when habits array is empty', () => {
    expect(calculateTodayProgressPercent([], 2)).toBe(0)
  })
})

describe('computeStreakFromStatus', () => {
  it('counts completed days backwards from currentDayIndex (US-13 S4)', () => {
    const statuses: CompletionStatus[] = [
      'completed',
      'completed',
      'completed',
      'failed',
      'completed',
      'pending',
      'pending',
    ]

    expect(computeStreakFromStatus(statuses, 4)).toBe(1)
  })

  it('returns 0 when all days are pending', () => {
    const statuses: CompletionStatus[] = [
      'pending',
      'pending',
      'pending',
      'pending',
      'pending',
      'pending',
      'pending',
    ]

    expect(computeStreakFromStatus(statuses, 3)).toBe(0)
  })

  it('returns 0 for invalid currentDayIndex', () => {
    const statuses: CompletionStatus[] = [
      'completed',
      'completed',
      'pending',
      'pending',
      'pending',
      'pending',
      'pending',
    ]

    expect(computeStreakFromStatus(statuses, -1)).toBe(0)
    expect(computeStreakFromStatus(statuses, 7)).toBe(0)
  })
})

describe('createHabitFromFormInput', () => {
  it('creates habit with 7 pending days and streak 0', () => {
    const habit = createHabitFromFormInput(
      { emoji: '🏃', name: 'Correr', pointsPerDay: 10, penalty: 5 },
      '42'
    )

    expect(habit).toEqual({
      id: '42',
      emoji: '🏃',
      name: 'Correr',
      pointsPerDay: 10,
      penalty: 5,
      streak: 0,
      completionStatus: [
        'pending',
        'pending',
        'pending',
        'pending',
        'pending',
        'pending',
        'pending',
      ],
    })
  })
})

describe('totalPointsFromStats', () => {
  it('returns net points after penalties', () => {
    const stats: HabitStats = {
      thisWeekPoints: 20,
      lastWeekPoints: 0,
      penalties: 5,
      maxStreak: 3,
    }

    expect(totalPointsFromStats(stats)).toBe(15)
  })
})

function weekStatus(partial: CompletionStatus[]): CompletionStatus[] {
  return [
    partial[0] ?? 'pending',
    partial[1] ?? 'pending',
    partial[2] ?? 'pending',
    partial[3] ?? 'pending',
    partial[4] ?? 'pending',
    partial[5] ?? 'pending',
    partial[6] ?? 'pending',
  ]
}
