import type { RewardRedemption } from '../../domain/rewardRedemption'

export interface RewardRedemptionRepository {
  /**
   * Calculates available balance and creates a redemption in the same database transaction.
   * Implementations MUST lock the week row and validate balance atomically before insert.
   */
  redeem(params: {
    userId: number
    weekId: number
    rewardId: number
    rewardCost: number
  }): Promise<RewardRedemption>
}
