export type CompletionStatus = 'completed' | 'failed' | 'pending'

export interface Habit {
  id: string
  emoji: string
  name: string
  pointsPerDay: number
  penalty: number
  streak: number
  completionStatus: CompletionStatus[]
}

export interface HabitFormInput {
  emoji: string
  name: string
  pointsPerDay: number
  penalty: number
}

export function computeStreakFromStatus(
  statuses: CompletionStatus[],
  currentDayIndex: number
): number {
  if (currentDayIndex < 0 || currentDayIndex > 6) return 0
  let streak = 0
  for (let i = currentDayIndex; i >= 0; i--) {
    if (statuses[i] === 'completed') streak++
    else break
  }
  return streak
}

/** Longest consecutive completed run from day 0 through upToDayIndex (inclusive). */
export function computeBestStreakFromStatus(
  statuses: CompletionStatus[],
  upToDayIndex: number
): number {
  if (upToDayIndex < 0 || upToDayIndex > 6) return 0

  let maxStreak = 0
  let currentRun = 0
  for (let i = 0; i <= upToDayIndex; i++) {
    if (statuses[i] === 'completed') {
      currentRun++
      if (currentRun > maxStreak) maxStreak = currentRun
    } else {
      currentRun = 0
    }
  }
  return maxStreak
}

export function toggleHabitDayCompletion(
  habit: Habit,
  dayIndex: number,
  currentDayIndex: number
): Habit {
  if (dayIndex < 0 || dayIndex > 6) {
    return { ...habit }
  }

  const newStatus = [...habit.completionStatus]
  const currentStatus = newStatus[dayIndex]

  if (currentStatus === 'pending') {
    newStatus[dayIndex] = 'completed'
  } else if (currentStatus === 'completed') {
    newStatus[dayIndex] = 'failed'
  } else {
    newStatus[dayIndex] = 'pending'
  }

  return {
    ...habit,
    completionStatus: newStatus,
    streak: computeStreakFromStatus(newStatus, currentDayIndex),
  }
}

export interface HabitStats {
  thisWeekPoints: number
  lastWeekPoints: number
  penalties: number
  maxStreak: number
}

export function calculateHabitStats(habits: Habit[], currentDayIndex: number): HabitStats {
  let thisWeekPoints = 0
  const lastWeekPoints = 0
  let penalties = 0
  let maxStreak = 0

  habits.forEach((habit) => {
    habit.completionStatus.forEach((status) => {
      if (status === 'completed') thisWeekPoints += habit.pointsPerDay
      if (status === 'failed') penalties += habit.penalty
    })
    const bestStreak = computeBestStreakFromStatus(habit.completionStatus, currentDayIndex)
    if (bestStreak > maxStreak) maxStreak = bestStreak
  })

  return { thisWeekPoints, lastWeekPoints, penalties, maxStreak }
}

export function totalPointsFromStats(stats: HabitStats, pointsRedeemed = 0): number {
  return stats.thisWeekPoints + stats.lastWeekPoints - stats.penalties - pointsRedeemed
}

export function calculateTodayProgressPercent(habits: Habit[], currentDayIndex: number): number {
  if (habits.length === 0 || currentDayIndex < 0) return 0
  const completedToday = habits.filter(
    (h) => h.completionStatus[currentDayIndex] === 'completed'
  ).length
  return Math.round((completedToday / habits.length) * 10000) / 100
}

export function createHabitFromFormInput(input: HabitFormInput, id: string): Habit {
  return {
    id,
    ...input,
    streak: 0,
    completionStatus: ['pending', 'pending', 'pending', 'pending', 'pending', 'pending', 'pending'],
  }
}
