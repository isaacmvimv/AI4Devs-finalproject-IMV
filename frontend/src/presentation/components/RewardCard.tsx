import { useState } from 'react'
import { Lock, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { redeemReward } from '../../infrastructure/rewardApi'
import { ApiError } from '../../infrastructure/httpClient'

interface RewardCardProps {
  rewardId: number
  weekId: number
  emoji: string
  name: string
  description: string
  cost: number
  currentPoints: number
  isRedeemedThisWeek: boolean
  weekRedemptionLimitReached: boolean
  canDelete: boolean
  onRedeemSuccess?: (rewardId: number, pointsSpent: number) => void
  onDelete: () => void
}

export default function RewardCard({
  rewardId,
  weekId,
  emoji,
  name,
  description,
  cost,
  currentPoints,
  isRedeemedThisWeek,
  weekRedemptionLimitReached,
  canDelete,
  onRedeemSuccess,
  onDelete,
}: RewardCardProps) {
  const [isRedeeming, setIsRedeeming] = useState(false)

  const canAfford = currentPoints >= cost
  const missingPoints = cost - currentPoints
  const progressPercentage = Math.min((currentPoints / cost) * 100, 100)
  const redeemDisabled =
    !canAfford || isRedeeming || isRedeemedThisWeek || weekRedemptionLimitReached

  async function handleRedeem() {
    if (redeemDisabled) return
    setIsRedeeming(true)
    try {
      const result = await redeemReward(weekId, rewardId)
      toast.success('¡Recompensa canjeada!')
      onRedeemSuccess?.(rewardId, result.pointsSpent)
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        toast.error('Puntos insuficientes para canjear esta recompensa')
      } else if (err instanceof ApiError && err.status === 409 && err.code === 'WEEK_REDEMPTION_LIMIT') {
        toast.error('Solo puedes canjear una recompensa por semana')
      } else {
        toast.error('Error al canjear. Inténtalo de nuevo.')
      }
    } finally {
      setIsRedeeming(false)
    }
  }

  const buttonContent = () => {
    if (isRedeemedThisWeek) return '¡Canjeada!'
    if (weekRedemptionLimitReached) return 'Límite semanal'
    if (!canAfford) return `Faltan ${missingPoints} pts`
    if (isRedeeming) return <Loader2 className="w-4 h-4 animate-spin" />
    return 'Canjear'
  }

  const buttonClass = () => {
    if (isRedeemedThisWeek) {
      return 'px-4 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium cursor-not-allowed'
    }
    if (weekRedemptionLimitReached || !canAfford) {
      return 'px-4 py-1.5 bg-gray-100 text-gray-400 rounded-lg text-sm font-medium cursor-not-allowed'
    }
    if (isRedeeming) {
      return 'px-4 py-1.5 bg-yellow-400 opacity-70 text-yellow-900 rounded-lg text-sm font-medium cursor-not-allowed'
    }
    return 'px-4 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 rounded-lg text-sm font-medium transition-colors'
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm relative group">
      {canDelete && (
        <button
          onClick={onDelete}
          aria-label="Eliminar recompensa"
          className="absolute top-3 right-3 w-6 h-6 text-gray-300 hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100"
        >
          ×
        </button>
      )}

      <div className="flex items-start gap-3 mb-4">
        <div className="text-3xl">{emoji}</div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-800 mb-1">{name}</h4>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        {!canAfford && !isRedeemedThisWeek && <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" />}
      </div>

      <div className="mb-3">
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-yellow-400 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-yellow-600 font-medium">{cost} pts</span>

        <button
          onClick={handleRedeem}
          disabled={redeemDisabled}
          className={buttonClass()}
        >
          {buttonContent()}
        </button>
      </div>
    </div>
  )
}
