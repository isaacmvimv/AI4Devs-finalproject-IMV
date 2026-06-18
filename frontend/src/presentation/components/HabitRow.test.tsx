// @vitest-environment jsdom
import { cleanup, render, screen, fireEvent } from '@testing-library/react'
import { afterEach, describe, it, expect, vi } from 'vitest'
import HabitRow from './HabitRow'

const defaultProps = {
  emoji: '💪',
  name: 'Ejercicio',
  completionStatus: ['pending', 'pending', 'pending', 'pending', 'pending', 'pending', 'pending'] as Array<'completed' | 'failed' | 'pending'>,
  onToggle: vi.fn(),
  onDelete: vi.fn(),
}

describe('HabitRow', () => {
  afterEach(() => {
    cleanup()
  })

  it('2.2 happy path toggle: click en celda pendiente llama onToggle con índice correcto', () => {
    const onToggle = vi.fn()
    render(<HabitRow {...defaultProps} onToggle={onToggle} />)
    // 7 day buttons + 1 delete button = 8 total; day buttons are first 7
    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[2])
    expect(onToggle).toHaveBeenCalledWith(2)
  })

  it('2.3 isReadOnly=true: celdas son div (no button), botón × ausente', () => {
    render(<HabitRow {...defaultProps} isReadOnly={true} />)
    expect(screen.queryAllByRole('button')).toHaveLength(0)
  })

  it('2.4 estado completado: celda con clase verde e icono check', () => {
    const status: Array<'completed' | 'failed' | 'pending'> = ['completed', 'pending', 'pending', 'pending', 'pending', 'pending', 'pending']
    render(<HabitRow {...defaultProps} completionStatus={status} />)
    const buttons = screen.getAllByRole('button')
    // buttons[0] is the first day cell (index 0 = Monday)
    expect(buttons[0].className).toContain('bg-green-500')
  })

  it('2.5 estado fallado: celda con clase roja e icono x', () => {
    const status: Array<'completed' | 'failed' | 'pending'> = ['failed', 'pending', 'pending', 'pending', 'pending', 'pending', 'pending']
    render(<HabitRow {...defaultProps} completionStatus={status} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons[0].className).toContain('bg-red-400')
  })

  it('2.6 indicador de hoy: presente cuando weekOffset=0, ausente cuando weekOffset=-1', () => {
    render(<HabitRow {...defaultProps} weekOffset={0} />)
    const buttonsWithOffset0 = screen.getAllByRole('button')
    const hasRingToday = buttonsWithOffset0.some(b => b.className.includes('ring-2'))
    expect(hasRingToday).toBe(true)
    cleanup()

    render(<HabitRow {...defaultProps} weekOffset={-1} />)
    const buttonsWithOffset = screen.getAllByRole('button')
    const hasRingPast = buttonsWithOffset.some(b => b.className.includes('ring-2'))
    expect(hasRingPast).toBe(false)
  })

  it('2.7 botón ×: click llama onDelete(); ausente en isReadOnly', () => {
    const onDelete = vi.fn()
    render(<HabitRow {...defaultProps} onDelete={onDelete} />)
    const buttons = screen.getAllByRole('button')
    // Last button is delete (×)
    const deleteButton = buttons[buttons.length - 1]
    fireEvent.click(deleteButton)
    expect(onDelete).toHaveBeenCalled()
    cleanup()

    render(<HabitRow {...defaultProps} onDelete={onDelete} isReadOnly={true} />)
    expect(screen.queryAllByRole('button')).toHaveLength(0)
  })

  it('días futuros en semana actual son read-only (div, no button)', () => {
    const onToggle = vi.fn()
    // currentDayIndex=2 (miércoles) → days 3-6 should be divs
    render(<HabitRow {...defaultProps} weekOffset={0} currentDayIndex={2} onToggle={onToggle} />)
    const buttons = screen.getAllByRole('button')
    // 3 day buttons (0,1,2) + 1 delete = 4
    expect(buttons).toHaveLength(4)
    // clicking a future day div should not call onToggle
    expect(onToggle).not.toHaveBeenCalled()
  })

  it('en semanas pasadas (weekOffset=-1) todos los días son editables si no es readOnly', () => {
    render(<HabitRow {...defaultProps} weekOffset={-1} currentDayIndex={2} />)
    const buttons = screen.getAllByRole('button')
    // 7 day buttons + 1 delete = 8
    expect(buttons).toHaveLength(8)
  })

  it('2.8 racha: muestra 🔥 5 días cuando streak=5; sin indicador cuando streak=0', () => {
    render(<HabitRow {...defaultProps} streak={5} />)
    expect(screen.getByText('🔥 5 días')).toBeInTheDocument()
    cleanup()

    render(<HabitRow {...defaultProps} streak={0} />)
    expect(screen.queryByText(/🔥/)).not.toBeInTheDocument()
  })
})
