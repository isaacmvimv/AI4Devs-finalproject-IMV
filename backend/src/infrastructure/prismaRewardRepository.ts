import type { PrismaClient } from '@prisma/client'
import type { RewardRepository } from '../application/ports/RewardRepository'
import type { CreateRewardData, Reward } from '../domain/reward'

function mapToReward(row: {
  id: number
  userId: number
  emoji: string
  name: string
  description: string
  cost: number
  isActive: boolean
  createdAt: Date
}): Reward {
  return {
    id: row.id,
    userId: row.userId,
    emoji: row.emoji,
    name: row.name,
    description: row.description,
    cost: row.cost,
    isActive: row.isActive,
    createdAt: row.createdAt,
  }
}

export function createPrismaRewardRepository(prisma: PrismaClient): RewardRepository {
  return {
    async create(data: CreateRewardData): Promise<Reward> {
      const reward = await prisma.reward.create({
        data: {
          userId: data.userId,
          emoji: data.emoji,
          name: data.name,
          description: data.description,
          cost: data.cost,
          isActive: true,
        },
      })
      return mapToReward(reward)
    },

    async findActiveByUserId(userId: number): Promise<Reward[]> {
      const rewards = await prisma.reward.findMany({
        where: { userId, isActive: true },
        orderBy: { createdAt: 'asc' },
      })
      return rewards.map(mapToReward)
    },

    async findById(id: number): Promise<Reward | null> {
      const reward = await prisma.reward.findUnique({ where: { id } })
      return reward ? mapToReward(reward) : null
    },

    async softDelete(id: number): Promise<Reward> {
      const reward = await prisma.reward.update({
        where: { id },
        data: { isActive: false },
      })
      return mapToReward(reward)
    },
  }
}
