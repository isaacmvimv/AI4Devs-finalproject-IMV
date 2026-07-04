import { apiRequest } from './httpClient'

/** Contrato JSON de PATCH /api/habit-entries/:id (alineado con `HabitEntryResponse`). */
export interface HabitEntryApiDto {
  id: number
  status: 'pending' | 'completed' | 'failed'
  updatedAt: string
  redemptionInvalidated: boolean
}

export function updateHabitEntry(
  entryId: number,
  status: 'pending' | 'completed' | 'failed',
): Promise<HabitEntryApiDto> {
  return apiRequest<HabitEntryApiDto>('PATCH', `/habit-entries/${entryId}`, { status })
}
