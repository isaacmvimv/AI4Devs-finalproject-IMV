import type { PrismaClient } from '@prisma/client'
import type { HabitRepository } from '../application/ports/HabitRepository'
import type { CreateHabitData, Habit, UpdateHabitData } from '../domain/habit'

function mapToHabit(row: {
  id: number
  userId: number
  emoji: string
  name: string
  pointsPerDay: number
  penalty: number
  isActive: boolean
  createdAt: Date
}): Habit {
  return {
    id: row.id,
    userId: row.userId,
    emoji: row.emoji,
    name: row.name,
    pointsPerDay: row.pointsPerDay,
    penalty: row.penalty,
    isActive: row.isActive,
    createdAt: row.createdAt,
  }
}

export function createPrismaHabitRepository(prisma: PrismaClient): HabitRepository {
  return {
    async create(data: CreateHabitData): Promise<Habit> {
      const habit = await prisma.habit.create({
        data: {
          userId: data.userId,
          emoji: data.emoji,
          name: data.name,
          pointsPerDay: data.pointsPerDay,
          penalty: data.penalty,
          isActive: true,
        },
      })
      return mapToHabit(habit)
    },

    async findActiveByUserId(userId: number): Promise<Habit[]> {
      const habits = await prisma.habit.findMany({
        where: { userId, isActive: true },
        orderBy: { createdAt: 'asc' },
      })
      return habits.map(mapToHabit)
    },

    async findById(id: number): Promise<Habit | null> {
      const habit = await prisma.habit.findUnique({ where: { id } })
      return habit ? mapToHabit(habit) : null
    },

    async update(id: number, data: UpdateHabitData): Promise<Habit> {
      const habit = await prisma.habit.update({
        where: { id },
        data,
      })
      return mapToHabit(habit)
    },

    async softDelete(id: number): Promise<Habit> {
      const habit = await prisma.habit.update({
        where: { id },
        data: { isActive: false },
      })
      return mapToHabit(habit)
    },
  }
}
