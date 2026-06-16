export interface Week {
  id: number
  userId: number
  startDate: Date
  endDate: Date
  isLocked: boolean
  totalPointsEarned: number
  totalPenalties: number
  createdAt: Date
}

export interface WeekHabit {
  id: number
  weekId: number
  habitId: number
  order: number
  snapshotName: string
  snapshotEmoji: string
  snapshotPoints: number
  snapshotPenalty: number
}

export interface HabitEntry {
  id: number
  weekHabitId: number
  dayIndex: number
  status: CompletionStatus
  updatedAt: Date
}

export type CompletionStatus = 'pending' | 'completed' | 'failed'

export interface WeekHabitWithEntries extends WeekHabit {
  entries: HabitEntry[]
}

export interface WeekWithDetails extends Week {
  weekHabits: WeekHabitWithEntries[]
}

export function getWeekBoundaries(date: Date): { startDate: Date; endDate: Date } {
  const day = date.getUTCDay()
  const diff = day === 0 ? -6 : 1 - day

  const year = date.getUTCFullYear()
  const month = date.getUTCMonth()
  const dayOfMonth = date.getUTCDate()

  const startDate = new Date(Date.UTC(year, month, dayOfMonth + diff, 0, 0, 0, 0))
  const endDate = new Date(Date.UTC(year, month, dayOfMonth + diff + 6, 23, 59, 59, 999))

  return { startDate, endDate }
}

export function addUtcWeeks(startDate: Date, weeks: number): Date {
  const result = new Date(startDate)
  result.setUTCDate(result.getUTCDate() + weeks * 7)
  return result
}
