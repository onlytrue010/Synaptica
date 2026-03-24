import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// ─── CLASS MERGE ────────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── NUMBER FORMATTERS ──────────────────────────────────────────
export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k`
  return n.toString()
}

export function formatScore(score: number): string {
  return `${Math.round(score)}/100`
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

// ─── SLUG HELPERS ───────────────────────────────────────────────
export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function fromSlug(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

// ─── SCORE COLOR ────────────────────────────────────────────────
export function scoreColor(score: number): string {
  if (score >= 85) return 'text-emerald-400'
  if (score >= 65) return 'text-amber-400'
  return 'text-rose-400'
}

export function scoreBg(score: number): string {
  if (score >= 85) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  if (score >= 65) return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
  return 'bg-rose-500/10 text-rose-400 border-rose-500/20'
}

// ─── DATE HELPERS ───────────────────────────────────────────────
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'month',
    month: 'short',
    day: 'numeric',
  }).format(new Date(iso))
}

// ─── ARRAY HELPERS ──────────────────────────────────────────────
export function chunk<T>(arr: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  )
}

export function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

// ─── DIFFICULTY / CATEGORY HELPERS ──────────────────────────────
// Re-exported from constants — single source of truth
export { DIFFICULTY_STYLES, CATEGORY_STYLES } from '@constants/index'

// ─── LOCAL STORAGE HELPERS ──────────────────────────────────────
export function localGet<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key)
    return item ? (JSON.parse(item) as T) : fallback
  } catch {
    return fallback
  }
}

export function localSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage full or unavailable — silent fail
  }
}
