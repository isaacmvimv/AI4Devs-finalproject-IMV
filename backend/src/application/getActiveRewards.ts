import type { RewardRepository } from './ports/RewardRepository'
import type { Reward } from '../domain/reward'

export async function getActiveRewards(
  repo: RewardRepository,
  userId: number
): Promise<Reward[]> {
  return repo.findActiveByUserId(userId)
}
