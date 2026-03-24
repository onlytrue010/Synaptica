import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { X, Plus } from 'lucide-react'
import { SectionLabel, SectionTitle, Badge, ScoreBar, Card, Reveal } from '@components/ui/index'
import RadarChart from '@components/charts/RadarChart'
import { algorithms, getAlgorithmBySlug } from '@data/algorithms'
import { useCompareStore } from '@store/filterStore'
import { RATING_DIMENSIONS, DATA_TYPES } from '@constants/index'
import type { DataType } from '@/types'

const SUPPORT_ICON: Record<string, string> = {
  native: '✓', adapted: '~', 'not-suitable': '✗',
}
const SUPPORT_COLOR: Record<string, string> = {
  native: 'text-emerald-400', adapted: 'text-amber-400', 'not-suitable': 'text-rose-400',
}

export default function ComparePage() {
  const navigate = useNavigate()
  const { algorithms: selectedSlugs, addToCompare, removeFromCompare, canAddMore } = useCompareStore()

  const selected = selectedSlugs.map((s) => getAlgorithmBySlug(s)).filter(Boolean) as typeof algorithms

  const available = algorithms.filter((a) => !selectedSlugs.includes(a.slug))

  return (
    <>
      <Helmet>
        <title>Compare Algorithms — Synaptica</title>
        <meta name="description" content="Side-by-side comparison of machine learning algorithms across 7 performance dimensions." />
      </Helmet>

      {/* Header */}
      <div className="border-b py-14 px-6 sm:px-10 lg:px-16" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-1)' }}>
        <div className="max-w-[1400px] mx-auto">
          <Reveal><SectionLabel>Comparison Tool</SectionLabel></Reveal>
          <Reveal delay={80}>
            <SectionTitle>
              Compare <em style={{ color: 'var(--color-amber)', fontStyle: 'italic' }}>Side by Side</em>
            </SectionTitle>
          </Reveal>
          <Reveal delay={160}>
            <p className="text-base mt-3" style={{ color: 'var(--color-text-2)' }}>
              Select up to 4 algorithms to compare across all 7 performance dimensions.
            </p>
          </Reveal>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 py-10">

        {/* Selection row */}
        <div className="flex flex-wrap gap-3 mb-10">
          {selected.map((algo) => (
            <div
              key={algo.slug}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border"
              style={{ background: 'var(--color-surface-2)', borderColor: 'rgba(245,158,11,0.3)' }}
            >
              <Badge category={algo.category} className="text-[10px]">{algo.category}</Badge>
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-1)' }}>{algo.name}</span>
              <button onClick={() => removeFromCompare(algo.slug)} style={{ color: 'var(--color-text-3)' }}>
                <X size={13} />
              </button>
            </div>
          ))}
          {canAddMore() && (
            <div className="relative group">
              <button
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed text-sm transition-colors"
                style={{ borderColor: 'var(--color-border-2)', color: 'var(--color-text-3)' }}
              >
                <Plus size={14} /> Add algorithm
              </button>
              {/* Dropdown */}
              <div
                className="absolute top-full left-0 mt-1 w-52 rounded-lg border py-1 z-30 hidden group-hover:block"
                style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border-2)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
              >
                {available.slice(0, 12).map((a) => (
                  <button
                    key={a.slug}
                    onClick={() => addToCompare(a.slug)}
                    className="w-full text-left px-3 py-2 text-xs transition-colors hover:bg-amber-500/10"
                    style={{ color: 'var(--color-text-2)' }}
                  >
                    {a.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {selected.length === 0 ? (
          /* Empty state */
          <div className="text-center py-24">
            <p className="text-4xl mb-4">⚖️</p>
            <p className="text-base mb-2" style={{ color: 'var(--color-text-2)' }}>No algorithms selected yet</p>
            <p className="text-sm mb-6" style={{ color: 'var(--color-text-3)' }}>Go to any algorithm page and click "Compare" to add it here</p>
            <button onClick={() => navigate('/algorithms')} className="btn-primary">
              Browse Algorithms
            </button>
          </div>
        ) : (
          <>
            {/* Radar comparison */}
            {selected.length > 1 && (
              <Reveal>
                <Card className="p-6 mb-6">
                  <SectionLabel className="mb-4">Radar Comparison</SectionLabel>
                  <RadarChart algorithms={selected} size={320} />
                </Card>
              </Reveal>
            )}

            {/* Dimension table */}
            <Reveal delay={80}>
              <Card className="p-6 mb-6 overflow-x-auto">
                <SectionLabel className="mb-5">Dimension Scores</SectionLabel>
                <table className="w-full text-sm" style={{ minWidth: `${selected.length * 160}px` }}>
                  <thead>
                    <tr className="border-b" style={{ borderColor: 'var(--color-border)' }}>
                      <th className="text-left pb-3 text-xs uppercase tracking-wide pr-6" style={{ color: 'var(--color-text-3)' }}>Dimension</th>
                      {selected.map((a) => (
                        <th key={a.slug} className="pb-3 text-center text-xs font-medium" style={{ color: 'var(--color-amber)' }}>{a.shortName ?? a.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {RATING_DIMENSIONS.map((d) => {
                      const scores = selected.map((a) => a.ratings[d.key as keyof typeof a.ratings] as number)
                      const max    = Math.max(...scores)
                      return (
                        <tr key={d.key} className="border-b" style={{ borderColor: 'var(--color-border)' }}>
                          <td className="py-3 pr-6 text-xs" style={{ color: 'var(--color-text-2)' }}>{d.label}</td>
                          {selected.map((a, i) => {
                            const val = scores[i]
                            const isTop = val === max
                            return (
                              <td key={a.slug} className="py-3 text-center">
                                <span className={`text-sm font-mono font-medium ${isTop ? 'text-emerald-400' : ''}`}
                                  style={{ color: isTop ? undefined : 'var(--color-text-2)' }}>
                                  {val}
                                </span>
                              </td>
                            )
                          })}
                        </tr>
                      )
                    })}
                    {/* Overall */}
                    <tr>
                      <td className="py-3 pr-6 text-xs font-medium" style={{ color: 'var(--color-text-1)' }}>Overall Score</td>
                      {selected.map((a) => (
                        <td key={a.slug} className="py-3 text-center text-sm font-mono font-bold" style={{ color: 'var(--color-amber)' }}>
                          {a.overallScore}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </Card>
            </Reveal>

            {/* Data type support */}
            <Reveal delay={100}>
              <Card className="p-6 overflow-x-auto">
                <SectionLabel className="mb-5">Data Type Support</SectionLabel>
                <table className="w-full text-sm" style={{ minWidth: `${selected.length * 140}px` }}>
                  <thead>
                    <tr className="border-b" style={{ borderColor: 'var(--color-border)' }}>
                      <th className="text-left pb-3 text-xs uppercase tracking-wide pr-6" style={{ color: 'var(--color-text-3)' }}>Data Type</th>
                      {selected.map((a) => (
                        <th key={a.slug} className="pb-3 text-center text-xs font-medium" style={{ color: 'var(--color-amber)' }}>{a.shortName ?? a.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {DATA_TYPES.map((dt) => (
                      <tr key={dt.value} className="border-b" style={{ borderColor: 'var(--color-border)' }}>
                        <td className="py-2.5 pr-6 text-xs" style={{ color: 'var(--color-text-2)' }}>{dt.label}</td>
                        {selected.map((a) => {
                          const sup = a.dataTypes[dt.value as DataType]
                          return (
                            <td key={a.slug} className={`py-2.5 text-center text-sm font-mono ${SUPPORT_COLOR[sup]}`}>
                              {SUPPORT_ICON[sup]}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </Reveal>
          </>
        )}
      </div>
    </>
  )
}
