import { CompletionStatus, type PrismaClient } from '@prisma/client'
import { calculateWeekAvailableBalance } from '../application/calculateWeekAvailableBalance'
import type { RewardRedemptionRepository } from '../application/ports/RewardRedemptionRepository'
import { ConflictError, NotFoundError, UnprocessableError } from '../domain/errors/appErrors'
import type { RewardRedemption } from '../domain/rewardRedemption'
import type {
  CompletionStatus as DomainCompletionStatus,
  HabitEntry,
  WeekHabitWithEntries,
  WeekWithDetails,
} from '../domain/week'

function mapToHabitEntry(row: {
  id: number
  weekHabitId: number
  dayIndex: number
  status: CompletionStatus
  updatedAt: Date
}): HabitEntry {
  return {
    id: row.id,
    weekHabitId: row.weekHabitId,
    dayIndex: row.dayIndex,
    status: row.status as DomainCompletionStatus,
    updatedAt: row.updatedAt,
  }
}

function mapToWeekHabitWithEntries(row: {
  id: number
  weekId: number
  habitId: number
  order: number
  snapshotName: string
  snapshotPoints: number
  snapshotPenalty: number
  habitEntries: Array<{
    id: number
    weekHabitId: number
    dayIndex: number
    status: CompletionStatus
    updatedAt: Date
  }>
}): WeekHabitWithEntries {
  return {
    id: row.id,
    weekId: row.weekId,
    habitId: row.habitId,
    order: row.order,
    snapshotName: row.snapshotName,
    snapshotPoints: row.snapshotPoints,
    snapshotPenalty: row.snapshotPenalty,
    entries: row.habitEntries.map(mapToHabitEntry),
  }
}

function mapToWeekWithDetails(
  week: {
    id: number
    userId: number
    startDate: Date
    endDate: Date
    isLocked: boolean
    totalPointsEarned: number
    totalPenalties: number
    createdAt: Date
    weekHabits: Array<{
      id: number
      weekId: number
      habitId: number
      order: number
      snapshotName: string
      snapshotPoints: number
      snapshotPenalty: number
      habitEntries: Array<{
        id: number
        weekHabitId: number
        dayIndex: number
        status: CompletionStatus
        updatedAt: Date
      }>
    }>
  }
): WeekWithDetails {
  return {
    id: week.id,
    userId: week.userId,
    startDate: week.startDate,
    endDate: week.endDate,
    isLocked: week.isLocked,
    totalPointsEarned: week.totalPointsEarned,
    totalPenalties: week.totalPenalties,
    createdAt: week.createdAt,
    weekHabits: week.weekHabits.map(mapToWeekHabitWithEntries),
  }
}

function mapToRewardRedemption(row: {
  id: number
  weekId: number
  rewardId: number
  pointsSpent: number
  redeemedAt: Date
}): RewardRedemption {
  return {
    id: row.id,
    weekId: row.weekId,
    rewardId: row.rewardId,
    pointsSpent: row.pointsSpent,
    redeemedAt: row.redeemedAt,
  }
}

export function createPrismaRewardRedemptionRepository(
  prisma: PrismaClient
): RewardRedemptionRepository {
  return {
    async redeem({ userId, weekId, rewardId, rewardCost }) {
      return prisma.$transaction(async (tx) => {
        const locked = await tx.$queryRaw<Array<{ id: number }>>`
          SELECT id FROM "Week" WHERE id = ${weekId} FOR UPDATE
        `

        if (locked.length === 0) {
          throw new NotFoundError('Semana no encontrada', 'WEEK_NOT_FOUND')
        }

        const week = await tx.week.findUnique({
          where: { id: weekId },
          include: {
            weekHabits: {
              include: { habitEntries: { orderBy: { dayIndex: 'asc' } } },
              orderBy: { order: 'asc' },
            },
          },
        })

        if (!week || week.userId !== userId) {
          throw new NotFoundError('Semana no encontrada', 'WEEK_NOT_FOUND')
        }

        if (week.isLocked) {
          throw new ConflictError('No se puede modificar una semana bloqueada', 'WEEK_LOCKED')
        }

        const aggregate = await tx.rewardRedemption.aggregate({
          where: { weekId },
          _sum: { pointsSpent: true },
        })
        const redemptionsSpentTotal = aggregate._sum.pointsSpent ?? 0

        const available = calculateWeekAvailableBalance(
          mapToWeekWithDetails(week),
          redemptionsSpentTotal
        )

        if (available < rewardCost) {
          throw new UnprocessableError('Puntos insuficientes', 'INSUFFICIENT_POINTS', {
            available,
            required: rewardCost,
          })
        }

        const created = await tx.rewardRedemption.create({
          data: { weekId, rewardId, pointsSpent: rewardCost },
        })

        return mapToRewardRedemption(created)
      })
    },
  }
}
