import { useState, useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { Search, X, ExternalLink, Copy, CheckCheck } from 'lucide-react'
import { SectionLabel, SectionTitle, Reveal, Badge } from '@components/ui/index'
import { algorithms } from '@data/algorithms'
import { ALGORITHM_CATEGORIES } from '@constants/index'
import { cn } from '@utils/index'
import type { AlgorithmCategory } from '@/types'

// ─── CHEAT SHEET DATA ─────────────────────────────────────────────
// Each card is generated from algorithm data + manually curated quick-ref fields
interface CheatSheet {
  slug:         string
  name:         string
  category:     AlgorithmCategory
  subcategory:  string
  tagline:      string         // one-line summary
  whenToUse:    string[]       // 3 bullets
  avoid:        string[]       // 2 bullets
  keyFormula:   string         // the ONE formula to remember
  formulaLabel: string
  defaultParams: { key: string; value: string; note: string }[]
  quickCode:    string         // 5-8 line snippet
  watchOut:     string         // single biggest gotcha
  complexity:   { time: string; space: string }
  overallScore: number
}

// Build from algorithm data + manual curation map
const CURATED: Record<string, Partial<CheatSheet>> = {
  'random-forest': {
    tagline:      'Robust ensemble of decorrelated decision trees via bagging + random features.',
    whenToUse:    ['Tabular data, mixed feature types', 'Need built-in feature importance', 'Baseline before gradient boosting'],
    avoid:        ['When you need probability calibration', 'Very large datasets (use XGBoost instead)'],
    keyFormula:   'Var(ȳ) = ρσ² + (1-ρ)σ²/B',
    formulaLabel: 'Ensemble variance — lower ρ (correlation) = better',
    defaultParams:[
      { key: 'n_estimators', value: '200',    note: 'More = lower variance, diminishing returns after 200' },
      { key: 'max_features', value: '"sqrt"', note: 'sqrt(p) for classification, p/3 for regression' },
      { key: 'n_jobs',       value: '-1',     note: 'Always use all CPUs' },
    ],
    quickCode:    `from sklearn.ensemble import RandomForestClassifier\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler\n\nrf = RandomForestClassifier(\n    n_estimators=200,\n    max_features='sqrt',\n    n_jobs=-1,\n    random_state=42\n)\nrf.fit(X_train, y_train)\nprint(rf.oob_score_)  # free cross-validation`,
    watchOut:     'Not scaling features is fine — but always check oob_score_ before wasting time on CV.',
  },
  'xgboost': {
    tagline:      'Sequential gradient boosting with regularization — state of the art on tabular data.',
    whenToUse:    ['Structured/tabular competition data', 'When interpretability matters less than accuracy', 'When you have time to tune'],
    avoid:        ['Raw text/image without feature engineering', 'Very small datasets (<500 rows)'],
    keyFormula:   'F_m(x) = F_{m-1}(x) + η · h_m(x)',
    formulaLabel: 'Additive model update — each tree corrects prior residuals',
    defaultParams:[
      { key: 'n_estimators',        value: '2000',    note: 'Always pair with early_stopping_rounds' },
      { key: 'learning_rate',       value: '0.05',    note: 'Lower + more trees = better generalization' },
      { key: 'max_depth',           value: '6',       note: 'Try 3,4,5,6,8' },
      { key: 'early_stopping_rounds', value: '50',   note: 'Critical — prevents overfitting' },
    ],
    quickCode:    `import xgboost as xgb\n\nmodel = xgb.XGBClassifier(\n    n_estimators=2000,\n    learning_rate=0.05,\n    max_depth=6,\n    subsample=0.8,\n    colsample_bytree=0.8,\n    early_stopping_rounds=50,\n    eval_metric='auc',\n    random_state=42\n)\nmodel.fit(X_train, y_train,\n    eval_set=[(X_val, y_val)], verbose=100)`,
    watchOut:     'Never tune n_estimators manually — always use early_stopping_rounds with an eval set.',
  },
  'svm': {
    tagline:      'Maximum-margin hyperplane classifier with kernel trick for non-linear boundaries.',
    whenToUse:    ['High-dimensional sparse data (text, genomics)', 'Small-medium datasets (<100k rows)', 'Need strong theoretical guarantees'],
    avoid:        ['Large datasets (O(n²) training)', 'When you need probability outputs without Platt scaling'],
    keyFormula:   'K(x,z) = exp(-γ||x-z||²)',
    formulaLabel: 'RBF kernel — maps to infinite-dimensional space',
    defaultParams:[
      { key: 'kernel', value: '"rbf"',  note: 'Try "linear" for text first — much faster' },
      { key: 'C',      value: '1.0',    note: 'Grid search [0.01, 0.1, 1, 10, 100]' },
      { key: 'gamma',  value: '"scale"',note: '1 / (n_features * X.var())' },
    ],
    quickCode:    `from sklearn.svm import SVC\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler\n\npipe = Pipeline([\n    ('scaler', StandardScaler()),  # MANDATORY\n    ('svm', SVC(kernel='rbf', C=1.0, probability=True))\n])\npipe.fit(X_train, y_train)`,
    watchOut:     'StandardScaler inside a Pipeline is non-negotiable — unscaled features completely break SVM.',
  },
  'kmeans': {
    tagline:      'Iterative centroid-based clustering that minimizes within-cluster sum of squares.',
    whenToUse:    ['Known approximate number of clusters', 'Roughly spherical, similar-size clusters', 'Fast clustering needed on large data'],
    avoid:        ['Non-spherical cluster shapes (use DBSCAN)', 'Outlier-heavy data', 'Unknown K without experimentation'],
    keyFormula:   'J = ∑_k ∑_{x∈Cₖ} ||x - μₖ||²',
    formulaLabel: 'WCSS — within-cluster sum of squares (minimize this)',
    defaultParams:[
      { key: 'n_clusters', value: '?',         note: 'Use elbow curve + silhouette to choose K' },
      { key: 'init',       value: '"k-means++"', note: 'Always use k-means++, not "random"' },
      { key: 'n_init',     value: '10',         note: 'Runs with different seeds, keeps best' },
    ],
    quickCode:    `from sklearn.cluster import KMeans\nfrom sklearn.metrics import silhouette_score\n\n# Find optimal K\nfor k in range(2, 11):\n    km = KMeans(n_clusters=k, init='k-means++', n_init=10, random_state=42)\n    labels = km.fit_predict(X_scaled)\n    sil = silhouette_score(X_scaled, labels)\n    print(f"K={k}: inertia={km.inertia_:.0f}, silhouette={sil:.3f}")`,
    watchOut:     'Always scale features first — k-means uses Euclidean distance, so unscaled data gives meaningless clusters.',
  },
  'transformer': {
    tagline:      'Self-attention architecture processing all tokens in parallel — foundation of all modern LLMs.',
    whenToUse:    ['NLP tasks with large data', 'Sequence-to-sequence (translation, summarization)', 'When pre-trained models exist for your domain'],
    avoid:        ['Very long sequences without FlashAttention (O(n²) memory)', 'Small datasets without pre-trained initialization'],
    keyFormula:   'Attn(Q,K,V) = softmax(QKᵀ/√dₖ)V',
    formulaLabel: 'Scaled dot-product attention',
    defaultParams:[
      { key: 'd_model',  value: '512',   note: 'Hidden dimension — scale with data' },
      { key: 'n_heads',  value: '8',     note: 'd_model / 64 heads (64-dim per head)' },
      { key: 'warmup',   value: '4000 steps', note: 'Linear warmup then cosine decay' },
    ],
    quickCode:    `from transformers import AutoTokenizer, AutoModelForSequenceClassification\nimport torch\n\nmodel_name = "bert-base-uncased"\ntokenizer  = AutoTokenizer.from_pretrained(model_name)\nmodel      = AutoModelForSequenceClassification.from_pretrained(\n    model_name, num_labels=2\n)\n\n# Fine-tune with Trainer API or manual loop\n# Learning rate: 2e-5 to 5e-5 for fine-tuning`,
    watchOut:     'Always add positional encoding — self-attention is permutation-invariant and cannot distinguish word order.',
  },
  'dbscan': {
    tagline:      'Density-based clustering that finds arbitrary-shape clusters and explicitly labels outliers.',
    whenToUse:    ['Geospatial data or irregular cluster shapes', 'Outlier/anomaly detection needed', 'Number of clusters unknown'],
    avoid:        ['Widely varying cluster densities (use HDBSCAN)', 'High-dimensional data (>50 dims)', 'Very large datasets without spatial index'],
    keyFormula:   '|Nₑ(p)| ≥ MinPts  ⟹  p is core point',
    formulaLabel: 'Core point condition — minimum density to seed a cluster',
    defaultParams:[
      { key: 'eps',         value: '?',   note: 'Use k-distance graph elbow to choose' },
      { key: 'min_samples', value: 'dims+1', note: 'Rule: n_dimensions + 1 minimum' },
      { key: 'metric',      value: '"euclidean"', note: 'Scale first! Or use "cosine" for text' },
    ],
    quickCode:    `from sklearn.cluster import DBSCAN\nfrom sklearn.neighbors import NearestNeighbors\nimport numpy as np\n\n# Find eps via k-distance elbow\nk = 5  # min_samples\nnbrs = NearestNeighbors(n_neighbors=k).fit(X_scaled)\ndists, _ = nbrs.kneighbors(X_scaled)\nk_dists = np.sort(dists[:, k-1])[::-1]\n# Plot k_dists — eps = value at the "elbow"\n\ndb = DBSCAN(eps=0.5, min_samples=5)\nlabels = db.fit_predict(X_scaled)\nprint(f"{len(set(labels)) - (1 if -1 in labels else 0)} clusters, {(labels==-1).sum()} noise")`,
    watchOut:     'eps is the most sensitive parameter — random guessing almost always fails. Always use the k-distance elbow method.',
  },
}

// Merge algorithm data with curated cheat sheet data
const CHEAT_SHEETS: CheatSheet[] = algorithms
  .filter(a => CURATED[a.slug])
  .map(a => ({
    slug:         a.slug,
    name:         a.name,
    category:     a.category,
    subcategory:  a.subcategory,
    overallScore: a.overallScore,
    complexity:   { time: a.complexity.time, space: a.complexity.space },
    tagline:      CURATED[a.slug]?.tagline    ?? a.description.slice(0, 120),
    whenToUse:    CURATED[a.slug]?.whenToUse  ?? a.why.whyChooseThis.slice(0, 3),
    avoid:        CURATED[a.slug]?.avoid      ?? a.why.whyAvoidThis.slice(0, 2),
    keyFormula:   CURATED[a.slug]?.keyFormula ?? '',
    formulaLabel: CURATED[a.slug]?.formulaLabel ?? '',
    defaultParams:CURATED[a.slug]?.defaultParams ?? [],
    quickCode:    CURATED[a.slug]?.quickCode  ?? '',
    watchOut:     CURATED[a.slug]?.watchOut   ?? (a.commonMistakes[0]?.fix ?? ''),
  }))

// ─── COPY BUTTON ─────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  function copy(e: React.MouseEvent) {
    e.stopPropagation()
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-all hover:bg-[var(--color-surface-3)]"
      style={{ color: copied ? '#10b981' : 'var(--color-text-3)', borderColor: 'var(--color-border)' }}
    >
      {copied ? <CheckCheck size={11} /> : <Copy size={11} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

// ─── CHEAT SHEET CARD ─────────────────────────────────────────────
function CheatCard({ sheet }: { sheet: CheatSheet }) {
  const navigate = useNavigate()
  const [tab, setTab] = useState<'overview' | 'code'>('overview')

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ background: 'var(--color-card-bg)', borderColor: 'var(--color-border)' }}
    >
      {/* Card header */}
      <div
        className="px-5 pt-5 pb-4 border-b"
        style={{ background: 'var(--color-surface-1)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <Badge category={sheet.category} className="mb-2">{sheet.subcategory}</Badge>
            <h3 className="text-lg font-medium" style={{ color: 'var(--color-text-1)' }}>{sheet.name}</h3>
          </div>
          <div className="text-center flex-shrink-0">
            <div className="text-2xl font-mono font-medium" style={{ color: 'var(--color-amber)' }}>
              {sheet.overallScore}
            </div>
            <div className="text-[10px]" style={{ color: 'var(--color-text-3)' }}>score</div>
          </div>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-2)' }}>
          {sheet.tagline}
        </p>
        {/* Complexity pills */}
        <div className="flex gap-2 mt-3">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded border"
            style={{ color: 'var(--color-cyan)', borderColor: 'rgba(34,211,238,0.2)', background: 'rgba(34,211,238,0.06)' }}>
            T: {sheet.complexity.time}
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded border"
            style={{ color: 'var(--color-amber)', borderColor: 'rgba(245,158,11,0.2)', background: 'rgba(245,158,11,0.06)' }}>
            S: {sheet.complexity.space}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b" style={{ borderColor: 'var(--color-border)' }}>
        {(['overview', 'code'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-2.5 text-xs font-medium capitalize border-b-2 transition-colors"
            style={{
              borderColor: tab === t ? 'var(--color-amber)' : 'transparent',
              color:       tab === t ? 'var(--color-amber)' : 'var(--color-text-3)',
            }}
          >
            {t === 'overview' ? 'Reference' : 'Quick Code'}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-5">
        {tab === 'overview' && (
          <div className="space-y-4">
            {/* When to use */}
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-3)' }}>
                Use when
              </div>
              <ul className="space-y-1.5">
                {sheet.whenToUse.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--color-text-2)' }}>
                    <span className="text-emerald-400 mt-0.5 flex-shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Avoid */}
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-3)' }}>
                Avoid when
              </div>
              <ul className="space-y-1.5">
                {sheet.avoid.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--color-text-2)' }}>
                    <span className="text-rose-400 mt-0.5 flex-shrink-0">✗</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Key formula */}
            {sheet.keyFormula && (
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-3)' }}>
                  Key formula
                </div>
                <div
                  className="px-3 py-2.5 rounded-lg font-mono text-sm"
                  style={{ background: 'var(--color-surface-2)', color: 'var(--color-cyan)', border: '1px solid var(--color-border)' }}
                >
                  {sheet.keyFormula}
                </div>
                <p className="text-xs mt-1.5" style={{ color: 'var(--color-text-3)' }}>{sheet.formulaLabel}</p>
              </div>
            )}

            {/* Default params */}
            {sheet.defaultParams.length > 0 && (
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-3)' }}>
                  Key defaults
                </div>
                <div className="space-y-2">
                  {sheet.defaultParams.map((p, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <code
                        className="text-xs font-mono px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5"
                        style={{ background: 'var(--color-surface-3)', color: 'var(--color-amber)' }}
                      >
                        {p.key}={p.value}
                      </code>
                      <span className="text-xs leading-relaxed" style={{ color: 'var(--color-text-3)' }}>{p.note}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Watch out */}
            {sheet.watchOut && (
              <div
                className="px-3 py-2.5 rounded-lg text-sm leading-relaxed border-l-2"
                style={{ background: 'rgba(244,63,94,0.06)', borderLeftColor: '#f43f5e', color: 'var(--color-text-2)' }}
              >
                <span className="font-medium text-rose-400">Watch out: </span>
                {sheet.watchOut}
              </div>
            )}
          </div>
        )}

        {tab === 'code' && sheet.quickCode && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs" style={{ color: 'var(--color-text-3)' }}>
                Production-ready starter
              </span>
              <CopyButton text={sheet.quickCode} />
            </div>
            <pre
              className="text-xs font-mono leading-relaxed overflow-x-auto rounded-lg p-4"
              style={{ background: '#1a1d27', color: '#c9d1d9', border: '1px solid var(--color-border)' }}
            >
              {sheet.quickCode}
            </pre>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t flex items-center justify-end"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-1)' }}>
        <button
          onClick={() => navigate(`/algorithms/${sheet.slug}`)}
          className="flex items-center gap-1.5 text-xs transition-all hover:text-amber-400"
          style={{ color: 'var(--color-text-3)' }}
        >
          Full deep dive <ExternalLink size={11} />
        </button>
      </div>
    </div>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────
export default function CheatSheetsPage() {
  const [search, setSearch]     = useState('')
  const [category, setCategory] = useState<AlgorithmCategory | 'all'>('all')

  const filtered = useMemo(() => {
    let list = [...CHEAT_SHEETS]
    if (category !== 'all') list = list.filter(s => s.category === category)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.tagline.toLowerCase().includes(q) ||
        s.subcategory.toLowerCase().includes(q)
      )
    }
    return list
  }, [search, category])

  return (
    <>
      <Helmet>
        <title>Cheat Sheets — Synaptica</title>
        <meta name="description" content="Quick-reference algorithm cards — when to use, key formulas, default parameters, and starter code for every major ML algorithm." />
      </Helmet>

      {/* Header */}
      <div className="border-b py-14 px-6 sm:px-10 lg:px-16"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-1)' }}>
        <div className="max-w-[1400px] mx-auto">
          <Reveal><SectionLabel>Quick Reference</SectionLabel></Reveal>
          <Reveal delay={80}>
            <SectionTitle>
              Algorithm <em style={{ color: 'var(--color-amber)', fontStyle: 'italic' }}>Cheat Sheets</em>
            </SectionTitle>
          </Reveal>
          <Reveal delay={160}>
            <p className="text-base mt-3 max-w-xl" style={{ color: 'var(--color-text-2)' }}>
              One card per algorithm — when to use it, the key formula to remember, default parameters, and copy-paste starter code.
            </p>
          </Reveal>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 py-10">

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--color-text-3)' }} />
            <input
              type="text"
              placeholder="Search cheat sheets…"
              value={search}
              onChange={e => setSearch(e.target.value)}
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

          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => setCategory('all')}
              className={cn('px-3 py-1 rounded-full text-xs border transition-all',
                category === 'all' ? 'border-amber-500/40 text-amber-400 bg-amber-500/10' : 'border-transparent')}
              style={{ color: category === 'all' ? undefined : 'var(--color-text-3)' }}
            >All</button>
            {ALGORITHM_CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value as AlgorithmCategory)}
                className={cn('px-3 py-1 rounded-full text-xs border transition-all',
                  category === cat.value ? 'border-amber-500/40 text-amber-400 bg-amber-500/10' : 'border-transparent')}
                style={{ color: category === cat.value ? undefined : 'var(--color-text-3)' }}
              >{cat.label}</button>
            ))}
          </div>

          <span className="text-xs font-mono self-center ml-auto" style={{ color: 'var(--color-text-3)' }}>
            {filtered.length} sheets
          </span>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-base mb-2" style={{ color: 'var(--color-text-2)' }}>No cheat sheets found</p>
            <button onClick={() => { setSearch(''); setCategory('all') }}
              className="text-sm underline" style={{ color: 'var(--color-amber)' }}>
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((sheet, i) => (
              <Reveal key={sheet.slug} delay={i * 40}>
                <CheatCard sheet={sheet} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </>
  )
}