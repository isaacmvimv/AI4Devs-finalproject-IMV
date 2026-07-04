import type { Habit } from '../domain/habit'
import { getWeekBoundaries } from '../domain/week'
import { assertHabitOwnedByUser } from './habitOwnership'
import type { HabitRepository } from './ports/HabitRepository'
import type { RewardRedemptionRepository } from './ports/RewardRedemptionRepository'
import type { WeekRepository } from './ports/WeekRepository'
import { reconcileWeekRedemption } from './reconcileWeekRedemption'

export interface DeactivateHabitResult {
  habit: Habit
  redemptionInvalidated: boolean
}

export async function deactivateHabit(
  habitRepo: HabitRepository,
  weekRepo: WeekRepository,
  redemptionRepo: RewardRedemptionRepository,
  userId: number,
  habitId: number,
  now: Date = new Date()
): Promise<DeactivateHabitResult> {
  await assertHabitOwnedByUser(habitRepo, habitId, userId)
  const habit = await habitRepo.softDelete(habitId)

  const { startDate } = getWeekBoundaries(now)
  const currentWeek = await weekRepo.findCurrentWeek(userId, startDate)
  if (currentWeek === null) {
    return { habit, redemptionInvalidated: false }
  }

  const isInCurrentWeek = currentWeek.weekHabits.some((weekHabit) => weekHabit.habitId === habitId)
  if (!isInCurrentWeek) {
    return { habit, redemptionInvalidated: false }
  }

  const updatedWeek = await weekRepo.removeHabitsFromWeek(currentWeek.id, [habitId])
  const reconciliation = await reconcileWeekRedemption(updatedWeek, redemptionRepo)
  return { habit, redemptionInvalidated: reconciliation.invalidated }
}
