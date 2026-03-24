import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookmarkPlus, BookmarkCheck, GitCompare, ArrowRight } from 'lucide-react'
import { Badge, ScoreBar, Card } from '@components/ui/index'
import { useProgressStore } from '@store/progressStore'
import { useCompareStore } from '@store/filterStore'
import { cn, scoreColor } from '@utils/index'
import type { Algorithm } from '@/types'

interface AlgorithmCardProps {
  algo: Algorithm
  index?: number
  compact?: boolean
}

export default function AlgorithmCard({ algo, index = 0, compact = false }: AlgorithmCardProps) {
  const navigate = useNavigate()
  const { isBookmarked, addBookmark, removeBookmark, addXP } = useProgressStore()
  const { isInCompare, addToCompare, removeFromCompare, canAddMore } = useCompareStore()

  const bookmarked = isBookmarked(algo.id)
  const comparing = isInCompare(algo.slug)

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
    >
      <Card
        hover
        onClick={handleClick}
        className={cn(
          'group relative overflow-hidden p-5',
          comparing && 'ring-1 ring-amber-500/50'
        )}
      >
        {/* Top accent line — draws in on hover */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
          style={{ background: 'linear-gradient(90deg, var(--color-amber), var(--color-cyan))' }}
        />

        {/* Ambient glow on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top left, var(--color-amber-dim) 0%, transparent 65%)' }}
        />

        {/* Header */}
        <div className="relative flex items-start justify-between mb-3">
          <Badge category={algo.category}>{algo.subcategory}</Badge>
          <div className="flex gap-1.5">
            {/* Compare toggle */}
            <button
              onClick={handleCompare}
              title={comparing ? 'Remove from compare' : canAddMore() ? 'Add to compare' : 'Compare full (max 4)'}
              className={cn(
                'w-7 h-7 rounded-md flex items-center justify-center transition-all duration-200 border text-[10px]',
                comparing
                  ? 'border-amber-500/40 text-amber-400'
                  : 'border-transparent opacity-0 group-hover:opacity-100 hover:border-[var(--color-border-2)]'
              )}
              style={{ color: comparing ? undefined : 'var(--color-text-3)' }}
            >
              <GitCompare size={12} />
            </button>

            {/* Bookmark toggle */}
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

        {/* Title */}
        <h3
          className="relative text-[15px] font-medium mb-1.5 group-hover:text-amber-400 transition-colors"
          style={{ color: 'var(--color-text-1)' }}
        >
          {algo.name}
        </h3>

        {/* Year */}
        <p className="relative text-[11px] font-mono mb-2.5" style={{ color: 'var(--color-text-3)' }}>
          {algo.year} · {algo.complexity.time}
        </p>

        {/* Description */}
        {!compact && (
          <p className="relative text-xs leading-relaxed mb-4 line-clamp-2" style={{ color: 'var(--color-text-3)' }}>
            {algo.description}
          </p>
        )}

        {/* Rating pills */}
        <div className="relative flex flex-wrap gap-1.5 mb-4">
          {[
            { label: 'Accuracy', val: algo.ratings.accuracy },
            { label: 'Speed',    val: algo.ratings.speed },
            { label: 'Scale',    val: algo.ratings.scalability },
          ].map(({ label, val }) => (
            <span
              key={label}
              className="text-[10px] font-mono px-2 py-0.5 rounded border"
              style={{
                background: 'var(--color-surface-2)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-2)',
              }}
            >
              {label} <span className={scoreColor(val)}>{val}</span>
            </span>
          ))}
        </div>

        {/* Overall score bar */}
        <div className="relative">
          <ScoreBar label="Overall score" value={algo.overallScore} />
        </div>

        {/* Footer */}
        <div className="relative flex items-center justify-between mt-3 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex gap-1 flex-wrap">
            {algo.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-[9px] font-mono uppercase tracking-wide px-1.5 py-0.5 rounded"
                style={{ background: 'var(--color-surface-3)', color: 'var(--color-text-3)' }}
              >
                {tag}
              </span>
            ))}
          </div>
          <div
            className="flex items-center gap-1 text-[11px] opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: 'var(--color-amber)' }}
          >
            Deep dive <ArrowRight size={11} />
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
