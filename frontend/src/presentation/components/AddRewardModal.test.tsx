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

  it('2.3 submit con coste = 0 → error inline visible, onAdd no invocado', async () => {
    const onAdd = vi.fn()
    render(<AddRewardModal {...defaultProps} onAdd={onAdd} />)
    const nameInput = screen.getByPlaceholderText('Ej: Pizza del viernes')
    fireEvent.change(nameInput, { target: { value: 'Test recompensa' } })
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

  it('2.4 submit válido → onAdd invocado con datos correctos, onClose invocado', async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined)
    const onClose = vi.fn()
    render(<AddRewardModal {...defaultProps} onAdd={onAdd} onClose={onClose} />)
    const nameInput = screen.getByPlaceholderText('Ej: Pizza del viernes')
    fireEvent.change(nameInput, { target: { value: 'Mi recompensa' } })
    fireEvent.click(screen.getByRole('button', { name: /añadir recompensa/i }))
    await waitFor(() => {
      expect(onAdd).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Mi recompensa', cost: 10 })
      )
      expect(onClose).toHaveBeenCalled()
    })
  })

  it('2.5 error de API → onAdd invocado, onClose NO invocado, modal permanece abierto', async () => {
    const onAdd = vi.fn().mockRejectedValue(new Error('API error'))
    const onClose = vi.fn()
    render(<AddRewardModal {...defaultProps} onAdd={onAdd} onClose={onClose} />)
    const nameInput = screen.getByPlaceholderText('Ej: Pizza del viernes')
    fireEvent.change(nameInput, { target: { value: 'Mi recompensa' } })
    fireEvent.click(screen.getByRole('button', { name: /añadir recompensa/i }))
    await waitFor(() => {
      expect(onAdd).toHaveBeenCalled()
    })
    expect(onClose).not.toHaveBeenCalled()
  })
})
