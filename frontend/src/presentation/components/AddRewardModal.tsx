import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'

interface AddRewardModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (reward: { emoji: string; name: string; description: string; cost: number }) => Promise<void>
}

const REWARD_EMOJIS = [
  '🍕', '🍦', '🎬', '🎮', '🛁', '📖', '✈️', '🛍️',
  '🍷', '🎵', '🌴', '💆', '🎂', '🏖️', '🎁', '🌟',
]

const initialState = () => ({
  emoji: REWARD_EMOJIS[0],
  name: '',
  description: '',
  cost: 10,
})

export default function AddRewardModal({ isOpen, onClose, onAdd }: AddRewardModalProps) {
  const [selectedEmoji, setSelectedEmoji] = useState(REWARD_EMOJIS[0])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [cost, setCost] = useState(10)
  const [errors, setErrors] = useState<{ name?: string; cost?: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = () => {
    const newErrors: { name?: string; cost?: string } = {}
    if (!name.trim()) newErrors.name = 'El nombre es obligatorio'
    if (cost <= 0) newErrors.cost = 'El coste debe ser mayor que 0'
    return newErrors
  }

  const resetFields = () => {
    const s = initialState()
    setSelectedEmoji(s.emoji)
    setName(s.name)
    setDescription(s.description)
    setCost(s.cost)
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
        description: description.trim(),
        cost,
      })
      resetFields()
      onClose()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al añadir la recompensa'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-3xl p-6 w-full max-w-md shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800">Añadir recompensa</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-3">Emoji</label>
            <div className="grid grid-cols-8 gap-2">
              {REWARD_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${
                    selectedEmoji === emoji
                      ? 'bg-purple-100 ring-2 ring-purple-400'
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
              placeholder="Ej: Pizza del viernes"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
            />
            {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">Descripción (opcional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Una pizza de pepperoni después de una semana dura"
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Coste (puntos)</label>
            <input
              type="number"
              value={cost}
              onChange={(e) => setCost(Number(e.target.value))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
            />
            {errors.cost && <p className="text-sm text-red-500 mt-1">{errors.cost}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-purple-500 hover:bg-purple-600 disabled:opacity-60 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Añadir recompensa
          </button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
