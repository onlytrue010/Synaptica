// ─── ALGORITHM TYPES ────────────────────────────────────────────
export type AlgorithmCategory =
  | 'supervised'
  | 'unsupervised'
  | 'ensemble'
  | 'deep-learning'
  | 'reinforcement'
  | 'self-supervised'
  | 'semi-supervised'
  | 'generative'

export type DataType = 'tabular' | 'text' | 'image' | 'timeseries' | 'graph' | 'audio' | 'video'

export type DataTypeSupport = 'native' | 'adapted' | 'not-suitable'

export interface AlgorithmRatings {
  accuracy:         number  // 0-100
  speed:            number
  scalability:      number
  interpretability: number
  robustness:       number
  easeOfUse:        number
  dataEfficiency:   number
}

export interface BenchmarkEntry {
  year:    number
  dataset: string
  score:   number
  metric:  string
  paper?:  string
}

export interface HyperParameter {
  name:         string
  type:         'int' | 'float' | 'string' | 'bool'
  default:      string | number | boolean
  range?:       [number, number]
  options?:     string[]
  description:  string
  impact:       'high' | 'medium' | 'low'
}

export interface CodeExample {
  language:    'python' | 'r' | 'julia'
  title:       string
  description: string
  code:        string
  library?:    string
}

export interface Algorithm {
  id:          string
  slug:        string
  name:        string
  shortName?:  string
  category:    AlgorithmCategory
  subcategory: string
  year:        number
  description: string
  intuition:   string
  ratings:     AlgorithmRatings
  overallScore: number
  dataTypes:   Record<DataType, DataTypeSupport>
  pros:        string[]
  cons:        string[]
  useCases:    string[]
  hyperParams: HyperParameter[]
  benchmarks:  BenchmarkEntry[]
  codeExamples: CodeExample[]
  neighbors:   string[]  // related algo slugs
  tags:        string[]
  complexity: {
    time:   string
    space:  string
  }
  hasVisualization: boolean
}

// ─── INTERVIEW Q&A TYPES ────────────────────────────────────────
export type QuestionDifficulty = 'fundamental' | 'intermediate' | 'tricky' | 'critical' | 'system-design'
export type QuestionCompany    = 'Google' | 'Meta' | 'Amazon' | 'Microsoft' | 'OpenAI' | 'Apple' | 'Netflix' | 'Uber' | 'General'
export type QuestionCategory   =
  | 'conceptual'
  | 'mathematical'
  | 'coding'
  | 'system-design'
  | 'scenario'
  | 'tricky'

export interface InterviewQuestion {
  id:           string
  title:        string
  question:     string
  difficulty:   QuestionDifficulty
  category:     QuestionCategory
  companies:    QuestionCompany[]
  algorithms:   string[]
  answer:       string
  example?:     string
  keyPoints:    string[]
  commonMistakes: string[]
  followUps:    string[]
  relatedTopics: string[]
  tags:         string[]
  estimatedTime: number
}

// ─── TIMELINE TYPES ─────────────────────────────────────────────
export interface TimelineEvent {
  year:        number
  title:       string
  description: string
  category:    'foundation' | 'algorithm' | 'breakthrough' | 'hardware' | 'application'
  importance:  'milestone' | 'major' | 'notable'
  algoSlug?:   string
  paper?:      string
  authors?:    string[]
}

// ─── USER / PROGRESS TYPES ──────────────────────────────────────
export interface UserProgress {
  visitedAlgorithms: string[]
  bookmarks:         string[]
  completedQuizzes:  string[]
  xp:                number
  level:             number
  streak:            number
  lastVisit:         string
}

export interface BookmarkItem {
  id:        string
  type:      'algorithm' | 'question'
  slug:      string
  title:     string
  addedAt:   string
}

// ─── COMPARE TYPES ──────────────────────────────────────────────
export interface CompareSelection {
  algorithms: string[]  // up to 4 slugs
}

// ─── UI / THEME TYPES ───────────────────────────────────────────
export type Theme = 'dark' | 'light'

export interface NavLink {
  label: string
  path:  string
  icon?: string
}

// ─── FILTER TYPES ───────────────────────────────────────────────
export interface AlgorithmFilters {
  category?:   AlgorithmCategory
  dataType?:   DataType
  search?:     string
  sortBy?:     'name' | 'score' | 'year' | 'category'
  sortOrder?:  'asc' | 'desc'
}

export interface InterviewFilters {
  difficulty?: QuestionDifficulty
  category?:   QuestionCategory
  company?:    QuestionCompany
  algorithm?:  string
  search?:     string
}
