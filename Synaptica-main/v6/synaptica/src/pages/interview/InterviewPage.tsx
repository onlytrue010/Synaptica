import { useState, useMemo, useCallback } from 'react'
import { Helmet } from 'react-helmet-async'
import { Search, ChevronDown, X, BookmarkPlus, BookmarkCheck, Clock, ChevronLeft, ChevronRight, Timer } from 'lucide-react'
import Fuse from 'fuse.js'
import { SectionLabel, SectionTitle, Reveal } from '@components/ui/index'
import { DIFFICULTY_LABELS, DIFFICULTY_STYLES, COMPANY_TAGS } from '@constants/index'
import { useDebounce } from '@hooks/index'
import { useProgressStore } from '@store/progressStore'
import { interviewQuestions, QUESTION_TOPICS, getTopicFromTags } from '@data/interviewQuestions'
import MockInterview from './MockInterview'
import type { QuestionDifficulty, QuestionCompany } from '@/types'
import { cn } from '@utils/index'

const PER_PAGE = 8

const fuse = new Fuse(interviewQuestions, {
  keys: ['title', 'question', 'tags', 'answer'],
  threshold: 0.3,
  minMatchCharLength: 2,
})

const DIFF_ORDER: Record<string, number> = {
  fundamental: 0, intermediate: 1, tricky: 2, critical: 3, 'system-design': 4,
}

