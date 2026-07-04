export interface Reward {
  id: string
  emoji: string
  name: string
  description: string
  cost: number
  hasBeenRedeemed: boolean
}

export interface RewardFormInput {
  emoji: string
  name: string
  description: string
  cost: number
}

export function createRewardFromFormInput(input: RewardFormInput, id: string): Reward {
  return { id, ...input, hasBeenRedeemed: false }
}
