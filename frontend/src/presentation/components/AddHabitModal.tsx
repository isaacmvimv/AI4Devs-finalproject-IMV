import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'

interface AddHabitModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (habit: { emoji: string; name: string; pointsPerDay: number; penalty: number }) => Promise<void>
}

const HABIT_EMOJIS = [
  '🏋️',
  '🚴',
  '🏃',
  '🔥',
  '💧',
  '📚',
  '🚫',
  '🎨',
  '🎯',
  '🍎',
  '🎵',
  '✏️',
  '📱',
  '🧘',
  '🎮',
  '🌟',
]

const initialState = () => ({
  emoji: HABIT_EMOJIS[0],
  name: '',
  pointsPerDay: 5,
  penalty: 3,
})

export default function AddHabitModal({ isOpen, onClose, onAdd }: AddHabitModalProps) {
  const [selectedEmoji, setSelectedEmoji] = useState(HABIT_EMOJIS[0])
  const [name, setName] = useState('')
  const [pointsPerDay, setPointsPerDay] = useState(5)
  const [penalty, setPenalty] = useState(3)
  const [errors, setErrors] = useState<{ name?: string; pointsPerDay?: string; penalty?: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = () => {
    const newErrors: { name?: string; pointsPerDay?: string; penalty?: string } = {}
    if (!name.trim()) newErrors.name = 'El nombre es obligatorio'
    if (pointsPerDay <= 0) newErrors.pointsPerDay = 'Los puntos deben ser mayores que 0'
    if (penalty < 0) newErrors.penalty = 'La penalización no puede ser negativa'
    return newErrors
  }

  const resetFields = () => {
    const s = initialState()
    setSelectedEmoji(s.emoji)
    setName(s.name)
    setPointsPerDay(s.pointsPerDay)
    setPenalty(s.penalty)
    setErrors({})
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setErrors({})
    setIsSubmitting(true)
    try {
      await onAdd({
        emoji: selectedEmoji,
        name: name.trim(),
        pointsPerDay,
        penalty,
      })
      resetFields()
      onClose()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al añadir el hábito'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-3xl p-6 w-full max-w-md shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800">Añadir hábito</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-3">Emoji</label>
            <div className="grid grid-cols-8 gap-2">
              {HABIT_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${
                    selectedEmoji === emoji
                      ? 'bg-green-100 ring-2 ring-green-400'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Caminar 30 min"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
            />
            {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Puntos por día</label>
              <input
                type="number"
                value={pointsPerDay}
                onChange={(e) => setPointsPerDay(Number(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
              />
              {errors.pointsPerDay && <p className="text-sm text-red-500 mt-1">{errors.pointsPerDay}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Penalización si fallas
              </label>
              <input
                type="number"
                value={penalty}
                onChange={(e) => setPenalty(Number(e.target.value))}
                min="0"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
              />
              {errors.penalty && <p className="text-sm text-red-500 mt-1">{errors.penalty}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Añadir hábito
          </button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
