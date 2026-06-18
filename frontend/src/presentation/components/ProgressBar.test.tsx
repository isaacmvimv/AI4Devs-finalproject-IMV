// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, it, expect } from 'vitest'
import ProgressBar from './ProgressBar'

afterEach(cleanup)

describe('ProgressBar', () => {
  it('renders percentage according to props', () => {
    render(<ProgressBar progress={67} />)
    expect(screen.getByText('67%')).toBeTruthy()
  })

  it('renders 0% without NaN when progress is 0', () => {
    render(<ProgressBar progress={0} />)
    expect(screen.getByText('0%')).toBeTruthy()
    expect(screen.queryByText('NaN')).toBeNull()
  })

  it('inner bar has width matching percentage', () => {
    const { container } = render(<ProgressBar progress={45} />)
    const innerBar = container.querySelector('[style*="width"]') as HTMLElement
    expect(innerBar.style.width).toBe('45%')
  })
})
