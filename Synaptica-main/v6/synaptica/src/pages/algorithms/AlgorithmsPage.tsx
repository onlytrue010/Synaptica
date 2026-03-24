import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Search, SlidersHorizontal, X, LayoutGrid, List, ChevronDown, Zap } from 'lucide-react'
import Fuse from 'fuse.js'
import { SectionLabel, SectionTitle, Badge, Reveal } from '@components/ui/index'
import AlgorithmCard from '@components/algorithm/AlgorithmCard'
import { algorithms } from '@data/algorithms'
import { ALGORITHM_CATEGORIES } from '@constants/index'
import { useProgressStore } from '@store/progressStore'
import { useCompareStore } from '@store/filterStore'
import { useDebounce } from '@hooks/index'
import { cn, scoreColor } from '@utils/index'
import type { AlgorithmCategory, DataType } from '@/types'

// ─── FUSE SEARCH ────────────────────────────────────────────────
const fuse = new Fuse(algorithms, {
  keys: ['name', 'description', 'tags', 'subcategory', 'inventor'],
  threshold: 0.35,
  minMatchCharLength: 2,
})

// ─── CONSTANTS ──────────────────────────────────────────────────
const SORT_OPTIONS = [
  { value: 'name',     label: 'Name A–Z'      },
  { value: 'score',    label: 'Top Rated'     },
  { value: 'year',     label: 'Newest First'  },
  { value: 'year-asc', label: 'Oldest First'  },
  { value: 'category', label: 'Category'      },
]

const DATA_TYPE_OPTIONS: { value: DataType; label: string }[] = [
  { value: 'tabular',    label: 'Tabular'     },
  { value: 'text',       label: 'Text / NLP'  },
  { value: 'image',      label: 'Image / CV'  },
  { value: 'timeseries', label: 'Time Series' },
  { value: 'graph',      label: 'Graph'       },
  { value: 'audio',      label: 'Audio'       },
]

const MIN_SCORE_OPTIONS = [
  { value: 0,  label: 'Any score'  },
  { value: 60, label: '60+ score'  },
  { value: 70, label: '70+ score'  },
  { value: 80, label: '80+ score'  },
  { value: 90, label: '90+ score'  },
]

// ─── STAT BANNER ────────────────────────────────────────────────
const STATS = [
  { value: algorithms.length,                                          label: 'algorithms' },
  { value: [...new Set(algorithms.map((a) => a.category))].length,    label: 'categories' },
  { value: algorithms.filter((a) => a.hasVisualization).length,       label: 'with viz'   },
  { value: Math.round(algorithms.reduce((s, a) => s + a.overallScore, 0) / algorithms.length), label: 'avg score'  },
]

// ─── LIST ROW COMPONENT ─────────────────────────────────────────
function AlgorithmRow({ algo, index }: { algo: typeof algorithms[number]; index: number }) {
  const navigate = useNavigate()
  const { isBookmarked, addBookmark, removeBookmark, addXP } = useProgressStore()
  const { isInCompare, addToCompare, removeFromCompare, canAddMore } = useCompareStore()
  const bookmarked = isBookmarked(algo.id)
  const comparing  = isInCompare(algo.slug)

  return (
    <Reveal delay={index * 25}>
      <div
        className="flex items-center gap-4 px-5 py-3.5 border-b cursor-pointer group transition-all duration-200 hover:bg-[var(--color-surface-1)]"
        style={{ borderColor: 'var(--color-border)' }}
        onClick={() => { navigate(`/algorithms/${algo.slug}`); addXP(10) }}
      >
        {/* Name + category */}
        <div className="flex items-center gap-3 w-[240px] flex-shrink-0">
          <Badge category={algo.category} className="hidden sm:inline-flex">{algo.subcategory}</Badge>
          <span className="text-sm font-medium group-hover:text-amber-400 transition-colors truncate"
            style={{ color: 'var(--color-text-1)' }}>
            {algo.name}
          </span>
        </div>
        {/* Year */}
        <span className="text-xs font-mono w-12 flex-shrink-0 hidden md:block"
          style={{ color: 'var(--color-text-3)' }}>{algo.year}</span>
        {/* Tags */}
        <div className="hidden lg:flex gap-1.5 flex-1 flex-wrap">
          {algo.tags.slice(0, 3).map((t) => (
            <span key={t} className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded"
              style={{ background: 'var(--color-surface-3)', color: 'var(--color-text-3)' }}>
              {t}
            </span>
          ))}
        </div>
        {/* Scores */}
        <div className="flex gap-3 items-center ml-auto">
          {(['accuracy', 'speed', 'scalability'] as const).map((k) => (
            <span key={k} className={`text-xs font-mono hidden xl:block ${scoreColor(algo.ratings[k])}`}>
              {algo.ratings[k]}
            </span>
          ))}
          <span className="text-sm font-mono font-medium w-8 text-right" style={{ color: 'var(--color-amber)' }}>
            {algo.overallScore}
          </span>
        </div>
      </div>
    </Reveal>
  )
}

