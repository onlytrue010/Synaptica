import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookmarkPlus, BookmarkCheck, GitCompare, ArrowRight } from 'lucide-react'
import { Badge, ScoreBar, Card } from '@components/ui/index'
import { useProgressStore } from '@store/progressStore'
import { useCompareStore } from '@store/filterStore'
import { cn, scoreColor } from '@utils/index'
import type { Algorithm } from '@/types'

interface AlgorithmCardProps {
  algo:     Algorithm
  index?:   number
  compact?: boolean
}

export default function AlgorithmCard({ algo, index = 0, compact = false }: AlgorithmCardProps) {
  const navigate = useNavigate()
  const { isBookmarked, addBookmark, removeBookmark, addXP } = useProgressStore()
  const { isInCompare, addToCompare, removeFromCompare, canAddMore } = useCompareStore()

  const bookmarked = isBookmarked(algo.id)
  const comparing  = isInCompare(algo.slug)

  function handleBookmark(e: React.MouseEvent) {
    e.stopPropagation()
    if (bookmarked) {
      removeBookmark(algo.id)
    } else {
      addBookmark({ id: algo.id, type: 'algorithm', slug: algo.slug, title: algo.name, addedAt: new Date().toISOString() })
      addXP(5)
    }
  }

  function handleCompare(e: React.MouseEvent) {
    e.stopPropagation()
    if (comparing) removeFromCompare(algo.slug)
    else if (canAddMore()) addToCompare(algo.slug)
  }

  function handleClick() {
    navigate(`/algorithms/${algo.slug}`)
    addXP(10)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="h-full"
    >
      <Card
        hover
        onClick={handleClick}
        className={cn(
          'group relative overflow-hidden p-5 flex flex-col h-full',
          comparing && 'ring-1 ring-amber-500/50'
        )}
      >
        {/* Top accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
          style={{ background: 'linear-gradient(90deg, var(--color-amber), var(--color-cyan))' }}
        />

        {/* Ambient glow on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top left, var(--color-amber-dim) 0%, transparent 65%)' }}
        />

        {/* ── ZONE 1: Badge + actions — fixed ──────────────── */}
        <div className="relative flex items-start justify-between mb-3 flex-shrink-0">
          <Badge category={algo.category}>{algo.subcategory}</Badge>
          <div className="flex gap-1.5 flex-shrink-0">
            <button
              onClick={handleCompare}
              title={comparing ? 'Remove from compare' : canAddMore() ? 'Add to compare' : 'Compare full (max 4)'}
              className={cn(
                'w-7 h-7 rounded-md flex items-center justify-center transition-all duration-200 border',
                comparing
                  ? 'border-amber-500/40 text-amber-400'
                  : 'border-transparent opacity-0 group-hover:opacity-100 hover:border-[var(--color-border-2)]'
              )}
              style={{ color: comparing ? undefined : 'var(--color-text-3)' }}
            >
              <GitCompare size={12} />
            </button>
            <button
              onClick={handleBookmark}
              title={bookmarked ? 'Remove bookmark' : 'Bookmark'}
              className={cn(
                'w-7 h-7 rounded-md flex items-center justify-center transition-all duration-200 border',
                bookmarked
                  ? 'border-cyan-500/40 text-cyan-400'
                  : 'border-transparent opacity-0 group-hover:opacity-100 hover:border-[var(--color-border-2)]'
              )}
              style={{ color: bookmarked ? undefined : 'var(--color-text-3)' }}
            >
              {bookmarked ? <BookmarkCheck size={12} /> : <BookmarkPlus size={12} />}
            </button>
          </div>
        </div>

        {/* ── ZONE 2: Title — exactly 2 lines, no more ─────────
            height: 2.6em = 2 lines × 1.3 line-height at 15px.
            overflow:hidden + display:-webkit-box does the clamp.
            This zone is always the same height across all cards. */}
        <h3
          className="relative font-medium group-hover:text-amber-400 transition-colors flex-shrink-0"
          style={{
            fontSize:          '15px',
            color:             'var(--color-text-1)',
            lineHeight:        '1.35',
            height:            '2.7em',       // exactly 2 lines
            overflow:          'hidden',
            display:           '-webkit-box',
            WebkitLineClamp:   2,
            WebkitBoxOrient:   'vertical',
            marginBottom:      '6px',
          }}
        >
          {algo.name}
        </h3>

        {/* ── ZONE 3: Year + complexity — 1 line, truncated ─── */}
        <p
          className="relative font-mono flex-shrink-0"
          style={{
            fontSize:     '11px',
            color:        'var(--color-text-3)',
            height:       '1.4em',
            overflow:     'hidden',
            whiteSpace:   'nowrap',
            textOverflow: 'ellipsis',
            marginBottom: '10px',
          }}
        >
          {algo.year} · {algo.complexity.time}
        </p>

        {/* ── ZONE 4: Description — exactly 3 lines, always ────
            3 lines × 1.5 line-height × 13px ≈ 58px.
            flex-shrink-0 + fixed height = same space on every card.
            Short descriptions leave whitespace. Long ones clip at 3. */}
        {!compact && (
          <div
            className="relative flex-shrink-0"
            style={{
              height:       '58px',     // 3 lines at 13px × 1.5 line-height
              overflow:     'hidden',
              marginBottom: '16px',
            }}
          >
            <p
              style={{
                fontSize:    '13px',
                lineHeight:  '1.5',
                color:       'var(--color-text-3)',
                margin:      0,
              }}
            >
              {algo.description}
            </p>
          </div>
        )}

        {/* ── ZONE 5: Rating pills — flex-shrink-0 ─────────── */}
        <div className="relative flex flex-wrap gap-1.5 mb-4 flex-shrink-0">
          {[
            { label: 'Accuracy', val: algo.ratings.accuracy    },
            { label: 'Speed',    val: algo.ratings.speed       },
            { label: 'Scale',    val: algo.ratings.scalability },
          ].map(({ label, val }) => (
            <span
              key={label}
              className="font-mono rounded border"
              style={{
                fontSize:    '11px',
                padding:     '2px 8px',
                background:  'var(--color-surface-2)',
                borderColor: 'var(--color-border)',
                color:       'var(--color-text-2)',
              }}
            >
              {label} <span className={scoreColor(val)}>{val}</span>
            </span>
          ))}
        </div>

        {/* ── ZONE 6: Score bar — flex-shrink-0 ───────────── */}
        <div className="relative flex-shrink-0">
          <ScoreBar label="Overall score" value={algo.overallScore} />
        </div>

        {/* ── ZONE 7: Footer — pushed to bottom via mt-auto ───
            mt-auto absorbs all leftover space above it so the
            footer border always sits at the very bottom.       */}
        <div
          className="relative flex items-center justify-between mt-auto pt-3 border-t"
          style={{ borderColor: 'var(--color-border)', marginTop: '12px' }}
        >
          <div className="flex gap-1 flex-wrap">
            {algo.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="font-mono uppercase tracking-wide rounded"
                style={{
                  fontSize:   '10px',
                  padding:    '2px 6px',
                  background: 'var(--color-surface-3)',
                  color:      'var(--color-text-3)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
          <div
            className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
            style={{ fontSize: '11px', color: 'var(--color-amber)' }}
          >
            Deep dive <ArrowRight size={11} />
          </div>
        </div>
      </Card>
    </motion.div>
  )
}