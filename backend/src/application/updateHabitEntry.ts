import type { CompletionStatus, HabitEntry } from '../domain/week'
import { ConflictError, NotFoundError } from '../domain/errors/appErrors'
import type { HabitEntryRepository } from './ports/HabitEntryRepository'

export async function updateHabitEntry(
  repo: HabitEntryRepository,
  userId: number,
  entryId: number,
  input: { status: CompletionStatus }
): Promise<HabitEntry> {
  const ctx = await repo.findByIdWithWeek(entryId)
  if (!ctx || ctx.weekUserId !== userId) {
    throw new NotFoundError('Entrada de hábito no encontrada', 'HABIT_ENTRY_NOT_FOUND')
  }
  if (ctx.weekIsLocked) {
    throw new ConflictError('No se puede modificar una semana bloqueada', 'WEEK_LOCKED')
  }
  return repo.updateStatus(entryId, input.status)
}
