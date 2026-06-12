import type { Reward } from '../domain/reward'
import { NotFoundError } from '../domain/errors/appErrors'
import type { RewardRepository } from './ports/RewardRepository'

export async function assertRewardOwnedByUser(
  repo: RewardRepository,
  rewardId: number,
  userId: number
): Promise<Reward> {
  const reward = await repo.findById(rewardId)
  if (!reward || reward.userId !== userId) {
    throw new NotFoundError('Recompensa no encontrada', 'REWARD_NOT_FOUND')
  }
  return reward
}
