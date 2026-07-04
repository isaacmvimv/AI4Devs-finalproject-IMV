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

function computeBestStreakFromEntries(entries: HabitEntry[], upToDayIndex: number): number {
  if (upToDayIndex < 0 || upToDayIndex > 6) return 0

  const statusByDay = new Array<CompletionStatus>(7).fill('pending')
  for (const entry of entries) {
    statusByDay[entry.dayIndex] = entry.status
  }

  let maxStreak = 0
  let currentRun = 0
  for (let i = 0; i <= upToDayIndex; i++) {
    if (statusByDay[i] === 'completed') {
      currentRun++
      if (currentRun > maxStreak) maxStreak = currentRun
    } else {
      currentRun = 0
    }
  }
  return maxStreak
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

    const bestStreak = computeBestStreakFromEntries(weekHabit.entries, currentDayIndex)
    if (bestStreak > maxStreak) maxStreak = bestStreak
  }

  return { thisWeekPoints, penalties, lastWeekPoints, maxStreak }
}
