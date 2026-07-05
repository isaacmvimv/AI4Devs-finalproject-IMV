// @vitest-environment jsdom
import { cleanup, render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { afterEach, describe, it, expect, vi } from 'vitest'
import AddRewardModal from './AddRewardModal'

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  onAdd: vi.fn().mockResolvedValue(undefined),
}

describe('AddRewardModal', () => {
  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('2.2 submit con nombre vacío → error inline visible, onAdd no invocado', async () => {
    const onAdd = vi.fn()
    render(<AddRewardModal {...defaultProps} onAdd={onAdd} />)
    fireEvent.click(screen.getByRole('button', { name: /añadir recompensa/i }))
    await waitFor(() => {
      expect(screen.getByText('El nombre es obligatorio')).toBeTruthy()
    })
    expect(onAdd).not.toHaveBeenCalled()
  })

  it('2.3 submit con descripción vacía → error inline visible, onAdd no invocado', async () => {
    const onAdd = vi.fn()
    render(<AddRewardModal {...defaultProps} onAdd={onAdd} />)
    const nameInput = screen.getByPlaceholderText('Ej: Pizza del viernes')
    fireEvent.change(nameInput, { target: { value: 'Test recompensa' } })
    fireEvent.click(screen.getByRole('button', { name: /añadir recompensa/i }))
    await waitFor(() => {
      expect(screen.getByText('La descripción es obligatoria')).toBeTruthy()
    })
    expect(onAdd).not.toHaveBeenCalled()
  })

  it('2.4 submit con coste = 0 → error inline visible, onAdd no invocado', async () => {
    const onAdd = vi.fn()
    render(<AddRewardModal {...defaultProps} onAdd={onAdd} />)
    const nameInput = screen.getByPlaceholderText('Ej: Pizza del viernes')
    const descriptionInput = screen.getByPlaceholderText('Ej: Una pizza de pepperoni después de una semana dura')
    fireEvent.change(nameInput, { target: { value: 'Test recompensa' } })
    fireEvent.change(descriptionInput, { target: { value: 'Una descripción válida' } })
    const costInput = screen.getByRole('spinbutton')
    await act(async () => {
      fireEvent.change(costInput, { target: { value: '0' } })
    })
    fireEvent.click(screen.getByRole('button', { name: /añadir recompensa/i }))
    await waitFor(() => {
      expect(screen.getByText('El coste debe ser mayor que 0')).toBeTruthy()
    })
    expect(onAdd).not.toHaveBeenCalled()
  })

  it('2.5 submit válido → onAdd invocado con datos correctos, onClose invocado', async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined)
    const onClose = vi.fn()
    render(<AddRewardModal {...defaultProps} onAdd={onAdd} onClose={onClose} />)
    const nameInput = screen.getByPlaceholderText('Ej: Pizza del viernes')
    const descriptionInput = screen.getByPlaceholderText('Ej: Una pizza de pepperoni después de una semana dura')
    fireEvent.change(nameInput, { target: { value: 'Mi recompensa' } })
    fireEvent.change(descriptionInput, { target: { value: 'Una pizza de pepperoni' } })
    fireEvent.click(screen.getByRole('button', { name: /añadir recompensa/i }))
    await waitFor(() => {
      expect(onAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Mi recompensa',
          description: 'Una pizza de pepperoni',
          cost: 10,
        })
      )
      expect(onClose).toHaveBeenCalled()
    })
  })

  it('2.6 error de API → onAdd invocado, onClose NO invocado, modal permanece abierto', async () => {
    const onAdd = vi.fn().mockRejectedValue(new Error('API error'))
    const onClose = vi.fn()
    render(<AddRewardModal {...defaultProps} onAdd={onAdd} onClose={onClose} />)
    const nameInput = screen.getByPlaceholderText('Ej: Pizza del viernes')
    const descriptionInput = screen.getByPlaceholderText('Ej: Una pizza de pepperoni después de una semana dura')
    fireEvent.change(nameInput, { target: { value: 'Mi recompensa' } })
    fireEvent.change(descriptionInput, { target: { value: 'Una pizza de pepperoni' } })
    fireEvent.click(screen.getByRole('button', { name: /añadir recompensa/i }))
    await waitFor(() => {
      expect(onAdd).toHaveBeenCalled()
    })
    expect(onClose).not.toHaveBeenCalled()
  })
})
