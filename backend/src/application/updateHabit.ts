import type { Habit, UpdateHabitData } from '../domain/habit'
import { getWeekBoundaries } from '../domain/week'
import { assertHabitOwnedByUser } from './habitOwnership'
import type { HabitRepository } from './ports/HabitRepository'
import type { RewardRedemptionRepository } from './ports/RewardRedemptionRepository'
import type { WeekRepository } from './ports/WeekRepository'
import { parseUpdateHabitInput } from './validation/habit'
import { reconcileWeekRedemption } from './reconcileWeekRedemption'

export interface UpdateHabitResult {
  habit: Habit
  redemptionInvalidated: boolean
}

export async function updateHabit(
  habitRepo: HabitRepository,
  weekRepo: WeekRepository,
  redemptionRepo: RewardRedemptionRepository,
  userId: number,
  habitId: number,
  input: unknown,
  now: Date = new Date()
): Promise<UpdateHabitResult> {
  await assertHabitOwnedByUser(habitRepo, habitId, userId)
  const validated = parseUpdateHabitInput(input)
  const habit = await habitRepo.update(habitId, validated)

  const redemptionInvalidated = await syncCurrentWeekSnapshotAndReconcile(
    weekRepo,
    redemptionRepo,
    userId,
    habitId,
    habit,
    validated,
    now
  )

  return { habit, redemptionInvalidated }
}

async function syncCurrentWeekSnapshotAndReconcile(
  weekRepo: WeekRepository,
  redemptionRepo: RewardRedemptionRepository,
  userId: number,
  habitId: number,
  habit: Habit,
  validated: UpdateHabitData,
  now: Date
): Promise<boolean> {
  const { startDate } = getWeekBoundaries(now)
  const currentWeek = await weekRepo.findCurrentWeek(userId, startDate)
  if (!currentWeek || currentWeek.isLocked) {
    return false
  }

  const isInCurrentWeek = currentWeek.weekHabits.some((weekHabit) => weekHabit.habitId === habitId)
  if (!isInCurrentWeek) {
    return false
  }

  const snapshotUpdate: {
    snapshotPoints?: number
    snapshotPenalty?: number
    snapshotName?: string
    snapshotEmoji?: string
  } = {}

  if (validated.pointsPerDay !== undefined) {
    snapshotUpdate.snapshotPoints = validated.pointsPerDay
  }
  if (validated.penalty !== undefined) {
    snapshotUpdate.snapshotPenalty = validated.penalty
  }
  if (validated.name !== undefined) {
    snapshotUpdate.snapshotName = validated.name
  }
  if (validated.emoji !== undefined) {
    snapshotUpdate.snapshotEmoji = validated.emoji
  }

  if (Object.keys(snapshotUpdate).length > 0) {
    await weekRepo.updateHabitSnapshotInWeek(currentWeek.id, habitId, snapshotUpdate)
  }

  const week = await weekRepo.findById(currentWeek.id)
  if (!week) {
    return false
  }

  const reconciliation = await reconcileWeekRedemption(week, redemptionRepo)
  return reconciliation.invalidated
}
