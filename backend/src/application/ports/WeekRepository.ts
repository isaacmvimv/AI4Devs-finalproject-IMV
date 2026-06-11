import type { Habit } from '../../domain/habit'
import type { WeekWithDetails } from '../../domain/week'

export interface WeekRepository {
  findCurrentWeek(userId: number, startDate: Date): Promise<WeekWithDetails | null>
  createWeekWithHabitsAndEntries(
    userId: number,
    startDate: Date,
    endDate: Date,
    activeHabits: Habit[]
  ): Promise<WeekWithDetails>
}
