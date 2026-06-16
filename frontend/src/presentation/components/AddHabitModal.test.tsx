// @vitest-environment jsdom
import { cleanup, render, screen, fireEvent, waitFor } from '@testing-library/react'
import { afterEach, describe, it, expect, vi } from 'vitest'
import AddHabitModal from './AddHabitModal'

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  onAdd: vi.fn().mockResolvedValue(undefined),
}

describe('AddHabitModal', () => {
  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('5.2 submit con nombre vacío → error inline visible, onAdd no invocado', async () => {
    const onAdd = vi.fn()
    render(<AddHabitModal {...defaultProps} onAdd={onAdd} />)
    fireEvent.click(screen.getByRole('button', { name: /añadir hábito/i }))
    await waitFor(() => {
      expect(screen.getByText('El nombre es obligatorio')).toBeTruthy()
    })
    expect(onAdd).not.toHaveBeenCalled()
  })

  it('5.3 submit con puntos = 0 → error inline visible, onAdd no invocado', async () => {
    const onAdd = vi.fn()
    render(<AddHabitModal {...defaultProps} onAdd={onAdd} />)
    const nameInput = screen.getByPlaceholderText('Ej: Caminar 30 min')
    fireEvent.change(nameInput, { target: { value: 'Test hábito' } })
    // inputs number: [0]=pointsPerDay, [1]=penalty
    const numberInputs = screen.getAllByRole('spinbutton')
    fireEvent.change(numberInputs[0], { target: { value: '0' } })
    fireEvent.click(screen.getByRole('button', { name: /añadir hábito/i }))
    await waitFor(() => {
      expect(screen.getByText('Los puntos deben ser mayores que 0')).toBeTruthy()
    })
    expect(onAdd).not.toHaveBeenCalled()
  })

  it('5.4 submit válido → onAdd invocado con datos correctos; modal llama a onClose', async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined)
    const onClose = vi.fn()
    render(<AddHabitModal {...defaultProps} onAdd={onAdd} onClose={onClose} />)
    const nameInput = screen.getByPlaceholderText('Ej: Caminar 30 min')
    fireEvent.change(nameInput, { target: { value: 'Mi hábito' } })
    fireEvent.click(screen.getByRole('button', { name: /añadir hábito/i }))
    await waitFor(() => {
      expect(onAdd).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Mi hábito', pointsPerDay: 5, penalty: 3 })
      )
      expect(onClose).toHaveBeenCalled()
    })
  })

  it('5.5 error de API → onAdd invocado, modal permanece abierto (onClose no llamado)', async () => {
    const onAdd = vi.fn().mockRejectedValue(new Error('API error'))
    const onClose = vi.fn()
    render(<AddHabitModal {...defaultProps} onAdd={onAdd} onClose={onClose} />)
    const nameInput = screen.getByPlaceholderText('Ej: Caminar 30 min')
    fireEvent.change(nameInput, { target: { value: 'Mi hábito' } })
    fireEvent.click(screen.getByRole('button', { name: /añadir hábito/i }))
    await waitFor(() => {
      expect(onAdd).toHaveBeenCalled()
    })
    expect(onClose).not.toHaveBeenCalled()
  })
})