// ─── ADVANCED FILTER PANEL ──────────────────────────────────────
interface Filters {
  category: AlgorithmCategory | 'all'
  dataType:  DataType | 'all'
  minScore:  number
  hasViz:    boolean
  yearFrom:  number
  yearTo:    number
}

const DEFAULT_FILTERS: Filters = {
  category:  'all',
  dataType:  'all',
  minScore:  0,
  hasViz:    false,
  yearFrom:  1950,
  yearTo:    2024,
}

function FilterPanel({
  filters,
  onChange,
  onReset,
  activeCount,
}: {
  filters: Filters
  onChange: (f: Partial<Filters>) => void
  onReset: () => void
  activeCount: number
}) {
  return (
    <div
      className="rounded-xl border p-5 mb-6 space-y-5"
      style={{ background: 'var(--color-surface-1)', borderColor: 'var(--color-border)' }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-3)' }}>
          Advanced Filters
          {activeCount > 0 && (
            <span className="ml-2 px-1.5 py-0.5 rounded-full text-[10px]"
              style={{ background: 'var(--color-amber)', color: '#080808' }}>
              {activeCount} active
            </span>
          )}
        </span>
        {activeCount > 0 && (
          <button onClick={onReset} className="text-xs" style={{ color: 'var(--color-text-3)' }}>
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Data type */}
        <div>
          <label className="block text-xs mb-1.5" style={{ color: 'var(--color-text-3)' }}>Data type</label>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => onChange({ dataType: 'all' })}
              className={cn('px-2.5 py-1 rounded text-[10px] border transition-all', filters.dataType === 'all' ? 'border-amber-500/40 bg-amber-500/10 text-amber-400' : 'border-transparent')}
              style={{ color: filters.dataType === 'all' ? undefined : 'var(--color-text-3)' }}
            >All</button>
            {DATA_TYPE_OPTIONS.map((dt) => (
              <button
                key={dt.value}
                onClick={() => onChange({ dataType: dt.value })}
                className={cn('px-2.5 py-1 rounded text-[10px] border transition-all', filters.dataType === dt.value ? 'border-amber-500/40 bg-amber-500/10 text-amber-400' : 'border-transparent')}
                style={{ color: filters.dataType === dt.value ? undefined : 'var(--color-text-3)' }}
              >{dt.label}</button>
            ))}
          </div>
        </div>

        {/* Min score */}
        <div>
          <label className="block text-xs mb-1.5" style={{ color: 'var(--color-text-3)' }}>Min overall score</label>
          <div className="flex flex-wrap gap-1">
            {MIN_SCORE_OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => onChange({ minScore: o.value })}
                className={cn('px-2.5 py-1 rounded text-[10px] border transition-all', filters.minScore === o.value ? 'border-amber-500/40 bg-amber-500/10 text-amber-400' : 'border-transparent')}
                style={{ color: filters.minScore === o.value ? undefined : 'var(--color-text-3)' }}
              >{o.label}</button>
            ))}
          </div>
        </div>

        {/* Year range */}
        <div>
          <label className="block text-xs mb-1.5" style={{ color: 'var(--color-text-3)' }}>
            Year range: {filters.yearFrom} – {filters.yearTo}
          </label>
          <div className="flex gap-2 items-center">
            <input type="range" min={1950} max={2024} step={5}
              value={filters.yearFrom}
              onChange={(e) => onChange({ yearFrom: +e.target.value })}
              style={{ width: '100%' }}
            />
            <input type="range" min={1950} max={2024} step={1}
              value={filters.yearTo}
              onChange={(e) => onChange({ yearTo: +e.target.value })}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {/* Extras */}
        <div>
          <label className="block text-xs mb-1.5" style={{ color: 'var(--color-text-3)' }}>Extras</label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.hasViz}
              onChange={(e) => onChange({ hasViz: e.target.checked })}
            />
            <span className="text-xs" style={{ color: 'var(--color-text-2)' }}>
              Has interactive visualization
            </span>
          </label>
        </div>
      </div>
    </div>
  )
}

