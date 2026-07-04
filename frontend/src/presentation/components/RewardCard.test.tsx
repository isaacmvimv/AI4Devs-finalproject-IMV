// @vitest-environment jsdom
import { cleanup, render, screen, fireEvent, waitFor } from '@testing-library/react'
import { afterEach, describe, it, expect, vi } from 'vitest'
import RewardCard from './RewardCard'
import { ApiError } from '../../infrastructure/httpClient'

vi.mock('../../infrastructure/rewardApi', () => ({
  redeemReward: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

import { redeemReward } from '../../infrastructure/rewardApi'
import { toast } from 'sonner'

const defaultProps = {
  rewardId: 1,
  weekId: 10,
  emoji: '🎁',
  name: 'Test Reward',
  description: 'A test reward',
  cost: 80,
  currentPoints: 30,
  isRedeemedThisWeek: false,
  weekRedemptionLimitReached: false,
  canDelete: true,
  onRedeemSuccess: vi.fn(),
  onDelete: vi.fn(),
}

describe('RewardCard', () => {
  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('SC1 — currentPoints < cost → botón "Faltan X pts" y disabled', () => {
    render(<RewardCard {...defaultProps} currentPoints={30} cost={80} />)
    const btn = screen.getByRole('button', { name: /faltan 50 pts/i })
    expect(btn).toBeTruthy()
    expect((btn as HTMLButtonElement).disabled).toBe(true)
  })

  it('SC2 — currentPoints >= cost → botón "Canjear" habilitado', () => {
    render(<RewardCard {...defaultProps} currentPoints={100} cost={80} />)
    const btn = screen.getByRole('button', { name: /canjear/i })
    expect(btn).toBeTruthy()
    expect((btn as HTMLButtonElement).disabled).toBe(false)
  })

  it('SC3 — canje exitoso → onRedeemSuccess llamado con rewardId y pointsSpent', async () => {
    vi.mocked(redeemReward).mockResolvedValueOnce({
      id: 1,
      weekId: 10,
      rewardId: 1,
      pointsSpent: 80,
      redeemedAt: '',
    })
    const onRedeemSuccess = vi.fn()
    render(
      <RewardCard {...defaultProps} currentPoints={100} cost={80} onRedeemSuccess={onRedeemSuccess} />
    )
    fireEvent.click(screen.getByRole('button', { name: /canjear/i }))
    await waitFor(() => {
      expect(onRedeemSuccess).toHaveBeenCalledWith(1, 80)
    })
    expect(toast.success).toHaveBeenCalled()
  })

  it('SC4 — error 422 → toast error, onRedeemSuccess no llamado', async () => {
    vi.mocked(redeemReward).mockRejectedValueOnce(
      new ApiError(422, 'INSUFFICIENT_POINTS', 'Puntos insuficientes', {})
    )
    const onRedeemSuccess = vi.fn()
    render(
      <RewardCard {...defaultProps} currentPoints={100} cost={80} onRedeemSuccess={onRedeemSuccess} />
    )
    fireEvent.click(screen.getByRole('button', { name: /canjear/i }))
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled()
    })
    expect(onRedeemSuccess).not.toHaveBeenCalled()
  })

  it('SC5 — clic en eliminar → onDelete llamado cuando canDelete es true', () => {
    const onDelete = vi.fn()
    render(<RewardCard {...defaultProps} onDelete={onDelete} canDelete={true} />)
    const deleteBtn = screen.getByRole('button', { name: /eliminar recompensa/i })
    fireEvent.click(deleteBtn)
    expect(onDelete).toHaveBeenCalled()
  })

  it('SC6 — no muestra botón eliminar cuando canDelete es false', () => {
    render(<RewardCard {...defaultProps} canDelete={false} />)
    expect(screen.queryByRole('button', { name: /eliminar recompensa/i })).toBeNull()
  })

  it('SC7 — límite semanal alcanzado → botón "Límite semanal" disabled', () => {
    render(<RewardCard {...defaultProps} currentPoints={100} weekRedemptionLimitReached={true} />)
    const btn = screen.getByRole('button', { name: /límite semanal/i })
    expect(btn).toBeTruthy()
    expect((btn as HTMLButtonElement).disabled).toBe(true)
  })

  it('SC8 — recompensa canjeada esta semana → botón "¡Canjeada!" disabled', () => {
    render(<RewardCard {...defaultProps} currentPoints={100} isRedeemedThisWeek={true} />)
    const btn = screen.getByRole('button', { name: /canjeada/i })
    expect(btn).toBeTruthy()
    expect((btn as HTMLButtonElement).disabled).toBe(true)
  })
})
