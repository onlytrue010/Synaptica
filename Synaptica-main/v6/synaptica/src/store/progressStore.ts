import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserProgress, BookmarkItem } from '@/types'

interface ProgressState extends UserProgress {
  addVisited:      (slug: string) => void
  addBookmark:     (item: BookmarkItem) => void
  removeBookmark:  (id: string) => void
  isBookmarked:    (id: string) => boolean
  addXP:           (amount: number) => void
  markQuizDone:    (id: string) => void
  resetProgress:   () => void
}

const defaultProgress: UserProgress = {
  visitedAlgorithms: [],
  bookmarks: [],
  completedQuizzes: [],
  xp: 0,
  level: 1,
  streak: 0,
  lastVisit: new Date().toISOString(),
}

const XP_PER_LEVEL = 500

function calcLevel(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      ...defaultProgress,

      addVisited: (slug) =>
        set((state) => ({
          visitedAlgorithms: state.visitedAlgorithms.includes(slug)
            ? state.visitedAlgorithms
            : [...state.visitedAlgorithms, slug],
          lastVisit: new Date().toISOString(),
        })),

      addBookmark: (item) =>
        set((state) => ({
          bookmarks: [...state.bookmarks, item],
        })),

      removeBookmark: (id) =>
        set((state) => ({
          bookmarks: state.bookmarks.filter((b) => b.id !== id),
        })),

      isBookmarked: (id) =>
        get().bookmarks.some((b) => b.id === id),

      addXP: (amount) =>
        set((state) => {
          const newXP = state.xp + amount
          return { xp: newXP, level: calcLevel(newXP) }
        }),

      markQuizDone: (id) =>
        set((state) => ({
          completedQuizzes: state.completedQuizzes.includes(id)
            ? state.completedQuizzes
            : [...state.completedQuizzes, id],
        })),

      resetProgress: () => set(defaultProgress),
    }),
    { name: 'synaptica-progress' }
  )
)
