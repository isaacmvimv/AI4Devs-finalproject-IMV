import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from './httpClient'
import {
  createReward,
  deleteReward,
  fetchRewards,
  redeemReward,
} from './rewardApi'

function mockFetchOnce(response: { ok: boolean; status?: number; json?: unknown }) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: response.ok,
      status: response.status ?? (response.ok ? 200 : 500),
      json: async () => response.json,
    }),
  )
}

const rewardDto = {
  id: 1,
  userId: 1,
  emoji: '🎁',
  name: 'Película',
  description: 'Ver una película',
  cost: 50,
  createdAt: '2026-06-01T00:00:00.000Z',
  hasBeenRedeemed: false,
}

const redemptionDto = {
  id: 1,
  weekId: 10,
  rewardId: 1,
  pointsSpent: 50,
  redeemedAt: '2026-06-10T12:00:00.000Z',
}

describe('rewardApi', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('fetchRewards', () => {
    it('devuelve la lista de recompensas (200)', async () => {
      mockFetchOnce({ ok: true, json: [rewardDto] })
      const result = await fetchRewards()
      expect(result).toEqual([rewardDto])
    })
  })

  describe('createReward', () => {
    it('crea una recompensa (201)', async () => {
      mockFetchOnce({ ok: true, status: 201, json: rewardDto })
      const result = await createReward({
        emoji: '🎁',
        name: 'Película',
        description: 'Ver una película',
        cost: 50,
      })
      expect(result).toEqual(rewardDto)
    })
  })

  describe('deleteReward', () => {
    it('elimina una recompensa (204)', async () => {
      mockFetchOnce({ ok: true, status: 204 })
      const result = await deleteReward(1)
      expect(result).toBeUndefined()
    })
  })

  describe('redeemReward', () => {
    it('happy path: llama a POST /api/weeks/:id/redemptions y retorna el resultado (201)', async () => {
      mockFetchOnce({ ok: true, status: 201, json: redemptionDto })

      const result = await redeemReward(10, 1)

      const fetchMock = vi.mocked(globalThis.fetch)
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/weeks/10/redemptions',
        expect.objectContaining({ method: 'POST' }),
      )
      expect(result).toEqual(redemptionDto)
    })

    it('edge case 422 INSUFFICIENT_POINTS: lanza ApiError con details tipados', async () => {
      mockFetchOnce({
        ok: false,
        status: 422,
        json: {
          code: 'INSUFFICIENT_POINTS',
          message: 'Puntos insuficientes',
          details: { available: 30, required: 80 },
        },
      })

      await expect(redeemReward(10, 1)).rejects.toMatchObject({
        status: 422,
        code: 'INSUFFICIENT_POINTS',
        details: { available: 30, required: 80 },
      })
      await expect(redeemReward(10, 1)).rejects.toBeInstanceOf(ApiError)
    })
  })
})
