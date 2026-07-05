import { ConflictError } from '../domain/errors/appErrors'
import type { Reward } from '../domain/reward'
import { assertRewardOwnedByUser } from './rewardOwnership'
import type { RewardRedemptionRepository } from './ports/RewardRedemptionRepository'
import type { RewardRepository } from './ports/RewardRepository'

export async function softDeleteReward(
  rewardRepo: RewardRepository,
  redemptionRepo: RewardRedemptionRepository,
  userId: number,
  rewardId: number
): Promise<Reward> {
  await assertRewardOwnedByUser(rewardRepo, rewardId, userId)

  const hasBeenRedeemed = await redemptionRepo.hasRedemptionsForReward(rewardId)
  if (hasBeenRedeemed) {
    throw new ConflictError(
      'No se puede eliminar una recompensa ya canjeada',
      'REWARD_ALREADY_REDEEMED'
    )
  }

  return rewardRepo.softDelete(rewardId)
}
