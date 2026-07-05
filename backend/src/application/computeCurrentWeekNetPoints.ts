import type { WeekWithDetails } from '../domain/week'

export function computeCurrentWeekNetPoints(week: WeekWithDetails): number {
  let earned = 0
  let penalties = 0

  for (const weekHabit of week.weekHabits) {
    for (const entry of weekHabit.entries) {
      if (entry.status === 'completed') {
        earned += weekHabit.snapshotPoints
      } else if (entry.status === 'failed') {
        penalties += weekHabit.snapshotPenalty
      }
    }
  }

  return earned - penalties
}
