import { CompletionStatus, type PrismaClient } from '@prisma/client'
import type { WeekRepository } from '../application/ports/WeekRepository'
import type { Habit } from '../domain/habit'
import type {
  CompletionStatus as DomainCompletionStatus,
  HabitEntry,
  Week,
  WeekHabitWithEntries,
  WeekWithDetails,
} from '../domain/week'
import { createWeekHabitsWithEntriesInTx } from './prismaWeekHabitRepository'

function mapToWeek(row: {
  id: number
  userId: number
  startDate: Date
  endDate: Date
  isLocked: boolean
  totalPointsEarned: number
  totalPenalties: number
  createdAt: Date
}): Week {
  return {
    id: row.id,
    userId: row.userId,
    startDate: row.startDate,
    endDate: row.endDate,
    isLocked: row.isLocked,
    totalPointsEarned: row.totalPointsEarned,
    totalPenalties: row.totalPenalties,
    createdAt: row.createdAt,
  }
}

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
  },
  weekHabits: WeekHabitWithEntries[]
): WeekWithDetails {
  return {
    ...mapToWeek(week),
    weekHabits,
  }
}

export function createPrismaWeekRepository(prisma: PrismaClient): WeekRepository {
  return {
    async findCurrentWeek(userId: number, startDate: Date): Promise<WeekWithDetails | null> {
      const week = await prisma.week.findFirst({
        where: { userId, startDate, isLocked: false },
        include: {
          weekHabits: {
            include: { habitEntries: { orderBy: { dayIndex: 'asc' } } },
            orderBy: { order: 'asc' },
          },
        },
      })

      if (!week) return null

      return mapToWeekWithDetails(
        week,
        week.weekHabits.map(mapToWeekHabitWithEntries)
      )
    },

    async createWeekWithHabitsAndEntries(
      userId: number,
      startDate: Date,
      endDate: Date,
      activeHabits: Habit[]
    ): Promise<WeekWithDetails> {
      return prisma.$transaction(async (tx) => {
        const week = await tx.week.create({
          data: { userId, startDate, endDate },
        })

        const weekHabits =
          activeHabits.length > 0
            ? await createWeekHabitsWithEntriesInTx(tx, week.id, activeHabits)
            : []

        return mapToWeekWithDetails(week, weekHabits)
      })
    },
  }
}
