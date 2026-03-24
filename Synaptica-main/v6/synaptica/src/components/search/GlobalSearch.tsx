import { useEffect, useRef, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Fuse from 'fuse.js'
import { Search, X, Clock, Hash, BookOpen, MessageCircle, ArrowRight, Command, Layers } from 'lucide-react'
import { useSearchStore } from '@store/searchStore'
import { algorithms } from '@data/algorithms'
import { interviewQuestions } from '@data/interviewQuestions'
import { DIFFICULTY_STYLES, DIFFICULTY_LABELS } from '@constants/index'
import { cn } from '@utils/index'

// ── Inline timeline data for search (lightweight — just title/desc/year)
const TIMELINE_ITEMS = [
  { id: 'tl-turing',      title: 'Turing Test (1950)',          desc: 'Alan Turing proposes "Can machines think?"',                   year: 1950 },
  { id: 'tl-perceptron',  title: 'Perceptron (1957)',           desc: 'Frank Rosenblatt invents the first trainable neural network', year: 1957 },
  { id: 'tl-backprop',    title: 'Backpropagation (1986)',      desc: 'Rumelhart, Hinton & Williams popularize backprop for MLPs',   year: 1986 },
  { id: 'tl-cnn',         title: 'LeNet / CNN (1989)',          desc: 'LeCun trains first practical CNN for digit recognition',      year: 1989 },
  { id: 'tl-svm-kernel',  title: 'Kernel SVM (1992)',           desc: 'Boser, Guyon & Vapnik introduce the kernel trick',           year: 1992 },
  { id: 'tl-lstm',        title: 'LSTM (1997)',                 desc: 'Hochreiter & Schmidhuber solve the vanishing gradient',      year: 1997 },
  { id: 'tl-rf',          title: 'Random Forest (2001)',        desc: 'Leo Breiman combines bagging + feature randomness',          year: 2001 },
  { id: 'tl-imagenet',    title: 'ImageNet (2009)',             desc: 'Fei-Fei Li assembles 14M image training dataset',            year: 2009 },
  { id: 'tl-alexnet',     title: 'AlexNet (2012)',              desc: 'Deep CNN cuts ImageNet error by 10% — starts revolution',    year: 2012 },
  { id: 'tl-word2vec',    title: 'Word2Vec (2013)',             desc: 'Mikolov creates dense word embeddings',                      year: 2013 },
  { id: 'tl-gan',         title: 'GANs (2014)',                 desc: 'Goodfellow invents Generative Adversarial Networks',        year: 2014 },
  { id: 'tl-resnet',      title: 'ResNet (2015)',               desc: 'He et al. solve deep training with residual connections',    year: 2015 },
  { id: 'tl-transformer', title: 'Transformer (2017)',          desc: '"Attention Is All You Need" — Vaswani et al.',               year: 2017 },
  { id: 'tl-bert',        title: 'BERT (2018)',                 desc: 'Bidirectional pre-trained language model from Google',       year: 2018 },
  { id: 'tl-gpt3',        title: 'GPT-3 (2020)',               desc: '175B parameter model shows emergent few-shot learning',      year: 2020 },
  { id: 'tl-chatgpt',     title: 'ChatGPT / RLHF (2022)',      desc: 'Instruction tuning + human feedback reaches 100M users',    year: 2022 },
  { id: 'tl-diffusion',   title: 'Diffusion Models (2022)',    desc: 'Stable Diffusion democratizes image generation',             year: 2022 },
  { id: 'tl-reasoning',   title: 'Reasoning Models (2024)',    desc: 'o1/o3 scale test-time compute — models think before answering', year: 2024 },
]

// ── Quick-access glossary terms for search
const GLOSSARY_ITEMS = [
  { id: 'gl-overfitting',      title: 'Overfitting',           desc: 'When a model fits training data too closely and fails to generalize' },
  { id: 'gl-underfitting',     title: 'Underfitting',          desc: 'When a model is too simple to capture the underlying patterns' },
  { id: 'gl-gradient-descent', title: 'Gradient Descent',      desc: 'Optimization algorithm that iteratively moves toward minimum loss' },
  { id: 'gl-regularization',   title: 'Regularization',        desc: 'Techniques (L1, L2, dropout) that reduce overfitting' },
  { id: 'gl-cross-validation', title: 'Cross-Validation',      desc: 'Model evaluation using multiple train/test splits' },
  { id: 'gl-hyperparameter',   title: 'Hyperparameter',        desc: 'Model configuration set before training (e.g. learning rate, depth)' },
  { id: 'gl-embedding',        title: 'Embedding',             desc: 'Dense vector representation of discrete data (words, items)' },
  { id: 'gl-attention',        title: 'Attention Mechanism',   desc: 'Computes weighted sum of values based on query-key similarity' },
  { id: 'gl-batch-norm',       title: 'Batch Normalization',   desc: 'Normalizes layer inputs for more stable, faster training' },
  { id: 'gl-dropout',          title: 'Dropout',               desc: 'Randomly zeros neurons during training to prevent co-adaptation' },
  { id: 'gl-relu',             title: 'ReLU',                  desc: 'Rectified Linear Unit: max(0,x) — most common activation function' },
  { id: 'gl-softmax',          title: 'Softmax',               desc: 'Converts logits into a probability distribution (sums to 1)' },
  { id: 'gl-loss-function',    title: 'Loss Function',         desc: 'Measures prediction error — what the optimizer minimizes' },
  { id: 'gl-epoch',            title: 'Epoch',                 desc: 'One full pass through the training dataset' },
  { id: 'gl-precision',        title: 'Precision',             desc: 'TP / (TP + FP) — fraction of positive predictions that are correct' },
  { id: 'gl-recall',           title: 'Recall',                desc: 'TP / (TP + FN) — fraction of actual positives correctly identified' },
  { id: 'gl-f1',               title: 'F1 Score',              desc: 'Harmonic mean of precision and recall' },
  { id: 'gl-roc-auc',          title: 'ROC-AUC',               desc: 'Area under the receiver operating characteristic curve (0.5–1.0)' },
  { id: 'gl-bias',             title: 'Bias (Statistical)',    desc: 'Systematic error — how far predictions are from the truth on average' },
  { id: 'gl-variance',         title: 'Variance (Statistical)','desc': 'How much predictions change with different training data' },
]

// Build unified search index
const ALGO_INDEX = new Fuse(algorithms, {
  keys: [
    { name: 'name',        weight: 0.5 },
    { name: 'description', weight: 0.3 },
    { name: 'tags',        weight: 0.2 },
    { name: 'subcategory', weight: 0.1 },
  ],
  threshold: 0.35,
  includeScore: true,
})

const IQ_INDEX = new Fuse(interviewQuestions, {
  keys: [
    { name: 'title',    weight: 0.5 },
    { name: 'question', weight: 0.4 },
    { name: 'tags',     weight: 0.1 },
  ],
  threshold: 0.35,
  includeScore: true,
})

const TL_INDEX = new Fuse(TIMELINE_ITEMS, {
  keys: [{ name: 'title', weight: 0.6 }, { name: 'desc', weight: 0.4 }],
  threshold: 0.4,
  includeScore: true,
})

const GL_INDEX = new Fuse(GLOSSARY_ITEMS, {
  keys: [{ name: 'title', weight: 0.7 }, { name: 'desc', weight: 0.3 }],
  threshold: 0.35,
  includeScore: true,
})

const QUICK_LINKS = [
  { label: 'All Algorithms',    path: '/algorithms',   icon: BookOpen     },
  { label: 'Compare Tool',      path: '/compare',      icon: ArrowRight   },
  { label: 'ML Timeline',       path: '/timeline',     icon: Clock        },
  { label: 'Interview Prep',    path: '/interview',    icon: MessageCircle },
  { label: 'Live Lab',          path: '/lab',          icon: Hash         },
  { label: 'Learning Paths',    path: '/learning',     icon: BookOpen     },
  { label: 'Glossary',          path: '/glossary',     icon: Layers       },
  { label: 'Cheat Sheets',      path: '/cheatsheets',  icon: Hash         },
]

const CATEGORY_COLORS: Record<string, string> = {
  supervised:       'text-emerald-400',
  unsupervised:     'text-cyan-400',
  ensemble:         'text-amber-400',
  'deep-learning':  'text-purple-400',
  reinforcement:    'text-rose-400',
  'self-supervised':'text-teal-400',
  generative:       'text-pink-400',
}

export default function GlobalSearch() {
  const { isOpen, query, recentSearches, closeSearch, setQuery, addRecent, clearRecent } = useSearchStore()
  const navigate   = useNavigate()
  const inputRef   = useRef<HTMLInputElement>(null)
  const listRef    = useRef<HTMLDivElement>(null)
  const [cursor, setCursor] = useState(0)

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setCursor(0)
    }
  }, [isOpen])

  // Keyboard shortcut Cmd/Ctrl + K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        useSearchStore.getState().isOpen
          ? closeSearch()
          : useSearchStore.getState().openSearch()
      }
      if (e.key === 'Escape' && isOpen) closeSearch()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, closeSearch])

  const results = useMemo(() => {
    if (!query.trim()) return null
    const algoResults = ALGO_INDEX.search(query, { limit: 4 }).map((r) => ({
      type:  'algorithm' as const,
      id:    r.item.slug,
      title: r.item.name,
      sub:   r.item.subcategory,
      meta:  r.item.category,
      path:  `/algorithms/${r.item.slug}`,
      score: r.score ?? 1,
    }))
    const iqResults = IQ_INDEX.search(query, { limit: 3 }).map((r) => ({
      type:  'question' as const,
      id:    r.item.id,
      title: r.item.title,
      sub:   r.item.question.slice(0, 60) + '…',
      meta:  r.item.difficulty,
      path:  `/interview`,
      score: r.score ?? 1,
    }))
    const tlResults = TL_INDEX.search(query, { limit: 3 }).map((r) => ({
      type:  'timeline' as const,
      id:    r.item.id,
      title: r.item.title,
      sub:   r.item.desc,
      meta:  String(r.item.year),
      path:  `/timeline`,
      score: r.score ?? 1,
    }))
    const glResults = GL_INDEX.search(query, { limit: 3 }).map((r) => ({
      type:  'glossary' as const,
      id:    r.item.id,
      title: r.item.title,
      sub:   r.item.desc,
      meta:  'glossary',
      path:  `/glossary`,
      score: r.score ?? 1,
    }))
    return { algorithms: algoResults, questions: iqResults, timeline: tlResults, glossary: glResults }
  }, [query])

  const flatItems = useMemo(() => {
    if (!results) return QUICK_LINKS.map((l) => ({ ...l, type: 'link' as const }))
    return [
      ...results.algorithms.map((r) => ({ ...r, label: r.title })),
      ...results.questions.map((r)  => ({ ...r, label: r.title })),
      ...results.timeline.map((r)   => ({ ...r, label: r.title })),
      ...results.glossary.map((r)   => ({ ...r, label: r.title })),
    ]
  }, [results])

  function navigate_to(path: string, term?: string) {
    if (term) addRecent(term)
    closeSearch()
    navigate(path)
  }

  // Arrow key navigation
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setCursor((c) => Math.min(c + 1, flatItems.length - 1)) }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)) }
      if (e.key === 'Enter' && flatItems[cursor]) {
        const item = flatItems[cursor]
        navigate_to(item.path, query || undefined)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, cursor, flatItems, query])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-[200] flex items-start justify-center pt-[12vh] px-4"
        style={{ background: 'rgba(7,8,12,0.75)', backdropFilter: 'blur(8px)' }}
        onClick={(e) => { if (e.target === e.currentTarget) closeSearch() }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -12 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-2xl rounded-2xl border overflow-hidden"
          style={{
            background: 'var(--color-surface-2)',
            borderColor: 'var(--color-border-2)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(245,158,11,0.08)',
          }}
        >
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <Search size={17} style={{ color: 'var(--color-amber)', flexShrink: 0 }} />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search algorithms, questions, topics…"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setCursor(0) }}
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: 'var(--color-text-1)' }}
            />
            {query && (
              <button onClick={() => setQuery('')} className="p-1 rounded transition-colors hover:bg-[var(--color-surface-3)]" style={{ color: 'var(--color-text-3)' }}>
                <X size={14} />
              </button>
            )}
            <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono border" style={{ color: 'var(--color-text-3)', borderColor: 'var(--color-border)' }}>
              <span>Esc</span>
            </kbd>
          </div>

          {/* Results */}
          <div ref={listRef} className="overflow-y-auto" style={{ maxHeight: '60vh' }}>

            {/* No query — show recent + quick links */}
            {!query.trim() && (
              <div>
                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between px-4 pt-4 pb-2">
                      <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: 'var(--color-text-3)' }}>Recent</span>
                      <button onClick={clearRecent} className="text-[10px] hover:underline" style={{ color: 'var(--color-text-3)' }}>Clear</button>
                    </div>
                    {recentSearches.map((r, i) => (
                      <button key={r} onClick={() => { setQuery(r); setCursor(0) }}
                        className={cn('w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors', i === cursor ? 'bg-[var(--color-surface-3)]' : 'hover:bg-[var(--color-surface-3)]')}>
                        <Clock size={13} style={{ color: 'var(--color-text-3)' }} />
                        <span className="text-sm" style={{ color: 'var(--color-text-2)' }}>{r}</span>
                      </button>
                    ))}
                  </div>
                )}
                <div className="px-4 pt-4 pb-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: 'var(--color-text-3)' }}>Quick Links</span>
                </div>
                <div className="grid grid-cols-2 gap-1 px-3 pb-4">
                  {QUICK_LINKS.map((l) => (
                    <button key={l.path} onClick={() => navigate_to(l.path)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-colors hover:bg-[var(--color-surface-3)]">
                      <l.icon size={14} style={{ color: 'var(--color-amber)', flexShrink: 0 }} />
                      <span className="text-xs" style={{ color: 'var(--color-text-2)' }}>{l.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Has query — show results */}
            {query.trim() && results && (
              <div className="py-2">
                {/* Algorithm results */}
                {results.algorithms.length > 0 && (
                  <div>
                    <div className="px-4 py-2">
                      <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: 'var(--color-text-3)' }}>Algorithms</span>
                    </div>
                    {results.algorithms.map((r, i) => (
                      <button key={r.id} onClick={() => navigate_to(r.path, query)}
                        className={cn('w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                          i === cursor ? 'bg-[var(--color-surface-3)]' : 'hover:bg-[var(--color-surface-3)]')}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--color-surface-3)' }}>
                          <BookOpen size={14} style={{ color: 'var(--color-amber)' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium" style={{ color: 'var(--color-text-1)' }}>{r.title}</div>
                          <div className="text-xs truncate" style={{ color: 'var(--color-text-3)' }}>{r.sub}</div>
                        </div>
                        <span className={cn('text-[10px] font-mono capitalize', CATEGORY_COLORS[r.meta] ?? 'text-gray-400')}>
                          {r.meta}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Question results */}
                {results.questions.length > 0 && (
                  <div>
                    <div className="px-4 py-2">
                      <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: 'var(--color-text-3)' }}>Interview Questions</span>
                    </div>
                    {results.questions.map((r, i) => {
                      const idx = results.algorithms.length + i
                      return (
                        <button key={r.id} onClick={() => navigate_to(r.path, query)}
                          className={cn('w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                            idx === cursor ? 'bg-[var(--color-surface-3)]' : 'hover:bg-[var(--color-surface-3)]')}>
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--color-surface-3)' }}>
                            <MessageCircle size={14} style={{ color: 'var(--color-cyan)' }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate" style={{ color: 'var(--color-text-1)' }}>{r.title}</div>
                            <div className="text-xs truncate" style={{ color: 'var(--color-text-3)' }}>{r.sub}</div>
                          </div>
                          <span className={cn('text-[10px] font-mono border px-1.5 py-0.5 rounded', DIFFICULTY_STYLES[r.meta as keyof typeof DIFFICULTY_STYLES] ?? '')}>
                            {DIFFICULTY_LABELS[r.meta as keyof typeof DIFFICULTY_LABELS] ?? r.meta}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* No results */}
                {results.algorithms.length === 0 && results.questions.length === 0 && results.timeline.length === 0 && results.glossary.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-3xl mb-3">🔍</div>
                    <p className="text-sm" style={{ color: 'var(--color-text-3)' }}>No results for "{query}"</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-3)' }}>Try "random forest", "overfitting", or "attention"</p>
                  </div>
                )}

                {/* Timeline results */}
                {results.timeline.length > 0 && (
                  <div>
                    <div className="px-4 py-2">
                      <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: 'var(--color-text-3)' }}>ML Timeline</span>
                    </div>
                    {results.timeline.map((r, i) => {
                      const idx = results.algorithms.length + results.questions.length + i
                      return (
                        <button key={r.id} onClick={() => navigate_to(r.path, query)}
                          className={cn('w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                            idx === cursor ? 'bg-[var(--color-surface-3)]' : 'hover:bg-[var(--color-surface-3)]')}>
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--color-surface-3)' }}>
                            <Clock size={14} style={{ color: 'var(--color-emerald)' }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium" style={{ color: 'var(--color-text-1)' }}>{r.title}</div>
                            <div className="text-xs truncate" style={{ color: 'var(--color-text-3)' }}>{r.sub}</div>
                          </div>
                          <span className="text-[10px] font-mono flex-shrink-0" style={{ color: 'var(--color-text-3)' }}>{r.meta}</span>
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* Glossary results */}
                {results.glossary.length > 0 && (
                  <div>
                    <div className="px-4 py-2">
                      <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: 'var(--color-text-3)' }}>Glossary</span>
                    </div>
                    {results.glossary.map((r, i) => {
                      const idx = results.algorithms.length + results.questions.length + results.timeline.length + i
                      return (
                        <button key={r.id} onClick={() => navigate_to(r.path, query)}
                          className={cn('w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                            idx === cursor ? 'bg-[var(--color-surface-3)]' : 'hover:bg-[var(--color-surface-3)]')}>
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--color-surface-3)' }}>
                            <Layers size={14} style={{ color: '#c084fc' }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium" style={{ color: 'var(--color-text-1)' }}>{r.title}</div>
                            <div className="text-xs truncate" style={{ color: 'var(--color-text-3)' }}>{r.sub}</div>
                          </div>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded flex-shrink-0"
                            style={{ color: '#c084fc', background: 'rgba(192,132,252,0.1)', border: '1px solid rgba(192,132,252,0.2)' }}>
                            term
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer hint */}
          <div className="flex items-center gap-4 px-4 py-2.5 border-t" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-1)' }}>
            <div className="flex items-center gap-1.5 text-[10px]" style={{ color: 'var(--color-text-3)' }}>
              <kbd className="px-1.5 py-0.5 rounded border text-[9px]" style={{ borderColor: 'var(--color-border)' }}>↑↓</kbd> navigate
            </div>
            <div className="flex items-center gap-1.5 text-[10px]" style={{ color: 'var(--color-text-3)' }}>
              <kbd className="px-1.5 py-0.5 rounded border text-[9px]" style={{ borderColor: 'var(--color-border)' }}>↵</kbd> open
            </div>
            <div className="flex items-center gap-1.5 text-[10px]" style={{ color: 'var(--color-text-3)' }}>
              <kbd className="px-1.5 py-0.5 rounded border text-[9px]" style={{ borderColor: 'var(--color-border)' }}>Esc</kbd> close
            </div>
            <div className="ml-auto flex items-center gap-1.5 text-[10px]" style={{ color: 'var(--color-text-3)' }}>
              <Command size={10} />
              <kbd className="px-1.5 py-0.5 rounded border text-[9px]" style={{ borderColor: 'var(--color-border)' }}>K</kbd>
              to open anywhere
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}