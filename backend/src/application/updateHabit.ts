import type { Habit } from '../domain/habit'
import { assertHabitOwnedByUser } from './habitOwnership'
import type { HabitRepository } from './ports/HabitRepository'
import { parseUpdateHabitInput } from './validation/habit'

export async function updateHabit(
  repo: HabitRepository,
  userId: number,
  habitId: number,
  input: unknown
): Promise<Habit> {
  await assertHabitOwnedByUser(repo, habitId, userId)
  const validated = parseUpdateHabitInput(input)
  return repo.update(habitId, validated)
}
