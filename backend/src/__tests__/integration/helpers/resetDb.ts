import type { PrismaClient } from '@prisma/client'

export async function resetDb(prisma: PrismaClient) {
  await prisma.$transaction([
    prisma.rewardRedemption.deleteMany(),
    prisma.habitEntry.deleteMany(),
    prisma.weekHabit.deleteMany(),
    prisma.week.deleteMany(),
    prisma.reward.deleteMany(),
    prisma.habit.deleteMany(),
    prisma.user.deleteMany(),
  ])
  const tables = ['User', 'Habit', 'Week', 'WeekHabit', 'HabitEntry', 'Reward', 'RewardRedemption']
  for (const t of tables) {
    await prisma.$executeRawUnsafe(`ALTER SEQUENCE "${t}_id_seq" RESTART WITH 1`)
  }
}
