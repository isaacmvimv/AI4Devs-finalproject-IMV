import type { WeekResponseDto } from '../infrastructure/weekApi'
import type { CompletionStatus, Habit, HabitStats } from '../domain/habit'
import { computeStreakFromStatus } from '../domain/habit'

export interface DashboardWeekData {
  habits: Habit[]
  stats: HabitStats
  entryIdsByHabitId: Record<string, number[]>
  isLocked: boolean
}

export function mapWeekResponseToDashboard(
  dto: WeekResponseDto,
  currentDayIndex: number
): DashboardWeekData {
  const habits: Habit[] = []
  const entryIdsByHabitId: Record<string, number[]> = {}

  for (const { weekHabit, entries } of dto.habits) {
    const id = String(weekHabit.habitId)
    const sortedEntries = [...entries].sort((a, b) => a.dayIndex - b.dayIndex)
    const completionStatus: CompletionStatus[] = sortedEntries.map((entry) => entry.status)
    const entryIds = sortedEntries.map((entry) => entry.id)

    habits.push({
      id,
      emoji: weekHabit.snapshotEmoji,
      name: weekHabit.snapshotName,
      pointsPerDay: weekHabit.snapshotPoints,
      penalty: weekHabit.snapshotPenalty,
      streak: computeStreakFromStatus(completionStatus, currentDayIndex),
      completionStatus,
    })
    entryIdsByHabitId[id] = entryIds
  }

  const stats: HabitStats = {
    thisWeekPoints: dto.stats.thisWeekPoints,
    lastWeekPoints: dto.stats.lastWeekPoints,
    penalties: dto.stats.penalties,
    maxStreak: dto.stats.maxStreak,
  }

  return {
    habits,
    stats,
    entryIdsByHabitId,
    isLocked: dto.week.isLocked,
  }
}
