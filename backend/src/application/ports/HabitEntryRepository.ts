import type { CompletionStatus, HabitEntry } from '../../domain/week'

export interface HabitEntryWithWeekContext {
  entry: HabitEntry
  weekId: number
  weekUserId: number
  weekIsLocked: boolean
}

export interface HabitEntryRepository {
  findByIdWithWeek(entryId: number): Promise<HabitEntryWithWeekContext | null>
  updateStatus(entryId: number, status: CompletionStatus): Promise<HabitEntry>
}
