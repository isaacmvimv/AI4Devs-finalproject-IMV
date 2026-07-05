import { ApiError, apiRequest } from './httpClient'

/** Contrato JSON de GET/POST /api/rewards (alineado con `RewardApi` del backend). */
export interface RewardApiDto {
  id: number
  userId: number
  emoji: string
  name: string
  description: string
  cost: number
  createdAt: string
  hasBeenRedeemed: boolean
}

/** Contrato de entrada de POST /api/rewards. */
export interface CreateRewardInput {
  emoji: string
  name: string
  description: string
  cost: number
}

/** Contrato JSON de POST /api/weeks/:weekId/redemptions. */
export interface RedemptionApiDto {
  id: number
  weekId: number
  rewardId: number
  pointsSpent: number
  redeemedAt: string
}

export interface InsufficientPointsDetails {
  available: number
  required: number
}

export function fetchRewards(): Promise<RewardApiDto[]> {
  return apiRequest<RewardApiDto[]>('GET', '/rewards')
}

export function createReward(input: CreateRewardInput): Promise<RewardApiDto> {
  return apiRequest<RewardApiDto>('POST', '/rewards', input)
}

export function deleteReward(id: number): Promise<void> {
  return apiRequest<void>('DELETE', `/rewards/${id}`)
}

export async function redeemReward(weekId: number, rewardId: number): Promise<RedemptionApiDto> {
  try {
    return await apiRequest<RedemptionApiDto>('POST', `/weeks/${weekId}/redemptions`, { rewardId })
  } catch (err) {
    if (
      err instanceof ApiError &&
      err.status === 422 &&
      err.code === 'INSUFFICIENT_POINTS'
    ) {
      const details = err.details as InsufficientPointsDetails
      throw new ApiError(422, 'INSUFFICIENT_POINTS', err.message, {
        available: details.available,
        required: details.required,
      } satisfies InsufficientPointsDetails)
    }
    throw err
  }
}
