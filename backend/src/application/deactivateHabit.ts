import type { Habit } from '../domain/habit'
import { getWeekBoundaries } from '../domain/week'
import { assertHabitOwnedByUser } from './habitOwnership'
import type { HabitRepository } from './ports/HabitRepository'
import type { WeekRepository } from './ports/WeekRepository'

export async function deactivateHabit(
  habitRepo: HabitRepository,
  weekRepo: WeekRepository,
  userId: number,
  habitId: number,
  now: Date = new Date()
): Promise<Habit> {
  await assertHabitOwnedByUser(habitRepo, habitId, userId)
  const habit = await habitRepo.softDelete(habitId)

  const { startDate } = getWeekBoundaries(now)
  const currentWeek = await weekRepo.findCurrentWeek(userId, startDate)
  if (currentWeek !== null) {
    const isInCurrentWeek = currentWeek.weekHabits.some((weekHabit) => weekHabit.habitId === habitId)
    if (isInCurrentWeek) {
      await weekRepo.removeHabitsFromWeek(currentWeek.id, [habitId])
    }
  }

  return habit
}
