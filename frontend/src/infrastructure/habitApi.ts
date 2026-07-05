import { apiRequest } from './httpClient'

/** Contrato JSON de GET/POST/PATCH /api/habits (alineado con `HabitApi` del backend). */
export interface HabitApiDto {
  id: number
  userId: number
  emoji: string
  name: string
  pointsPerDay: number
  penalty: number
  isActive: boolean
  createdAt: string
}

/** Contrato de entrada de POST /api/habits (alineado con `CreateHabitRequest`). */
export interface CreateHabitInput {
  emoji: string
  name: string
  pointsPerDay: number
  penalty: number
}

export function fetchHabits(): Promise<HabitApiDto[]> {
  return apiRequest<HabitApiDto[]>('GET', '/habits')
}

export function createHabit(input: CreateHabitInput): Promise<HabitApiDto> {
  return apiRequest<HabitApiDto>('POST', '/habits', input)
}

export function deleteHabit(id: number): Promise<{ redemptionInvalidated: boolean }> {
  return apiRequest<{ redemptionInvalidated: boolean }>('DELETE', `/habits/${id}`)
}
