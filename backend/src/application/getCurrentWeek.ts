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
    return existing
  }

  const activeHabits = await habitRepo.findActiveByUserId(userId)
  return weekRepo.createWeekWithHabitsAndEntries(userId, startDate, endDate, activeHabits)
}