// ─── PAGE ───────────────────────────────────────────────────────
export default function AlgorithmsPage() {
  const [search, setSearch]           = useState('')
  const [activeCategory, setCategory] = useState<AlgorithmCategory | 'all'>('all')
  const [sortBy, setSortBy]           = useState('score')
  const [viewMode, setViewMode]       = useState<'grid' | 'list'>('grid')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [filters, setFilters]         = useState<Filters>(DEFAULT_FILTERS)

  const debouncedSearch = useDebounce(search, 250)

  const activeFilterCount = useMemo(() => {
    let n = 0
    if (filters.dataType !== 'all') n++
    if (filters.minScore > 0) n++
    if (filters.hasViz) n++
    if (filters.yearFrom !== 1950 || filters.yearTo !== 2024) n++
    return n
  }, [filters])

  const filtered = useMemo(() => {
    let list = debouncedSearch.trim().length > 1
      ? fuse.search(debouncedSearch).map((r) => r.item)
      : [...algorithms]

    if (activeCategory !== 'all') list = list.filter((a) => a.category === activeCategory)
    if (filters.dataType !== 'all') list = list.filter((a) => a.dataTypes[filters.dataType as DataType] === 'native')
    if (filters.minScore > 0) list = list.filter((a) => a.overallScore >= filters.minScore)
    if (filters.hasViz) list = list.filter((a) => a.hasVisualization)
    list = list.filter((a) => a.year >= filters.yearFrom && a.year <= filters.yearTo)

    list.sort((a, b) => {
      if (sortBy === 'score')    return b.overallScore - a.overallScore
      if (sortBy === 'year')     return b.year - a.year
      if (sortBy === 'year-asc') return a.year - b.year
      if (sortBy === 'category') return a.category.localeCompare(b.category)
      return a.name.localeCompare(b.name)
    })
    return list
  }, [debouncedSearch, activeCategory, sortBy, filters])

  return (
    <>
      <Helmet>
        <title>Algorithms — Synaptica</title>
        <meta name="description" content="Browse 68+ machine learning algorithms with interactive visualizations, ratings, code examples, and interview questions." />
      </Helmet>

      {/* ── HEADER ─────────────────────────────────────── */}
      <div className="border-b py-14 px-6 sm:px-10 lg:px-16"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-1)' }}>
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

          {/* ── STAT ROW ── */}
          <Reveal delay={220}>
            <div className="flex gap-6 mt-6 flex-wrap">
              {STATS.map((s) => (
                <div key={s.label}>
                  <div className="text-2xl font-mono font-medium" style={{ color: 'var(--color-amber)' }}>
                    {s.value}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--color-text-3)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>

      {/* ── STICKY FILTER BAR ──────────────────────────── */}
      <div
        className="sticky top-[58px] z-40 border-b py-3 px-6 sm:px-10 lg:px-16"
        style={{ background: 'var(--color-nav-bg)', backdropFilter: 'blur(16px)', borderColor: 'var(--color-border)' }}
      >
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row gap-3 items-start sm:items-center">

          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--color-text-3)' }} />
            <input
              type="text"
              placeholder="Search by name, tag, inventor…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border outline-none focus:border-amber-500/50 transition-colors"
              style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border-2)', color: 'var(--color-text-1)' }}
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--color-text-3)' }}>
                <X size={13} />
              </button>
            )}
          </div>

          {/* Category pills */}
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => setCategory('all')}
              className={cn('px-3 py-1 rounded-full text-xs font-medium border transition-all',
                activeCategory === 'all' ? 'border-amber-500/40 text-amber-400 bg-amber-500/10' : 'border-transparent')}
              style={{ color: activeCategory === 'all' ? undefined : 'var(--color-text-3)' }}
            >All</button>
            {ALGORITHM_CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value as AlgorithmCategory)}
                className={cn('px-3 py-1 rounded-full text-xs font-medium border transition-all',
                  activeCategory === cat.value ? 'border-amber-500/40 text-amber-400 bg-amber-500/10' : 'border-transparent')}
                style={{ color: activeCategory === cat.value ? undefined : 'var(--color-text-3)' }}
              >{cat.label}</button>
            ))}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2 ml-auto flex-shrink-0">
            {/* Advanced filter toggle */}
            <button
              onClick={() => setFiltersOpen((v) => !v)}
              className={cn(
                'flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all',
                filtersOpen ? 'border-amber-500/40 bg-amber-500/10 text-amber-400' : ''
              )}
              style={{
                borderColor: filtersOpen ? undefined : 'var(--color-border-2)',
                color: filtersOpen ? undefined : 'var(--color-text-2)',
              }}
            >
              <SlidersHorizontal size={12} />
              Filters
              {activeFilterCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold"
                  style={{ background: 'var(--color-amber)', color: '#080808' }}>
                  {activeFilterCount}
                </span>
              )}
              <ChevronDown size={11} className={cn('transition-transform', filtersOpen && 'rotate-180')} />
            </button>

            {/* Sort */}
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

            {/* View toggle */}
            <div className="flex rounded-lg border overflow-hidden" style={{ borderColor: 'var(--color-border-2)' }}>
              <button
                onClick={() => setViewMode('grid')}
                className={cn('p-1.5 transition-all', viewMode === 'grid' ? 'bg-amber-500/10' : '')}
                style={{ color: viewMode === 'grid' ? 'var(--color-amber)' : 'var(--color-text-3)' }}
              ><LayoutGrid size={14} /></button>
              <button
                onClick={() => setViewMode('list')}
                className={cn('p-1.5 transition-all', viewMode === 'list' ? 'bg-amber-500/10' : '')}
                style={{ color: viewMode === 'list' ? 'var(--color-amber)' : 'var(--color-text-3)' }}
              ><List size={14} /></button>
            </div>

            <span className="text-xs font-mono" style={{ color: 'var(--color-text-3)' }}>
              {filtered.length} results
            </span>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ───────────────────────────────── */}
      <div className="py-8 px-6 sm:px-10 lg:px-16 max-w-[1400px] mx-auto">

        {/* Advanced filter panel */}
        {filtersOpen && (
          <FilterPanel
            filters={filters}
            onChange={(f) => setFilters((prev) => ({ ...prev, ...f }))}
            onReset={() => setFilters(DEFAULT_FILTERS)}
            activeCount={activeFilterCount}
          />
        )}

        {/* List view header */}
        {viewMode === 'list' && filtered.length > 0 && (
          <div className="flex items-center gap-4 px-5 pb-2 border-b text-[10px] uppercase tracking-widest"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-3)' }}>
            <span className="w-[240px] flex-shrink-0">Algorithm</span>
            <span className="w-12 flex-shrink-0 hidden md:block">Year</span>
            <span className="flex-1 hidden lg:block">Tags</span>
            <div className="flex gap-3 ml-auto">
              <span className="hidden xl:block w-8 text-right">Acc</span>
              <span className="hidden xl:block w-8 text-right">Spd</span>
              <span className="hidden xl:block w-8 text-right">Scl</span>
              <span className="w-8 text-right">Score</span>
            </div>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <Zap size={32} className="mx-auto mb-4 opacity-20" style={{ color: 'var(--color-amber)' }} />
            <p className="text-base mb-1" style={{ color: 'var(--color-text-2)' }}>No algorithms matched</p>
            <p className="text-sm mb-6" style={{ color: 'var(--color-text-3)' }}>
              Try different search terms or clear your filters
            </p>
            <button
              onClick={() => { setSearch(''); setCategory('all'); setFilters(DEFAULT_FILTERS) }}
              className="text-sm px-4 py-2 rounded-lg border transition-all hover:bg-amber-500/10"
              style={{ color: 'var(--color-amber)', borderColor: 'rgba(245,158,11,0.3)' }}
            >
              Clear all filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((algo, i) => (
              <AlgorithmCard key={algo.id} algo={algo} index={i} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border overflow-hidden"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-card-bg)' }}>
            {filtered.map((algo, i) => (
              <AlgorithmRow key={algo.id} algo={algo} index={i} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}