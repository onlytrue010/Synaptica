import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, BookmarkPlus, BookmarkCheck, GitCompare,
  ChevronDown, ChevronRight, CheckCircle2, XCircle,
  Zap, Brain, Calculator, Code2, AlertTriangle,
  GitBranch, Trophy, Cpu, Clock, MemoryStick,
} from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Badge, ScoreBar, SectionLabel, Card, Reveal } from '@components/ui/index'
import RadarChart from '@components/charts/RadarChart'
import BenchmarkChart from '@components/charts/BenchmarkChart'
import AlgorithmViz from '@components/visualization/AlgorithmViz'
import { getAlgorithmBySlug, getNeighborAlgorithms } from '@data/algorithms'
import { useProgressStore } from '@store/progressStore'
import { useCompareStore } from '@store/filterStore'
import { RATING_DIMENSIONS, DATA_TYPES } from '@constants/index'
import { cn } from '@utils/index'
import AlgorithmQuiz from '@components/algorithm/AlgorithmQuiz'
import type { Algorithm, DataType } from '@/types'

// ── SUPPORT ICONS ────────────────────────────────────────────────
const SUPPORT_ICON: Record<string, { icon: string; color: string }> = {
  native:         { icon: '✓', color: 'text-emerald-400' },
  adapted:        { icon: '~', color: 'text-amber-400' },
  'not-suitable': { icon: '✗', color: 'text-rose-400' },
}

const PHASE_COLORS: Record<string, string> = {
  initialization: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  forward:        'bg-blue-500/15 text-blue-400 border-blue-500/30',
  backward:       'bg-orange-500/15 text-orange-400 border-orange-500/30',
  update:         'bg-green-500/15 text-green-400 border-green-500/30',
  evaluation:     'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  prediction:     'bg-amber-500/15 text-amber-400 border-amber-500/30',
}

const IMPACT_COLORS: Record<string, string> = {
  high:   'text-rose-400',
  medium: 'text-amber-400',
  low:    'text-emerald-400',
}

