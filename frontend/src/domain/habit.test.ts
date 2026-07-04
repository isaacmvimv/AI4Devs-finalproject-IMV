import { describe, expect, it } from 'vitest'
import type { CompletionStatus, Habit, HabitStats } from './habit'
import {
  calculateHabitStats,
  calculateTodayProgressPercent,
  computeBestStreakFromStatus,
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

    const afterFirst = toggleHabitDayCompletion(habit, 2, 2)
    expect(afterFirst.completionStatus[2]).toBe('completed')

    const afterSecond = toggleHabitDayCompletion(afterFirst, 2, 2)
    expect(afterSecond.completionStatus[2]).toBe('failed')

    const afterThird = toggleHabitDayCompletion(afterSecond, 2, 2)
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

    expect(toggleHabitDayCompletion(habit, -1, 0)).toEqual(habit)
    expect(toggleHabitDayCompletion(habit, 7, 0)).toEqual(habit)
    expect(habit.completionStatus[0]).toBe('completed')
  })

  it('recalculates streak from current day when toggling a past day', () => {
    const habit = buildHabit({
      completionStatus: weekStatus([
        'completed',
        'completed',
        'completed',
        'completed',
        'completed',
        'pending',
        'pending',
      ]),
      streak: 5,
    })

    const toggled = toggleHabitDayCompletion(habit, 0, 4)
    expect(toggled.completionStatus[0]).toBe('failed')
    expect(toggled.streak).toBe(4)
  })

  it('does not mutate the original habit', () => {
    const habit = buildHabit()
    const originalStatus = [...habit.completionStatus]

    toggleHabitDayCompletion(habit, 2, 2)

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

    expect(calculateHabitStats([habit], 2)).toEqual({
      thisWeekPoints: 20,
      lastWeekPoints: 0,
      penalties: 5,
      maxStreak: 2,
    })
  })

  it('returns thisWeekPoints=0 and penalties=total when all days failed', () => {
    const habit = buildHabit({
      pointsPerDay: 10,
      penalty: 3,
      completionStatus: ['failed', 'failed', 'failed', 'failed', 'failed', 'failed', 'failed'],
      streak: 0,
    })

    expect(calculateHabitStats([habit], 6)).toEqual({
      thisWeekPoints: 0,
      lastWeekPoints: 0,
      penalties: 21,
      maxStreak: 0,
    })
  })

  it('returns maxStreak from habit with longest consecutive streak in the week', () => {
    const h1 = buildHabit({
      id: '1',
      completionStatus: weekStatus(['completed', 'completed', 'completed']),
      streak: 3,
    })
    const h2 = buildHabit({
      id: '2',
      completionStatus: weekStatus([
        'completed',
        'completed',
        'completed',
        'completed',
        'completed',
      ]),
      streak: 3,
    })
    const h3 = buildHabit({
      id: '3',
      completionStatus: weekStatus(['completed']),
      streak: 1,
    })

    expect(calculateHabitStats([h1, h2, h3], 4).maxStreak).toBe(5)
  })

  it('counts best streak even when today is failed', () => {
    const comerSano = buildHabit({
      completionStatus: weekStatus([
        'completed',
        'completed',
        'completed',
        'completed',
        'failed',
      ]),
      streak: 0,
    })
    const hacerDeporte = buildHabit({
      id: '2',
      completionStatus: weekStatus([
        'pending',
        'pending',
        'completed',
        'completed',
        'completed',
      ]),
      streak: 3,
    })

    expect(calculateHabitStats([comerSano, hacerDeporte], 4).maxStreak).toBe(4)
  })

  it('returns zeros for empty habits array (US-13 S5)', () => {
    expect(calculateHabitStats([], 4)).toEqual({
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

  it('returns 33.33 when 1 of 3 completed', () => {
    const habits = [
      buildHabit({ id: '1', completionStatus: weekStatus(['completed']) }),
      buildHabit({ id: '2', completionStatus: weekStatus(['pending']) }),
      buildHabit({ id: '3', completionStatus: weekStatus(['pending']) }),
    ]

    expect(calculateTodayProgressPercent(habits, 0)).toBe(33.33)
  })

  it('returns 100 when all completed', () => {
    const habits = [
      buildHabit({ id: '1', completionStatus: weekStatus(['completed']) }),
      buildHabit({ id: '2', completionStatus: weekStatus(['completed']) }),
    ]

    expect(calculateTodayProgressPercent(habits, 0)).toBe(100)
  })

  it('returns 0 when habits array is empty', () => {
    expect(calculateTodayProgressPercent([], 2)).toBe(0)
  })
})

describe('computeBestStreakFromStatus', () => {
  it('returns longest consecutive run up to current day', () => {
    const statuses: CompletionStatus[] = [
      'completed',
      'completed',
      'completed',
      'completed',
      'failed',
      'pending',
      'pending',
    ]

    expect(computeBestStreakFromStatus(statuses, 4)).toBe(4)
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

    expect(computeBestStreakFromStatus(statuses, 3)).toBe(0)
  })

  it('returns 0 for invalid upToDayIndex', () => {
    const statuses: CompletionStatus[] = ['completed', 'completed']

    expect(computeBestStreakFromStatus(statuses, -1)).toBe(0)
    expect(computeBestStreakFromStatus(statuses, 7)).toBe(0)
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

  it('returns 3 for three consecutive completed days', () => {
    const statuses: CompletionStatus[] = [
      'completed',
      'completed',
      'completed',
      'pending',
      'pending',
      'pending',
      'pending',
    ]

    expect(computeStreakFromStatus(statuses, 2)).toBe(3)
  })

  it('returns 1 when failed interrupts completed streak', () => {
    const statuses: CompletionStatus[] = [
      'completed',
      'failed',
      'completed',
      'pending',
      'pending',
      'pending',
      'pending',
    ]

    expect(computeStreakFromStatus(statuses, 2)).toBe(1)
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

  it('returns negative when penalties exceed points', () => {
    const stats: HabitStats = {
      thisWeekPoints: 10,
      lastWeekPoints: 0,
      penalties: 25,
      maxStreak: 0,
    }

    expect(totalPointsFromStats(stats)).toBe(-15)
  })

  it('returns zero when penalties equal points', () => {
    const stats: HabitStats = {
      thisWeekPoints: 15,
      lastWeekPoints: 0,
      penalties: 15,
      maxStreak: 2,
    }

    expect(totalPointsFromStats(stats)).toBe(0)
  })

  it('subtracts prior redemptions from available balance', () => {
    const stats: HabitStats = {
      thisWeekPoints: 60,
      lastWeekPoints: 0,
      penalties: 3,
      maxStreak: 4,
    }

    expect(totalPointsFromStats(stats, 39)).toBe(18)
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
