import { NotFoundError } from '../domain/errors/appErrors'
import { addUtcWeeks, getWeekBoundaries } from '../domain/week'
import { calculateWeekStats, getCurrentDayIndex } from './calculateWeekStats'
import { getCurrentWeekResponse } from './getCurrentWeekResponse'
import { mapWeekToApiResponse, type WeekApiResponse } from './mapWeekToApiResponse'
import type { HabitRepository } from './ports/HabitRepository'
import type { RewardRedemptionRepository } from './ports/RewardRedemptionRepository'
import type { WeekRepository } from './ports/WeekRepository'

export async function getWeekByOffset(
  weekRepo: WeekRepository,
  habitRepo: HabitRepository,
  redemptionRepo: RewardRedemptionRepository,
  userId: number,
  offset: number,
  now: Date = new Date()
): Promise<WeekApiResponse> {
  if (offset === 0) {
    return getCurrentWeekResponse(weekRepo, habitRepo, redemptionRepo, userId, now)
  }

  if (offset > 0) {
    throw new NotFoundError('Semana no encontrada', 'WEEK_NOT_FOUND')
  }

  const { startDate: currentStart } = getWeekBoundaries(now)
  const targetStart = addUtcWeeks(currentStart, offset)
  const week = await weekRepo.findWeekByUserAndStartDate(userId, targetStart)

  if (week === null) {
    throw new NotFoundError('Semana no encontrada', 'WEEK_NOT_FOUND')
  }

  const lastLockedWeek = await weekRepo.findLastLockedWeekBefore(userId, week.startDate)
  const lastWeekPoints = lastLockedWeek?.totalPointsEarned ?? 0
  const currentDayIndex = getCurrentDayIndex(week.startDate, now)
  const stats = calculateWeekStats(week, lastWeekPoints, currentDayIndex)
  const redemptions = await redemptionRepo.findByWeekId(week.id)

  return mapWeekToApiResponse(week, stats, redemptions)
}
