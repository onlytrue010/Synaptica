import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Filter, ChevronRight } from 'lucide-react'
import { SectionLabel, SectionTitle, Reveal } from '@components/ui/index'
import { algorithms } from '@data/algorithms'
import { DATA_TYPES, CATEGORY_STYLES } from '@constants/index'
import type { DataType, DataTypeSupport } from '@/types'

// Support icons and colors
const SUPPORT_CONFIG = {
  native:         { icon: '✓', label: 'Native',    bg: 'rgba(16,185,129,0.12)',  color: '#10b981', border: 'rgba(16,185,129,0.3)' },
  adapted:        { icon: '~', label: 'Adapted',   bg: 'rgba(245,158,11,0.10)',  color: '#f59e0b', border: 'rgba(245,158,11,0.3)' },
  'not-suitable': { icon: '✗', label: 'No',        bg: 'rgba(244,63,94,0.07)',   color: '#f43f5e', border: 'rgba(244,63,94,0.15)' },
}

const DATA_TYPE_ICONS: Record<string, string> = {
  tabular:    '📊',
  text:       '📝',
  image:      '🖼',
  timeseries: '📈',
  graph:      '🕸',
  audio:      '🎵',
  video:      '🎬',
}

// Score how well an algorithm handles a data type
function supportScore(s: DataTypeSupport): number {
  return s === 'native' ? 2 : s === 'adapted' ? 1 : 0
}

