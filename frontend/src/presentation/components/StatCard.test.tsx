// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, it, expect } from 'vitest'
import StatCard from './StatCard'

afterEach(cleanup)

describe('StatCard', () => {
  it('renders positive value with + prefix', () => {
    render(<StatCard icon="🏆" value={42} label="Esta semana" bgColor="#C8E6C9" />)
    expect(screen.getByText('+42')).toBeTruthy()
    expect(screen.getByText('Esta semana')).toBeTruthy()
  })

  it('renders value 0 as +0', () => {
    render(<StatCard icon="📊" value={0} label="Semana anterior" bgColor="#E8F5E9" />)
    expect(screen.getByText('+0')).toBeTruthy()
  })

  it('renders negative value without + prefix', () => {
    render(<StatCard icon="⚠️" value={-3} label="Penalizaciones" bgColor="#FFCDD2" />)
    expect(screen.getByText('-3')).toBeTruthy()
  })

  it('shows icon, label and bgColor correctly', () => {
    const { container } = render(
      <StatCard icon="🔥" value={5} label="Mejor racha" bgColor="#FFE0B2" />
    )
    expect(screen.getByText('🔥')).toBeTruthy()
    expect(screen.getByText('Mejor racha')).toBeTruthy()
    const iconContainer = container.querySelector('[style*="background-color"]') as HTMLElement
    expect(iconContainer.style.backgroundColor).toBe('rgb(255, 224, 178)')
  })
})
