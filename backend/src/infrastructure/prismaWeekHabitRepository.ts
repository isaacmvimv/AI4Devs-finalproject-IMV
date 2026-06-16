import { CompletionStatus, type Prisma, type PrismaClient } from '@prisma/client'
import type { WeekHabitRepository } from '../application/ports/WeekHabitRepository'
import type { Habit } from '../domain/habit'
import type {
  CompletionStatus as DomainCompletionStatus,
  HabitEntry,
  WeekHabit,
  WeekHabitWithEntries,
} from '../domain/week'

function mapToWeekHabit(row: {
  id: number
  weekId: number
  habitId: number
  order: number
  snapshotName: string
  snapshotEmoji: string
  snapshotPoints: number
  snapshotPenalty: number
}): WeekHabit {
  return {
    id: row.id,
    weekId: row.weekId,
    habitId: row.habitId,
    order: row.order,
    snapshotName: row.snapshotName,
    snapshotEmoji: row.snapshotEmoji,
    snapshotPoints: row.snapshotPoints,
    snapshotPenalty: row.snapshotPenalty,
  }
}

export function mapToHabitEntry(row: {
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

export async function createWeekHabitsWithEntriesInTx(
  tx: Prisma.TransactionClient,
  weekId: number,
  activeHabits: Habit[]
): Promise<WeekHabitWithEntries[]> {
  const result: WeekHabitWithEntries[] = []

  for (let order = 0; order < activeHabits.length; order++) {
    const habit = activeHabits[order]
    const weekHabit = await tx.weekHabit.create({
      data: {
        weekId,
        habitId: habit.id,
        order,
        snapshotName: habit.name,
        snapshotEmoji: habit.emoji,
        snapshotPoints: habit.pointsPerDay,
        snapshotPenalty: habit.penalty,
      },
    })

    const entries: HabitEntry[] = []
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      const entry = await tx.habitEntry.create({
        data: {
          weekHabitId: weekHabit.id,
          dayIndex,
          status: CompletionStatus.pending,
        },
      })
      entries.push(mapToHabitEntry(entry))
    }

    result.push({
      ...mapToWeekHabit(weekHabit),
      entries,
    })
  }

  return result
}

export function createPrismaWeekHabitRepository(prisma: PrismaClient): WeekHabitRepository {
  return {
    async createWeekHabits(weekId: number, activeHabits: Habit[]): Promise<WeekHabit[]> {
      const weekHabitsWithEntries = await prisma.$transaction((tx) =>
        createWeekHabitsWithEntriesInTx(tx, weekId, activeHabits)
      )
      return weekHabitsWithEntries.map(({ entries: _entries, ...weekHabit }) => weekHabit)
    },
  }
}
