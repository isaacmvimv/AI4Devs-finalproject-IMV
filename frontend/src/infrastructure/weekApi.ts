import { apiRequest } from './httpClient'

/** Contrato JSON de un canje dentro de WeekResponseDto. */
export interface RedemptionDto {
  id: number
  weekId: number
  rewardId: number
  pointsSpent: number
  redeemedAt: string
}

/** Contrato JSON de GET /api/weeks/current y GET /api/weeks (alineado con `WeekResponse` de api-spec.yml). */
export interface WeekResponseDto {
  week: {
    id: number
    startDate: string
    endDate: string
    isLocked: boolean
    totalPointsEarned: number
    totalPenalties: number
  }
  habits: Array<{
    weekHabit: {
      id: number
      habitId: number
      order: number
      snapshotName: string
      snapshotEmoji: string
      snapshotPoints: number
      snapshotPenalty: number
    }
    entries: Array<{
      id: number
      dayIndex: number
      status: 'pending' | 'completed' | 'failed'
    }>
  }>
  stats: WeekStatsDto
  redemptions: RedemptionDto[]
}

/** Contrato de `stats` dentro de `WeekResponseDto` (alineado con `WeekStats`). */
export interface WeekStatsDto {
  thisWeekPoints: number
  lastWeekPoints: number
  penalties: number
  maxStreak: number
}

export function fetchCurrentWeek(): Promise<WeekResponseDto> {
  return apiRequest<WeekResponseDto>('GET', '/weeks/current')
}

export function fetchWeekByOffset(offset: number): Promise<WeekResponseDto> {
  return apiRequest<WeekResponseDto>('GET', `/weeks?offset=${offset}`)
}