// ─── QUESTION CARD ───────────────────────────────────────────────
function QuestionCard({ q, index }: { q: typeof interviewQuestions[0]; index: number }) {
  const [open, setOpen] = useState(false)
  const [tab, setTab]   = useState<'answer' | 'example' | 'tips'>('answer')
  const { isBookmarked, addBookmark, removeBookmark, addXP } = useProgressStore()
  const bookmarked = isBookmarked(q.id)

  function handleBookmark(e: React.MouseEvent) {
    e.stopPropagation()
    if (bookmarked) {
      removeBookmark(q.id)
    } else {
      addBookmark({ id: q.id, type: 'question', slug: q.id, title: q.title, addedAt: new Date().toISOString() })
      addXP(5)
    }
  }

  return (
    <Reveal delay={index * 30}>
      <div
        className="rounded-xl border overflow-hidden transition-all duration-200"
        style={{
          background: 'var(--color-card-bg)',
          borderColor: open ? 'rgba(245,158,11,0.3)' : 'var(--color-border)',
        }}
      >
        {/* Header row */}
        <button
          className="w-full flex items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-[var(--color-surface-2)]"
          onClick={() => setOpen((v) => !v)}
        >
          <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium border flex-shrink-0 mt-0.5', DIFFICULTY_STYLES[q.difficulty])}>
            {DIFFICULTY_LABELS[q.difficulty]}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium leading-snug" style={{ color: 'var(--color-text-1)' }}>{q.question}</p>
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              {q.companies.slice(0, 4).map((c) => (
                <span key={c} className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ color: 'var(--color-text-3)', background: 'var(--color-surface-2)' }}>{c}</span>
              ))}
              <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--color-text-3)' }}>
                <Clock size={10} /> {q.estimatedTime}min
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button onClick={handleBookmark}
              className={cn('w-7 h-7 rounded-md flex items-center justify-center border transition-all',
                bookmarked ? 'border-cyan-500/40 text-cyan-400' : 'border-transparent hover:border-[var(--color-border-2)]')}
              style={{ color: bookmarked ? undefined : 'var(--color-text-3)' }}>
              {bookmarked ? <BookmarkCheck size={13} /> : <BookmarkPlus size={13} />}
            </button>
            <ChevronDown size={15} className="transition-transform duration-300"
              style={{ color: 'var(--color-text-3)', transform: open ? 'rotate(180deg)' : 'none' }} />
          </div>
        </button>

        {/* Answer panel */}
        {open && (
          <div className="border-t" style={{ borderColor: 'var(--color-border)' }}>
            {/* Tabs */}
            <div className="flex border-b px-5" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-1)' }}>
              {(['answer', 'example', 'tips'] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className="px-4 py-2.5 text-xs font-medium capitalize border-b-2 transition-colors -mb-px"
                  style={{
                    borderColor: tab === t ? 'var(--color-amber)' : 'transparent',
                    color: tab === t ? 'var(--color-amber)' : 'var(--color-text-3)',
                  }}>
                  {t === 'answer' ? 'Full Answer' : t === 'example' ? 'With Example' : 'Key Tips'}
                </button>
              ))}
            </div>

            <div className="px-5 py-5">
              {/* Full Answer */}
              {tab === 'answer' && (
                <div>
                  <pre className="text-sm leading-relaxed whitespace-pre-wrap font-sans" style={{ color: 'var(--color-text-2)' }}>{q.answer}</pre>
                  {q.followUps.length > 0 && (
                    <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                      <div className="text-[10px] font-mono uppercase tracking-widest mb-2.5" style={{ color: 'var(--color-text-3)' }}>Likely follow-ups</div>
                      <div className="flex flex-wrap gap-2">
                        {q.followUps.map((f) => (
                          <span key={f} className="text-xs px-2.5 py-1 rounded-full border" style={{ color: 'var(--color-text-2)', borderColor: 'var(--color-border-2)', background: 'var(--color-surface-2)' }}>{f}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* With Example */}
              {tab === 'example' && (
                q.example
                  ? <pre className="text-sm leading-relaxed whitespace-pre-wrap font-sans p-4 rounded-lg border" style={{ color: 'var(--color-text-2)', background: 'var(--color-surface-2)', borderColor: 'var(--color-border)' }}>{q.example}</pre>
                  : <p className="text-sm" style={{ color: 'var(--color-text-3)' }}>Examples are embedded in the Full Answer tab.</p>
              )}

              {/* Key Tips */}
              {tab === 'tips' && (
                <div className="space-y-4">
                  <div className="rounded-lg p-4" style={{ background: 'rgba(34,211,238,0.05)', border: '1px solid rgba(34,211,238,0.15)' }}>
                    <div className="text-[10px] font-mono uppercase tracking-widest mb-3" style={{ color: 'var(--color-cyan)' }}>Key points to nail in your answer</div>
                    <ul className="space-y-2">
                      {q.keyPoints.map((kp, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--color-text-2)' }}>
                          <span className="text-xs font-mono mt-0.5 flex-shrink-0" style={{ color: 'var(--color-cyan)' }}>{String(i + 1).padStart(2, '0')}</span>
                          {kp}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-lg p-4" style={{ background: 'rgba(244,63,94,0.04)', border: '1px solid rgba(244,63,94,0.12)' }}>
                    <div className="text-[10px] font-mono uppercase tracking-widest mb-3 text-rose-400">Common mistakes to avoid</div>
                    <ul className="space-y-2">
                      {q.commonMistakes.map((m, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--color-text-2)' }}>
                          <span className="text-rose-400 mt-0.5 flex-shrink-0 text-xs">✗</span>{m}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: 'var(--color-text-3)' }}>Related topics</div>
                    <div className="flex flex-wrap gap-2">
                      {q.relatedTopics.map((t) => (
                        <span key={t} className="text-xs px-2.5 py-1 rounded border" style={{ color: 'var(--color-amber)', borderColor: 'rgba(245,158,11,0.25)', background: 'rgba(245,158,11,0.06)' }}>{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Reveal>
  )
}

// ─── PAGINATION ──────────────────────────────────────────────────
function Pagination({ current, total, onPage }: { current: number; total: number; onPage: (p: number) => void }) {
  if (total <= 1) return null
  const pages: (number | '...')[] = []
  if (total <= 7) { for (let i = 1; i <= total; i++) pages.push(i) }
  else {
    pages.push(1)
    if (current > 3) pages.push('...')
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i)
    if (current < total - 2) pages.push('...')
    pages.push(total)
  }
  const btn = 'w-9 h-9 rounded-lg text-sm flex items-center justify-center border transition-all'
  return (
    <div className="flex items-center justify-center gap-1.5 mt-10">
      <button onClick={() => onPage(current - 1)} disabled={current === 1} className={btn}
        style={{ borderColor: 'var(--color-border-2)', color: 'var(--color-text-1)', opacity: current === 1 ? 0.35 : 1 }}>
        <ChevronLeft size={15} />
      </button>
      {pages.map((p, i) =>
        p === '...'
          ? <span key={`d${i}`} className="w-9 h-9 flex items-center justify-center text-sm" style={{ color: 'var(--color-text-3)' }}>…</span>
          : <button key={p} onClick={() => onPage(p as number)} className={btn}
              style={{
                background: p === current ? 'var(--color-amber)' : 'transparent',
                borderColor: p === current ? 'var(--color-amber)' : 'var(--color-border-2)',
                color: p === current ? '#080808' : 'var(--color-text-2)',
                fontWeight: p === current ? 600 : 400,
              }}>{p}</button>
      )}
      <button onClick={() => onPage(current + 1)} disabled={current === total} className={btn}
        style={{ borderColor: 'var(--color-border-2)', color: 'var(--color-text-1)', opacity: current === total ? 0.35 : 1 }}>
        <ChevronRight size={15} />
      </button>
      <span className="ml-1 text-xs font-mono" style={{ color: 'var(--color-text-3)' }}>
        {current}/{total}
      </span>
    </div>
  )
}

// ─── MAIN PAGE ───────────────────────────────────────────────────
export default function InterviewPage() {
  const [search, setSearch]         = useState('')
  const [difficulty, setDifficulty] = useState<QuestionDifficulty | 'all'>('all')
  const [company, setCompany]       = useState<QuestionCompany | 'all'>('all')
  const [topic, setTopic]           = useState('all')
  const [page, setPage]             = useState(1)
  const [pageTab, setPageTab]       = useState<'browse' | 'mock'>('browse')
  const debounced                   = useDebounce(search, 250)

  const filtered = useMemo(() => {
    let list = debounced.trim().length > 1 ? fuse.search(debounced).map((r) => r.item) : [...interviewQuestions]
    if (difficulty !== 'all') list = list.filter((q) => q.difficulty === difficulty)
    if (company !== 'all')    list = list.filter((q) => q.companies.includes(company as QuestionCompany))
    if (topic !== 'all')      list = list.filter((q) => getTopicFromTags(q.tags) === topic)
    return list.sort((a, b) => DIFF_ORDER[a.difficulty] - DIFF_ORDER[b.difficulty])
  }, [debounced, difficulty, company, topic])

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const go = (p: number) => { setPage(p); window.scrollTo({ top: 280, behavior: 'smooth' }) }

  const setF = useCallback(<T,>(fn: (v: T) => void, v: T) => { fn(v); setPage(1) }, [])

  const active = [difficulty !== 'all', company !== 'all', topic !== 'all', debounced.length > 0].filter(Boolean).length

  const stats = useMemo(() => ({
    total: interviewQuestions.length,
    byDiff: Object.fromEntries(
      ['fundamental','intermediate','tricky','critical','system-design'].map((d) => [
        d, interviewQuestions.filter((q) => q.difficulty === d).length
      ])
    ),
  }), [])

  return (
    <>
      <Helmet>
        <title>Interview Prep — Synaptica</title>
        <meta name="description" content="ML interview questions with full answers, real examples, and tips. Google, Meta, Amazon, OpenAI." />
      </Helmet>

      {/* Header */}
      <div className="border-b py-14 px-6 sm:px-10 lg:px-16" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-1)' }}>
        <div className="max-w-[1400px] mx-auto">
          <Reveal><SectionLabel>Interview Preparation</SectionLabel></Reveal>
          <Reveal delay={80}>
            <SectionTitle>ML Interview <em style={{ color: 'var(--color-amber)', fontStyle: 'italic' }}>Mastery</em></SectionTitle>
          </Reveal>
          <Reveal delay={220}>
            <div className="flex gap-1 mt-6 p-1 rounded-xl border w-fit"
              style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)' }}>
              {([
                { id: 'browse', label: 'Browse Q&A',      icon: ChevronDown },
                { id: 'mock',   label: 'Mock Interview',  icon: Timer       },
              ] as const).map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setPageTab(id)}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200"
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
          <Reveal delay={160}>
            <p className="text-base mt-3 max-w-2xl" style={{ color: 'var(--color-text-2)' }}>
              Every answer explained clearly with a real data example so you understand and remember it. Covers fundamentals to system design — exactly what top companies ask.
            </p>
          </Reveal>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 py-10">

        {/* Mock Interview Tab */}
        {pageTab === 'mock' && (
          <div className="max-w-2xl">
            <MockInterview />
          </div>
        )}

        {/* Browse Tab */}
        {pageTab === 'browse' && (<>

        {/* Stats */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-8">
          {[
            { label: 'Total', value: stats.total, color: 'var(--color-text-1)' },
            { label: 'Fundamental', value: stats.byDiff['fundamental'], color: 'var(--color-cyan)' },
            { label: 'Intermediate', value: stats.byDiff['intermediate'], color: '#60a5fa' },
            { label: 'Tricky', value: stats.byDiff['tricky'], color: 'var(--color-amber)' },
            { label: 'Critical', value: stats.byDiff['critical'], color: '#f43f5e' },
            { label: 'Sys Design', value: stats.byDiff['system-design'], color: '#c084fc' },
          ].map((s) => (
            <div key={s.label} className="rounded-lg px-3 py-3 text-center border" style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)' }}>
              <div className="text-xl font-bold font-mono" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[10px] uppercase tracking-wide mt-0.5" style={{ color: 'var(--color-text-3)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Topic pills */}
        <div className="flex flex-wrap gap-2 mb-5">
          {QUESTION_TOPICS.map((t) => (
            <button key={t.value} onClick={() => setF(setTopic, t.value)}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all"
              style={{
                background: topic === t.value ? 'var(--color-amber-dim)' : 'transparent',
                borderColor: topic === t.value ? 'rgba(245,158,11,0.4)' : 'var(--color-border-2)',
                color: topic === t.value ? 'var(--color-amber)' : 'var(--color-text-3)',
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap gap-3 items-center mb-6 p-3.5 rounded-xl border" style={{ background: 'var(--color-surface-1)', borderColor: 'var(--color-border)' }}>
          <div className="relative flex-1 min-w-[160px] max-w-xs">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--color-text-3)' }} />
            <input type="text" placeholder="Search questions..." value={search} onChange={(e) => setF(setSearch, e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border outline-none focus:border-amber-500/50 transition-colors"
              style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border-2)', color: 'var(--color-text-1)' }} />
            {search && <button onClick={() => setF(setSearch, '')} className="absolute right-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-3)' }}><X size={12} /></button>}
          </div>
          <select value={difficulty} onChange={(e) => setF(setDifficulty, e.target.value as QuestionDifficulty | 'all')}
            className="text-xs py-2 px-2.5 rounded-lg border outline-none"
            style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border-2)', color: 'var(--color-text-2)' }}>
            <option value="all">All difficulties</option>
            {Object.entries(DIFFICULTY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <select value={company} onChange={(e) => setF(setCompany, e.target.value as QuestionCompany | 'all')}
            className="text-xs py-2 px-2.5 rounded-lg border outline-none"
            style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border-2)', color: 'var(--color-text-2)' }}>
            <option value="all">All companies</option>
            {COMPANY_TAGS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {active > 0 && (
            <button onClick={() => { setSearch(''); setDifficulty('all'); setCompany('all'); setTopic('all'); setPage(1) }}
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border"
              style={{ color: '#f43f5e', borderColor: 'rgba(244,63,94,0.25)', background: 'rgba(244,63,94,0.06)' }}>
              <X size={11} /> Clear {active}
            </button>
          )}
          <span className="text-xs font-mono ml-auto" style={{ color: 'var(--color-text-3)' }}>{filtered.length} questions</span>
        </div>

        {/* Questions list */}
        {paginated.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-3)' }}>No questions matched your filters</p>
            <button onClick={() => { setSearch(''); setDifficulty('all'); setCompany('all'); setTopic('all'); setPage(1) }} className="text-sm underline" style={{ color: 'var(--color-amber)' }}>Clear all filters</button>
          </div>
        ) : (
          <div className="space-y-3">
            {paginated.map((q, i) => <QuestionCard key={q.id} q={q} index={i} />)}
          </div>
        )}

        <Pagination current={page} total={totalPages} onPage={go} />
        </>)} {/* end browse tab */}
      </div>
    </>
  )
}