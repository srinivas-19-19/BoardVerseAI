import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ShareButton } from '../ShareButton'

describe('ShareButton', () => {
  beforeEach(() => {
    // Setup mock for clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn(),
      },
    });
    
    // Setup mock for window.location
    Object.defineProperty(window, 'location', {
      value: {
        origin: 'http://localhost:3000'
      },
      writable: true
    });
    
    // Setup mock timers
    vi.useFakeTimers()
  })

  it('renders the share button with default state', () => {
    render(<ShareButton workspaceId="test-id-123" />)
    expect(screen.getByText('Share')).toBeInTheDocument()
  })

  it('copies the link and shows Copied state when clicked', async () => {
    render(<ShareButton workspaceId="test-id-123" />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('http://localhost:3000/invite/test-id-123')
    
    expect(screen.getByText('Copied!')).toBeInTheDocument()
    
    // Fast-forward time by 2 seconds
    vi.advanceTimersByTime(2000)
    
    // Should revert back to Share
    expect(screen.getByText('Share')).toBeInTheDocument()
  })
})