// ── COLLAPSIBLE SECTION ──────────────────────────────────────────
function Section({
  icon: Icon, title, subtitle, color = 'var(--color-amber)',
  defaultOpen = false, children,
}: {
  icon: React.ElementType; title: string; subtitle?: string
  color?: string; defaultOpen?: boolean; children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <Card className="overflow-hidden">
      <button
        className="w-full flex items-center gap-3 p-5 text-left hover:bg-[var(--color-surface-2)] transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}18` }}>
          <Icon size={15} style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium" style={{ color: 'var(--color-text-1)' }}>{title}</div>
          {subtitle && <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-3)' }}>{subtitle}</div>}
        </div>
        <ChevronDown size={15} className="flex-shrink-0 transition-transform duration-300"
          style={{ color: 'var(--color-text-3)', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="border-t px-5 py-5" style={{ borderColor: 'var(--color-border)' }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}

// ── ANNOTATED CODE BLOCK ─────────────────────────────────────────
function AnnotatedCode({ example }: { example: Algorithm['codeExamples'][0] }) {
  const [showAnnotations, setShowAnnotations] = useState(false)
  const [activeTab, setActiveTab] = useState<'code' | 'output'>('code')
  const lines = example.code.split('\n')

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm font-medium" style={{ color: 'var(--color-text-1)' }}>{example.title}</div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-3)' }}>{example.description}</div>
          {example.whenToUse && (
            <div className="text-xs mt-1 px-2 py-0.5 rounded inline-block"
              style={{ color: 'var(--color-cyan)', background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.2)' }}>
              When: {example.whenToUse}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {example.library && (
            <span className="text-[10px] font-mono px-2 py-1 rounded border"
              style={{ color: 'var(--color-cyan)', borderColor: 'rgba(34,211,238,0.2)', background: 'var(--color-cyan-dim)' }}>
              {example.library}
            </span>
          )}
          {example.annotatedLines && example.annotatedLines.length > 0 && (
            <button onClick={() => setShowAnnotations((v) => !v)}
              className="text-[10px] px-2.5 py-1 rounded border transition-all"
              style={{
                background: showAnnotations ? 'rgba(245,158,11,0.1)' : 'transparent',
                borderColor: showAnnotations ? 'rgba(245,158,11,0.4)' : 'var(--color-border-2)',
                color: showAnnotations ? 'var(--color-amber)' : 'var(--color-text-3)',
              }}>
              {showAnnotations ? 'Hide' : 'Show'} explanations
            </button>
          )}
        </div>
      </div>

      {/* Tabs if output exists */}
      {example.output && (
        <div className="flex border-b mb-0" style={{ borderColor: 'var(--color-border)' }}>
          {(['code', 'output'] as const).map((t) => (
            <button key={t} onClick={() => setActiveTab(t)}
              className="px-4 py-2 text-xs font-medium capitalize border-b-2 -mb-px transition-colors"
              style={{
                borderColor: activeTab === t ? 'var(--color-amber)' : 'transparent',
                color: activeTab === t ? 'var(--color-amber)' : 'var(--color-text-3)',
              }}>
              {t === 'code' ? 'Code' : 'Expected Output'}
            </button>
          ))}
        </div>
      )}

      {/* Code block */}
      {activeTab === 'code' && (
        <div className="relative">
          {showAnnotations && example.annotatedLines ? (
            // Annotated view — line by line
            <div className="rounded-lg overflow-hidden border" style={{ borderColor: 'var(--color-border)' }}>
              <div className="p-4 font-mono text-xs leading-relaxed overflow-x-auto"
                style={{ background: '#1e1e1e' }}>
                {lines.map((line, i) => {
                  const lineNum = i + 1
                  const annotation = example.annotatedLines?.find((a) => a.line === lineNum)
                  return (
                    <div key={i}>
                      <div
                        className={cn('flex gap-3 py-0.5 px-2 rounded transition-colors', annotation?.important ? 'bg-amber-500/10' : '')}
                        style={{ borderLeft: annotation?.important ? '2px solid var(--color-amber)' : '2px solid transparent' }}
                      >
                        <span className="select-none w-6 text-right flex-shrink-0" style={{ color: '#555' }}>{lineNum}</span>
                        <span style={{ color: annotation ? '#e5e7eb' : '#a0a0a0' }}>{line || ' '}</span>
                      </div>
                      {annotation && (
                        <div className="flex gap-3 py-1.5 px-2 mb-1 mx-2 rounded text-[11px]"
                          style={{ background: annotation.important ? 'rgba(245,158,11,0.08)' : 'rgba(34,211,238,0.05)', color: annotation.important ? '#fcd34d' : '#6ee7b7' }}>
                          <span className="flex-shrink-0">↳</span>
                          <span>{annotation.explanation}</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="rounded-lg overflow-hidden text-xs">
              <SyntaxHighlighter language="python" style={vscDarkPlus}
                customStyle={{ margin: 0, borderRadius: '8px', fontSize: '12px', lineHeight: '1.7' }}>
                {example.code}
              </SyntaxHighlighter>
            </div>
          )}
        </div>
      )}

      {/* Output tab */}
      {activeTab === 'output' && example.output && (
        <pre className="text-xs p-4 rounded-lg font-mono leading-relaxed overflow-x-auto"
          style={{ background: '#0d1117', color: '#58a6ff', border: '1px solid var(--color-border)' }}>
          {example.output}
        </pre>
      )}
    </div>
  )
}

// ── MAIN COMPONENT ───────────────────────────────────────────────
export default function AlgorithmDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate  = useNavigate()
  const algo      = getAlgorithmBySlug(slug ?? '')
  const neighbors = getNeighborAlgorithms(slug ?? '')

  const { isBookmarked, addBookmark, removeBookmark, addVisited, addXP } = useProgressStore()
  const { isInCompare, addToCompare, removeFromCompare, canAddMore }     = useCompareStore()

  // ── Page-level tab: Learn | Quiz
  const [pageTab, setPageTab] = useState<'learn' | 'quiz'>('learn')

  useEffect(() => { if (algo) { addVisited(algo.slug); addXP(10) } }, [algo?.slug])

  if (!algo) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-2xl">🤔</p>
      <p style={{ color: 'var(--color-text-2)' }}>Algorithm "{slug}" not found</p>
      <button onClick={() => navigate('/algorithms')} className="text-sm underline" style={{ color: 'var(--color-amber)' }}>
        Browse all algorithms
      </button>
    </div>
  )

  const bookmarked = isBookmarked(algo.id)
  const comparing  = isInCompare(algo.slug)

  return (
    <>
      <Helmet>
        <title>{algo.name} — Synaptica</title>
        <meta name="description" content={algo.description} />
      </Helmet>

      {/* ── BACK + ACTIONS ──────────────────────────────────────── */}
      <div className="border-b px-6 sm:px-10 lg:px-16 py-4 flex items-center justify-between sticky top-[56px] z-20"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-1)' }}>
        <button onClick={() => navigate('/algorithms')}
          className="flex items-center gap-2 text-sm transition-colors hover:text-amber-400"
          style={{ color: 'var(--color-text-2)' }}>
          <ArrowLeft size={15} /> All algorithms
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => comparing ? removeFromCompare(algo.slug) : canAddMore() && addToCompare(algo.slug)}
            className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all',
              comparing ? 'border-amber-500/40 text-amber-400 bg-amber-500/10' : '')}
            style={{ borderColor: comparing ? undefined : 'var(--color-border-2)', color: comparing ? undefined : 'var(--color-text-2)' }}>
            <GitCompare size={12} /> {comparing ? 'In compare' : 'Compare'}
          </button>
          <button
            onClick={() => bookmarked ? removeBookmark(algo.id) : addBookmark({ id: algo.id, type: 'algorithm', slug: algo.slug, title: algo.name, addedAt: new Date().toISOString() })}
            className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all',
              bookmarked ? 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10' : '')}
            style={{ borderColor: bookmarked ? undefined : 'var(--color-border-2)', color: bookmarked ? undefined : 'var(--color-text-2)' }}>
            {bookmarked ? <BookmarkCheck size={12} /> : <BookmarkPlus size={12} />}
            {bookmarked ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 py-10">

        {/* ── HEADER ──────────────────────────────────────────── */}
        <Reveal>
          <div className="flex flex-wrap items-start gap-4 mb-10">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge category={algo.category}>{algo.subcategory}</Badge>
                <span className="text-xs font-mono px-2 py-0.5 rounded border"
                  style={{ color: 'var(--color-text-3)', borderColor: 'var(--color-border)' }}>
                  {algo.year}
                </span>
                {algo.inventor && (
                  <span className="text-xs px-2 py-0.5 rounded"
                    style={{ color: 'var(--color-text-3)', background: 'var(--color-surface-2)' }}>
                    by {algo.inventor}
                  </span>
                )}
              </div>
              <h1 className="font-serif text-4xl sm:text-5xl font-normal tracking-tight mb-3"
                style={{ color: 'var(--color-text-1)', letterSpacing: '-1.5px' }}>
                {algo.name}
              </h1>
              <p className="text-base leading-relaxed max-w-2xl" style={{ color: 'var(--color-text-2)' }}>
                {algo.description}
              </p>
              {algo.paper && (
                <p className="text-xs mt-2 font-mono" style={{ color: 'var(--color-text-3)' }}>
                  📄 {algo.paper}
                </p>
              )}
            </div>
            <div className="flex-shrink-0 text-center px-8 py-5 rounded-xl border"
              style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)' }}>
              <div className="text-4xl font-bold font-mono" style={{ color: 'var(--color-amber)' }}>{algo.overallScore}</div>
              <div className="text-xs uppercase tracking-wide mt-1" style={{ color: 'var(--color-text-3)' }}>Score</div>
              <div className="text-[10px] mt-1 font-mono" style={{ color: 'var(--color-text-3)' }}>{algo.complexity.time}</div>
            </div>
          </div>
        </Reveal>

        {/* ── PAGE TABS: Learn | Quiz ──────────────────────── */}
        <Reveal delay={50}>
          <div className="flex gap-1 mb-8 p-1 rounded-xl border w-fit"
            style={{ background: 'var(--color-surface-1)', borderColor: 'var(--color-border)' }}>
            {([
              { id: 'learn', label: 'Learn',       icon: Brain  },
              { id: 'quiz',  label: 'Test Yourself', icon: Trophy },
            ] as const).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setPageTab(id)}
                className={cn(
                  'flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                )}
                style={{
                  background: pageTab === id ? 'var(--color-amber-dim)' : 'transparent',
                  color:      pageTab === id ? 'var(--color-amber)' : 'var(--color-text-3)',
                  border:     pageTab === id ? '1px solid rgba(245,158,11,0.25)' : '1px solid transparent',
                }}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>
        </Reveal>

        {/* ── QUIZ TAB ────────────────────────────────────────── */}
        {pageTab === 'quiz' && (
          <Reveal>
            <Card className="p-6 max-w-2xl">
              <AlgorithmQuiz algo={algo} />
            </Card>
          </Reveal>
        )}

        {/* ── MAIN GRID (learn tab only) ───────────────────── */}
        {pageTab === 'learn' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── LEFT COLUMN ─────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">

            {/* 1. Real-world analogy */}
            {algo.realWorldAnalogy && (
              <Reveal>
                <Card className="p-5 bg-[var(--color-surface-1)]">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">💡</span>
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: 'var(--color-amber)' }}>
                        Real-world analogy
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-1)' }}>
                        {algo.realWorldAnalogy}
                      </p>
                    </div>
                  </div>
                </Card>
              </Reveal>
            )}

            {/* 2. Intuition */}
            <Reveal delay={30}>
              <Card className="p-5">
                <SectionLabel className="mb-2">Intuition</SectionLabel>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-2)' }}>
                  {algo.intuition}
                </p>
              </Card>
            </Reveal>

            {/* 3. WHY SECTION */}
            {algo.why && (
              <Reveal delay={40}>
                <Section icon={Brain} title="Why This Algorithm?" subtitle="Core insight, comparisons, and decision guide" color="#c084fc" defaultOpen>
                  {/* Why it works */}
                  <div className="mb-5 p-4 rounded-lg" style={{ background: 'rgba(192,132,252,0.06)', border: '1px solid rgba(192,132,252,0.15)' }}>
                    <div className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: '#c084fc' }}>
                      The core insight — why it works
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-2)' }}>
                      {algo.why.whyItWorks}
                    </p>
                  </div>

                  {/* Why better / worse than */}
                  {(algo.why.whyBetterThan?.length > 0 || algo.why.whyWorseThan?.length > 0) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                      {algo.why.whyBetterThan?.length > 0 && (
                        <div>
                          <div className="text-[10px] font-mono uppercase tracking-widest mb-2.5 text-emerald-400">Better than</div>
                          <div className="space-y-2">
                            {algo.why.whyBetterThan.map((item, i) => (
                              <div key={i} className="p-2.5 rounded-lg text-xs" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
                                <div className="font-medium text-emerald-400 mb-0.5">{item.algo}</div>
                                <div style={{ color: 'var(--color-text-2)' }}>{item.reason}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {algo.why.whyWorseThan?.length > 0 && (
                        <div>
                          <div className="text-[10px] font-mono uppercase tracking-widest mb-2.5 text-rose-400">Worse than</div>
                          <div className="space-y-2">
                            {algo.why.whyWorseThan.map((item, i) => (
                              <div key={i} className="p-2.5 rounded-lg text-xs" style={{ background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.15)' }}>
                                <div className="font-medium text-rose-400 mb-0.5">{item.algo}</div>
                                <div style={{ color: 'var(--color-text-2)' }}>{item.reason}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Choose / Avoid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {algo.why.whyChooseThis?.length > 0 && (
                      <div>
                        <div className="text-[10px] font-mono uppercase tracking-widest mb-2.5 text-emerald-400">✓ Choose this when</div>
                        <ul className="space-y-1.5">
                          {algo.why.whyChooseThis.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--color-text-2)' }}>
                              <CheckCircle2 size={11} className="mt-0.5 flex-shrink-0 text-emerald-400" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {algo.why.whyAvoidThis?.length > 0 && (
                      <div>
                        <div className="text-[10px] font-mono uppercase tracking-widest mb-2.5 text-rose-400">✗ Avoid when</div>
                        <ul className="space-y-1.5">
                          {algo.why.whyAvoidThis.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--color-text-2)' }}>
                              <XCircle size={11} className="mt-0.5 flex-shrink-0 text-rose-400" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Real world why */}
                  {algo.why.realWorldWhy && (
                    <div className="mt-4 p-3 rounded-lg text-xs" style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-2)' }}>
                      <span style={{ color: 'var(--color-amber)' }}>🌍 Industry context: </span>
                      {algo.why.realWorldWhy}
                    </div>
                  )}
                </Section>
              </Reveal>
            )}

            {/* 4. MATH FOUNDATION */}
            {algo.mathFoundation && (
              <Reveal delay={50}>
                <Section icon={Calculator} title="Math Foundation" subtitle="Formulas, derivation, and notation legend" color="#60a5fa">
                  {/* Overview */}
                  <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--color-text-2)' }}>
                    {algo.mathFoundation.overview}
                  </p>

                  {/* Assumptions */}
                  {algo.mathFoundation.assumptions?.length > 0 && (
                    <div className="mb-5">
                      <div className="text-[10px] font-mono uppercase tracking-widest mb-2.5" style={{ color: 'var(--color-text-3)' }}>
                        Key assumptions
                      </div>
                      <ul className="space-y-1.5">
                        {algo.mathFoundation.assumptions.map((a, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--color-text-2)' }}>
                            <span className="text-blue-400 flex-shrink-0 mt-0.5">•</span>{a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Loss function */}
                  {algo.mathFoundation.lossFunction && (
                    <div className="mb-4 p-3 rounded-lg" style={{ background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.15)' }}>
                      <div className="text-[10px] font-mono uppercase tracking-widest mb-1.5 text-blue-400">Objective / Loss function</div>
                      <code className="text-xs font-mono" style={{ color: '#a5f3fc' }}>{algo.mathFoundation.lossFunction}</code>
                    </div>
                  )}

                  {/* Update rule */}
                  {algo.mathFoundation.updateRule && (
                    <div className="mb-5 p-3 rounded-lg" style={{ background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.15)' }}>
                      <div className="text-[10px] font-mono uppercase tracking-widest mb-1.5 text-blue-400">Update rule</div>
                      <code className="text-xs font-mono" style={{ color: '#a5f3fc' }}>{algo.mathFoundation.updateRule}</code>
                    </div>
                  )}

                  {/* Derivation steps */}
                  {algo.mathFoundation.steps?.length > 0 && (
                    <div className="mb-5">
                      <div className="text-[10px] font-mono uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-3)' }}>
                        Step-by-step derivation
                      </div>
                      <div className="space-y-3">
                        {algo.mathFoundation.steps.map((step, i) => (
                          <div key={i} className="p-3 rounded-lg" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                                style={{ background: 'rgba(96,165,250,0.15)', color: '#60a5fa' }}>
                                {i + 1}
                              </span>
                              <div className="text-xs font-medium" style={{ color: 'var(--color-text-1)' }}>{step.title}</div>
                            </div>
                            {step.latex && (
                              <div className="px-3 py-2 rounded mb-2 text-xs font-mono overflow-x-auto"
                                style={{ background: '#0d1117', color: '#fbbf24', border: '1px solid rgba(96,165,250,0.2)' }}>
                                {step.latex}
                              </div>
                            )}
                            <p className="text-xs" style={{ color: 'var(--color-text-2)' }}>{step.explanation}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notation legend */}
                  {algo.mathFoundation.notation?.length > 0 && (
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-widest mb-2.5" style={{ color: 'var(--color-text-3)' }}>
                        Notation legend
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {algo.mathFoundation.notation.map((n, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <code className="font-mono px-1.5 py-0.5 rounded flex-shrink-0"
                              style={{ color: '#fbbf24', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.15)', minWidth: '2.5rem', textAlign: 'center' }}>
                              {n.symbol}
                            </code>
                            <span style={{ color: 'var(--color-text-2)' }}>{n.meaning}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Section>
              </Reveal>
            )}

            {/* 5. UNDER THE HOOD */}
            {algo.underTheHood && (
              <Reveal delay={60}>
                <Section icon={Cpu} title="Under the Hood" subtitle="How training and prediction actually work, step by step" color="#10b981" defaultOpen>

                  {/* Training steps */}
                  {algo.underTheHood.trainingSteps?.length > 0 && (
                    <div className="mb-6">
                      <div className="text-[10px] font-mono uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-3)' }}>
                        Training process
                      </div>
                      <div className="space-y-3">
                        {algo.underTheHood.trainingSteps.map((step, i) => (
                          <div key={i} className="rounded-xl border overflow-hidden"
                            style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-2)' }}>
                            <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
                              <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                                style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                                {step.step}
                              </span>
                              <div className="flex-1 min-w-0">
                                <span className="text-xs font-medium" style={{ color: 'var(--color-text-1)' }}>{step.title}</span>
                                <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-3)' }}>{step.description}</p>
                              </div>
                              <span className={cn('text-[9px] font-mono px-2 py-0.5 rounded border uppercase tracking-wide', PHASE_COLORS[step.phase])}>
                                {step.phase}
                              </span>
                            </div>
                            <div className="px-4 py-3 space-y-2">
                              <div className="text-xs leading-relaxed" style={{ color: 'var(--color-text-2)' }}>
                                {step.detail}
                              </div>
                              <div className="flex items-start gap-2 text-xs p-2 rounded"
                                style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
                                <Zap size={11} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                                <span style={{ color: '#6ee7b7' }}><strong>Why it matters: </strong>{step.whyItMatters}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Prediction flow */}
                  {algo.underTheHood.predictionFlow?.length > 0 && (
                    <div className="mb-5">
                      <div className="text-[10px] font-mono uppercase tracking-widest mb-2.5" style={{ color: 'var(--color-text-3)' }}>
                        What happens when you call .predict()
                      </div>
                      <div className="space-y-1.5">
                        {algo.underTheHood.predictionFlow.map((step, i) => (
                          <div key={i} className="flex items-start gap-2.5">
                            <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5"
                              style={{ background: 'rgba(34,211,238,0.1)', color: 'var(--color-cyan)' }}>
                              {i + 1}
                            </span>
                            <span className="text-xs" style={{ color: 'var(--color-text-2)' }}>{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Memory / Convergence / Parallelism */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {algo.underTheHood.memoryLayout && (
                      <div className="p-3 rounded-lg" style={{ background: 'var(--color-surface-3)', border: '1px solid var(--color-border)' }}>
                        <div className="flex items-center gap-1.5 mb-2">
                          <MemoryStick size={12} style={{ color: 'var(--color-amber)' }} />
                          <span className="text-[10px] font-mono uppercase tracking-wide" style={{ color: 'var(--color-text-3)' }}>Memory</span>
                        </div>
                        <p className="text-xs" style={{ color: 'var(--color-text-2)' }}>{algo.underTheHood.memoryLayout}</p>
                      </div>
                    )}
                    {algo.underTheHood.convergence && (
                      <div className="p-3 rounded-lg" style={{ background: 'var(--color-surface-3)', border: '1px solid var(--color-border)' }}>
                        <div className="flex items-center gap-1.5 mb-2">
                          <Clock size={12} style={{ color: '#60a5fa' }} />
                          <span className="text-[10px] font-mono uppercase tracking-wide" style={{ color: 'var(--color-text-3)' }}>Convergence</span>
                        </div>
                        <p className="text-xs" style={{ color: 'var(--color-text-2)' }}>{algo.underTheHood.convergence}</p>
                      </div>
                    )}
                    {algo.underTheHood.parallelism && (
                      <div className="p-3 rounded-lg" style={{ background: 'var(--color-surface-3)', border: '1px solid var(--color-border)' }}>
                        <div className="flex items-center gap-1.5 mb-2">
                          <Cpu size={12} style={{ color: '#c084fc' }} />
                          <span className="text-[10px] font-mono uppercase tracking-wide" style={{ color: 'var(--color-text-3)' }}>Parallelism</span>
                        </div>
                        <p className="text-xs" style={{ color: 'var(--color-text-2)' }}>{algo.underTheHood.parallelism}</p>
                      </div>
                    )}
                  </div>
                </Section>
              </Reveal>
            )}

            {/* 6. INTERACTIVE VISUALIZATION */}
            {algo.hasVisualization && (
              <Reveal delay={65}>
                <Section icon={Zap} title="Interactive Visualization" subtitle="Tweak parameters and watch the algorithm respond live" color="var(--color-amber)" defaultOpen>
                  <AlgorithmViz slug={algo.slug} />
                </Section>
              </Reveal>
            )}

            {/* 7. EVALUATION METRICS */}
            {algo.evalMetrics && algo.evalMetrics.length > 0 && (
              <Reveal delay={70}>
                <Section icon={Trophy} title="Evaluation Metrics" subtitle="Which metrics to use for this algorithm and why" color="#f59e0b" defaultOpen>
                  <div className="space-y-4">
                    {algo.evalMetrics.map((metric, i) => (
                      <div key={i} className="rounded-xl border overflow-hidden"
                        style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-2)' }}>
                        <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: 'var(--color-border)' }}>
                          <span className="text-sm font-medium" style={{ color: 'var(--color-text-1)' }}>{metric.name}</span>
                          {metric.formula && (
                            <code className="text-[10px] font-mono ml-auto px-2 py-0.5 rounded"
                              style={{ color: '#fbbf24', background: 'rgba(251,191,36,0.08)' }}>
                              {metric.formula.length > 40 ? metric.formula.slice(0, 40) + '…' : metric.formula}
                            </code>
                          )}
                        </div>
                        <div className="px-4 py-3 space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                            <div>
                              <div className="text-[10px] font-mono uppercase tracking-wide mb-1" style={{ color: 'var(--color-amber)' }}>Why use it</div>
                              <p style={{ color: 'var(--color-text-2)' }}>{metric.why}</p>
                            </div>
                            <div>
                              <div className="text-[10px] font-mono uppercase tracking-wide mb-1" style={{ color: 'var(--color-cyan)' }}>When to use</div>
                              <p style={{ color: 'var(--color-text-2)' }}>{metric.when}</p>
                            </div>
                            <div>
                              <div className="text-[10px] font-mono uppercase tracking-wide mb-1" style={{ color: '#c084fc' }}>How to read</div>
                              <p style={{ color: 'var(--color-text-2)' }}>{metric.howToRead}</p>
                            </div>
                          </div>
                          {metric.code && (
                            <div className="rounded-lg overflow-hidden text-xs">
                              <SyntaxHighlighter language="python" style={vscDarkPlus}
                                customStyle={{ margin: 0, borderRadius: '8px', fontSize: '11px', lineHeight: '1.6' }}>
                                {metric.code}
                              </SyntaxHighlighter>
                            </div>
                          )}
                          {metric.pitfall && (
                            <div className="flex items-start gap-2 p-2.5 rounded text-xs"
                              style={{ background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.15)' }}>
                              <AlertTriangle size={11} className="text-rose-400 flex-shrink-0 mt-0.5" />
                              <span style={{ color: 'var(--color-text-2)' }}><strong className="text-rose-400">Pitfall: </strong>{metric.pitfall}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              </Reveal>
            )}

            {/* 8. CODE EXAMPLES with annotated lines */}
            {algo.codeExamples.length > 0 && (
              <Reveal delay={75}>
                <Section icon={Code2} title="Code Examples" subtitle="Production-ready code with every line explained" color="var(--color-cyan)" defaultOpen>
                  <div className="space-y-6">
                    {algo.codeExamples.map((ex, i) => (
                      <div key={i}>
                        {i > 0 && <div className="border-t mb-6" style={{ borderColor: 'var(--color-border)' }} />}
                        <AnnotatedCode example={ex} />
                      </div>
                    ))}
                  </div>
                </Section>
              </Reveal>
            )}

            {/* 9. HYPERPARAMETERS with effect + tuning tips */}
            <Reveal delay={80}>
              <Section icon={Zap} title="Hyperparameters" subtitle="What each parameter does and how to tune it" color="#f59e0b">
                <div className="space-y-4">
                  {algo.hyperParams.map((hp) => (
                    <div key={hp.name} className="rounded-xl border overflow-hidden"
                      style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-2)' }}>
                      <div className="flex items-center gap-3 px-4 py-2.5 border-b" style={{ borderColor: 'var(--color-border)' }}>
                        <code className="text-xs font-mono px-2 py-0.5 rounded"
                          style={{ color: 'var(--color-cyan)', background: 'var(--color-cyan-dim)' }}>
                          {hp.name}
                        </code>
                        <span className="text-[10px] font-mono" style={{ color: 'var(--color-text-3)' }}>
                          {hp.type} · default: <strong style={{ color: 'var(--color-text-2)' }}>{String(hp.default)}</strong>
                          {hp.range && ` · [${hp.range[0]}, ${hp.range[1]}]`}
                          {hp.options && ` · ${hp.options.join(' | ')}`}
                        </span>
                        <span className={cn('ml-auto text-[10px] font-mono font-bold uppercase', IMPACT_COLORS[hp.impact])}>
                          {hp.impact} impact
                        </span>
                      </div>
                      <div className="px-4 py-3 space-y-2 text-xs">
                        <p style={{ color: 'var(--color-text-2)' }}>{hp.description}</p>
                        {hp.effect && (
                          <div className="flex items-start gap-2 p-2 rounded"
                            style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
                            <ChevronRight size={11} className="text-amber-400 flex-shrink-0 mt-0.5" />
                            <span style={{ color: 'var(--color-text-2)' }}><strong className="text-amber-400">Effect: </strong>{hp.effect}</span>
                          </div>
                        )}
                        {hp.tuningTip && (
                          <div className="flex items-start gap-2 p-2 rounded"
                            style={{ background: 'rgba(34,211,238,0.05)', border: '1px solid rgba(34,211,238,0.12)' }}>
                            <Zap size={11} style={{ color: 'var(--color-cyan)' }} className="flex-shrink-0 mt-0.5" />
                            <span style={{ color: 'var(--color-text-2)' }}><strong style={{ color: 'var(--color-cyan)' }}>Tuning: </strong>{hp.tuningTip}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            </Reveal>

            {/* 10. COMMON MISTAKES */}
            {algo.commonMistakes && algo.commonMistakes.length > 0 && (
              <Reveal delay={85}>
                <Section icon={AlertTriangle} title="Common Mistakes" subtitle="Errors that waste hours — and exactly how to fix them" color="#f43f5e">
                  <div className="space-y-4">
                    {algo.commonMistakes.map((m, i) => (
                      <div key={i} className="rounded-xl border overflow-hidden"
                        style={{ borderColor: 'rgba(244,63,94,0.2)', background: 'var(--color-surface-2)' }}>
                        <div className="flex items-start gap-2.5 px-4 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
                          <XCircle size={14} className="text-rose-400 flex-shrink-0 mt-0.5" />
                          <span className="text-sm font-medium" style={{ color: 'var(--color-text-1)' }}>{m.mistake}</span>
                        </div>
                        <div className="px-4 py-3 space-y-2 text-xs">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div className="p-2 rounded" style={{ background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.12)' }}>
                              <div className="text-[10px] uppercase tracking-wide text-rose-400 mb-1">Why it happens</div>
                              <p style={{ color: 'var(--color-text-2)' }}>{m.why}</p>
                            </div>
                            <div className="p-2 rounded" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)' }}>
                              <div className="text-[10px] uppercase tracking-wide text-amber-400 mb-1">Consequence</div>
                              <p style={{ color: 'var(--color-text-2)' }}>{m.consequence}</p>
                            </div>
                            <div className="p-2 rounded" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.12)' }}>
                              <div className="text-[10px] uppercase tracking-wide text-emerald-400 mb-1">The fix</div>
                              <p style={{ color: 'var(--color-text-2)' }}>{m.fix}</p>
                            </div>
                          </div>
                          {m.code && (
                            <div className="rounded-lg overflow-hidden text-xs">
                              <SyntaxHighlighter language="python" style={vscDarkPlus}
                                customStyle={{ margin: 0, borderRadius: '8px', fontSize: '11px', lineHeight: '1.6' }}>
                                {m.code}
                              </SyntaxHighlighter>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              </Reveal>
            )}

            {/* 11. PROS & CONS */}
            <Reveal delay={90}>
              <Card className="p-5">
                <SectionLabel className="mb-4">Pros &amp; Cons</SectionLabel>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs font-medium mb-2 text-emerald-400 uppercase tracking-wide">Advantages</div>
                    <ul className="space-y-2">
                      {algo.pros.map((p) => (
                        <li key={p} className="flex items-start gap-2 text-xs" style={{ color: 'var(--color-text-2)' }}>
                          <span className="mt-0.5 text-emerald-400 flex-shrink-0">✓</span>{p}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-xs font-medium mb-2 text-rose-400 uppercase tracking-wide">Limitations</div>
                    <ul className="space-y-2">
                      {algo.cons.map((c) => (
                        <li key={c} className="flex items-start gap-2 text-xs" style={{ color: 'var(--color-text-2)' }}>
                          <span className="mt-0.5 text-rose-400 flex-shrink-0">✗</span>{c}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            </Reveal>

            {/* 12. VARIANTS */}
            {algo.variants && algo.variants.length > 0 && (
              <Reveal delay={95}>
                <Section icon={GitBranch} title="Variants & Related" subtitle="Algorithm family members and when to use each" color="#c084fc">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {algo.variants.map((v, i) => (
                      <div key={i}
                        className={cn('p-3 rounded-xl border transition-all', v.slug ? 'cursor-pointer hover:-translate-y-0.5' : '')}
                        style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)' }}
                        onClick={() => v.slug && navigate(`/algorithms/${v.slug}`)}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-xs font-medium" style={{ color: 'var(--color-text-1)' }}>{v.name}</span>
                          {v.slug && <ChevronRight size={11} style={{ color: 'var(--color-text-3)' }} />}
                        </div>
                        <p className="text-xs mb-1.5" style={{ color: 'var(--color-text-3)' }}>{v.difference}</p>
                        <div className="text-[10px] px-2 py-0.5 rounded inline-block"
                          style={{ color: '#c084fc', background: 'rgba(192,132,252,0.08)', border: '1px solid rgba(192,132,252,0.2)' }}>
                          Use when: {v.useCase}
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              </Reveal>
            )}
          </div>

          {/* ── RIGHT SIDEBAR ──────────────────────────────────── */}
          <div className="space-y-4">

            {/* Radar chart */}
            <Reveal direction="scale">
              <Card className="p-5">
                <SectionLabel className="mb-1">Performance Profile</SectionLabel>
                <p className="text-xs mb-4" style={{ color: 'var(--color-text-3)' }}>7 dimensions · 0–100</p>
                <RadarChart algorithms={[algo]} size={240} />
              </Card>
            </Reveal>

            {/* Dimension scores */}
            <Reveal delay={40}>
              <Card className="p-5">
                <SectionLabel className="mb-4">Dimension Scores</SectionLabel>
                <div className="space-y-3">
                  {RATING_DIMENSIONS.map((d) => (
                    <ScoreBar key={d.key} label={d.label} value={algo.ratings[d.key as keyof typeof algo.ratings]} />
                  ))}
                </div>
              </Card>
            </Reveal>

            {/* Complexity */}
            <Reveal delay={50}>
              <Card className="p-5">
                <SectionLabel className="mb-3">Complexity</SectionLabel>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--color-text-3)' }}>Time:</span>
                    <code className="font-mono" style={{ color: 'var(--color-cyan)' }}>{algo.complexity.time}</code>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--color-text-3)' }}>Space:</span>
                    <code className="font-mono" style={{ color: 'var(--color-amber)' }}>{algo.complexity.space}</code>
                  </div>
                  {algo.complexity.trainingNote && (
                    <p className="mt-2 pt-2 border-t text-[11px]" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-3)' }}>
                      {algo.complexity.trainingNote}
                    </p>
                  )}
                </div>
              </Card>
            </Reveal>

            {/* Data type support */}
            <Reveal delay={60}>
              <Card className="p-5">
                <SectionLabel className="mb-4">Data Type Support</SectionLabel>
                <div className="space-y-2">
                  {DATA_TYPES.map((dt) => {
                    const support = algo.dataTypes[dt.value as DataType]
                    const s = SUPPORT_ICON[support]
                    return (
                      <div key={dt.value} className="flex items-center justify-between">
                        <span className="text-xs" style={{ color: 'var(--color-text-2)' }}>{dt.label}</span>
                        <span className={cn('text-xs font-mono font-medium', s.color)}>{s.icon} {support.replace('-', ' ')}</span>
                      </div>
                    )
                  })}
                </div>
              </Card>
            </Reveal>

            {/* Use cases */}
            <Reveal delay={70}>
              <Card className="p-5">
                <SectionLabel className="mb-3">Use Cases</SectionLabel>
                <div className="flex flex-wrap gap-2">
                  {algo.useCases.map((uc) => (
                    <span key={uc} className="text-xs px-2 py-1 rounded border"
                      style={{ color: 'var(--color-text-2)', borderColor: 'var(--color-border)', background: 'var(--color-surface-2)' }}>
                      {uc}
                    </span>
                  ))}
                </div>
              </Card>
            </Reveal>

            {/* Tags */}
            <Reveal delay={75}>
              <Card className="p-5">
                <SectionLabel className="mb-3">Tags</SectionLabel>
                <div className="flex flex-wrap gap-1.5">
                  {algo.tags.map((tag) => (
                    <span key={tag} className="text-[10px] font-mono px-2 py-0.5 rounded"
                      style={{ color: 'var(--color-text-3)', background: 'var(--color-surface-3)', border: '1px solid var(--color-border)' }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              </Card>
            </Reveal>

            {/* Benchmark history */}
            <Reveal delay={80}>
              <Card className="p-5">
                <SectionLabel className="mb-1">Benchmark History</SectionLabel>
                <p className="text-xs mb-3" style={{ color: 'var(--color-text-3)' }}>Performance over time</p>
                <BenchmarkChart algorithm={algo} />
                {algo.benchmarks.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    {algo.benchmarks.map((b, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span style={{ color: 'var(--color-text-3)' }}>{b.year} · {b.dataset}</span>
                        <span className="font-mono" style={{ color: 'var(--color-amber)' }}>{b.score} {b.metric}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </Reveal>

            {/* Related algorithms */}
            {neighbors.length > 0 && (
              <Reveal delay={85}>
                <Card className="p-5">
                  <SectionLabel className="mb-3">Related Algorithms</SectionLabel>
                  <div className="space-y-2">
                    {neighbors.map((n) => (
                      <button key={n.slug} onClick={() => navigate(`/algorithms/${n.slug}`)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg border text-left transition-all hover:border-amber-500/30 hover:bg-amber-500/5"
                        style={{ borderColor: 'var(--color-border)' }}>
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
        )} {/* end learn tab */}
      </div>
    </>
  )
}