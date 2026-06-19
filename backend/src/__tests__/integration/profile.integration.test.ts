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

describe('GET /api/profile', () => {
  it('returns 200 with user profile when user exists', async () => {
    await seedUser(prisma, { name: 'Ana', email: 'ana@test.com' })

    const res = await request(app).get('/api/profile')

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({
      id: 1,
      name: 'Ana',
      email: 'ana@test.com',
    })
  })

  it('returns 404 with USER_NOT_FOUND when no user exists', async () => {
    const res = await request(app).get('/api/profile')

    expect(res.status).toBe(404)
    expect(res.body).toMatchObject({
      code: 'USER_NOT_FOUND',
    })
  })
})
