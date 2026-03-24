import { useEffect, useRef, useState, useCallback } from 'react'
import { useThemeStore } from '@store/themeStore'
import type { Theme } from '@/types'

// ─── SCROLL REVEAL HOOK ─────────────────────────────────────────
export function useScrollReveal(threshold = 0.12) {
  const ref = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(el)
        }
      },
      { threshold }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, isVisible }
}

// ─── THEME HOOK ─────────────────────────────────────────────────
export function useTheme(): { theme: Theme; toggleTheme: () => void } {
  const { theme, toggleTheme } = useThemeStore()
  return { theme, toggleTheme }
}

// ─── DEBOUNCE HOOK ──────────────────────────────────────────────
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}

// ─── NAV SCROLL HOOK ────────────────────────────────────────────
export function useNavScroll(threshold = 50) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > threshold)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [threshold])

  return scrolled
}

// ─── MOBILE DETECT HOOK ─────────────────────────────────────────
export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < breakpoint)

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < breakpoint)
    window.addEventListener('resize', handler, { passive: true })
    return () => window.removeEventListener('resize', handler)
  }, [breakpoint])

  return isMobile
}

// ─── LOCAL STORAGE HOOK ─────────────────────────────────────────
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : initial
    } catch {
      return initial
    }
  })

  const set = useCallback(
    (val: T | ((prev: T) => T)) => {
      const next = val instanceof Function ? val(value) : val
      setValue(next)
      try {
        localStorage.setItem(key, JSON.stringify(next))
      } catch {
        // ignore storage errors
      }
    },
    [key, value]
  )

  return [value, set] as const
}

// ─── KEY PRESS HOOK ─────────────────────────────────────────────
export function useKeyPress(key: string, callback: () => void) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === key) callback()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [key, callback])
}

// ─── CLICK OUTSIDE HOOK ─────────────────────────────────────────
export function useClickOutside(callback: () => void) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        callback()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [callback])

  return ref
}
