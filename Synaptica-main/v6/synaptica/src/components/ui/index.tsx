import { useRef, useEffect, useState } from 'react'
import { cn, CATEGORY_STYLES, DIFFICULTY_STYLES } from '@utils/index'
import type { AlgorithmCategory, QuestionDifficulty } from '@/types'

// ─── BADGE ──────────────────────────────────────────────────────
interface BadgeProps {
  children: React.ReactNode
  variant?: 'category' | 'difficulty' | 'custom'
  category?: AlgorithmCategory
  difficulty?: QuestionDifficulty
  className?: string
}

export function Badge({ children, category, difficulty, className }: BadgeProps) {
  const style = category
    ? CATEGORY_STYLES[category]
    : difficulty
    ? DIFFICULTY_STYLES[difficulty]
    : ''

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium font-mono uppercase tracking-wide border',
        style,
        className
      )}
    >
      {children}
    </span>
  )
}

// ─── SECTION LABEL ───────────────────────────────────────────────
interface SectionLabelProps {
  children: React.ReactNode
  className?: string
}

export function SectionLabel({ children, className }: SectionLabelProps) {
  return (
    <div className={cn('section-label', className)}>
      {children}
    </div>
  )
}

// ─── SECTION TITLE ───────────────────────────────────────────────
interface SectionTitleProps {
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function SectionTitle({ children, className, size = 'lg' }: SectionTitleProps) {
  const sizes = {
    sm: 'text-2xl sm:text-3xl',
    md: 'text-3xl sm:text-4xl',
    lg: 'text-4xl sm:text-5xl',
    xl: 'text-5xl sm:text-6xl',
  }
  return (
    <h2
      className={cn(
        'font-serif font-normal tracking-tight leading-tight',
        sizes[size],
        className
      )}
      style={{ color: 'var(--color-text-1)' }}
    >
      {children}
    </h2>
  )
}

// ─── REVEAL WRAPPER ─────────────────────────────────────────────
interface RevealProps {
  children: React.ReactNode
  delay?: number
  direction?: 'up' | 'left' | 'scale'
  className?: string
}

export function Reveal({ children, delay = 0, direction = 'up', className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.unobserve(el) } },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const baseStyle: React.CSSProperties = {
    transitionDelay: `${delay}ms`,
    transitionDuration: '700ms',
    transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)',
  }

  const hiddenStyle: React.CSSProperties = {
    opacity: 0,
    transform:
      direction === 'left'
        ? 'translateX(-32px)'
        : direction === 'scale'
        ? 'scale(0.93)'
        : 'translateY(28px)',
  }

  const visibleStyle: React.CSSProperties = {
    opacity: 1,
    transform: 'none',
  }

  return (
    <div
      ref={ref}
      style={{ ...baseStyle, ...(visible ? visibleStyle : hiddenStyle) }}
      className={className}
    >
      {children}
    </div>
  )
}

// ─── SCORE BAR ───────────────────────────────────────────────────
interface ScoreBarProps {
  label: string
  value: number
  animate?: boolean
}

export function ScoreBar({ label, value, animate = true }: ScoreBarProps) {
  const [width, setWidth] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!animate) { setWidth(value); return }
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setWidth(value); obs.disconnect() } },
      { threshold: 0.1 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [value, animate])

  const color =
    value >= 85 ? '#10b981'
    : value >= 65 ? '#f59e0b'
    : '#f43f5e'

  return (
    <div ref={ref}>
      <div className="flex justify-between mb-1">
        <span className="text-xs" style={{ color: 'var(--color-text-3)' }}>{label}</span>
        <span className="text-xs font-mono" style={{ color }}>{value}</span>
      </div>
      <div
        className="h-1 rounded-full overflow-hidden"
        style={{ background: 'var(--color-surface-3)' }}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${width}%`,
            background: color,
            transitionDuration: '1.2s',
            transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)',
          }}
        />
      </div>
    </div>
  )
}

// ─── DIVIDER ────────────────────────────────────────────────────
export function Divider({ className }: { className?: string }) {
  return (
    <hr
      className={cn('border-0 h-px', className)}
      style={{ background: 'var(--color-border)' }}
    />
  )
}

// ─── CARD ────────────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

export function Card({ children, className, hover = false, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-xl border transition-all duration-300',
        hover && 'cursor-pointer hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.25)]',
        onClick && 'cursor-pointer',
        className
      )}
      style={{
        background: 'var(--color-card-bg)',
        borderColor: 'var(--color-border)',
      }}
    >
      {children}
    </div>
  )
}
