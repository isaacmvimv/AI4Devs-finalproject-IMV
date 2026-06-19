import type { PrismaClient } from '@prisma/client'

export async function seedUser(prisma: PrismaClient, overrides: { name?: string; email?: string } = {}) {
  return prisma.user.create({
    data: {
      name: overrides.name ?? 'Test User',
      email: overrides.email ?? 'test@example.com',
      avatarUrl: 'https://example.com/avatar.png',
    },
  })
}

export async function seedHabitWithWeek(
  prisma: PrismaClient,
  opts: {
    userId?: number
    weekLocked?: boolean
    totalPointsEarned?: number
    entryStatus?: 'pending' | 'completed' | 'failed'
  } = {}
) {
  const userId = opts.userId ?? 1
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay() + 1)
  startOfWeek.setHours(0, 0, 0, 0)
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)

  const habit = await prisma.habit.create({
    data: {
      userId,
      emoji: '🏃',
      name: 'Correr',
      pointsPerDay: 10,
      penalty: 5,
      isActive: true,
    },
  })

  const week = await prisma.week.create({
    data: {
      userId,
      startDate: startOfWeek,
      endDate: endOfWeek,
      isLocked: opts.weekLocked ?? false,
      totalPointsEarned: opts.totalPointsEarned ?? 0,
      totalPenalties: 0,
    },
  })

  const weekHabit = await prisma.weekHabit.create({
    data: {
      weekId: week.id,
      habitId: habit.id,
      order: 0,
      snapshotName: habit.name,
      snapshotEmoji: habit.emoji,
      snapshotPoints: habit.pointsPerDay,
      snapshotPenalty: habit.penalty,
    },
  })

  const entry = await prisma.habitEntry.create({
    data: {
      weekHabitId: weekHabit.id,
      dayIndex: 0,
      status: opts.entryStatus ?? 'pending',
    },
  })

  return { habit, week, weekHabit, entry }
}

export async function seedReward(
  prisma: PrismaClient,
  opts: { userId?: number; cost?: number } = {}
) {
  return prisma.reward.create({
    data: {
      userId: opts.userId ?? 1,
      emoji: '🎬',
      name: 'Ir al cine',
      description: 'Tarde de peli',
      cost: opts.cost ?? 50,
      isActive: true,
    },
  })
}
