import { useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import Fuse from 'fuse.js'
import { SectionLabel, SectionTitle, Badge, Reveal } from '@components/ui/index'
import AlgorithmCard from '@components/algorithm/AlgorithmCard'
import { algorithms } from '@data/algorithms'
import { ALGORITHM_CATEGORIES } from '@constants/index'
import { useDebounce } from '@hooks/index'
import type { AlgorithmCategory } from '@/types'

const fuse = new Fuse(algorithms, {
  keys: ['name', 'description', 'tags', 'subcategory'],
  threshold: 0.35,
  minMatchCharLength: 2,
})

const SORT_OPTIONS = [
  { value: 'name',     label: 'Name A–Z'    },
  { value: 'score',    label: 'Top Rated'   },
  { value: 'year',     label: 'Newest'      },
  { value: 'category', label: 'Category'    },
]

export default function AlgorithmsPage() {
  const [search, setSearch]         = useState('')
  const [activeCategory, setCategory] = useState<AlgorithmCategory | 'all'>('all')
  const [sortBy, setSortBy]         = useState('name')
  const [filtersOpen, setFiltersOpen] = useState(false)

  const debouncedSearch = useDebounce(search, 250)

  const filtered = useMemo(() => {
    let list = debouncedSearch.trim().length > 1
      ? fuse.search(debouncedSearch).map((r) => r.item)
      : [...algorithms]

    if (activeCategory !== 'all') {
      list = list.filter((a) => a.category === activeCategory)
    }

    list.sort((a, b) => {
      if (sortBy === 'score')    return b.overallScore - a.overallScore
      if (sortBy === 'year')     return b.year - a.year
      if (sortBy === 'category') return a.category.localeCompare(b.category)
      return a.name.localeCompare(b.name)
    })

    return list
  }, [debouncedSearch, activeCategory, sortBy])

  return (
    <>
      <Helmet>
        <title>Algorithms — Synaptica</title>
        <meta name="description" content="Browse 68+ machine learning algorithms with interactive visualizations, ratings, code examples, and interview questions." />
      </Helmet>

      {/* Header */}
      <div className="border-b py-14 px-6 sm:px-10 lg:px-16" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-1)' }}>
        <div className="max-w-[1400px] mx-auto">
          <Reveal><SectionLabel>Algorithm Library</SectionLabel></Reveal>
          <Reveal delay={80}>
            <SectionTitle className="mb-3">
              All <em style={{ color: 'var(--color-amber)', fontStyle: 'italic' }}>68+</em> Algorithms
            </SectionTitle>
          </Reveal>
          <Reveal delay={160}>
            <p className="text-base max-w-lg" style={{ color: 'var(--color-text-2)' }}>
              Each with 7-dimension ratings, interactive visualizations, full math, code examples, and linked interview questions.
            </p>
          </Reveal>
        </div>
      </div>

      {/* Sticky filter bar */}
      <div className="sticky top-[58px] z-40 border-b py-3 px-6 sm:px-10 lg:px-16" style={{ background: 'var(--color-nav-bg)', backdropFilter: 'blur(16px)', borderColor: 'var(--color-border)' }}>
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row gap-3 items-start sm:items-center">

          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--color-text-3)' }} />
            <input
              type="text"
              placeholder="Search algorithms..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border outline-none focus:border-amber-500/50 transition-colors"
              style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border-2)', color: 'var(--color-text-1)' }}
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-3)' }}>
                <X size={13} />
              </button>
            )}
          </div>

          {/* Category pills */}
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => setCategory('all')}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${activeCategory === 'all' ? 'border-amber-500/40 text-amber-400 bg-amber-500/10' : 'border-transparent'}`}
              style={{ color: activeCategory === 'all' ? undefined : 'var(--color-text-3)' }}
            >
              All
            </button>
            {ALGORITHM_CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value as AlgorithmCategory)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${activeCategory === cat.value ? 'border-amber-500/40 text-amber-400 bg-amber-500/10' : 'border-transparent'}`}
                style={{ color: activeCategory === cat.value ? undefined : 'var(--color-text-3)' }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2 ml-auto">
            <SlidersHorizontal size={13} style={{ color: 'var(--color-text-3)' }} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs py-1.5 px-2 rounded-lg border outline-none"
              style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border-2)', color: 'var(--color-text-2)' }}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <span className="text-xs font-mono" style={{ color: 'var(--color-text-3)' }}>
              {filtered.length} results
            </span>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="py-10 px-6 sm:px-10 lg:px-16 max-w-[1400px] mx-auto">
        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-3xl mb-3">🔍</p>
            <p className="text-sm" style={{ color: 'var(--color-text-3)' }}>No algorithms matched "{search}"</p>
            <button onClick={() => { setSearch(''); setCategory('all') }} className="mt-4 text-sm underline" style={{ color: 'var(--color-amber)' }}>
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((algo, i) => (
              <AlgorithmCard key={algo.id} algo={algo} index={i} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
