import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SearchState {
  isOpen:        boolean
  query:         string
  recentSearches: string[]
  openSearch:    () => void
  closeSearch:   () => void
  setQuery:      (q: string) => void
  addRecent:     (q: string) => void
  clearRecent:   () => void
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set) => ({
      isOpen:         false,
      query:          '',
      recentSearches: [],

      openSearch:  () => set({ isOpen: true,  query: '' }),
      closeSearch: () => set({ isOpen: false, query: '' }),
      setQuery:    (q) => set({ query: q }),

      addRecent: (q) =>
        set((s) => ({
          recentSearches: [q, ...s.recentSearches.filter((r) => r !== q)].slice(0, 8),
        })),

      clearRecent: () => set({ recentSearches: [] }),
    }),
    { name: 'synaptica-search' }
  )
)
