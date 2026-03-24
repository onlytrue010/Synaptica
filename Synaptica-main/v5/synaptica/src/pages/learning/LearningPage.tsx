import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Lock, CheckCircle, Circle, ChevronRight, Clock, BookOpen, Zap, Trophy, Star, Target } from 'lucide-react'
import { SectionLabel, SectionTitle, Reveal, Card } from '@components/ui/index'
import { useProgressStore } from '@store/progressStore'
import { algorithms } from '@data/algorithms'

// ─── DATA ────────────────────────────────────────────────────────
interface Module {
  id:          string
  title:       string
  description: string
  icon:        string
  xp:          number
  minutes:     number
  color:       string
  topics:      string[]
  algoSlugs:   string[]
  requires?:   string
}

interface Path {
  id:          string
  title:       string
  subtitle:    string
  description: string
  color:       string
  accent:      string
  totalXP:     number
  totalHours:  number
  icon:        string
  modules:     Module[]
}

const PATHS: Path[] = [
  {
    id: 'beginner',
    title: 'Beginner',
    subtitle: '0 – 3 months',
    description: 'Build a rock-solid foundation. Understand the core intuitions before touching any code.',
    color: 'rgba(16,185,129,0.1)',
    accent: '#10b981',
    totalXP: 1200,
    totalHours: 40,
    icon: '🌱',
    modules: [
      {
        id: 'math-foundations',
        title: 'Math Foundations',
        description: 'Linear algebra, calculus, and probability — the three pillars of ML.',
        icon: '📐',
        xp: 150,
        minutes: 180,
        color: '#10b981',
        topics: ['Vectors & matrices', 'Derivatives & gradients', 'Probability distributions', 'Bayes theorem', 'Information theory'],
        algoSlugs: [],
      },
      {
        id: 'data-prep',
        title: 'Data Preprocessing',
        description: 'Clean, scale, encode, and engineer features — where 80% of real ML work happens.',
        icon: '🔧',
        xp: 200,
        minutes: 240,
        color: '#10b981',
        topics: ['Handling missing values', 'Feature scaling', 'One-hot encoding', 'Train/test split', 'Cross-validation'],
        algoSlugs: [],
        requires: 'math-foundations',
      },
      {
        id: 'linear-models',
        title: 'Linear Models',
        description: 'Logistic regression, Ridge, Lasso — fast, interpretable, still used everywhere.',
        icon: '📈',
        xp: 250,
        minutes: 300,
        color: '#10b981',
        topics: ['Linear regression', 'Logistic regression', 'Ridge (L2)', 'Lasso (L1)', 'Gradient descent'],
        algoSlugs: ['logistic-regression', 'ridge-regression', 'lasso'],
        requires: 'data-prep',
      },
      {
        id: 'tree-models',
        title: 'Tree-based Models',
        description: 'Decision trees through Random Forest — interpretable to powerful.',
        icon: '🌲',
        xp: 300,
        minutes: 360,
        color: '#10b981',
        topics: ['Decision tree splits', 'Gini vs entropy', 'Overfitting in trees', 'Random Forest', 'Feature importance'],
        algoSlugs: ['decision-tree', 'random-forest'],
        requires: 'linear-models',
      },
      {
        id: 'evaluation',
        title: 'Model Evaluation',
        description: 'Accuracy is a lie. Learn the metrics that actually matter.',
        icon: '📊',
        xp: 300,
        minutes: 240,
        color: '#10b981',
        topics: ['Confusion matrix', 'Precision & recall', 'ROC-AUC', 'F1 score', 'Cross-validation'],
        algoSlugs: [],
        requires: 'tree-models',
      },
    ],
  },
  {
    id: 'intermediate',
    title: 'Intermediate',
    subtitle: '3 – 6 months',
    description: 'Master the algorithms that win competitions and power production systems.',
    color: 'rgba(245,158,11,0.1)',
    accent: '#f59e0b',
    totalXP: 2000,
    totalHours: 80,
    icon: '⚡',
    modules: [
      {
        id: 'ensemble-mastery',
        title: 'Ensemble Methods Mastery',
        description: 'XGBoost, LightGBM, CatBoost — the algorithms that dominate tabular data.',
        icon: '⚡',
        xp: 400,
        minutes: 480,
        color: '#f59e0b',
        topics: ['Gradient boosting theory', 'XGBoost hyperparameters', 'Early stopping', 'LightGBM vs XGBoost', 'Stacking & blending'],
        algoSlugs: ['xgboost', 'gradient-boosting'],
        requires: 'evaluation',
      },
      {
        id: 'unsupervised',
        title: 'Unsupervised Learning',
        description: 'K-Means, DBSCAN, PCA — find patterns without labels.',
        icon: '🕸',
        xp: 350,
        minutes: 360,
        color: '#f59e0b',
        topics: ['K-Means algorithm', 'DBSCAN density clustering', 'PCA dimensionality reduction', 'Silhouette scoring', 'Anomaly detection'],
        algoSlugs: ['kmeans', 'dbscan', 'pca', 'gaussian-mixture', 'isolation-forest'],
        requires: 'ensemble-mastery',
      },
      {
        id: 'svm-kernel',
        title: 'SVM & Kernel Methods',
        description: 'The kernel trick and maximum margin classification.',
        icon: '📐',
        xp: 300,
        minutes: 300,
        color: '#f59e0b',
        topics: ['Maximum margin hyperplane', 'Kernel trick', 'RBF kernel', 'SVM for text', 'SVR regression'],
        algoSlugs: ['svm'],
        requires: 'unsupervised',
      },
      {
        id: 'feature-engineering',
        title: 'Feature Engineering',
        description: 'The dark art that separates good models from great ones.',
        icon: '⚗️',
        xp: 400,
        minutes: 420,
        color: '#f59e0b',
        topics: ['Filter methods', 'Wrapper methods (RFE)', 'Lasso for selection', 'Target encoding', 'Interaction features'],
        algoSlugs: ['pca', 'lasso'],
        requires: 'svm-kernel',
      },
      {
        id: 'hyperparameter-opt',
        title: 'Hyperparameter Optimization',
        description: 'Grid search is dead. Master Bayesian optimization with Optuna.',
        icon: '🎯',
        xp: 350,
        minutes: 300,
        color: '#f59e0b',
        topics: ['Grid vs Random search', 'Bayesian optimization', 'Optuna framework', 'Cross-val strategies', 'Learning curves'],
        algoSlugs: [],
        requires: 'feature-engineering',
      },
    ],
  },
  {
    id: 'advanced',
    title: 'Advanced',
    subtitle: '6 – 12 months',
    description: 'Deep learning, sequence models, and production ML systems.',
    color: 'rgba(96,165,250,0.1)',
    accent: '#60a5fa',
    totalXP: 3000,
    totalHours: 120,
    icon: '🚀',
    modules: [
      {
        id: 'deep-learning-foundations',
        title: 'Deep Learning Foundations',
        description: 'Backpropagation, optimizers, batch norm — how neural nets actually work.',
        icon: '🧠',
        xp: 500,
        minutes: 600,
        color: '#60a5fa',
        topics: ['Backpropagation', 'Adam optimizer', 'Batch normalization', 'Dropout', 'Weight initialization'],
        algoSlugs: ['autoencoder'],
        requires: 'hyperparameter-opt',
      },
      {
        id: 'sequence-models',
        title: 'Sequence Models',
        description: 'LSTM, GRU, and the bridge to Transformers.',
        icon: '🔗',
        xp: 500,
        minutes: 540,
        color: '#60a5fa',
        topics: ['Vanishing gradient problem', 'LSTM gates', 'Bidirectional LSTM', 'GRU simplification', 'Sequence-to-sequence'],
        algoSlugs: ['lstm'],
        requires: 'deep-learning-foundations',
      },
      {
        id: 'transformers-attention',
        title: 'Transformers & Attention',
        description: 'The architecture that changed everything. Self-attention to GPT.',
        icon: '🔮',
        xp: 600,
        minutes: 720,
        color: '#60a5fa',
        topics: ['Self-attention mechanism', 'Multi-head attention', 'Positional encoding', 'BERT vs GPT', 'Fine-tuning strategies'],
        algoSlugs: ['transformer'],
        requires: 'sequence-models',
      },
      {
        id: 'generative-models',
        title: 'Generative Models',
        description: 'VAEs, GANs, and Diffusion — learn to create, not just classify.',
        icon: '🎨',
        xp: 550,
        minutes: 600,
        color: '#60a5fa',
        topics: ['Variational Autoencoders', 'GAN training', 'Mode collapse', 'Diffusion models', 'Stable Diffusion architecture'],
        algoSlugs: ['vae', 'autoencoder'],
        requires: 'transformers-attention',
      },
      {
        id: 'reinforcement-learning',
        title: 'Reinforcement Learning',
        description: 'Q-Learning to PPO — teach agents to act in environments.',
        icon: '🎮',
        xp: 550,
        minutes: 600,
        color: '#60a5fa',
        topics: ['MDP formulation', 'Q-Learning', 'Deep Q-Networks', 'Policy gradient', 'PPO algorithm'],
        algoSlugs: ['q-learning'],
        requires: 'generative-models',
      },
    ],
  },
  {
    id: 'expert',
    title: 'Expert',
    subtitle: '12+ months',
    description: 'RLHF, federated learning, and production ML at scale.',
    color: 'rgba(192,132,252,0.1)',
    accent: '#c084fc',
    totalXP: 4000,
    totalHours: 160,
    icon: '💎',
    modules: [
      {
        id: 'llm-alignment',
        title: 'LLM Alignment & RLHF',
        description: 'How ChatGPT was built. Reward modeling, PPO, DPO, Constitutional AI.',
        icon: '🤖',
        xp: 700,
        minutes: 720,
        color: '#c084fc',
        topics: ['RLHF pipeline', 'Reward model training', 'PPO for LLMs', 'DPO algorithm', 'Constitutional AI'],
        algoSlugs: ['transformer'],
        requires: 'reinforcement-learning',
      },
      {
        id: 'self-supervised',
        title: 'Self-Supervised Learning',
        description: 'SimCLR, BYOL, DINO — learn from unlabeled data at scale.',
        icon: '🌀',
        xp: 650,
        minutes: 600,
        color: '#c084fc',
        topics: ['Contrastive learning', 'SimCLR framework', 'BYOL (no negatives)', 'DINO knowledge distillation', 'Masked autoencoders'],
        algoSlugs: ['autoencoder', 'vae'],
        requires: 'llm-alignment',
      },
      {
        id: 'production-ml',
        title: 'Production ML Systems',
        description: 'Deploy, monitor, and maintain ML at scale. MLOps from scratch.',
        icon: '🏭',
        xp: 800,
        minutes: 900,
        color: '#c084fc',
        topics: ['Feature stores', 'Model serving (TorchServe)', 'Concept drift detection', 'A/B testing models', 'ML monitoring'],
        algoSlugs: [],
        requires: 'self-supervised',
      },
      {
        id: 'meta-learning',
        title: 'Meta-Learning & Few-Shot',
        description: 'MAML, Prototypical Networks — learn to learn from few examples.',
        icon: '🧬',
        xp: 750,
        minutes: 720,
        color: '#c084fc',
        topics: ['MAML algorithm', 'Few-shot learning', 'Prototypical networks', 'Zero-shot with LLMs', 'Retrieval augmentation'],
        algoSlugs: [],
        requires: 'production-ml',
      },
      {
        id: 'research-frontier',
        title: 'Research Frontier',
        description: 'State-space models, test-time compute, and what comes after Transformers.',
        icon: '🔭',
        xp: 900,
        minutes: 960,
        color: '#c084fc',
        topics: ['Mamba (state-space)', 'Mixture of Experts', 'Reasoning models (o1)', 'Test-time compute scaling', 'Multimodal systems'],
        algoSlugs: ['transformer'],
        requires: 'meta-learning',
      },
    ],
  },
]

