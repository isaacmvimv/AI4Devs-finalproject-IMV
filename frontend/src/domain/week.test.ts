import { describe, expect, it } from 'vitest'
import { buildWeekData, getCurrentDayIndexForWeek } from './week'

// Miércoles 10 jun 2026 (el 11 es jueves en calendario real 2026)
const wednesdayJune10_2026 = new Date(2026, 5, 10)

describe('buildWeekData', () => {
  it('returns 7 labels and dates for current week (miércoles 10 jun 2026)', () => {
    const week = buildWeekData(0, wednesdayJune10_2026)

    expect(week.dates).toHaveLength(7)
    expect(week.dates[0]).toEqual({ day: 'Lun', date: 8 })
    expect(week.dates[2]).toEqual({ day: 'Mié', date: 10 })
    expect(week.dates[6]).toEqual({ day: 'Dom', date: 14 })
    expect(week.range).toContain('Junio')
  })

  it('returns previous week when weekOffset is -1', () => {
    const week = buildWeekData(-1, wednesdayJune10_2026)

    expect(week.dates[0].date).toBe(1)
    expect(week.dates[6].date).toBe(7)
  })

  it('handles week that crosses months', () => {
    const wednesdayJuly1_2026 = new Date(2026, 6, 1)
    const week = buildWeekData(0, wednesdayJuly1_2026)

    expect(week.dates[0].date).toBe(29)
    expect(week.dates[6].date).toBe(5)
  })
})

describe('getCurrentDayIndexForWeek', () => {
  it('returns 2 for Wednesday in current week', () => {
    expect(getCurrentDayIndexForWeek(0, wednesdayJune10_2026)).toBe(2)
  })

  it('returns 6 for Sunday in current week', () => {
    const sundayJune14_2026 = new Date(2026, 5, 14)

    expect(getCurrentDayIndexForWeek(0, sundayJune14_2026)).toBe(6)
  })

  it('returns -1 when weekOffset is not 0', () => {
    expect(getCurrentDayIndexForWeek(-1, wednesdayJune10_2026)).toBe(-1)
    expect(getCurrentDayIndexForWeek(1, wednesdayJune10_2026)).toBe(-1)
  })
})
