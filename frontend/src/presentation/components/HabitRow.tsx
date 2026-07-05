import { Check, X } from 'lucide-react'

interface HabitRowProps {
  emoji: string
  name: string
  streak?: number
  completionStatus: Array<'completed' | 'failed' | 'pending'>
  weekOffset?: number
  currentDayIndex?: number
  onToggle: (dayIndex: number) => void
  onDelete: () => void
  isReadOnly?: boolean
}

export default function HabitRow({
  emoji,
  name,
  streak,
  completionStatus,
  weekOffset = 0,
  currentDayIndex,
  onToggle,
  onDelete,
  isReadOnly = false,
}: HabitRowProps) {
  const todayIndex = currentDayIndex ?? (() => {
    const day = new Date().getDay()
    return day === 0 ? 6 : day - 1
  })()

  const cellClassName = (status: 'completed' | 'failed' | 'pending', isToday: boolean, dayReadOnly: boolean) =>
    `w-8 h-8 rounded-lg flex items-center justify-center ${
      status === 'completed'
        ? 'bg-green-500 text-white'
        : status === 'failed'
          ? 'bg-red-400 text-white'
          : dayReadOnly
            ? 'bg-gray-100'
            : 'bg-gray-100 hover:bg-gray-200'
    }${isToday ? ' ring-2 ring-blue-400' : ''}`

  return (
    <div className="grid grid-cols-[1fr_repeat(7,48px)_24px] gap-2 items-center py-3 border-b border-gray-100 last:border-0">
      {/* Habit info column */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-xl">{emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-800 truncate">{name}</div>
          {streak != null && streak > 0 && <div className="text-xs text-orange-500">🔥 {streak} días</div>}
        </div>
      </div>

      {/* Day completion buttons - 7 columns */}
      {completionStatus.map((status, index) => {
        const isToday = weekOffset === 0 && index === todayIndex
        const isFutureDay = weekOffset === 0 && index > todayIndex
        const isDayReadOnly = isReadOnly || isFutureDay
        return (
          <div key={index} className="flex justify-center">
            {isDayReadOnly ? (
              <div className={cellClassName(status, isToday, true)} aria-hidden>
                {status === 'completed' && <Check className="w-4 h-4" />}
                {status === 'failed' && <X className="w-4 h-4" />}
              </div>
            ) : (
              <button onClick={() => onToggle(index)} className={cellClassName(status, isToday, false)}>
                {status === 'completed' && <Check className="w-4 h-4" />}
                {status === 'failed' && <X className="w-4 h-4" />}
              </button>
            )}
          </div>
        )
      })}

      {/* Delete button column */}
      <div className="flex justify-center">
        {!isReadOnly && (
          <button
            onClick={() => onDelete()}
            className="w-6 h-6 text-gray-400 hover:text-gray-600 transition-colors"
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
}
