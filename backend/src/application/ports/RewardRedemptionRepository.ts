import type { RewardRedemption } from '../../domain/rewardRedemption'

export interface RewardRedemptionRepository {
  findByWeekId(weekId: number): Promise<RewardRedemption[]>

  hasRedemptionsForReward(rewardId: number): Promise<boolean>

  findRedeemedRewardIds(rewardIds: number[]): Promise<number[]>

  deleteById(id: number): Promise<RewardRedemption>

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
