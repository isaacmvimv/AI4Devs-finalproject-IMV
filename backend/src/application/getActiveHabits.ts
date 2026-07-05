import type { HabitRepository } from './ports/HabitRepository'
import type { Habit } from '../domain/habit'

export async function getActiveHabits(
  repo: HabitRepository,
  userId: number
): Promise<Habit[]> {
  return repo.findActiveByUserId(userId)
}
