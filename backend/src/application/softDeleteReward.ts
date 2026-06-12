import type { Reward } from '../domain/reward'
import { assertRewardOwnedByUser } from './rewardOwnership'
import type { RewardRepository } from './ports/RewardRepository'

export async function softDeleteReward(
  repo: RewardRepository,
  userId: number,
  rewardId: number
): Promise<Reward> {
  await assertRewardOwnedByUser(repo, rewardId, userId)
  return repo.softDelete(rewardId)
}
