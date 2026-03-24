import { useState, useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { Search, X, TrendingUp, ExternalLink } from 'lucide-react'
import { SectionLabel, SectionTitle, Reveal } from '@components/ui/index'
import { useDebounce } from '@hooks/index'
import { cn } from '@utils/index'

type Industry = 'tech' | 'finance' | 'healthcare' | 'ecommerce' | 'autonomous' | 'science' | 'media'

interface CaseStudy {
  id:         string
  company:    string
  title:      string
  industry:   Industry
  problem:    string
  approach:   string
  algorithms: string[]
  algoSlugs:  string[]
  result:     string
  metric:     string
  year:       string
  scale:      string
  lesson:     string
  tags:       string[]
}

const CASES: CaseStudy[] = [
  {
    id: 'netflix-reco',
    company: 'Netflix',
    title: 'Personalized Movie Recommendations',
    industry: 'media',
    problem: 'With 15,000+ titles, users spend too long browsing and churn. A user who doesn\'t find something in 90 seconds leaves.',
    approach: 'Multi-stage pipeline: collaborative filtering (matrix factorization) for candidate generation, gradient boosting for ranking, with contextual bandits for exploration. Rows on the homepage are themselves ranked by a separate model.',
    algorithms: ['Matrix Factorization', 'XGBoost', 'Contextual Bandits', 'Deep Learning'],
    algoSlugs: ['xgboost'],
    result: 'Recommendation system saves Netflix an estimated $1B/year in prevented churn.',
    metric: '$1B/year prevented churn',
    year: '2007–present',
    scale: '270M subscribers, 15,000+ titles, billions of ratings',
    lesson: 'The thumbnail image shown for a title matters as much as the recommendation. Netflix uses contextual bandits to test different artwork per user segment — the same movie shows a different thumbnail to a comedy fan vs an action fan.',
    tags: ['recommendations', 'collaborative filtering', 'ranking', 'bandits'],
  },
  {
    id: 'google-translate',
    company: 'Google',
    title: 'Neural Machine Translation',
    industry: 'tech',
    problem: 'Statistical MT (phrase-based) couldn\'t capture long-range context or idiomatic language. Error rates were high, especially for morphologically rich languages.',
    approach: 'Google switched from phrase-based SMT to sequence-to-sequence LSTM with attention in 2016, then to Transformer architecture in 2017. The Transformer eliminated sequential bottleneck and handled long-range dependencies via self-attention.',
    algorithms: ['Transformer', 'LSTM', 'Attention Mechanism', 'Beam Search'],
    algoSlugs: ['transformer', 'lstm'],
    result: 'Transformer reduced translation errors by 60% over LSTM. Now supports 133 languages.',
    metric: '60% error reduction over LSTM',
    year: '2016–2017',
    scale: '500M users, 100B+ words translated daily',
    lesson: 'The Transformer paper "Attention Is All You Need" was written at Google Brain — their production use case motivated the architecture. Real deployment problems (long sentences, morphology) drove better research.',
    tags: ['NLP', 'translation', 'transformer', 'seq2seq'],
  },
  {
    id: 'uber-surge',
    company: 'Uber',
    title: 'Surge Pricing Prediction',
    industry: 'tech',
    problem: 'When demand spikes (concerts, rain, rush hour), supply of drivers is low and ride requests spike. Predicting surge zones 30 minutes ahead lets Uber incentivize drivers to reposition.',
    approach: 'Gradient boosting (LightGBM) on time series features: historical demand by grid cell, time-of-day, day-of-week, weather, local events. Features are engineered at multiple time granularities (5min, 30min, 1h, 24h lookback).',
    algorithms: ['LightGBM', 'Feature Engineering', 'Time Series'],
    algoSlugs: ['xgboost'],
    result: 'Reduced driver idle time by 18%, improved rider wait times by 26% during peak demand.',
    metric: '26% better wait times in peak demand',
    year: '2017–present',
    scale: '19M trips/day, 3M drivers, 63+ countries',
    lesson: 'Feature engineering matters more than algorithm choice for geospatial time series. Lag features (demand 1 week ago at same time) and Fourier features (weekly/daily seasonality) outperformed deep learning on this task.',
    tags: ['time-series', 'geospatial', 'pricing', 'gradient-boosting'],
  },
  {
    id: 'gmail-spam',
    company: 'Google',
    title: 'Gmail Spam Detection',
    industry: 'tech',
    problem: 'Gmail receives billions of emails daily. In 2004, spam was 80%+ of all email. Required near-zero false positive rate (legitimate email must not be filtered).',
    approach: 'Started with Naive Bayes (1999–2007). Transitioned to SVM with TF-IDF features, then to gradient boosting with hundreds of hand-crafted signals. Modern Gmail uses deep learning (Transformer) on full email content. Multiple layers: sender reputation, content, behavioral signals.',
    algorithms: ['Naive Bayes', 'SVM', 'XGBoost', 'Transformer'],
    algoSlugs: ['svm', 'xgboost', 'transformer'],
    result: 'Catches 99.9% of spam with <0.1% false positive rate.',
    metric: '99.9% spam catch, <0.1% false positives',
    year: '2004–present',
    scale: '1.8B users, 100B+ emails filtered daily',
    lesson: 'Every generation of spam requires re-training. Adversarial evolution: spammers adapt, models must adapt. The 20-year history of spam filtering is a masterclass in practical ML maintenance and concept drift.',
    tags: ['classification', 'NLP', 'adversarial', 'fraud'],
  },
  {
    id: 'deepmind-alphafold',
    company: 'DeepMind',
    title: 'AlphaFold 2 — Protein Structure Prediction',
    industry: 'science',
    problem: 'Predicting 3D protein structure from amino acid sequence — the "protein folding problem" — had been unsolved for 50 years. Experimental structure determination takes months and costs $100k+.',
    approach: 'Transformer with geometric reasoning. Key innovations: Evoformer attention that processes multiple sequence alignments simultaneously, equivariant structure module that directly outputs 3D coordinates respecting geometric constraints.',
    algorithms: ['Transformer (Evoformer)', 'Equivariant Networks', 'Attention', 'MSA Processing'],
    algoSlugs: ['transformer'],
    result: 'Median accuracy 92.4 GDT on CASP14 — matching experimental precision. Predicted structure of all 200M known proteins.',
    metric: '92.4 GDT (near-experimental accuracy)',
    year: '2020–2022',
    scale: '200M+ protein structures, full human proteome',
    lesson: 'Domain knowledge was critical. The architecture wasn\'t just "throw a Transformer at sequences" — it was carefully designed to encode the physics of protein geometry. Problem-specific inductive biases often matter more than pure scale.',
    tags: ['science', 'biology', 'transformer', 'structure-prediction'],
  },
  {
    id: 'tesla-autopilot',
    company: 'Tesla',
    title: 'Full Self-Driving Vision Stack',
    industry: 'autonomous',
    problem: 'Replace radar + lidar with vision-only autonomous driving. Cameras provide 360° coverage but require understanding 3D space from 2D images in real time at 36Hz.',
    approach: 'Multi-camera Transformer (HydraNet) processes 8 camera feeds simultaneously. Outputs semantic segmentation, depth estimation, object detection, and motion prediction in one forward pass. Training data from millions of Tesla vehicles via fleet learning.',
    algorithms: ['Transformer (Vision)', 'Multi-task Learning', 'Fleet Learning', 'Occupancy Networks'],
    algoSlugs: ['transformer'],
    result: 'Vision-only system achieves comparable safety to radar-based systems. Fleet learning scales data collection exponentially.',
    metric: 'Vision-only matches radar+lidar safety metrics',
    year: '2021–present',
    scale: '4M+ vehicles, petabytes of driving data daily',
    lesson: 'Data flywheel is the real moat. 4M+ Teslas automatically flag edge cases and upload clips. No competitor can match this labeled dataset scale. In ML, data acquisition strategy is often more important than architecture.',
    tags: ['computer-vision', 'transformer', 'autonomous', 'multi-task'],
  },
  {
    id: 'stripe-fraud',
    company: 'Stripe',
    title: 'Real-Time Payment Fraud Detection',
    industry: 'finance',
    problem: 'Detect fraudulent transactions in <100ms with <0.1% false positive rate. False positives block legitimate payments (massive customer loss). False negatives allow fraud (direct financial loss).',
    approach: 'Multi-layered approach: Rule engine for known patterns (fast, <1ms), gradient boosting (XGBoost) for tabular transaction features (behavioral, device, network), deep learning for sequence patterns (purchase history as a sequence).',
    algorithms: ['XGBoost', 'LSTM', 'Rule Engine', 'Anomaly Detection'],
    algoSlugs: ['xgboost', 'lstm'],
    result: 'Processing $640B+ in payments annually with fraud rate well below industry average.',
    metric: '$640B+ processed, below-average fraud rate',
    year: '2012–present',
    scale: '250M+ active users, millions of transactions/day',
    lesson: 'In fraud detection, operational constraints (latency <100ms) often eliminate deep learning. Gradient boosting dominates because: (1) <50ms inference, (2) works on tabular data, (3) SHAP gives regulators explanations. Know your constraints before choosing a model.',
    tags: ['fraud', 'classification', 'finance', 'real-time'],
  },
  {
    id: 'spotify-discover',
    company: 'Spotify',
    title: 'Discover Weekly Playlist Generation',
    industry: 'media',
    problem: 'Generate a personalized 30-song playlist every week for 600M users that feels like it was curated by someone who knows your taste deeply.',
    approach: 'Three signals combined: collaborative filtering (users with similar taste → similar recommendations), NLP on song metadata and playlist names (Word2Vec-style embeddings), audio analysis (CNNs on raw audio for acoustic features). Final ranking with gradient boosting.',
    algorithms: ['Collaborative Filtering', 'Word2Vec', 'CNN', 'Matrix Factorization'],
    algoSlugs: ['kmeans', 'xgboost'],
    result: 'Discover Weekly launched 2015. 40M users in first year. Average save rate 4× higher than random.',
    metric: '40M users in first year, 4× higher save rate',
    year: '2015–present',
    scale: '600M users, 100M+ tracks, weekly for all users',
    lesson: 'Hybrid systems beat single-signal approaches. Pure collaborative filtering fails for new tracks (cold start). Audio features + metadata embeddings solve cold start and handle brand-new songs on day 1. Always think about edge cases in production.',
    tags: ['recommendations', 'music', 'collaborative-filtering', 'NLP'],
  },
  {
    id: 'google-ads-ctr',
    company: 'Google',
    title: 'Ad Click-Through Rate Prediction',
    industry: 'ecommerce',
    problem: 'Predict the probability a user clicks an ad before serving it. Directly determines ad revenue — a 1% improvement = $1B+ per year at Google\'s scale.',
    approach: 'Wide & Deep Learning: "wide" = memorization with cross-product feature interactions (logistic regression), "deep" = generalization via neural network on embeddings. Trained on billions of impressions daily with incremental retraining.',
    algorithms: ['Wide & Deep', 'Logistic Regression', 'Embeddings', 'Neural Network'],
    algoSlugs: ['logistic-regression', 'transformer'],
    result: 'Wide & Deep published in 2016 became the industry standard for recommendation and CTR systems.',
    metric: 'Industry-standard CTR architecture, $100B+ ad revenue',
    year: '2016–present',
    scale: 'Billions of predictions/day, real-time <10ms',
    lesson: 'The Wide & Deep paper changed how the industry thinks about recommendation systems. Simple models memorize seen patterns well. Deep models generalize to unseen combinations. The combination beats either alone — and the architecture is still widely used.',
    tags: ['ads', 'CTR', 'recommendations', 'wide-deep'],
  },
  {
    id: 'openai-gpt4',
    company: 'OpenAI',
    title: 'GPT-4 & RLHF Alignment',
    industry: 'tech',
    problem: 'A powerful language model that just predicts tokens isn\'t safe or useful as an assistant. It refuses nothing, halluccinates confidently, and is hard to control. RLHF (Reinforcement Learning from Human Feedback) aligns it.',
    approach: 'Step 1: Supervised fine-tuning on human-written demonstrations. Step 2: Train a reward model on human preference comparisons (A vs B, which is better). Step 3: Fine-tune the LM using PPO to maximize the reward model\'s score.',
    algorithms: ['Transformer', 'PPO', 'Reward Model', 'RLHF'],
    algoSlugs: ['transformer'],
    result: 'ChatGPT reached 100M users in 60 days. GPT-4 passes bar exam at 90th percentile.',
    metric: '100M users in 60 days, bar exam 90th percentile',
    year: '2022–present',
    scale: '100M+ users, trillions of tokens processed monthly',
    lesson: 'RLHF is what turned GPT-3 (impressive but unusable) into ChatGPT (product people use daily). Alignment and safety techniques are now as important as the base model. A powerful but unaligned model has no commercial value.',
    tags: ['LLM', 'RLHF', 'alignment', 'transformer'],
  },
  {
    id: 'amazon-prime-delivery',
    company: 'Amazon',
    title: 'Predictive Inventory Placement',
    industry: 'ecommerce',
    problem: 'Shipping a product 2-day Prime from a warehouse 1000 miles away is expensive. If Amazon predicts you will buy a product and pre-positions it in your local fulfillment center, same-day delivery is cheap.',
    approach: 'Demand forecasting per product/region/time: gradient boosting on 150+ features including purchase history, search trends, seasonality, weather, local events, price elasticity. Reinforcement learning for the stocking policy (how many units to place where).',
    algorithms: ['XGBoost', 'Time Series Forecasting', 'Reinforcement Learning'],
    algoSlugs: ['xgboost'],
    result: 'Anticipatory shipping patents filed 2013. Delivery costs reduced 40% vs reactive shipping.',
    metric: '40% delivery cost reduction',
    year: '2013–present',
    scale: '350M+ products, 185 fulfillment centers, 300M+ customers',
    lesson: 'ML-driven supply chain is a bigger business advantage than most realize. The "moat" isn\'t the algorithm — it\'s the data flywheel: every Amazon purchase improves the demand forecast, which improves inventory placement, which enables same-day delivery, which drives more purchases.',
    tags: ['forecasting', 'supply-chain', 'ecommerce', 'reinforcement-learning'],
  },
  {
    id: 'deepmind-alphago',
    company: 'DeepMind',
    title: 'AlphaGo / AlphaZero — Game Mastery',
    industry: 'science',
    problem: 'Go has 10^170 possible board positions — more than atoms in the observable universe. Exhaustive search is impossible. The best human players said computers would never beat them within 20 years.',
    approach: 'AlphaGo: Deep CNN policy network (which move to play) + value network (who will win), combined with Monte Carlo Tree Search. AlphaZero: Same approach but trained entirely through self-play from random play — no human games used.',
    algorithms: ['CNN', 'Monte Carlo Tree Search', 'Reinforcement Learning', 'Self-Play'],
    algoSlugs: ['transformer'],
    result: 'AlphaGo beat world champion Lee Sedol 4-1 in 2016. AlphaZero beat AlphaGo 100-0.',
    metric: 'Beat world champion 4-1, then beat AlphaGo 100-0',
    year: '2016–2018',
    scale: 'Game tree: 10^170 positions. Trained on TPUs for days.',
    lesson: 'Self-play is a superpower. AlphaZero started from random play and in 8 hours surpassed all human knowledge of Chess, Go, and Shogi. The key insight: supervised learning from human data limits you to human-level reasoning. Self-play has no such ceiling.',
    tags: ['reinforcement-learning', 'game-playing', 'self-play', 'CNN'],
  },
]

const INDUSTRY_CONFIG: Record<Industry, { label: string; color: string }> = {
  tech:       { label: 'Technology',    color: '#22d3ee' },
  finance:    { label: 'Finance',       color: '#10b981' },
  healthcare: { label: 'Healthcare',    color: '#f43f5e' },
  ecommerce:  { label: 'E-commerce',   color: '#f59e0b' },
  autonomous: { label: 'Autonomous',   color: '#c084fc' },
  science:    { label: 'Science',      color: '#60a5fa' },
  media:      { label: 'Media',        color: '#fb923c' },
}

function CaseCard({ cs, onExpand, expanded }: {
  cs: CaseStudy
  onExpand: () => void
  expanded: boolean
}) {
  const navigate = useNavigate()
  const cfg = INDUSTRY_CONFIG[cs.industry]

  return (
    <div
      className="rounded-xl border overflow-hidden transition-all duration-200 cursor-pointer"
      style={{
        background: 'var(--color-card-bg)',
        borderColor: expanded ? cfg.color + '50' : 'var(--color-border)',
      }}
      onClick={onExpand}
    >
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span
                className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded font-medium"
                style={{ color: cfg.color, background: cfg.color + '18', border: `1px solid ${cfg.color}30` }}
              >
                {cfg.label}
              </span>
              <span className="text-[10px] font-mono" style={{ color: 'var(--color-text-3)' }}>
                {cs.year}
              </span>
            </div>
            <div className="text-xs font-medium mb-0.5" style={{ color: cfg.color }}>{cs.company}</div>
            <h3 className="text-[15px] font-medium" style={{ color: 'var(--color-text-1)' }}>{cs.title}</h3>
          </div>
          <span className="text-xs flex-shrink-0 transition-transform duration-200 mt-1"
            style={{ color: 'var(--color-text-3)', transform: expanded ? 'rotate(180deg)' : 'none' }}>▾</span>
        </div>

        {/* Problem */}
        <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--color-text-2)' }}>
          {cs.problem}
        </p>

        {/* Metric pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
          style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)' }}>
          <TrendingUp size={11} />
          {cs.metric}
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t px-5 pb-5 pt-4 space-y-4" style={{ borderColor: 'var(--color-border)' }}
          onClick={e => e.stopPropagation()}>

          {/* Approach */}
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-3)' }}>
              ML Approach
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-2)' }}>{cs.approach}</p>
          </div>

          {/* Algorithms used */}
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-3)' }}>
              Algorithms used
            </div>
            <div className="flex flex-wrap gap-2">
              {cs.algorithms.map(a => (
                <span key={a} className="text-xs px-2.5 py-1 rounded-full border"
                  style={{ color: 'var(--color-text-2)', borderColor: 'var(--color-border)', background: 'var(--color-surface-2)' }}>
                  {a}
                </span>
              ))}
            </div>
          </div>

          {/* Scale */}
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-3)' }}>
              Scale
            </div>
            <p className="text-xs" style={{ color: 'var(--color-text-3)' }}>{cs.scale}</p>
          </div>

          {/* Key lesson */}
          <div className="px-4 py-3 rounded-xl border-l-2"
            style={{ background: 'var(--color-surface-2)', borderLeftColor: 'var(--color-amber)' }}>
            <div className="text-[11px] font-mono uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-amber)' }}>
              Key Lesson
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-2)' }}>{cs.lesson}</p>
          </div>

          {/* Algorithm links */}
          {cs.algoSlugs.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {cs.algoSlugs.map(slug => (
                <button
                  key={slug}
                  onClick={() => navigate(`/algorithms/${slug}`)}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all hover:border-amber-500/40 hover:bg-amber-500/5"
                  style={{ color: 'var(--color-amber)', borderColor: 'rgba(245,158,11,0.25)' }}
                >
                  Deep dive: {slug} <ExternalLink size={10} />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function CaseStudiesPage() {
  const [search, setSearch]     = useState('')
  const [industry, setIndustry] = useState<Industry | 'all'>('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const debounced = useDebounce(search, 200)

  const filtered = useMemo(() => {
    let list = [...CASES]
    if (industry !== 'all') list = list.filter(c => c.industry === industry)
    if (debounced.trim()) {
      const q = debounced.toLowerCase()
      list = list.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.problem.toLowerCase().includes(q) ||
        c.tags.some(t => t.includes(q))
      )
    }
    return list
  }, [industry, debounced])

  return (
    <>
      <Helmet>
        <title>Case Studies — Synaptica</title>
        <meta name="description" content="Real ML deployments: how Netflix, Google, Stripe, DeepMind, and others apply machine learning in production." />
      </Helmet>

      <div className="border-b py-14 px-6 sm:px-10 lg:px-16"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-1)' }}>
        <div className="max-w-[1400px] mx-auto">
          <Reveal><SectionLabel>Industry</SectionLabel></Reveal>
          <Reveal delay={80}>
            <SectionTitle>
              ML in the <em style={{ color: 'var(--color-amber)', fontStyle: 'italic' }}>Real World</em>
            </SectionTitle>
          </Reveal>
          <Reveal delay={160}>
            <p className="text-base mt-3 max-w-xl" style={{ color: 'var(--color-text-2)' }}>
              {CASES.length} real deployments — the actual algorithms, scale, results, and lessons from companies that built production ML.
            </p>
          </Reveal>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 py-10">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--color-text-3)' }} />
            <input
              type="text" placeholder="Search case studies…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border outline-none focus:border-amber-500/50 transition-colors"
              style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border-2)', color: 'var(--color-text-1)' }}
            />
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--color-text-3)' }}><X size={13} /></button>}
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => setIndustry('all')}
              className={cn('px-3 py-1 rounded-full text-xs border transition-all',
                industry === 'all' ? 'border-amber-500/40 text-amber-400 bg-amber-500/10' : 'border-transparent')}
              style={{ color: industry === 'all' ? undefined : 'var(--color-text-3)' }}
            >All</button>
            {Object.entries(INDUSTRY_CONFIG).map(([k, v]) => (
              <button key={k}
                onClick={() => setIndustry(k as Industry)}
                className={cn('px-3 py-1 rounded-full text-xs border transition-all')}
                style={{
                  color: industry === k ? v.color : 'var(--color-text-3)',
                  borderColor: industry === k ? v.color + '50' : 'transparent',
                  background: industry === k ? v.color + '12' : 'transparent',
                }}
              >{v.label}</button>
            ))}
          </div>
          <span className="text-xs font-mono self-center ml-auto" style={{ color: 'var(--color-text-3)' }}>
            {filtered.length} cases
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filtered.map((cs, i) => (
            <Reveal key={cs.id} delay={i * 30}>
              <CaseCard
                cs={cs}
                expanded={expanded === cs.id}
                onExpand={() => setExpanded(expanded === cs.id ? null : cs.id)}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </>
  )
}