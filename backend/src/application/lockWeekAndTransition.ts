import { getWeekBoundaries, type WeekWithDetails } from '../domain/week'
import { getCurrentWeek } from './getCurrentWeek'
import type { HabitRepository } from './ports/HabitRepository'
import type { WeekRepository } from './ports/WeekRepository'

export async function lockWeekAndTransition(
  weekRepo: WeekRepository,
  habitRepo: HabitRepository,
  userId: number,
  now: Date = new Date()
): Promise<WeekWithDetails> {
  const { startDate } = getWeekBoundaries(now)
  const staleWeek = await weekRepo.findUnlockedWeekBefore(userId, startDate)
  if (staleWeek !== null) {
    await weekRepo.lockWeek(staleWeek.id)
  }
  return getCurrentWeek(weekRepo, habitRepo, userId, now)
}
