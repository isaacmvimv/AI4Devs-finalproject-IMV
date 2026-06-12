import type { RewardRepository } from './ports/RewardRepository'
import type { Reward } from '../domain/reward'
import { parseCreateRewardInput } from './validation/reward'

export async function createReward(
  repo: RewardRepository,
  userId: number,
  input: unknown
): Promise<Reward> {
  const validated = parseCreateRewardInput(input)
  return repo.create({
    userId,
    emoji: validated.emoji,
    name: validated.name,
    description: validated.description,
    cost: validated.cost,
  })
}
