import type { Habit } from '../domain/habit'
import { assertHabitOwnedByUser } from './habitOwnership'
import type { HabitRepository } from './ports/HabitRepository'

export async function deactivateHabit(
  repo: HabitRepository,
  userId: number,
  habitId: number
): Promise<Habit> {
  await assertHabitOwnedByUser(repo, habitId, userId)
  return repo.softDelete(habitId)
}
