import { CompletionStatus, type PrismaClient } from '@prisma/client'
import type { HabitEntryRepository } from '../application/ports/HabitEntryRepository'
import type { CompletionStatus as DomainCompletionStatus } from '../domain/week'
import { mapToHabitEntry } from './prismaWeekHabitRepository'

export function createPrismaHabitEntryRepository(prisma: PrismaClient): HabitEntryRepository {
  return {
    async findByIdWithWeek(entryId: number) {
      const row = await prisma.habitEntry.findUnique({
        where: { id: entryId },
        include: {
          weekHabit: {
            include: { week: true },
          },
        },
      })

      if (!row) {
        return null
      }

      return {
        entry: mapToHabitEntry(row),
        weekUserId: row.weekHabit.week.userId,
        weekIsLocked: row.weekHabit.week.isLocked,
      }
    },

    async updateStatus(entryId: number, status: DomainCompletionStatus) {
      const row = await prisma.habitEntry.update({
        where: { id: entryId },
        data: { status: status as CompletionStatus },
      })
      return mapToHabitEntry(row)
    },
  }
}
