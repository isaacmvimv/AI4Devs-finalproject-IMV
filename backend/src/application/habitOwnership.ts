import type { Habit } from '../domain/habit'
import { NotFoundError } from '../domain/errors/appErrors'
import type { HabitRepository } from './ports/HabitRepository'

export async function assertHabitOwnedByUser(
  repo: HabitRepository,
  habitId: number,
  userId: number
): Promise<Habit> {
  const habit = await repo.findById(habitId)
  if (!habit || habit.userId !== userId) {
    throw new NotFoundError('Hábito no encontrado', 'HABIT_NOT_FOUND')
  }
  return habit
}
