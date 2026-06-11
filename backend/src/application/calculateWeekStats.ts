import type { CompletionStatus, HabitEntry, WeekWithDetails } from '../domain/week'

export interface WeekStats {
  thisWeekPoints: number
  penalties: number
  lastWeekPoints: number
  maxStreak: number
}

export function getCurrentDayIndex(weekStartDate: Date, now: Date): number {
  const startMs = Date.UTC(
    weekStartDate.getUTCFullYear(),
    weekStartDate.getUTCMonth(),
    weekStartDate.getUTCDate()
  )
  const nowMs = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  const diffDays = Math.floor((nowMs - startMs) / (24 * 60 * 60 * 1000))

  if (diffDays < 0) return 0
  if (diffDays > 6) return 6
  return diffDays
}

function computeStreakFromEntries(entries: HabitEntry[], currentDayIndex: number): number {
  if (currentDayIndex < 0 || currentDayIndex > 6) return 0

  const statusByDay = new Array<CompletionStatus>(7).fill('pending')
  for (const entry of entries) {
    statusByDay[entry.dayIndex] = entry.status
  }

  let streak = 0
  for (let i = currentDayIndex; i >= 0; i--) {
    if (statusByDay[i] === 'completed') streak++
    else break
  }
  return streak
}

export function calculateWeekStats(
  week: WeekWithDetails,
  lastWeekPoints: number,
  currentDayIndex: number
): WeekStats {
  let thisWeekPoints = 0
  let penalties = 0
  let maxStreak = 0

  for (const weekHabit of week.weekHabits) {
    for (const entry of weekHabit.entries) {
      if (entry.status === 'completed') {
        thisWeekPoints += weekHabit.snapshotPoints
      } else if (entry.status === 'failed') {
        penalties += weekHabit.snapshotPenalty
      }
    }

    const streak = computeStreakFromEntries(weekHabit.entries, currentDayIndex)
    if (streak > maxStreak) maxStreak = streak
  }

  return { thisWeekPoints, penalties, lastWeekPoints, maxStreak }
}
