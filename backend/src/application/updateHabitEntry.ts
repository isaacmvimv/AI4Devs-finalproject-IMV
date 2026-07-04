import type { CompletionStatus, HabitEntry } from '../domain/week'
import { ConflictError, NotFoundError } from '../domain/errors/appErrors'
import type { HabitEntryRepository } from './ports/HabitEntryRepository'
import type { RewardRedemptionRepository } from './ports/RewardRedemptionRepository'
import type { WeekRepository } from './ports/WeekRepository'
import { reconcileWeekRedemption } from './reconcileWeekRedemption'

export interface UpdateHabitEntryResult {
  entry: HabitEntry
  redemptionInvalidated: boolean
}

export async function updateHabitEntry(
  entryRepo: HabitEntryRepository,
  weekRepo: WeekRepository,
  redemptionRepo: RewardRedemptionRepository,
  userId: number,
  entryId: number,
  input: { status: CompletionStatus }
): Promise<UpdateHabitEntryResult> {
  const ctx = await entryRepo.findByIdWithWeek(entryId)
  if (!ctx || ctx.weekUserId !== userId) {
    throw new NotFoundError('Entrada de hábito no encontrada', 'HABIT_ENTRY_NOT_FOUND')
  }
  if (ctx.weekIsLocked) {
    throw new ConflictError('No se puede modificar una semana bloqueada', 'WEEK_LOCKED')
  }

  const entry = await entryRepo.updateStatus(entryId, input.status)

  const week = await weekRepo.findById(ctx.weekId)
  if (!week) {
    return { entry, redemptionInvalidated: false }
  }

  const reconciliation = await reconcileWeekRedemption(week, redemptionRepo)
  return { entry, redemptionInvalidated: reconciliation.invalidated }
}
