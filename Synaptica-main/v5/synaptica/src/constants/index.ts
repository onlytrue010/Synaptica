import type { NavLink } from '@/types'

export const NAV_LINKS: NavLink[] = [
  { label: 'Algorithms',  path: '/algorithms'  },
  { label: 'Compare',     path: '/compare'     },
  { label: 'Timeline',    path: '/timeline'    },
  { label: 'Interview',   path: '/interview'   },
  { label: 'Lab',         path: '/lab'         },
  { label: 'Learning',    path: '/learning'    },
  { label: 'Performance', path: '/performance' },
  { label: 'Data Matrix', path: '/data-matrix' },
]

export const ALGORITHM_CATEGORIES = [
  { value: 'supervised',        label: 'Supervised',       color: 'emerald' },
  { value: 'unsupervised',      label: 'Unsupervised',     color: 'cyan' },
  { value: 'ensemble',          label: 'Ensemble',         color: 'amber' },
  { value: 'deep-learning',     label: 'Deep Learning',    color: 'purple' },
  { value: 'reinforcement',     label: 'Reinforcement',    color: 'rose' },
  { value: 'self-supervised',   label: 'Self-Supervised',  color: 'teal' },
  { value: 'semi-supervised',   label: 'Semi-Supervised',  color: 'indigo' },
  { value: 'generative',        label: 'Generative',       color: 'pink' },
] as const

export const DATA_TYPES = [
  { value: 'tabular',    label: 'Tabular',      icon: '⬛' },
  { value: 'text',       label: 'Text / NLP',   icon: '📝' },
  { value: 'image',      label: 'Image / CV',   icon: '🖼️' },
  { value: 'timeseries', label: 'Time Series',  icon: '📈' },
  { value: 'graph',      label: 'Graph / GNN',  icon: '🕸️' },
  { value: 'audio',      label: 'Audio',        icon: '🔊' },
  { value: 'video',      label: 'Video',        icon: '🎬' },
] as const

export const RATING_DIMENSIONS = [
  { key: 'accuracy',         label: 'Accuracy' },
  { key: 'speed',            label: 'Speed' },
  { key: 'scalability',      label: 'Scalability' },
  { key: 'interpretability', label: 'Interpretability' },
  { key: 'robustness',       label: 'Robustness' },
  { key: 'easeOfUse',        label: 'Ease of Use' },
  { key: 'dataEfficiency',   label: 'Data Efficiency' },
] as const

export const DIFFICULTY_LABELS = {
  fundamental:    'Fundamental',
  intermediate:   'Intermediate',
  tricky:         'Tricky',
  critical:       'Critical',
  'system-design':'System Design',
} as const

export const DIFFICULTY_STYLES = {
  fundamental:    'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  intermediate:   'bg-blue-500/10 text-blue-400 border-blue-500/20',
  tricky:         'bg-amber-500/10 text-amber-400 border-amber-500/20',
  critical:       'bg-rose-500/10 text-rose-400 border-rose-500/20',
  'system-design':'bg-purple-500/10 text-purple-400 border-purple-500/20',
} as const

export const CATEGORY_STYLES = {
  supervised:        'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  unsupervised:      'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  ensemble:          'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'deep-learning':   'bg-purple-500/10 text-purple-400 border-purple-500/20',
  reinforcement:     'bg-rose-500/10 text-rose-400 border-rose-500/20',
  'self-supervised': 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  'semi-supervised': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  generative:        'bg-pink-500/10 text-pink-400 border-pink-500/20',
} as const

export const COMPANY_TAGS = [
  'Google', 'Meta', 'Amazon', 'Microsoft', 'OpenAI',
  'Apple', 'Netflix', 'Uber', 'General',
] as const

export const XP_REWARDS = {
  VISIT_ALGORITHM:    10,
  COMPLETE_QUIZ:      50,
  ADD_BOOKMARK:        5,
  STREAK_BONUS:       25,
  COMPLETE_MODULE:   200,
} as const

export const APP_NAME    = 'Synaptica'
export const APP_VERSION = '0.1.0'
export const APP_TAGLINE = 'The Complete Machine Learning Reference'
