import request from 'supertest'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { createTestApp } from './helpers/testApp'
import { resetDb } from './helpers/resetDb'
import { seedUser, seedHabitWithWeek, seedReward } from './helpers/seeders'

const { app, prisma } = createTestApp()

beforeEach(async () => {
  await resetDb(prisma)
})

afterAll(async () => {
  await prisma.$disconnect()
})

describe('POST /api/weeks/:weekId/redemptions', () => {
  it('returns 201 when user has enough points', async () => {
    await seedUser(prisma)
    const { week } = await seedHabitWithWeek(prisma, { totalPointsEarned: 100, entryStatus: 'completed' })
    const reward = await seedReward(prisma, { cost: 10 })

    const res = await request(app)
      .post(`/api/weeks/${week.id}/redemptions`)
      .send({ rewardId: reward.id })

    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({
      weekId: week.id,
      rewardId: reward.id,
      pointsSpent: 10,
    })
  })

  it('returns 409 WEEK_REDEMPTION_LIMIT on second redemption in same week', async () => {
    await seedUser(prisma)
    const { week } = await seedHabitWithWeek(prisma, { totalPointsEarned: 100, entryStatus: 'completed' })
    const rewardA = await seedReward(prisma, { cost: 10 })
    const rewardB = await seedReward(prisma, { cost: 15 })

    const first = await request(app)
      .post(`/api/weeks/${week.id}/redemptions`)
      .send({ rewardId: rewardA.id })
    expect(first.status).toBe(201)

    const second = await request(app)
      .post(`/api/weeks/${week.id}/redemptions`)
      .send({ rewardId: rewardB.id })

    expect(second.status).toBe(409)
    expect(second.body).toMatchObject({ code: 'WEEK_REDEMPTION_LIMIT' })
  })

  it('returns 422 with INSUFFICIENT_POINTS when not enough points', async () => {
    await seedUser(prisma)
    const { week } = await seedHabitWithWeek(prisma, { totalPointsEarned: 0 })
    const reward = await seedReward(prisma, { cost: 50 })

    const res = await request(app)
      .post(`/api/weeks/${week.id}/redemptions`)
      .send({ rewardId: reward.id })

    expect(res.status).toBe(422)
    expect(res.body).toMatchObject({
      code: 'INSUFFICIENT_POINTS',
    })
  })
})
