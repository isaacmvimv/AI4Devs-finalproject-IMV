import { PrismaClient } from '@prisma/client'
import { createApp } from '../../../presentation/http/createApp'

export function createTestApp() {
  const prisma = new PrismaClient()
  const app = createApp(prisma)
  return { app, prisma }
}
