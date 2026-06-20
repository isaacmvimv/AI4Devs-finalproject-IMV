import request from 'supertest'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { createTestApp } from './helpers/testApp'
import { resetDb } from './helpers/resetDb'
import { seedHabitWithWeek, seedUser } from './helpers/seeders'

const { app, prisma } = createTestApp()

const habitPayload = {
  emoji: '🚲',
  name: 'Bici 1h',
  pointsPerDay: 10,
  penalty: 3,
}

beforeEach(async () => {
  await resetDb(prisma)
})

afterAll(async () => {
  await prisma.$disconnect()
})

describe('GET /api/weeks/current — sincronización con hábitos activos', () => {
  it('incluye un hábito creado vía POST tras inicializar la semana vacía', async () => {
    await seedUser(prisma)

    const emptyWeek = await request(app).get('/api/weeks/current')
    expect(emptyWeek.status).toBe(200)
    expect(emptyWeek.body.habits).toHaveLength(0)

    const created = await request(app).post('/api/habits').send(habitPayload)
    expect(created.status).toBe(201)

    const current = await request(app).get('/api/weeks/current')
    expect(current.status).toBe(200)
    expect(current.body.habits).toHaveLength(1)
    expect(current.body.habits[0].weekHabit).toMatchObject({
      habitId: created.body.id,
      snapshotName: 'Bici 1h',
      snapshotPoints: 10,
      snapshotPenalty: 3,
    })
    expect(current.body.habits[0].entries).toHaveLength(7)
  })

  it('excluye un hábito desactivado y revierte puntos/penalizaciones de la semana actual', async () => {
    await seedUser(prisma)

    const created = await request(app).post('/api/habits').send(habitPayload)
    const habitId = created.body.id

    const week = await request(app).get('/api/weeks/current')
    const entryId = week.body.habits[0].entries[0].id

    await request(app)
      .patch(`/api/habit-entries/${entryId}`)
      .send({ status: 'completed' })
      .expect(200)

    const failedEntryId = week.body.habits[0].entries[1].id
    await request(app)
      .patch(`/api/habit-entries/${failedEntryId}`)
      .send({ status: 'failed' })
      .expect(200)

    const withStats = await request(app).get('/api/weeks/current')
    expect(withStats.body.stats.thisWeekPoints).toBe(10)
    expect(withStats.body.stats.penalties).toBe(3)

    await request(app).delete(`/api/habits/${habitId}`).expect(204)

    const afterDelete = await request(app).get('/api/weeks/current')
    expect(afterDelete.body.habits).toHaveLength(0)
    expect(afterDelete.body.stats.thisWeekPoints).toBe(0)
    expect(afterDelete.body.stats.penalties).toBe(0)

    const habit = await prisma.habit.findUnique({ where: { id: habitId } })
    expect(habit?.isActive).toBe(false)

    const weekHabitCount = await prisma.weekHabit.count({ where: { habitId } })
    expect(weekHabitCount).toBe(0)
  })

  it('conserva snapshots WeekHabit en semanas bloqueadas tras DELETE', async () => {
    await seedUser(prisma)
    const { habit, weekHabit } = await seedHabitWithWeek(prisma, { weekLocked: true })

    const snapshotsBefore = {
      snapshotName: weekHabit.snapshotName,
      snapshotPoints: weekHabit.snapshotPoints,
      snapshotPenalty: weekHabit.snapshotPenalty,
    }

    await request(app).delete(`/api/habits/${habit.id}`).expect(204)

    const preserved = await prisma.weekHabit.findUnique({ where: { id: weekHabit.id } })
    expect(preserved).not.toBeNull()
    expect(preserved).toMatchObject(snapshotsBefore)

    const deactivated = await prisma.habit.findUnique({ where: { id: habit.id } })
    expect(deactivated?.isActive).toBe(false)
  })
})
