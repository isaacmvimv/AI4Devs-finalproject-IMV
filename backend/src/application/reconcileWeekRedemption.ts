import type { RewardRedemption } from '../domain/rewardRedemption'
import type { WeekWithDetails } from '../domain/week'
import { computeCurrentWeekNetPoints } from './computeCurrentWeekNetPoints'
import type { RewardRedemptionRepository } from './ports/RewardRedemptionRepository'

export interface ReconcileWeekRedemptionResult {
  invalidated: boolean
  invalidatedRedemption?: RewardRedemption
}

export async function reconcileWeekRedemption(
  week: WeekWithDetails,
  redemptionRepo: RewardRedemptionRepository
): Promise<ReconcileWeekRedemptionResult> {
  const redemptions = await redemptionRepo.findByWeekId(week.id)
  if (redemptions.length === 0) {
    return { invalidated: false }
  }

  const netPoints = computeCurrentWeekNetPoints(week)
  const redemption = redemptions[0]

  if (netPoints >= redemption.pointsSpent) {
    return { invalidated: false }
  }

  await redemptionRepo.deleteById(redemption.id)
  return { invalidated: true, invalidatedRedemption: redemption }
}
