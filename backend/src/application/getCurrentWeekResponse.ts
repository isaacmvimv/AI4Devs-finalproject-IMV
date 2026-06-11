import { lockWeekAndTransition } from './lockWeekAndTransition'
import { getCurrentWeek } from './getCurrentWeek'
import { calculateWeekStats, getCurrentDayIndex } from './calculateWeekStats'
import { mapWeekToApiResponse, type WeekApiResponse } from './mapWeekToApiResponse'
import type { HabitRepository } from './ports/HabitRepository'
import type { WeekRepository } from './ports/WeekRepository'

export async function getCurrentWeekResponse(
  weekRepo: WeekRepository,
  habitRepo: HabitRepository,
  userId: number,
  now: Date = new Date()
): Promise<WeekApiResponse> {
  let week
  try {
    week = await lockWeekAndTransition(weekRepo, habitRepo, userId, now)
  } catch {
    week = await getCurrentWeek(weekRepo, habitRepo, userId, now)
  }

  const lastLockedWeek = await weekRepo.findLastLockedWeekBefore(userId, week.startDate)
  const lastWeekPoints = lastLockedWeek?.totalPointsEarned ?? 0
  const currentDayIndex = getCurrentDayIndex(week.startDate, now)
  const stats = calculateWeekStats(week, lastWeekPoints, currentDayIndex)

  return mapWeekToApiResponse(week, stats)
}
