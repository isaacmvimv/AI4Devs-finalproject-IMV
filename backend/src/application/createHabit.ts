import type { HabitRepository } from './ports/HabitRepository'
import type { Habit } from '../domain/habit'
import { parseCreateHabitInput } from './validation/habit'

export async function createHabit(
  repo: HabitRepository,
  userId: number,
  input: unknown
): Promise<Habit> {
  const validated = parseCreateHabitInput(input)
  return repo.create({
    userId,
    emoji: validated.emoji,
    name: validated.name,
    pointsPerDay: validated.pointsPerDay,
    penalty: validated.penalty,
  })
}
