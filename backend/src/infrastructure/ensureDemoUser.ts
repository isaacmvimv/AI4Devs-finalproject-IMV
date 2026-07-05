import type { PrismaClient } from '@prisma/client'
import { DEMO_USER_EMAIL, DEMO_USER_ID, DEMO_USER_NAME } from '../domain/demoUser'

export async function ensureDemoUser(prisma: PrismaClient): Promise<boolean> {
  const existing = await prisma.user.findUnique({ where: { id: DEMO_USER_ID } })
  if (existing !== null) {
    return false
  }

  await prisma.user.create({
    data: {
      id: DEMO_USER_ID,
      email: DEMO_USER_EMAIL,
      name: DEMO_USER_NAME,
    },
  })

  await prisma.$executeRawUnsafe(
    `SELECT setval(
      pg_get_serial_sequence('"User"', 'id'),
      COALESCE((SELECT MAX(id) FROM "User"), 1)
    )`,
  )

  return true
}
