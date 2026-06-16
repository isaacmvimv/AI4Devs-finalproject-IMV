// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'

afterEach(cleanup)
import WeeklyCalendar from './WeeklyCalendar'

function renderCalendar(props: Partial<Parameters<typeof WeeklyCalendar>[0]> = {}) {
  const defaults = {
    weekOffset: 0,
    isWeekLocked: false,
    onWeekNav: vi.fn(),
  }
  return { onWeekNav: defaults.onWeekNav, ...render(<WeeklyCalendar {...defaults} {...props} />) }
}

describe('WeeklyCalendar', () => {
  it('clic en ‹ invoca onWeekNav(-1)', () => {
    const onWeekNav = vi.fn()
    renderCalendar({ onWeekNav })
    fireEvent.click(screen.getByText('‹'))
    expect(onWeekNav).toHaveBeenCalledWith(-1)
  })

  it('clic en › invoca onWeekNav(+1)', () => {
    const onWeekNav = vi.fn()
    renderCalendar({ weekOffset: -1, onWeekNav })
    fireEvent.click(screen.getByText('›'))
    expect(onWeekNav).toHaveBeenCalledWith(1)
  })

  it('› tiene disabled cuando weekOffset === 0', () => {
    renderCalendar({ weekOffset: 0 })
    expect(screen.getByText('›').closest('button')).toBeDisabled()
  })

  it('› NO tiene disabled cuando weekOffset === -1', () => {
    renderCalendar({ weekOffset: -1 })
    expect(screen.getByText('›').closest('button')).not.toBeDisabled()
  })

  it('badge Semana bloqueada 🔒 visible cuando isWeekLocked=true', () => {
    renderCalendar({ isWeekLocked: true })
    expect(screen.getByText(/Semana bloqueada 🔒/)).toBeInTheDocument()
  })

  it('badge no visible cuando isWeekLocked=false', () => {
    renderCalendar({ isWeekLocked: false })
    expect(screen.queryByText(/Semana bloqueada 🔒/)).not.toBeInTheDocument()
  })
})
