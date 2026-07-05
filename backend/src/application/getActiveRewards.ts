import type { Reward } from '../domain/reward'
import type { RewardRedemptionRepository } from './ports/RewardRedemptionRepository'
import type { RewardRepository } from './ports/RewardRepository'

export interface ActiveRewardResponse {
  id: number
  userId: number
  emoji: string
  name: string
  description: string
  cost: number
  createdAt: Date
  hasBeenRedeemed: boolean
}

export async function getActiveRewards(
  rewardRepo: RewardRepository,
  redemptionRepo: RewardRedemptionRepository,
  userId: number
): Promise<ActiveRewardResponse[]> {
  const rewards = await rewardRepo.findActiveByUserId(userId)
  if (rewards.length === 0) return []

  const redeemedIds = new Set(
    await redemptionRepo.findRedeemedRewardIds(rewards.map((reward) => reward.id))
  )

  return rewards.map((reward) => mapToActiveRewardResponse(reward, redeemedIds.has(reward.id)))
}

function mapToActiveRewardResponse(reward: Reward, hasBeenRedeemed: boolean): ActiveRewardResponse {
  return {
    id: reward.id,
    userId: reward.userId,
    emoji: reward.emoji,
    name: reward.name,
    description: reward.description,
    cost: reward.cost,
    createdAt: reward.createdAt,
    hasBeenRedeemed,
  }
}
