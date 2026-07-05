import request from 'supertest'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { createTestApp } from './helpers/testApp'
import { resetDb } from './helpers/resetDb'
import { seedUser, seedHabitWithWeek } from './helpers/seeders'

const { app, prisma } = createTestApp()

beforeEach(async () => {
  await resetDb(prisma)
})

afterAll(async () => {
  await prisma.$disconnect()
})

describe('PATCH /api/habit-entries/:id', () => {
  it('returns 200 when updating entry in active week', async () => {
    await seedUser(prisma)
    const { entry } = await seedHabitWithWeek(prisma, { weekLocked: false })

    const res = await request(app)
      .patch(`/api/habit-entries/${entry.id}`)
      .send({ status: 'completed' })

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({
      id: entry.id,
      status: 'completed',
    })
  })

  it('returns 409 with WEEK_LOCKED when week is locked', async () => {
    await seedUser(prisma)
    const { entry } = await seedHabitWithWeek(prisma, { weekLocked: true })

    const res = await request(app)
      .patch(`/api/habit-entries/${entry.id}`)
      .send({ status: 'completed' })

    expect(res.status).toBe(409)
    expect(res.body).toMatchObject({
      code: 'WEEK_LOCKED',
    })
  })
})
