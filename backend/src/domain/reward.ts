export interface Reward {
  id: number
  userId: number
  emoji: string
  name: string
  description: string
  cost: number
  isActive: boolean
  createdAt: Date
}

export interface CreateRewardData {
  userId: number
  emoji: string
  name: string
  description: string
  cost: number
}
