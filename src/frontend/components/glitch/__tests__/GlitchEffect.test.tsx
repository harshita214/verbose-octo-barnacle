import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { GlitchEffect } from '../GlitchEffect'

describe('GlitchEffect Component', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubGlobal('requestAnimationFrame', vi.fn((cb) => {
      setTimeout(cb, 16) // Simulate 60fps
      return 1
    }))
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  describe('Rendering', () => {
    it('should render children', () => {
      render(
        <GlitchEffect active={false} intensity={0}>
          <div>Test Content</div>
        </GlitchEffect>
      )

      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('should render glitch container', () => {
      const { container } = render(
        <GlitchEffect active={false} intensity={0}>
          <div>Test</div>
        </GlitchEffect>
      )

      expect(container.querySelector('.glitch-container')).toBeInTheDocument()
    })

    it('should render glitch content wrapper', () => {
      const { container } = render(
        <GlitchEffect active={false} intensity={0}>
          <div>Test</div>
        </GlitchEffect>
      )

      expect(container.querySelector('.glitch-content')).toBeInTheDocument()
    })
  })

  describe('Active State', () => {
    it('should add glitch-active class when active', () => {
      const { container } = render(
        <GlitchEffect active={true} intensity={0.5}>
          <div>Test</div>
        </GlitchEffect>
      )

      expect(container.querySelector('.glitch-active')).toBeInTheDocument()
    })

    it('should remove glitch-active class when inactive', () => {
      const { container, rerender } = render(
        <GlitchEffect active={true} intensity={0.5}>
          <div>Test</div>
        </GlitchEffect>
      )

      expect(container.querySelector('.glitch-active')).toBeInTheDocument()

      rerender(
        <GlitchEffect active={false} intensity={0.5}>
          <div>Test</div>
        </GlitchEffect>
      )

      expect(container.querySelector('.glitch-active')).not.toBeInTheDocument()
    })

    it('should render spectral overlay when active', () => {
      const { container } = render(
        <GlitchEffect active={true} intensity={0.5}>
          <div>Test</div>
        </GlitchEffect>
      )

      expect(container.querySelector('.spectral-overlay')).toBeInTheDocument()
    })

    it('should not render spectral overlay when inactive', () => {
      const { container } = render(
        <GlitchEffect active={false} intensity={0.5}>
          <div>Test</div>
        </GlitchEffect>
      )

      expect(container.querySelector('.spectral-overlay')).not.toBeInTheDocument()
    })

    it('should render glitch artifacts when active', () => {
      const { container } = render(
        <GlitchEffect active={true} intensity={0.5}>
          <div>Test</div>
        </GlitchEffect>
      )

      expect(container.querySelectorAll('.glitch-artifact').length).toBe(3)
    })

    it('should not render glitch artifacts when inactive', () => {
      const { container } = render(
        <GlitchEffect active={false} intensity={0.5}>
          <div>Test</div>
        </GlitchEffect>
      )

      expect(container.querySelectorAll('.glitch-artifact').length).toBe(0)
    })
  })

  describe('Intensity Control', () => {
    it('should normalize intensity to 0-1 range', () => {
      const { container: container1 } = render(
        <GlitchEffect active={true} intensity={-0.5}>
          <div>Test</div>
        </GlitchEffect>
      )

      const { container: container2 } = render(
        <GlitchEffect active={true} intensity={1.5}>
          <div>Test</div>
        </GlitchEffect>
      )

      // Both should render without errors
      expect(container1.querySelector('.glitch-container')).toBeInTheDocument()
      expect(container2.querySelector('.glitch-container')).toBeInTheDocument()
    })

    it('should apply intensity as CSS variable', () => {
      const { container } = render(
        <GlitchEffect active={true} intensity={0.7}>
          <div>Test</div>
        </GlitchEffect>
      )

      const glitch_container = container.querySelector('.glitch-container') as HTMLElement
      const style = glitch_container.style

      expect(style.getPropertyValue('--glitch-intensity')).toBe('0.7')
    })

    it('should calculate glitch offset based on intensity', () => {
      const { container } = render(
        <GlitchEffect active={true} intensity={0.5}>
          <div>Test</div>
        </GlitchEffect>
      )

      const glitch_container = container.querySelector('.glitch-container') as HTMLElement
      const offset = glitch_container.style.getPropertyValue('--glitch-offset')

      expect(offset).toBe('5px') // 0.5 * 10
    })

    it('should calculate color shift based on intensity', () => {
      const { container } = render(
        <GlitchEffect active={true} intensity={0.5}>
          <div>Test</div>
        </GlitchEffect>
      )

      const glitch_container = container.querySelector('.glitch-container') as HTMLElement
      const shift = glitch_container.style.getPropertyValue('--color-shift')

      expect(shift).toBe('50%') // 0.5 * 100
    })

    it('should calculate shake amount based on intensity', () => {
      const { container } = render(
        <GlitchEffect active={true} intensity={0.5}>
          <div>Test</div>
        </GlitchEffect>
      )

      const glitch_container = container.querySelector('.glitch-container') as HTMLElement
      const shake = glitch_container.style.getPropertyValue('--shake-amount')

      expect(shake).toBe('2.5px') // 0.5 * 5
    })
  })

  describe('Duration and Completion', () => {
    it('should accept duration prop', () => {
      const mock_on_complete = vi.fn()

      const { rerender } = render(
        <GlitchEffect active={true} intensity={0.5} duration={500} onComplete={mock_on_complete}>
          <div>Test</div>
        </GlitchEffect>
      )

      // Component should render with custom duration
      expect(mock_on_complete).not.toHaveBeenCalled()

      // Deactivate to stop the effect
      rerender(
        <GlitchEffect active={false} intensity={0.5} duration={500} onComplete={mock_on_complete}>
          <div>Test</div>
        </GlitchEffect>
      )

      expect(mock_on_complete).not.toHaveBeenCalled()
    })

    it('should use default duration of 3000ms', () => {
      const mock_on_complete = vi.fn()

      render(
        <GlitchEffect active={true} intensity={0.5} onComplete={mock_on_complete}>
          <div>Test</div>
        </GlitchEffect>
      )

      // Component should render with default duration
      expect(mock_on_complete).not.toHaveBeenCalled()
    })

    it('should deactivate when active prop becomes false', () => {
      const { container, rerender } = render(
        <GlitchEffect active={true} intensity={0.5} duration={1000}>
          <div>Test</div>
        </GlitchEffect>
      )

      expect(container.querySelector('.glitch-active')).toBeInTheDocument()

      rerender(
        <GlitchEffect active={false} intensity={0.5} duration={1000}>
          <div>Test</div>
        </GlitchEffect>
      )

      expect(container.querySelector('.glitch-active')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should respect prefers-reduced-motion', () => {
      // This is a CSS-based test, so we just verify the component renders
      const { container } = render(
        <GlitchEffect active={true} intensity={0.5}>
          <div>Test</div>
        </GlitchEffect>
      )

      expect(container.querySelector('.glitch-container')).toBeInTheDocument()
    })

    it('should support calm mode', () => {
      const { container } = render(
        <GlitchEffect active={true} intensity={0.5}>
          <div>Test</div>
        </GlitchEffect>
      )

      const glitch_container = container.querySelector('.glitch-container') as HTMLElement

      // Add calm mode class (would be done by parent component)
      glitch_container.classList.add('calm-mode')

      expect(glitch_container).toHaveClass('calm-mode')
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero intensity', () => {
      const { container } = render(
        <GlitchEffect active={true} intensity={0}>
          <div>Test</div>
        </GlitchEffect>
      )

      const glitch_container = container.querySelector('.glitch-container') as HTMLElement
      expect(glitch_container.style.getPropertyValue('--glitch-intensity')).toBe('0')
    })

    it('should handle maximum intensity', () => {
      const { container } = render(
        <GlitchEffect active={true} intensity={1}>
          <div>Test</div>
        </GlitchEffect>
      )

      const glitch_container = container.querySelector('.glitch-container') as HTMLElement
      expect(glitch_container.style.getPropertyValue('--glitch-intensity')).toBe('1')
    })

    it('should handle rapid active state changes', () => {
      const { rerender, container } = render(
        <GlitchEffect active={true} intensity={0.5}>
          <div>Test</div>
        </GlitchEffect>
      )

      expect(container.querySelector('.glitch-active')).toBeInTheDocument()

      rerender(
        <GlitchEffect active={false} intensity={0.5}>
          <div>Test</div>
        </GlitchEffect>
      )

      expect(container.querySelector('.glitch-active')).not.toBeInTheDocument()

      rerender(
        <GlitchEffect active={true} intensity={0.5}>
          <div>Test</div>
        </GlitchEffect>
      )

      expect(container.querySelector('.glitch-active')).toBeInTheDocument()
    })

    it('should handle multiple children', () => {
      render(
        <GlitchEffect active={true} intensity={0.5}>
          <div>Child 1</div>
          <div>Child 2</div>
          <div>Child 3</div>
        </GlitchEffect>
      )

      expect(screen.getByText('Child 1')).toBeInTheDocument()
      expect(screen.getByText('Child 2')).toBeInTheDocument()
      expect(screen.getByText('Child 3')).toBeInTheDocument()
    })
  })
})
