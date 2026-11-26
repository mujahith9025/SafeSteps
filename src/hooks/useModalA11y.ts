'use client'

import { useEffect, useRef } from 'react'

export interface UseModalA11yOptions {
  isOpen: boolean
  onClose: () => void
  initialFocusRef?: React.RefObject<HTMLElement | null>
  disabled?: boolean
}

/**
 * Reusable modal accessibility hook:
 * 1. Focuses initial element or first focusable element on open.
 * 2. Traps keyboard Tab navigation strictly inside the modal dialog.
 * 3. Listens for Escape key to close the modal.
 * 4. Restores focus to the triggering element on close.
 */
export function useModalA11y<T extends HTMLElement = HTMLDivElement>({
  isOpen,
  onClose,
  initialFocusRef,
  disabled = false,
}: UseModalA11yOptions) {
  const containerRef = useRef<T>(null)
  const previousActiveElementRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!isOpen) return

    // Save element that had focus before opening modal
    if (typeof document !== 'undefined') {
      previousActiveElementRef.current = document.activeElement as HTMLElement | null
    }

    const container = containerRef.current
    if (!container) return

    // Focus initial element or first focusable item
    const focusTimer = setTimeout(() => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus()
      } else {
        const focusable = container.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const first = Array.from(focusable).find(
          (el) => !el.hasAttribute('disabled') && el.offsetParent !== null
        )
        first?.focus()
      }
    }, 50)

    // Keydown handler: Escape to close, Tab to trap focus
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return

      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }

      if (e.key === 'Tab') {
        const focusable = Array.from(
          container.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => !el.hasAttribute('disabled') && el.offsetParent !== null)

        if (focusable.length === 0) {
          e.preventDefault()
          return
        }

        const first = focusable[0]
        const last = focusable[focusable.length - 1]

        if (e.shiftKey) {
          if (document.activeElement === first || !container.contains(document.activeElement)) {
            e.preventDefault()
            last.focus()
          }
        } else {
          if (document.activeElement === last || !container.contains(document.activeElement)) {
            e.preventDefault()
            first.focus()
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      clearTimeout(focusTimer)
      window.removeEventListener('keydown', handleKeyDown)

      // Restore focus to triggering element
      if (previousActiveElementRef.current && typeof previousActiveElementRef.current.focus === 'function') {
        previousActiveElementRef.current.focus()
      }
    }
  }, [isOpen, onClose, disabled, initialFocusRef])

  return containerRef
}
