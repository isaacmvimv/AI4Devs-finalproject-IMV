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
  addHabitsToWeek(weekId: number, habits: Habit[], startOrder: number): Promise<WeekWithDetails>
  removeHabitsFromWeek(weekId: number, habitIds: number[]): Promise<WeekWithDetails>
  findById(weekId: number): Promise<WeekWithDetails | null>
  updateHabitSnapshotInWeek(
    weekId: number,
    habitId: number,
    data: { snapshotPoints?: number; snapshotPenalty?: number; snapshotName?: string; snapshotEmoji?: string }
  ): Promise<void>
  findWeekByUserAndStartDate(userId: number, startDate: Date): Promise<WeekWithDetails | null>
  findLastLockedWeekBefore(userId: number, beforeStartDate: Date): Promise<Week | null>
}
