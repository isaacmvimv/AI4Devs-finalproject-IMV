import type { Habit } from '../../domain/habit'
import type { WeekHabit } from '../../domain/week'

export interface WeekHabitRepository {
  createWeekHabits(weekId: number, activeHabits: Habit[]): Promise<WeekHabit[]>
}
