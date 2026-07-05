import type { CreateRewardData, Reward } from '../../domain/reward'

export interface RewardRepository {
  create(data: CreateRewardData): Promise<Reward>
  findActiveByUserId(userId: number): Promise<Reward[]>
  findById(id: number): Promise<Reward | null>
  softDelete(id: number): Promise<Reward>
}
