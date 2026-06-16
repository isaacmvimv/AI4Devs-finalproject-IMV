import { startOfWeek, addDays, addWeeks, format } from 'date-fns'
import { es } from 'date-fns/locale'

interface WeeklyCalendarProps {
  weekOffset: number
  isWeekLocked: boolean
  onWeekNav: (delta: number) => void
}

export default function WeeklyCalendar({ weekOffset, isWeekLocked, onWeekNav }: WeeklyCalendarProps) {
  const todayIndex = (() => {
    const day = new Date().getDay()
    return day === 0 ? 6 : day - 1
  })()

  const weekStart = startOfWeek(addWeeks(new Date(), weekOffset), { weekStartsOn: 1 })
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(weekStart, i)
    return {
      day: format(d, 'EEE', { locale: es }),
      date: d.getDate(),
    }
  })
  const weekEnd = addDays(weekStart, 6)
  const weekRange = `${format(weekStart, 'd MMM', { locale: es })} – ${format(weekEnd, 'd MMM yyyy', { locale: es })}`

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => onWeekNav(-1)}
          className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
        >
          <span className="text-gray-600">‹</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">{weekRange}</span>
          {isWeekLocked && (
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
              Semana bloqueada 🔒
            </span>
          )}
        </div>

        <button
          onClick={() => onWeekNav(+1)}
          disabled={weekOffset === 0}
          className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="text-gray-600">›</span>
        </button>
      </div>

      <div className="grid grid-cols-[1fr_repeat(7,48px)_24px] gap-2 mb-2">
        <div></div>

        {weekDates.map((date, index) => {
          const isToday = weekOffset === 0 && index === todayIndex
          return (
            <div key={index} className={`text-center ${isToday ? 'ring-2 ring-blue-400 rounded-lg' : ''}`}>
              <div className="text-xs text-gray-500 mb-0.5">{date.day}</div>
              <div className={`text-sm font-semibold ${isToday ? 'text-green-600' : 'text-gray-700'}`}>
                {date.date}
              </div>
            </div>
          )
        })}

        <div></div>
      </div>
    </div>
  )
}
