import { useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowLeft, BookmarkPlus, BookmarkCheck, GitCompare, ExternalLink } from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Badge, ScoreBar, SectionLabel, Card, Reveal } from '@components/ui/index'
import RadarChart from '@components/charts/RadarChart'
import BenchmarkChart from '@components/charts/BenchmarkChart'
import AlgorithmViz from '@components/visualization/AlgorithmViz'
import { getAlgorithmBySlug, getNeighborAlgorithms } from '@data/algorithms'
import { useProgressStore } from '@store/progressStore'
import { useCompareStore } from '@store/filterStore'
import { useEffect } from 'react'
import { RATING_DIMENSIONS, DATA_TYPES } from '@constants/index'
import type { DataType } from '@/types'

const SUPPORT_ICON: Record<string, { icon: string; color: string }> = {
  native:       { icon: '✓', color: 'text-emerald-400' },
  adapted:      { icon: '~', color: 'text-amber-400'   },
  'not-suitable': { icon: '✗', color: 'text-rose-400'  },
}

export default function AlgorithmDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate  = useNavigate()
  const algo      = getAlgorithmBySlug(slug ?? '')
  const neighbors = getNeighborAlgorithms(slug ?? '')

  const { isBookmarked, addBookmark, removeBookmark, addVisited, addXP } = useProgressStore()
  const { isInCompare, addToCompare, removeFromCompare, canAddMore }     = useCompareStore()

  useEffect(() => {
    if (algo) { addVisited(algo.slug); addXP(10) }
  }, [algo?.slug])

  if (!algo) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-2xl">🤔</p>
        <p style={{ color: 'var(--color-text-2)' }}>Algorithm "{slug}" not found</p>
        <button onClick={() => navigate('/algorithms')} className="text-sm underline" style={{ color: 'var(--color-amber)' }}>
          Browse all algorithms
        </button>
      </div>
    )
  }

  const bookmarked = isBookmarked(algo.id)
  const comparing  = isInCompare(algo.slug)

  return (
    <>
      <Helmet>
        <title>{algo.name} — Synaptica</title>
        <meta name="description" content={algo.description} />
      </Helmet>

      {/* ── BACK + ACTIONS ───────────────────────────── */}
      <div className="border-b px-6 sm:px-10 lg:px-16 py-4 flex items-center justify-between" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-1)' }}>
        <button onClick={() => navigate('/algorithms')} className="flex items-center gap-2 text-sm transition-colors hover:text-amber-400" style={{ color: 'var(--color-text-2)' }}>
          <ArrowLeft size={15} /> Back to algorithms
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => comparing ? removeFromCompare(algo.slug) : canAddMore() && addToCompare(algo.slug)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all ${comparing ? 'border-amber-500/40 text-amber-400 bg-amber-500/10' : ''}`}
            style={{ borderColor: comparing ? undefined : 'var(--color-border-2)', color: comparing ? undefined : 'var(--color-text-2)' }}
          >
            <GitCompare size={12} /> {comparing ? 'In compare' : 'Compare'}
          </button>
          <button
            onClick={() => bookmarked ? removeBookmark(algo.id) : addBookmark({ id: algo.id, type: 'algorithm', slug: algo.slug, title: algo.name, addedAt: new Date().toISOString() })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all ${bookmarked ? 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10' : ''}`}
            style={{ borderColor: bookmarked ? undefined : 'var(--color-border-2)', color: bookmarked ? undefined : 'var(--color-text-2)' }}
          >
            {bookmarked ? <BookmarkCheck size={12} /> : <BookmarkPlus size={12} />}
            {bookmarked ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 py-12">

        {/* ── HEADER ──────────────────────────────────── */}
        <Reveal>
          <div className="flex flex-wrap items-start gap-4 mb-10">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge category={algo.category}>{algo.subcategory}</Badge>
                <span className="text-xs font-mono px-2 py-0.5 rounded border" style={{ color: 'var(--color-text-3)', borderColor: 'var(--color-border)' }}>
                  {algo.year}
                </span>
              </div>
              <h1 className="font-serif text-4xl sm:text-5xl font-normal tracking-tight mb-3" style={{ color: 'var(--color-text-1)', letterSpacing: '-1.5px' }}>
                {algo.name}
              </h1>
              <p className="text-base leading-relaxed max-w-2xl" style={{ color: 'var(--color-text-2)' }}>
                {algo.description}
              </p>
            </div>

            {/* Overall score */}
            <div className="flex-shrink-0 text-center px-8 py-5 rounded-xl border" style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)' }}>
              <div className="text-4xl font-bold font-mono" style={{ color: 'var(--color-amber)' }}>{algo.overallScore}</div>
              <div className="text-xs uppercase tracking-wide mt-1" style={{ color: 'var(--color-text-3)' }}>Overall Score</div>
              <div className="text-[10px] mt-0.5 font-mono" style={{ color: 'var(--color-text-3)' }}>{algo.complexity.time}</div>
            </div>
          </div>
        </Reveal>

        {/* ── MAIN GRID ───────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: detail content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Intuition */}
            <Reveal>
              <Card className="p-6">
                <SectionLabel className="mb-3">Intuition</SectionLabel>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-2)' }}>
                  {algo.intuition}
                </p>
              </Card>
            </Reveal>

            {/* Interactive Visualization */}
            {algo.hasVisualization && (
              <Reveal delay={40}>
                <Card className="p-6">
                  <SectionLabel className="mb-1">Interactive Visualization</SectionLabel>
                  <p className="text-xs mb-4" style={{ color: 'var(--color-text-3)' }}>
                    Tweak parameters and watch the algorithm respond in real-time
                  </p>
                  <AlgorithmViz slug={algo.slug} />
                </Card>
              </Reveal>
            )}

            {/* Pros & Cons */}
            <Reveal delay={60}>
              <Card className="p-6">
                <SectionLabel className="mb-4">Pros &amp; Cons</SectionLabel>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs font-medium mb-2 text-emerald-400 uppercase tracking-wide">Advantages</div>
                    <ul className="space-y-2">
                      {algo.pros.map((p) => (
                        <li key={p} className="flex items-start gap-2 text-xs" style={{ color: 'var(--color-text-2)' }}>
                          <span className="mt-0.5 text-emerald-400 flex-shrink-0">✓</span> {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-xs font-medium mb-2 text-rose-400 uppercase tracking-wide">Limitations</div>
                    <ul className="space-y-2">
                      {algo.cons.map((c) => (
                        <li key={c} className="flex items-start gap-2 text-xs" style={{ color: 'var(--color-text-2)' }}>
                          <span className="mt-0.5 text-rose-400 flex-shrink-0">✗</span> {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            </Reveal>

            {/* Code examples */}
            {algo.codeExamples.map((ex, i) => (
              <Reveal key={i} delay={80}>
                <Card className="p-6 overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-sm font-medium" style={{ color: 'var(--color-text-1)' }}>{ex.title}</div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-3)' }}>{ex.description}</div>
                    </div>
                    {ex.library && (
                      <span className="text-[10px] font-mono px-2 py-1 rounded border" style={{ color: 'var(--color-cyan)', borderColor: 'rgba(34,211,238,0.2)', background: 'var(--color-cyan-dim)' }}>
                        {ex.library}
                      </span>
                    )}
                  </div>
                  <div className="rounded-lg overflow-hidden text-xs">
                    <SyntaxHighlighter
                      language="python"
                      style={vscDarkPlus}
                      customStyle={{ margin: 0, borderRadius: '8px', fontSize: '12px', lineHeight: '1.7' }}
                    >
                      {ex.code}
                    </SyntaxHighlighter>
                  </div>
                </Card>
              </Reveal>
            ))}

            {/* Hyperparameters */}
            <Reveal delay={100}>
              <Card className="p-6">
                <SectionLabel className="mb-4">Hyperparameters</SectionLabel>
                <div className="space-y-3">
                  {algo.hyperParams.map((hp) => (
                    <div key={hp.name} className="flex flex-col sm:flex-row sm:items-start gap-2 pb-3 border-b last:border-b-0" style={{ borderColor: 'var(--color-border)' }}>
                      <div className="sm:w-40 flex-shrink-0">
                        <code className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ color: 'var(--color-cyan)', background: 'var(--color-cyan-dim)' }}>
                          {hp.name}
                        </code>
                        <span className={`ml-2 text-[10px] font-mono ${hp.impact === 'high' ? 'text-rose-400' : hp.impact === 'medium' ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {hp.impact}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="text-xs" style={{ color: 'var(--color-text-2)' }}>{hp.description}</div>
                        <div className="text-[10px] mt-0.5 font-mono" style={{ color: 'var(--color-text-3)' }}>
                          default: {String(hp.default)}
                          {hp.range && ` · range: [${hp.range[0]}, ${hp.range[1]}]`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </Reveal>
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">

            {/* Radar chart */}
            <Reveal direction="scale">
              <Card className="p-5">
                <SectionLabel className="mb-1">Performance Profile</SectionLabel>
                <p className="text-xs mb-4" style={{ color: 'var(--color-text-3)' }}>7-dimension · 0–100 scale</p>
                <RadarChart algorithms={[algo]} size={240} />
              </Card>
            </Reveal>

            {/* All ratings */}
            <Reveal delay={60}>
              <Card className="p-5">
                <SectionLabel className="mb-4">Dimension Scores</SectionLabel>
                <div className="space-y-3">
                  {RATING_DIMENSIONS.map((d) => (
                    <ScoreBar
                      key={d.key}
                      label={d.label}
                      value={algo.ratings[d.key as keyof typeof algo.ratings]}
                    />
                  ))}
                </div>
              </Card>
            </Reveal>

            {/* Data type matrix */}
            <Reveal delay={80}>
              <Card className="p-5">
                <SectionLabel className="mb-4">Data Type Support</SectionLabel>
                <div className="space-y-2">
                  {DATA_TYPES.map((dt) => {
                    const support = algo.dataTypes[dt.value as DataType]
                    const s = SUPPORT_ICON[support]
                    return (
                      <div key={dt.value} className="flex items-center justify-between">
                        <span className="text-xs" style={{ color: 'var(--color-text-2)' }}>{dt.label}</span>
                        <span className={`text-xs font-mono font-medium ${s.color}`}>{s.icon} {support.replace('-', ' ')}</span>
                      </div>
                    )
                  })}
                </div>
              </Card>
            </Reveal>

            {/* Use cases */}
            <Reveal delay={100}>
              <Card className="p-5">
                <SectionLabel className="mb-3">Use Cases</SectionLabel>
                <div className="flex flex-wrap gap-2">
                  {algo.useCases.map((uc) => (
                    <span key={uc} className="text-xs px-2 py-1 rounded border" style={{ color: 'var(--color-text-2)', borderColor: 'var(--color-border)', background: 'var(--color-surface-2)' }}>
                      {uc}
                    </span>
                  ))}
                </div>
              </Card>
            </Reveal>

            {/* Benchmark history */}
            <Reveal delay={110}>
              <Card className="p-5">
                <SectionLabel className="mb-1">Benchmark History</SectionLabel>
                <p className="text-xs mb-3" style={{ color: 'var(--color-text-3)' }}>Performance over time</p>
                <BenchmarkChart algorithm={algo} />
              </Card>
            </Reveal>

            {/* Neighbor algorithms */}
            {neighbors.length > 0 && (
              <Reveal delay={120}>
                <Card className="p-5">
                  <SectionLabel className="mb-3">Related Algorithms</SectionLabel>
                  <div className="space-y-2">
                    {neighbors.map((n) => (
                      <button
                        key={n.slug}
                        onClick={() => navigate(`/algorithms/${n.slug}`)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg border text-left transition-all hover:border-amber-500/30 hover:bg-amber-500/5"
                        style={{ borderColor: 'var(--color-border)' }}
                      >
                        <span className="text-xs" style={{ color: 'var(--color-text-1)' }}>{n.name}</span>
                        <span className="text-xs font-mono" style={{ color: 'var(--color-amber)' }}>{n.overallScore}</span>
                      </button>
                    ))}
                  </div>
                </Card>
              </Reveal>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
