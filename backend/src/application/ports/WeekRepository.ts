import type { Habit } from '../../domain/habit'
import type { Week, WeekWithDetails } from '../../domain/week'

export interface WeekRepository {
  findCurrentWeek(userId: number, startDate: Date): Promise<WeekWithDetails | null>
  findUnlockedWeekBefore(userId: number, beforeStartDate: Date): Promise<WeekWithDetails | null>
  lockWeek(weekId: number): Promise<Week>
  createWeekWithHabitsAndEntries(
    userId: number,
    startDate: Date,
    endDate: Date,
    activeHabits: Habit[]
  ): Promise<WeekWithDetails>
  findWeekByUserAndStartDate(userId: number, startDate: Date): Promise<WeekWithDetails | null>
  findLastLockedWeekBefore(userId: number, beforeStartDate: Date): Promise<Week | null>
}