// ─── MODULE CARD ─────────────────────────────────────────────────
interface ModuleCardProps {
  module:     Module
  pathAccent: string
  isUnlocked: boolean
  isComplete: boolean
  index:      number
  onStart:    (m: Module) => void
}

function ModuleCard({ module, pathAccent, isUnlocked, isComplete, index, onStart }: ModuleCardProps) {
  const linkedAlgos = algorithms.filter((a) => module.algoSlugs.includes(a.slug))

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-xl border overflow-hidden transition-all duration-300"
      style={{
        background: 'var(--color-card-bg)',
        borderColor: isComplete
          ? `${pathAccent}44`
          : isUnlocked
          ? 'var(--color-border-2)'
          : 'var(--color-border)',
        opacity: isUnlocked ? 1 : 0.55,
      }}
    >
      <div className="p-5">
        <div className="flex items-start gap-3 mb-4">
          {/* Icon */}
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: isComplete ? `${pathAccent}22` : 'var(--color-surface-2)' }}>
            {isComplete ? '✓' : !isUnlocked ? '🔒' : module.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="text-sm font-medium" style={{ color: 'var(--color-text-1)' }}>{module.title}</h3>
              {isComplete && <CheckCircle size={13} style={{ color: pathAccent, flexShrink: 0 }} />}
              {!isUnlocked && <Lock size={11} style={{ color: 'var(--color-text-3)', flexShrink: 0 }} />}
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-3)' }}>{module.description}</p>
          </div>
          {/* XP badge */}
          <div className="flex-shrink-0 text-center">
            <div className="text-sm font-bold font-mono" style={{ color: pathAccent }}>{module.xp}</div>
            <div className="text-[9px] uppercase tracking-wide" style={{ color: 'var(--color-text-3)' }}>XP</div>
          </div>
        </div>

        {/* Topics */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {module.topics.map((t) => (
            <span key={t} className="text-[10px] px-2 py-0.5 rounded border"
              style={{ color: 'var(--color-text-3)', borderColor: 'var(--color-border)', background: 'var(--color-surface-2)' }}>
              {t}
            </span>
          ))}
        </div>

        {/* Linked algorithms */}
        {linkedAlgos.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={11} style={{ color: 'var(--color-text-3)' }} />
            <div className="flex gap-1.5 flex-wrap">
              {linkedAlgos.map((a) => (
                <span key={a.slug} className="text-[10px] font-mono px-2 py-0.5 rounded"
                  style={{ color: pathAccent, background: `${pathAccent}15`, border: `1px solid ${pathAccent}33` }}>
                  {a.shortName ?? a.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-text-3)' }}>
            <Clock size={11} /> {module.minutes >= 60 ? `${(module.minutes / 60).toFixed(1)}h` : `${module.minutes}min`}
          </div>
          {isUnlocked && !isComplete && (
            <button onClick={() => onStart(module)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all hover:-translate-y-0.5"
              style={{ background: pathAccent, color: pathAccent === '#f59e0b' ? '#080808' : '#fff' }}>
              Start <ChevronRight size={12} />
            </button>
          )}
          {isComplete && (
            <span className="text-xs font-medium" style={{ color: pathAccent }}>Completed ✓</span>
          )}
          {!isUnlocked && (
            <span className="text-xs" style={{ color: 'var(--color-text-3)' }}>Complete previous module</span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ─── PATH CARD ───────────────────────────────────────────────────
function PathOverviewCard({ path, completedModules, onSelect, isSelected }: {
  path: Path; completedModules: number; onSelect: () => void; isSelected: boolean
}) {
  const pct = Math.round((completedModules / path.modules.length) * 100)
  return (
    <button onClick={onSelect}
      className="w-full text-left p-5 rounded-xl border transition-all duration-300 hover:-translate-y-0.5"
      style={{
        background: isSelected ? path.color : 'var(--color-card-bg)',
        borderColor: isSelected ? path.accent : 'var(--color-border)',
        boxShadow: isSelected ? `0 4px 24px ${path.accent}22` : 'none',
      }}>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{path.icon}</span>
        <div>
          <div className="text-sm font-medium" style={{ color: 'var(--color-text-1)' }}>{path.title}</div>
          <div className="text-xs font-mono" style={{ color: path.accent }}>{path.subtitle}</div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-lg font-bold font-mono" style={{ color: path.accent }}>{pct}%</div>
          <div className="text-[10px]" style={{ color: 'var(--color-text-3)' }}>done</div>
        </div>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ background: 'var(--color-surface-3)' }}>
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: path.accent }} />
      </div>
      <div className="flex gap-3 text-[10px]" style={{ color: 'var(--color-text-3)' }}>
        <span>{completedModules}/{path.modules.length} modules</span>
        <span>{path.totalHours}h total</span>
        <span>{path.totalXP.toLocaleString()} XP</span>
      </div>
    </button>
  )
}

// ─── MAIN PAGE ───────────────────────────────────────────────────
export default function LearningPage() {
  const navigate = useNavigate()
  const { visitedAlgorithms, xp, level, addXP, addVisited } = useProgressStore()
  const [selectedPath, setSelectedPath] = useState('beginner')

  // Compute unlocked/completed state
  const completedModuleIds = new Set<string>()
  PATHS.forEach((p) => p.modules.forEach((m) => {
    if (m.algoSlugs.length === 0 || m.algoSlugs.every((s) => visitedAlgorithms.includes(s))) {
      completedModuleIds.add(m.id)
    }
  }))

  function isModuleUnlocked(m: Module): boolean {
    if (!m.requires) return true
    return completedModuleIds.has(m.requires)
  }

  function handleStart(m: Module) {
    if (m.algoSlugs.length > 0) {
      navigate(`/algorithms/${m.algoSlugs[0]}`)
    }
    addXP(50)
  }

  const activePath = PATHS.find((p) => p.id === selectedPath)!
  const totalXP    = PATHS.reduce((s, p) => s + p.totalXP, 0)
  const xpPct      = Math.round((xp / 10000) * 100)
  const levelXP    = xp % 500
  const levelPct   = Math.round((levelXP / 500) * 100)

  return (
    <>
      <Helmet>
        <title>Learning Paths — Synaptica</title>
        <meta name="description" content="Structured ML learning paths from beginner to expert. Track your progress with XP." />
      </Helmet>

      {/* Header */}
      <div className="border-b py-14 px-6 sm:px-10 lg:px-16" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-1)' }}>
        <div className="max-w-[1400px] mx-auto">
          <Reveal><SectionLabel>Learning Paths</SectionLabel></Reveal>
          <Reveal delay={80}>
            <SectionTitle>From Zero to <em style={{ color: 'var(--color-amber)', fontStyle: 'italic' }}>Expert</em></SectionTitle>
          </Reveal>
          <Reveal delay={160}>
            <p className="text-base mt-3 max-w-lg" style={{ color: 'var(--color-text-2)' }}>
              Four structured paths — Beginner to Expert. Each module builds on the last. Track your XP as you go.
            </p>
          </Reveal>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 py-10">

        {/* XP status bar */}
        <Reveal>
          <div className="rounded-xl border p-5 mb-10" style={{ background: 'var(--color-surface-1)', borderColor: 'var(--color-border)' }}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-4">
              {[
                { label: 'Total XP',      value: xp.toLocaleString(),  icon: Zap,    color: 'var(--color-amber)' },
                { label: 'Current Level', value: `Level ${level}`,     icon: Star,   color: '#c084fc' },
                { label: 'Algos Visited', value: visitedAlgorithms.length, icon: BookOpen, color: 'var(--color-cyan)' },
                { label: 'Overall',       value: `${xpPct}%`,          icon: Target, color: '#10b981' },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${s.color}18` }}>
                    <s.icon size={16} style={{ color: s.color }} />
                  </div>
                  <div>
                    <div className="text-base font-bold font-mono" style={{ color: s.color }}>{s.value}</div>
                    <div className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--color-text-3)' }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
            {/* Level progress */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono" style={{ color: 'var(--color-text-3)' }}>Lv {level}</span>
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-surface-3)' }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${levelPct}%`, background: 'linear-gradient(90deg, var(--color-amber), var(--color-cyan))' }} />
              </div>
              <span className="text-xs font-mono" style={{ color: 'var(--color-text-3)' }}>Lv {level + 1}</span>
              <span className="text-xs font-mono" style={{ color: 'var(--color-amber)' }}>{levelXP}/500 XP</span>
            </div>
          </div>
        </Reveal>

        {/* Path selector grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {PATHS.map((p) => {
            const completed = p.modules.filter((m) => completedModuleIds.has(m.id)).length
            return (
              <Reveal key={p.id} delay={PATHS.indexOf(p) * 60}>
                <PathOverviewCard
                  path={p}
                  completedModules={completed}
                  onSelect={() => setSelectedPath(p.id)}
                  isSelected={selectedPath === p.id}
                />
              </Reveal>
            )
          })}
        </div>

        {/* Active path modules */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">{activePath.icon}</span>
            <div>
              <h2 className="text-lg font-medium" style={{ color: 'var(--color-text-1)' }}>{activePath.title} Path</h2>
              <p className="text-xs" style={{ color: 'var(--color-text-3)' }}>{activePath.description}</p>
            </div>
          </div>

          <div className="space-y-4">
            {activePath.modules.map((m, i) => (
              <ModuleCard
                key={m.id}
                module={m}
                pathAccent={activePath.accent}
                isUnlocked={isModuleUnlocked(m)}
                isComplete={completedModuleIds.has(m.id)}
                index={i}
                onStart={handleStart}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
