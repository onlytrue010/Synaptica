import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { X, Plus, Trophy, TrendingUp, TrendingDown, Search } from 'lucide-react'
import { SectionLabel, SectionTitle, Badge, Card, Reveal } from '@components/ui/index'
import RadarChart from '@components/charts/RadarChart'
import { algorithms, getAlgorithmBySlug } from '@data/algorithms'
import { useCompareStore } from '@store/filterStore'
import { RATING_DIMENSIONS, DATA_TYPES } from '@constants/index'
import { cn, scoreColor } from '@utils/index'
import type { DataType, Algorithm } from '@/types'

// ─── CONSTANTS ──────────────────────────────────────────────────
const ALGO_COLORS = [
  { main: '#f59e0b', dim: 'rgba(245,158,11,0.12)', text: 'text-amber-400'  },
  { main: '#22d3ee', dim: 'rgba(34,211,238,0.12)',  text: 'text-cyan-400'  },
  { main: '#10b981', dim: 'rgba(16,185,129,0.12)',  text: 'text-emerald-400' },
  { main: '#c084fc', dim: 'rgba(192,132,252,0.12)', text: 'text-purple-400' },
]

const SUPPORT_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  native:        { icon: '✓', color: 'text-emerald-400', label: 'Native' },
  adapted:       { icon: '~', color: 'text-amber-400',   label: 'Adapted' },
  'not-suitable':{ icon: '✗', color: 'text-rose-400',    label: 'No'    },
}

// ─── HELPER: get winner index for a score array ──────────────────
function getWinnerIdx(scores: number[]): number {
  let best = -1, bestVal = -Infinity
  scores.forEach((v, i) => { if (v > bestVal) { bestVal = v; best = i } })
  return best
}