export default function DataMatrixPage() {
  const navigate  = useNavigate()
  const [filterDT, setFilterDT]       = useState<DataType | 'all'>('all')
  const [filterSupport, setSupport]   = useState<DataTypeSupport | 'all'>('all')
  const [filterCat, setFilterCat]     = useState('all')
  const [hoveredCell, setHoveredCell] = useState<{ algoIdx: number; dtIdx: number } | null>(null)
  const [search, setSearch]           = useState('')

  const filtered = useMemo(() => {
    let list = [...algorithms]
    if (search)        list = list.filter((a) => a.name.toLowerCase().includes(search.toLowerCase()))
    if (filterCat !== 'all') list = list.filter((a) => a.category === filterCat)
    if (filterDT !== 'all') {
      list = list.filter((a) => {
        const s = a.dataTypes[filterDT]
        return filterSupport === 'all' ? s !== 'not-suitable' : s === filterSupport
      })
    }
    return list
  }, [search, filterCat, filterDT, filterSupport])

  // Summary counts per data type
  const dtSummary = useMemo(() =>
    DATA_TYPES.map((dt) => ({
      ...dt,
      native:  algorithms.filter((a) => a.dataTypes[dt.value as DataType] === 'native').length,
      adapted: algorithms.filter((a) => a.dataTypes[dt.value as DataType] === 'adapted').length,
    })),
    []
  )

  const categories = ['all', ...Array.from(new Set(algorithms.map((a) => a.category)))]

  return (
    <>
      <Helmet>
        <title>Data Matrix — Synaptica</title>
        <meta name="description" content="Interactive matrix showing which ML algorithms work with which data types: tabular, text, image, time series, graph, audio, video." />
      </Helmet>

      {/* Header */}
      <div className="border-b py-14 px-6 sm:px-10 lg:px-16" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-1)' }}>
        <div className="max-w-[1400px] mx-auto">
          <Reveal><SectionLabel>Data Matrix</SectionLabel></Reveal>
          <Reveal delay={80}>
            <SectionTitle>Algorithm × <em style={{ color: 'var(--color-amber)', fontStyle: 'italic' }}>Data Type</em></SectionTitle>
          </Reveal>
          <Reveal delay={160}>
            <p className="text-base mt-3 max-w-xl" style={{ color: 'var(--color-text-2)' }}>
              Find which algorithms work with your data type instantly. Filter by data type to see every compatible algorithm with support level.
            </p>
          </Reveal>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 py-10">

        {/* Data type summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-10">
          {dtSummary.map((dt, i) => (
            <Reveal key={dt.value} delay={i * 40}>
              <button
                onClick={() => setFilterDT(filterDT === dt.value as DataType ? 'all' : dt.value as DataType)}
                className="rounded-xl border p-3 text-center transition-all duration-200 hover:-translate-y-0.5 w-full"
                style={{
                  background: filterDT === dt.value ? 'rgba(245,158,11,0.1)' : 'var(--color-card-bg)',
                  borderColor: filterDT === dt.value ? 'rgba(245,158,11,0.4)' : 'var(--color-border)',
                }}>
                <div className="text-2xl mb-2">{DATA_TYPE_ICONS[dt.value]}</div>
                <div className="text-xs font-medium mb-2" style={{ color: 'var(--color-text-1)' }}>{dt.label}</div>
                <div className="flex justify-center gap-2 text-[10px]">
                  <span style={{ color: '#10b981' }}>{dt.native}✓</span>
                  <span style={{ color: '#f59e0b' }}>{dt.adapted}~</span>
                </div>
              </button>
            </Reveal>
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <span className="text-xs" style={{ color: 'var(--color-text-3)' }}>Legend:</span>
          {Object.entries(SUPPORT_CONFIG).map(([k, v]) => (
            <div key={k} className="flex items-center gap-1.5 text-xs">
              <span className="w-5 h-5 rounded flex items-center justify-center text-[11px] font-bold"
                style={{ background: v.bg, color: v.color, border: `1px solid ${v.border}` }}>
                {v.icon}
              </span>
              <span style={{ color: 'var(--color-text-2)' }}>{v.label}</span>
            </div>
          ))}
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap gap-3 items-center mb-6">
          <input type="text" placeholder="Filter algorithms…" value={search} onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border outline-none"
            style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border-2)', color: 'var(--color-text-1)', minWidth: 160 }} />

          <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}
            className="text-xs py-1.5 px-2.5 rounded-lg border outline-none"
            style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border-2)', color: 'var(--color-text-2)' }}>
            {categories.map((c) => <option key={c} value={c}>{c === 'all' ? 'All categories' : c}</option>)}
          </select>

          {filterDT !== 'all' && (
            <select value={filterSupport} onChange={(e) => setSupport(e.target.value as DataTypeSupport | 'all')}
              className="text-xs py-1.5 px-2.5 rounded-lg border outline-none"
              style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border-2)', color: 'var(--color-text-2)' }}>
              <option value="all">Any support</option>
              <option value="native">Native only</option>
              <option value="adapted">Adapted only</option>
            </select>
          )}

          <span className="text-xs font-mono ml-auto" style={{ color: 'var(--color-text-3)' }}>
            {filtered.length} algorithm{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Matrix table */}
        <Reveal>
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
            <div className="overflow-x-auto">
              <table className="w-full" style={{ minWidth: 780 }}>
                <thead>
                  <tr style={{ background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)' }}>
                    <th className="text-left py-3 px-4 text-xs font-medium sticky left-0 z-10"
                      style={{ color: 'var(--color-text-2)', background: 'var(--color-surface-2)', minWidth: 200 }}>
                      Algorithm
                    </th>
                    {DATA_TYPES.map((dt) => (
                      <th key={dt.value}
                        className="py-3 px-3 text-center text-xs font-medium cursor-pointer transition-colors"
                        style={{
                          color: filterDT === dt.value ? 'var(--color-amber)' : 'var(--color-text-2)',
                          minWidth: 80,
                        }}
                        onClick={() => setFilterDT(filterDT === dt.value as DataType ? 'all' : dt.value as DataType)}
                        title={`Filter by ${dt.label}`}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-base">{DATA_TYPE_ICONS[dt.value]}</span>
                          <span className="text-[10px]">{dt.label.split(' ')[0]}</span>
                        </div>
                      </th>
                    ))}
                    <th className="py-3 px-4 text-center text-xs font-medium" style={{ color: 'var(--color-text-2)', minWidth: 60 }}>
                      Score
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((algo, ai) => {
                    const totalScore = DATA_TYPES.reduce((s, dt) => s + supportScore(algo.dataTypes[dt.value as DataType]), 0)
                    return (
                      <motion.tr
                        key={algo.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: ai * 0.02 }}
                        className="border-b cursor-pointer transition-all duration-150"
                        style={{
                          borderColor: 'var(--color-border)',
                          background: ai % 2 === 0 ? 'var(--color-card-bg)' : 'transparent',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-surface-2)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = ai % 2 === 0 ? 'var(--color-card-bg)' : 'transparent')}
                        onClick={() => navigate(`/algorithms/${algo.slug}`)}
                      >
                        {/* Algorithm name cell */}
                        <td className="py-3 px-4 sticky left-0 z-10"
                          style={{ background: 'inherit' }}>
                          <div className="flex items-center gap-2">
                            <div>
                              <div className="text-xs font-medium" style={{ color: 'var(--color-text-1)' }}>{algo.name}</div>
                              <div className={`text-[10px] font-mono capitalize mt-0.5 ${(CATEGORY_STYLES as Record<string, string>)[algo.category] ?? ''}`}>
                                {algo.category}
                              </div>
                            </div>
                            <ChevronRight size={12} className="ml-auto opacity-30" style={{ color: 'var(--color-text-3)' }} />
                          </div>
                        </td>

                        {/* Data type cells */}
                        {DATA_TYPES.map((dt, di) => {
                          const support = algo.dataTypes[dt.value as DataType]
                          const cfg     = SUPPORT_CONFIG[support]
                          const isHov   = hoveredCell?.algoIdx === ai && hoveredCell?.dtIdx === di
                          const isFilt  = filterDT === dt.value

                          return (
                            <td key={dt.value} className="py-3 px-3 text-center"
                              onMouseEnter={() => setHoveredCell({ algoIdx: ai, dtIdx: di })}
                              onMouseLeave={() => setHoveredCell(null)}>
                              <div
                                className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold transition-all duration-150"
                                style={{
                                  background: isFilt ? cfg.bg : isHov ? cfg.bg : `${cfg.bg}`,
                                  color: cfg.color,
                                  border: `1px solid ${isHov || isFilt ? cfg.border : 'transparent'}`,
                                  transform: isHov ? 'scale(1.2)' : 'scale(1)',
                                  opacity: filterDT !== 'all' && filterDT !== dt.value ? 0.3 : 1,
                                }}
                                title={`${algo.name} + ${dt.label}: ${cfg.label}`}
                              >
                                {cfg.icon}
                              </div>
                            </td>
                          )
                        })}

                        {/* Compatibility score */}
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex items-center justify-center">
                            <div className="text-sm font-bold font-mono"
                              style={{ color: totalScore >= 8 ? '#10b981' : totalScore >= 5 ? '#f59e0b' : '#f43f5e' }}>
                              {totalScore}
                            </div>
                            <span className="text-[9px] ml-0.5" style={{ color: 'var(--color-text-3)' }}>/14</span>
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>

        {/* Selected data type deep dive */}
        {filterDT !== 'all' && (
          <Reveal>
            <div className="mt-8 rounded-xl border p-6" style={{ background: 'var(--color-surface-1)', borderColor: 'var(--color-border)' }}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{DATA_TYPE_ICONS[filterDT]}</span>
                <div>
                  <h3 className="text-sm font-medium" style={{ color: 'var(--color-text-1)' }}>
                    {DATA_TYPES.find((d) => d.value === filterDT)?.label} — Best Algorithms
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--color-text-3)' }}>
                    Ranked by native support + overall score
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {algorithms
                  .filter((a) => a.dataTypes[filterDT] !== 'not-suitable')
                  .sort((a, b) => supportScore(b.dataTypes[filterDT]) - supportScore(a.dataTypes[filterDT]) || b.overallScore - a.overallScore)
                  .slice(0, 6)
                  .map((a) => {
                    const support = a.dataTypes[filterDT]
                    const cfg     = SUPPORT_CONFIG[support]
                    return (
                      <button key={a.slug} onClick={() => navigate(`/algorithms/${a.slug}`)}
                        className="flex items-center gap-3 p-3 rounded-lg border text-left transition-all hover:-translate-y-0.5"
                        style={{ background: 'var(--color-card-bg)', borderColor: 'var(--color-border)' }}>
                        <span className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
                          style={{ background: cfg.bg, color: cfg.color }}>{cfg.icon}</span>
                        <div className="min-w-0">
                          <div className="text-xs font-medium truncate" style={{ color: 'var(--color-text-1)' }}>{a.name}</div>
                          <div className="text-[10px]" style={{ color: cfg.color }}>{cfg.label}</div>
                        </div>
                        <div className="ml-auto text-xs font-mono font-bold flex-shrink-0" style={{ color: 'var(--color-amber)' }}>
                          {a.overallScore}
                        </div>
                      </button>
                    )
                  })}
              </div>
            </div>
          </Reveal>
        )}
      </div>
    </>
  )
}
