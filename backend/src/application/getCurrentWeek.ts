import { getWeekBoundaries, type WeekWithDetails } from '../domain/week'
import type { HabitRepository } from './ports/HabitRepository'
import type { WeekRepository } from './ports/WeekRepository'

export async function getCurrentWeek(
  weekRepo: WeekRepository,
  habitRepo: HabitRepository,
  userId: number,
  now: Date = new Date()
): Promise<WeekWithDetails> {
  const { startDate, endDate } = getWeekBoundaries(now)

  const existing = await weekRepo.findCurrentWeek(userId, startDate)
  if (existing !== null) {
    const activeHabits = await habitRepo.findActiveByUserId(userId)
    const activeHabitIds = new Set(activeHabits.map((habit) => habit.id))
    const linkedHabitIds = new Set(existing.weekHabits.map((weekHabit) => weekHabit.habitId))
    const missingHabits = activeHabits.filter((habit) => !linkedHabitIds.has(habit.id))
    const orphanedHabitIds = existing.weekHabits
      .filter((weekHabit) => !activeHabitIds.has(weekHabit.habitId))
      .map((weekHabit) => weekHabit.habitId)

    let syncedWeek = existing

    if (orphanedHabitIds.length > 0) {
      syncedWeek = await weekRepo.removeHabitsFromWeek(existing.id, orphanedHabitIds)
    }

    if (missingHabits.length > 0) {
      return weekRepo.addHabitsToWeek(
        syncedWeek.id,
        missingHabits,
        syncedWeek.weekHabits.length
      )
    }

    return syncedWeek
  }

  const activeHabits = await habitRepo.findActiveByUserId(userId)
  return weekRepo.createWeekWithHabitsAndEntries(userId, startDate, endDate, activeHabits)
}
