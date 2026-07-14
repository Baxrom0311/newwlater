'use client'

import { useEffect, useRef } from 'react'

export default function CursorSpotlight() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!finePointer.matches || reduceMotion.matches) return

    let frame = 0
    let activeTimeout = 0

    const setPosition = (event: PointerEvent) => {
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(() => {
        element.style.setProperty('--spotlight-x', `${event.clientX}px`)
        element.style.setProperty('--spotlight-y', `${event.clientY}px`)
        element.dataset.active = 'true'
      })

      window.clearTimeout(activeTimeout)
      activeTimeout = window.setTimeout(() => {
        element.dataset.active = 'false'
      }, 1400)
    }

    const hide = () => {
      window.clearTimeout(activeTimeout)
      element.dataset.active = 'false'
    }

    window.addEventListener('pointermove', setPosition, { passive: true })
    window.addEventListener('pointerleave', hide)
    window.addEventListener('blur', hide)

    return () => {
      window.cancelAnimationFrame(frame)
      window.clearTimeout(activeTimeout)
      window.removeEventListener('pointermove', setPosition)
      window.removeEventListener('pointerleave', hide)
      window.removeEventListener('blur', hide)
    }
  }, [])

  return <div ref={ref} className="cursor-spotlight" aria-hidden="true" data-active="false" />
}
