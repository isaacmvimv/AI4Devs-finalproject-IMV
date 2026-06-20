import { describe, expect, it, vi } from 'vitest'
import { DEMO_USER_EMAIL, DEMO_USER_ID, DEMO_USER_NAME } from '../domain/demoUser'
import { ensureDemoUser } from './ensureDemoUser'

describe('ensureDemoUser', () => {
  it('does nothing when demo user already exists', async () => {
    const prisma = {
      user: {
        findUnique: vi.fn().mockResolvedValue({ id: DEMO_USER_ID }),
        create: vi.fn(),
      },
      $executeRawUnsafe: vi.fn(),
    }

    const created = await ensureDemoUser(prisma as never)

    expect(created).toBe(false)
    expect(prisma.user.create).not.toHaveBeenCalled()
    expect(prisma.$executeRawUnsafe).not.toHaveBeenCalled()
  })

  it('creates demo user and syncs sequence when missing', async () => {
    const prisma = {
      user: {
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: DEMO_USER_ID }),
      },
      $executeRawUnsafe: vi.fn().mockResolvedValue(undefined),
    }

    const created = await ensureDemoUser(prisma as never)

    expect(created).toBe(true)
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        id: DEMO_USER_ID,
        email: DEMO_USER_EMAIL,
        name: DEMO_USER_NAME,
      },
    })
    expect(prisma.$executeRawUnsafe).toHaveBeenCalledOnce()
  })
})
