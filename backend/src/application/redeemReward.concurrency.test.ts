import { CompletionStatus, PrismaClient } from '@prisma/client'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { UnprocessableError } from '../domain/errors/appErrors'
import { calculateWeekAvailableBalance } from './calculateWeekAvailableBalance'
import { redeemReward } from './redeemReward'
import { createPrismaRewardRedemptionRepository } from '../infrastructure/prismaRewardRedemptionRepository'
import { createPrismaRewardRepository } from '../infrastructure/prismaRewardRepository'

const prisma = new PrismaClient()
let dbAvailable = false

beforeAll(async () => {
  try {
    await prisma.$connect()
    await prisma.$queryRaw`SELECT 1`
    dbAvailable = true
  } catch {
    dbAvailable = false
  }
})

afterAll(async () => {
  await prisma.$disconnect()
})

describe('redeemReward concurrency (US-12 S4)', () => {
  const testEmail = `redeem-concurrency-${Date.now()}@test.local`

  it('allows only one concurrent redemption when balance equals cost', async (ctx) => {
    if (!dbAvailable) {
      ctx.skip()
      return
    }
    const user = await prisma.user.create({
      data: { email: testEmail, name: 'Concurrency Test' },
    })

    const habit = await prisma.habit.create({
      data: {
        userId: user.id,
        emoji: '🏃',
        name: 'Test Habit',
        pointsPerDay: 50,
        penalty: 0,
      },
    })

    const reward = await prisma.reward.create({
      data: {
        userId: user.id,
        emoji: '🎁',
        name: 'Test Reward',
        description: 'Concurrency reward',
        cost: 50,
      },
    })

    const week = await prisma.week.create({
      data: {
        userId: user.id,
        startDate: new Date('2026-06-01T00:00:00.000Z'),
        endDate: new Date('2026-06-07T23:59:59.999Z'),
        isLocked: false,
      },
    })

    const weekHabit = await prisma.weekHabit.create({
      data: {
        weekId: week.id,
        habitId: habit.id,
        order: 0,
        snapshotName: habit.name,
        snapshotEmoji: '💪',
        snapshotPoints: 50,
        snapshotPenalty: 0,
      },
    })

    await prisma.habitEntry.create({
      data: {
        weekHabitId: weekHabit.id,
        dayIndex: 0,
        status: CompletionStatus.completed,
      },
    })

    const redemptionRepo = createPrismaRewardRedemptionRepository(prisma)
    const rewardRepo = createPrismaRewardRepository(prisma)

    const results = await Promise.allSettled([
      redeemReward(redemptionRepo, rewardRepo, user.id, week.id, reward.id),
      redeemReward(redemptionRepo, rewardRepo, user.id, week.id, reward.id),
    ])

    const fulfilled = results.filter((r) => r.status === 'fulfilled')
    const rejected = results.filter((r) => r.status === 'rejected')

    expect(fulfilled).toHaveLength(1)
    expect(rejected).toHaveLength(1)

    const failure = rejected[0] as PromiseRejectedResult
    expect(failure.reason).toBeInstanceOf(UnprocessableError)
    expect(failure.reason).toMatchObject({
      code: 'INSUFFICIENT_POINTS',
      details: { available: 0, required: 50 },
    })

    const redemptionCount = await prisma.rewardRedemption.count({
      where: { weekId: week.id },
    })
    expect(redemptionCount).toBe(1)

    const weekWithDetails = await prisma.week.findUniqueOrThrow({
      where: { id: week.id },
      include: {
        weekHabits: {
          include: { habitEntries: true },
          orderBy: { order: 'asc' },
        },
      },
    })

    const spentAggregate = await prisma.rewardRedemption.aggregate({
      where: { weekId: week.id },
      _sum: { pointsSpent: true },
    })

    const available = calculateWeekAvailableBalance(
      {
        id: weekWithDetails.id,
        userId: weekWithDetails.userId,
        startDate: weekWithDetails.startDate,
        endDate: weekWithDetails.endDate,
        isLocked: weekWithDetails.isLocked,
        totalPointsEarned: weekWithDetails.totalPointsEarned,
        totalPenalties: weekWithDetails.totalPenalties,
        createdAt: weekWithDetails.createdAt,
        weekHabits: weekWithDetails.weekHabits.map((wh) => ({
          id: wh.id,
          weekId: wh.weekId,
          habitId: wh.habitId,
          order: wh.order,
          snapshotName: wh.snapshotName,
          snapshotEmoji: '💪',
          snapshotPoints: wh.snapshotPoints,
          snapshotPenalty: wh.snapshotPenalty,
          entries: wh.habitEntries.map((e) => ({
            id: e.id,
            weekHabitId: e.weekHabitId,
            dayIndex: e.dayIndex,
            status: e.status,
            updatedAt: e.updatedAt,
          })),
        })),
      },
      spentAggregate._sum.pointsSpent ?? 0
    )

    expect(available).toBe(0)

    await prisma.rewardRedemption.deleteMany({ where: { weekId: week.id } })
    await prisma.habitEntry.deleteMany({ where: { weekHabitId: weekHabit.id } })
    await prisma.weekHabit.deleteMany({ where: { weekId: week.id } })
    await prisma.week.delete({ where: { id: week.id } })
    await prisma.reward.delete({ where: { id: reward.id } })
    await prisma.habit.delete({ where: { id: habit.id } })
    await prisma.user.delete({ where: { id: user.id } })
  })
})