// ─── ALGORITHM SELECTOR DROPDOWN ────────────────────────────────
function AlgoSelector({
  selected,
  onAdd,
  canAdd,
}: {
  selected: Algorithm[]
  onAdd: (slug: string) => void
  canAdd: boolean
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const available = useMemo(() => {
    const selectedSlugs = new Set(selected.map((a) => a.slug))
    return algorithms.filter((a) => {
      if (selectedSlugs.has(a.slug)) return false
      if (!search) return true
      return a.name.toLowerCase().includes(search.toLowerCase()) ||
             a.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
    })
  }, [selected, search])

  if (!canAdd) return null

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed text-sm transition-all hover:border-amber-500/50 hover:bg-amber-500/5"
        style={{ borderColor: 'var(--color-border-2)', color: 'var(--color-text-3)' }}
      >
        <Plus size={15} /> Add algorithm
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-2 w-72 rounded-xl border z-50"
          style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border-2)', boxShadow: '0 16px 48px rgba(0,0,0,0.35)' }}
        >
          <div className="p-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-3)' }} />
              <input
                autoFocus
                type="text"
                placeholder="Search algorithms…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border outline-none"
                style={{ background: 'var(--color-surface-3)', borderColor: 'var(--color-border)', color: 'var(--color-text-1)' }}
              />
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto py-1">
            {available.length === 0 ? (
              <p className="text-center py-4 text-xs" style={{ color: 'var(--color-text-3)' }}>No results</p>
            ) : available.map((a) => (
              <button
                key={a.slug}
                onClick={() => { onAdd(a.slug); setOpen(false); setSearch('') }}
                className="w-full text-left px-3 py-2 text-xs transition-colors hover:bg-amber-500/10 flex items-center gap-2"
                style={{ color: 'var(--color-text-2)' }}
              >
                <Badge category={a.category} className="text-[9px]">{a.subcategory}</Badge>
                {a.name}
                <span className="ml-auto font-mono" style={{ color: 'var(--color-amber)' }}>{a.overallScore}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── SCORE COMPARISON SECTION ───────────────────────────────────
function DimensionComparison({ selected }: { selected: Algorithm[] }) {
  return (
    <Card className="overflow-hidden mb-6">
      <div className="px-6 pt-5 pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <SectionLabel>Dimension-by-Dimension Breakdown</SectionLabel>
        <p className="text-xs mt-1" style={{ color: 'var(--color-text-3)' }}>
          Trophy = winner in that dimension. Bars show relative performance.
        </p>
      </div>

      <div className="p-6 space-y-5">
        {RATING_DIMENSIONS.map((dim) => {
          const scores = selected.map((a) => a.ratings[dim.key as keyof typeof a.ratings] as number)
          const winnerIdx = getWinnerIdx(scores)
          const max = Math.max(...scores)

          return (
            <div key={dim.key}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium" style={{ color: 'var(--color-text-2)' }}>{dim.label}</span>
              </div>
              <div className="space-y-1.5">
                {selected.map((algo, i) => {
                  const val = scores[i]
                  const isWinner = i === winnerIdx
                  const col = ALGO_COLORS[i % ALGO_COLORS.length]
                  return (
                    <div key={algo.slug} className="flex items-center gap-3">
                      <div className="w-28 flex-shrink-0 flex items-center gap-1.5">
                        {isWinner && scores.filter((s) => s === max).length === 1 && (
                          <Trophy size={10} className="text-amber-400 flex-shrink-0" />
                        )}
                        <span className="text-[11px] truncate" style={{ color: col.main }}>{algo.shortName ?? algo.name}</span>
                      </div>
                      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-surface-3)' }}>
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${val}%`, background: col.main, opacity: isWinner ? 1 : 0.55 }}
                        />
                      </div>
                      <span className={cn('text-xs font-mono w-8 text-right', isWinner ? scoreColor(val) : '')}
                        style={{ color: isWinner ? undefined : 'var(--color-text-3)' }}>
                        {val}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

// ─── PROS / CONS DIFF ───────────────────────────────────────────
function ProsConsSection({ selected }: { selected: Algorithm[] }) {
  return (
    <Card className="overflow-hidden mb-6">
      <div className="px-6 pt-5 pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <SectionLabel>Strengths & Weaknesses</SectionLabel>
      </div>
      <div
        className="grid divide-x divide-[var(--color-border)]"
        style={{
          gridTemplateColumns: `repeat(${selected.length}, 1fr)`,
        }}
      >
        {selected.map((algo, i) => {
          const col = ALGO_COLORS[i % ALGO_COLORS.length]
          return (
            <div key={algo.slug} className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: col.main }} />
                <span className="text-sm font-medium" style={{ color: 'var(--color-text-1)' }}>
                  {algo.shortName ?? algo.name}
                </span>
              </div>
              <div className="space-y-2 mb-4">
                {algo.pros.slice(0, 4).map((p, pi) => (
                  <div key={pi} className="flex items-start gap-2">
                    <TrendingUp size={11} className="mt-0.5 flex-shrink-0 text-emerald-400" />
                    <span className="text-xs leading-relaxed" style={{ color: 'var(--color-text-2)' }}>{p}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {algo.cons.slice(0, 3).map((c, ci) => (
                  <div key={ci} className="flex items-start gap-2">
                    <TrendingDown size={11} className="mt-0.5 flex-shrink-0 text-rose-400" />
                    <span className="text-xs leading-relaxed" style={{ color: 'var(--color-text-3)' }}>{c}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

// ─── COMPLEXITY TABLE ───────────────────────────────────────────
function ComplexitySection({ selected }: { selected: Algorithm[] }) {
  return (
    <Card className="overflow-hidden mb-6">
      <div className="px-6 pt-5 pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <SectionLabel>Complexity & Scale</SectionLabel>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ minWidth: `${selected.length * 180}px` }}>
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--color-border)' }}>
              <th className="text-left p-4 text-xs uppercase tracking-wide" style={{ color: 'var(--color-text-3)', width: 140 }}>Metric</th>
              {selected.map((a, i) => (
                <th key={a.slug} className="p-4 text-left text-xs font-medium" style={{ color: ALGO_COLORS[i % 4].main }}>
                  {a.shortName ?? a.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { label: 'Time complexity',   key: 'time'           as const },
              { label: 'Space complexity',  key: 'space'          as const },
              { label: 'Scale note',        key: 'trainingNote'   as const },
            ].map((row) => (
              <tr key={row.key} className="border-b" style={{ borderColor: 'var(--color-border)' }}>
                <td className="p-4 text-xs" style={{ color: 'var(--color-text-3)' }}>{row.label}</td>
                {selected.map((a) => (
                  <td key={a.slug} className="p-4 text-xs font-mono" style={{ color: 'var(--color-text-2)' }}>
                    {a.complexity[row.key]}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="border-b" style={{ borderColor: 'var(--color-border)' }}>
              <td className="p-4 text-xs" style={{ color: 'var(--color-text-3)' }}>Year invented</td>
              {selected.map((a) => (
                <td key={a.slug} className="p-4 text-xs font-mono" style={{ color: 'var(--color-text-2)' }}>{a.year}</td>
              ))}
            </tr>
            <tr>
              <td className="p-4 text-xs" style={{ color: 'var(--color-text-3)' }}>Inventor</td>
              {selected.map((a) => (
                <td key={a.slug} className="p-4 text-xs" style={{ color: 'var(--color-text-2)' }}>{a.inventor ?? '—'}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  )
}

// ─── DATA TYPE SUPPORT ──────────────────────────────────────────
function DataTypeSection({ selected }: { selected: Algorithm[] }) {
  return (
    <Card className="overflow-x-auto mb-6">
      <div className="px-6 pt-5 pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <SectionLabel>Data Type Compatibility</SectionLabel>
        <div className="flex gap-4 mt-2">
          {Object.entries(SUPPORT_CONFIG).map(([k, v]) => (
            <div key={k} className="flex items-center gap-1.5">
              <span className={`text-sm font-mono ${v.color}`}>{v.icon}</span>
              <span className="text-xs" style={{ color: 'var(--color-text-3)' }}>{v.label}</span>
            </div>
          ))}
        </div>
      </div>
      <table className="w-full text-sm" style={{ minWidth: `${selected.length * 140}px` }}>
        <thead>
          <tr className="border-b" style={{ borderColor: 'var(--color-border)' }}>
            <th className="text-left p-4 text-xs uppercase tracking-wide pr-6"
              style={{ color: 'var(--color-text-3)', width: 140 }}>Data Type</th>
            {selected.map((a, i) => (
              <th key={a.slug} className="p-4 text-center text-xs font-medium" style={{ color: ALGO_COLORS[i % 4].main }}>
                {a.shortName ?? a.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DATA_TYPES.map((dt) => (
            <tr key={dt.value} className="border-b" style={{ borderColor: 'var(--color-border)' }}>
              <td className="p-3 pr-6 text-xs" style={{ color: 'var(--color-text-2)' }}>
                <span className="mr-1.5">{dt.icon}</span>{dt.label}
              </td>
              {selected.map((a) => {
                const sup = a.dataTypes[dt.value as DataType]
                const cfg = SUPPORT_CONFIG[sup]
                return (
                  <td key={a.slug} className="p-3 text-center">
                    <span className={`text-sm font-mono font-medium ${cfg.color}`} title={cfg.label}>
                      {cfg.icon}
                    </span>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}

// ─── VERDICT SECTION ────────────────────────────────────────────
function VerdictSection({ selected }: { selected: Algorithm[] }) {
  const winner = selected.reduce((a, b) => a.overallScore >= b.overallScore ? a : b)
  const winnerIdx = selected.indexOf(winner)
  const col = ALGO_COLORS[winnerIdx % 4]

  return (
    <Card className="overflow-hidden mb-6 p-6">
      <SectionLabel className="mb-4">Quick Verdict</SectionLabel>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {selected.map((algo, i) => {
          const c = ALGO_COLORS[i % 4]
          const isOverallWinner = algo.slug === winner.slug
          return (
            <div
              key={algo.slug}
              className="p-4 rounded-xl border"
              style={{
                borderColor: isOverallWinner ? col.main + '60' : 'var(--color-border)',
                background: isOverallWinner ? col.dim : 'var(--color-surface-1)',
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                {isOverallWinner && <Trophy size={13} className="text-amber-400" />}
                <span className="text-sm font-medium" style={{ color: c.main }}>{algo.shortName ?? algo.name}</span>
                <span className="ml-auto text-xs font-mono font-bold" style={{ color: 'var(--color-amber)' }}>
                  {algo.overallScore}/100
                </span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-3)' }}>
                {algo.why.whyChooseThis[0]}
              </p>
              <div className="mt-3 flex gap-2 flex-wrap">
                {algo.useCases.slice(0, 2).map((uc, ui) => (
                  <span key={ui} className="text-[9px] font-mono px-2 py-0.5 rounded border"
                    style={{ background: 'var(--color-surface-3)', borderColor: 'var(--color-border)', color: 'var(--color-text-3)' }}>
                    {uc}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

// ─── PAGE ───────────────────────────────────────────────────────
export default function ComparePage() {
  const navigate = useNavigate()
  const { algorithms: selectedSlugs, addToCompare, removeFromCompare, canAddMore } = useCompareStore()
  const [activeSection, setActiveSection] = useState<'radar' | 'dimensions' | 'proscons' | 'complexity' | 'datatype' | 'verdict'>('radar')

  const selected = selectedSlugs.map((s) => getAlgorithmBySlug(s)).filter(Boolean) as Algorithm[]

  const NAV_SECTIONS = [
    { id: 'radar',      label: 'Radar'       },
    { id: 'dimensions', label: 'Dimensions'  },
    { id: 'proscons',   label: 'Pros & Cons' },
    { id: 'complexity', label: 'Complexity'  },
    { id: 'datatype',   label: 'Data Types'  },
    { id: 'verdict',    label: 'Verdict'     },
  ] as const

  return (
    <>
      <Helmet>
        <title>Compare Algorithms — Synaptica</title>
        <meta name="description" content="Side-by-side comparison of machine learning algorithms across 7 performance dimensions." />
      </Helmet>

      {/* ── HEADER ─────────────────────────────────────── */}
      <div className="border-b py-14 px-6 sm:px-10 lg:px-16"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-1)' }}>
        <div className="max-w-[1400px] mx-auto">
          <Reveal><SectionLabel>Comparison Tool</SectionLabel></Reveal>
          <Reveal delay={80}>
            <SectionTitle>
              Compare <em style={{ color: 'var(--color-amber)', fontStyle: 'italic' }}>Side by Side</em>
            </SectionTitle>
          </Reveal>
          <Reveal delay={160}>
            <p className="text-base mt-3" style={{ color: 'var(--color-text-2)' }}>
              Up to 4 algorithms · 7 dimensions · Pros/cons · Complexity · Data compatibility
            </p>
          </Reveal>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 py-10">

        {/* ── SELECTION ROW ───────────────────────────── */}
        <div className="flex flex-wrap gap-3 mb-8 items-center">
          {selected.map((algo, i) => {
            const col = ALGO_COLORS[i % 4]
            return (
              <div
                key={algo.slug}
                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border"
                style={{ background: col.dim, borderColor: col.main + '40' }}
              >
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: col.main }} />
                <div>
                  <div className="text-sm font-medium" style={{ color: 'var(--color-text-1)' }}>{algo.name}</div>
                  <div className="text-[10px] font-mono" style={{ color: 'var(--color-text-3)' }}>
                    {algo.category} · {algo.overallScore}/100
                  </div>
                </div>
                <button
                  onClick={() => removeFromCompare(algo.slug)}
                  className="ml-1 opacity-50 hover:opacity-100 transition-opacity"
                  style={{ color: 'var(--color-text-3)' }}
                >
                  <X size={13} />
                </button>
              </div>
            )
          })}
          <AlgoSelector selected={selected} onAdd={addToCompare} canAdd={canAddMore()} />
        </div>

        {selected.length === 0 ? (
          /* Empty state */
          <div className="text-center py-32 border rounded-2xl" style={{ borderColor: 'var(--color-border)', borderStyle: 'dashed' }}>
            <div className="text-5xl mb-5 opacity-30">⚖️</div>
            <p className="text-base mb-2" style={{ color: 'var(--color-text-2)' }}>No algorithms selected</p>
            <p className="text-sm mb-6" style={{ color: 'var(--color-text-3)' }}>
              Add algorithms above, or browse the library and click "Compare"
            </p>
            <button onClick={() => navigate('/algorithms')} className="btn-primary">
              Browse Algorithms
            </button>
          </div>
        ) : selected.length === 1 ? (
          <div className="text-center py-16 border rounded-2xl" style={{ borderColor: 'var(--color-border)', borderStyle: 'dashed' }}>
            <p className="text-sm" style={{ color: 'var(--color-text-3)' }}>
              Add at least one more algorithm to compare
            </p>
          </div>
        ) : (
          <>
            {/* ── SECTION NAV ────────────────────────── */}
            <div className="flex gap-1.5 flex-wrap mb-8 p-1 rounded-xl border w-fit"
              style={{ background: 'var(--color-surface-1)', borderColor: 'var(--color-border)' }}>
              {NAV_SECTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={cn(
                    'px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
                    activeSection === s.id
                      ? 'text-amber-400'
                      : ''
                  )}
                  style={{
                    background: activeSection === s.id ? 'var(--color-amber-dim)' : 'transparent',
                    color: activeSection === s.id ? 'var(--color-amber)' : 'var(--color-text-3)',
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* ── SECTIONS ───────────────────────────── */}
            {activeSection === 'radar' && (
              <Reveal>
                <Card className="p-6 mb-6">
                  <SectionLabel className="mb-4">Radar Comparison — All 7 Dimensions</SectionLabel>
                  <div className="flex flex-col lg:flex-row gap-6 items-start">
                    <RadarChart algorithms={selected} size={360} />
                    <div className="flex-1 space-y-3">
                      {selected.map((algo, i) => {
                        const col = ALGO_COLORS[i % 4]
                        const avgScore = Math.round(
                          Object.values(algo.ratings).reduce((s, v) => s + v, 0) / Object.values(algo.ratings).length
                        )
                        return (
                          <div key={algo.slug} className="flex items-center gap-3 p-3 rounded-lg"
                            style={{ background: col.dim, border: `1px solid ${col.main}30` }}>
                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: col.main }} />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate" style={{ color: 'var(--color-text-1)' }}>
                                {algo.name}
                              </div>
                              <div className="text-xs" style={{ color: 'var(--color-text-3)' }}>{algo.subcategory}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-mono font-medium" style={{ color: col.main }}>
                                {algo.overallScore}
                              </div>
                              <div className="text-[10px]" style={{ color: 'var(--color-text-3)' }}>overall</div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </Card>
              </Reveal>
            )}

            {activeSection === 'dimensions' && <DimensionComparison selected={selected} />}
            {activeSection === 'proscons'   && <ProsConsSection selected={selected} />}
            {activeSection === 'complexity' && <ComplexitySection selected={selected} />}
            {activeSection === 'datatype'   && <DataTypeSection selected={selected} />}
            {activeSection === 'verdict'    && <VerdictSection selected={selected} />}
          </>
        )}
      </div>
    </>
  )
}