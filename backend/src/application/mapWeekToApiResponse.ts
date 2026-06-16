import type { WeekStats } from './calculateWeekStats'
import type { WeekWithDetails } from '../domain/week'

export interface WeekApiResponse {
  week: {
    id: number
    startDate: string
    endDate: string
    isLocked: boolean
    totalPointsEarned: number
    totalPenalties: number
  }
  habits: Array<{
    weekHabit: {
      id: number
      habitId: number
      order: number
      snapshotName: string
      snapshotEmoji: string
      snapshotPoints: number
      snapshotPenalty: number
    }
    entries: Array<{
      id: number
      dayIndex: number
      status: string
    }>
  }>
  stats: WeekStats
  redemptions: []
}

export function mapWeekToApiResponse(week: WeekWithDetails, stats: WeekStats): WeekApiResponse {
  return {
    week: {
      id: week.id,
      startDate: week.startDate.toISOString(),
      endDate: week.endDate.toISOString(),
      isLocked: week.isLocked,
      totalPointsEarned: week.totalPointsEarned,
      totalPenalties: week.totalPenalties,
    },
    habits: week.weekHabits.map((wh) => ({
      weekHabit: {
        id: wh.id,
        habitId: wh.habitId,
        order: wh.order,
        snapshotName: wh.snapshotName,
        snapshotEmoji: wh.snapshotEmoji,
        snapshotPoints: wh.snapshotPoints,
        snapshotPenalty: wh.snapshotPenalty,
      },
      entries: wh.entries.map((entry) => ({
        id: entry.id,
        dayIndex: entry.dayIndex,
        status: entry.status,
      })),
    })),
    stats,
    redemptions: [],
  }
}
