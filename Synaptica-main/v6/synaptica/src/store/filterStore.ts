import { create } from 'zustand'
import type { AlgorithmFilters, InterviewFilters, CompareSelection } from '@/types'

// ─── ALGORITHM FILTER STORE ─────────────────────────────────────
interface AlgorithmFilterState {
  filters: AlgorithmFilters
  setFilter: <K extends keyof AlgorithmFilters>(key: K, value: AlgorithmFilters[K]) => void
  resetFilters: () => void
}

const defaultAlgoFilters: AlgorithmFilters = {
  sortBy: 'name',
  sortOrder: 'asc',
}

export const useAlgorithmFilterStore = create<AlgorithmFilterState>((set) => ({
  filters: defaultAlgoFilters,

  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),

  resetFilters: () => set({ filters: defaultAlgoFilters }),
}))

// ─── COMPARE STORE ───────────────────────────────────────────────
interface CompareState extends CompareSelection {
  addToCompare:      (slug: string) => void
  removeFromCompare: (slug: string) => void
  clearCompare:      () => void
  isInCompare:       (slug: string) => boolean
  canAddMore:        () => boolean
}

const MAX_COMPARE = 4

export const useCompareStore = create<CompareState>((set, get) => ({
  algorithms: [],

  addToCompare: (slug) =>
    set((state) => {
      if (state.algorithms.length >= MAX_COMPARE) return state
      if (state.algorithms.includes(slug)) return state
      return { algorithms: [...state.algorithms, slug] }
    }),

  removeFromCompare: (slug) =>
    set((state) => ({
      algorithms: state.algorithms.filter((s) => s !== slug),
    })),

  clearCompare: () => set({ algorithms: [] }),

  isInCompare:  (slug) => get().algorithms.includes(slug),
  canAddMore:   ()     => get().algorithms.length < MAX_COMPARE,
}))

// ─── INTERVIEW FILTER STORE ──────────────────────────────────────
interface InterviewFilterState {
  filters: InterviewFilters
  setFilter: <K extends keyof InterviewFilters>(key: K, value: InterviewFilters[K]) => void
  resetFilters: () => void
}

export const useInterviewFilterStore = create<InterviewFilterState>((set) => ({
  filters: {},

  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),

  resetFilters: () => set({ filters: {} }),
}))
