import { Calendar } from 'lucide-react'
import type { ReactNode } from 'react'

interface CalendarSectionProps {
  action?: ReactNode
  weekLoading?: boolean
  header?: ReactNode
  children: ReactNode
}

function HabitRowSkeleton() {
  return (
    <div className="grid grid-cols-[1fr_repeat(7,48px)_24px] gap-2 items-center h-10">
      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
      {Array.from({ length: 7 }, (_, i) => (
        <div key={i} className="h-8 w-8 bg-gray-200 rounded-lg animate-pulse mx-auto" />
      ))}
      <div />
    </div>
  )
}

export default function CalendarSection({ action, weekLoading, header, children }: CalendarSectionProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-800">Calendario semanal</h2>
        </div>
        {action}
      </div>
      {header}
      {weekLoading ? (
        <div className="mt-6 space-y-1">
          {Array.from({ length: 4 }, (_, i) => (
            <HabitRowSkeleton key={i} />
          ))}
        </div>
      ) : (
        children
      )}
    </div>
  )
}
