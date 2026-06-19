import request from 'supertest'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { createTestApp } from './helpers/testApp'
import { resetDb } from './helpers/resetDb'
import { seedUser } from './helpers/seeders'

const { app, prisma } = createTestApp()

beforeEach(async () => {
  await resetDb(prisma)
})

afterAll(async () => {
  await prisma.$disconnect()
})

describe('POST /api/habits', () => {
  it('returns 201 with created habit on valid body', async () => {
    await seedUser(prisma)

    const res = await request(app)
      .post('/api/habits')
      .send({ emoji: '🏃', name: 'Correr', pointsPerDay: 10, penalty: 5 })

    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({
      userId: 1,
      emoji: '🏃',
      name: 'Correr',
      pointsPerDay: 10,
      penalty: 5,
      isActive: true,
    })
    expect(res.body.id).toBeDefined()
  })

  it('returns 400 with VALIDATION_ERROR when name is missing', async () => {
    await seedUser(prisma)

    const res = await request(app)
      .post('/api/habits')
      .send({ emoji: '🏃', pointsPerDay: 10, penalty: 5 })

    expect(res.status).toBe(400)
    expect(res.body).toMatchObject({
      code: 'VALIDATION_ERROR',
    })
  })
})
