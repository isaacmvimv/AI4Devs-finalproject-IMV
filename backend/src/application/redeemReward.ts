import type { RewardRedemption } from '../domain/rewardRedemption'
import type { RewardRedemptionRepository } from './ports/RewardRedemptionRepository'
import type { RewardRepository } from './ports/RewardRepository'
import { assertRewardOwnedByUser } from './rewardOwnership'

export async function redeemReward(
  redemptionRepo: RewardRedemptionRepository,
  rewardRepo: RewardRepository,
  userId: number,
  weekId: number,
  rewardId: number
): Promise<RewardRedemption> {
  const reward = await assertRewardOwnedByUser(rewardRepo, rewardId, userId)
  return redemptionRepo.redeem({
    userId,
    weekId,
    rewardId,
    rewardCost: reward.cost,
  })
}
