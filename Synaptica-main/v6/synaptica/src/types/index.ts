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

export type DataType        = 'tabular' | 'text' | 'image' | 'timeseries' | 'graph' | 'audio' | 'video'
export type DataTypeSupport = 'native' | 'adapted' | 'not-suitable'

export interface AlgorithmRatings {
  accuracy:         number   // 0–100
  speed:            number
  scalability:      number
  interpretability: number
  robustness:       number
  easeOfUse:        number
  dataEfficiency:   number
}

// ── MATH SECTION ─────────────────────────────────────────────────
export interface MathStep {
  title:       string   // e.g. "Step 1: Compute similarity"
  latex?:      string   // KaTeX formula string
  explanation: string   // plain-English meaning of the formula
}

export interface MathFoundation {
  overview:    string        // high-level: "what math does this algo use"
  assumptions: string[]      // statistical/geometric assumptions
  steps:       MathStep[]    // numbered derivation steps
  notation:    { symbol: string; meaning: string }[]  // variable legend
  lossFunction?: string      // the loss/objective function in LaTeX
  updateRule?:  string       // weight update / parameter update formula
}

// ── HOW IT WORKS UNDER THE HOOD ──────────────────────────────────
export interface TrainingStep {
  step:        number
  phase:       'initialization' | 'forward' | 'backward' | 'update' | 'evaluation' | 'prediction'
  title:       string
  description: string        // detailed explanation
  detail:      string        // what happens computationally
  whyItMatters: string       // why this step exists
}

export interface UnderTheHood {
  trainingSteps:  TrainingStep[]
  predictionFlow: string[]    // what happens when you call .predict()
  memoryLayout:   string      // how data is stored internally
  convergence:    string      // when/how the algorithm knows it's done
  parallelism:    string      // can it train in parallel? how?
}

// ── ANNOTATED CODE ────────────────────────────────────────────────
export interface AnnotatedLine {
  line:        number         // line number (1-indexed)
  code:        string         // the actual code line
  explanation: string         // what this line does
  important?:  boolean        // highlight as key line
}

export interface CodeExample {
  language:       'python' | 'r' | 'julia'
  title:          string
  description:    string
  library?:       string
  code:           string      // full code block
  annotatedLines?: AnnotatedLine[]   // optional per-line explanations
  output?:        string      // expected console output
  whenToUse:      string      // which scenario calls for this pattern
}

// ── EVALUATION METRICS ────────────────────────────────────────────
export interface EvalMetric {
  name:        string         // e.g. "ROC-AUC"
  formula?:    string         // LaTeX
  why:         string         // why use this metric for this algorithm
  when:        string         // when is this metric appropriate
  howToRead:   string         // e.g. "1.0 = perfect, 0.5 = random"
  code:        string         // how to compute it
  pitfall?:    string         // common mistake with this metric
}

// ── HYPERPARAMETERS ───────────────────────────────────────────────
export interface HyperParameter {
  name:         string
  type:         'int' | 'float' | 'string' | 'bool'
  default:      string | number | boolean
  range?:       [number, number]
  options?:     string[]
  description:  string
  impact:       'high' | 'medium' | 'low'
  effect:       string        // "increasing this causes..."
  tuningTip:    string        // how to tune it in practice
}

// ── COMMON MISTAKES ───────────────────────────────────────────────
export interface CommonMistake {
  mistake:     string
  why:         string         // why people make this mistake
  consequence: string         // what goes wrong
  fix:         string         // how to correct it
  code?:       string         // wrong vs right code
}

// ── WHY SECTION ───────────────────────────────────────────────────
export interface WhySection {
  whyItWorks:      string     // the core insight: why the algorithm works
  whyBetterThan:   { algo: string; reason: string }[]
  whyWorseThan:    { algo: string; reason: string }[]
  whyChooseThis:   string[]   // decision checklist: "choose RF when..."
  whyAvoidThis:    string[]   // "avoid RF when..."
  realWorldWhy:    string     // concrete business reason it exists
}

// ── VARIANTS ─────────────────────────────────────────────────────
export interface AlgorithmVariant {
  name:        string
  difference:  string
  useCase:     string
  slug?:       string
}

// ── BENCHMARK ────────────────────────────────────────────────────
export interface BenchmarkEntry {
  year:     number
  dataset:  string
  score:    number
  metric:   string
  paper?:   string
  authors?: string
}

// ── FULL ALGORITHM TYPE ───────────────────────────────────────────
export interface Algorithm {
  id:           string
  slug:         string
  name:         string
  shortName?:   string
  category:     AlgorithmCategory
  subcategory:  string
  year:         number
  inventor?:    string
  paper?:       string

  // Overview
  description:  string
  intuition:    string
  realWorldAnalogy: string     // relatable analogy for total beginners

  // Why section — the "why" people always ask
  why:          WhySection

  // Math
  mathFoundation: MathFoundation

  // How it works step by step
  underTheHood: UnderTheHood

  // Ratings
  ratings:      AlgorithmRatings
  overallScore: number

  // Data compatibility
  dataTypes:    Record<DataType, DataTypeSupport>

  // Pros & cons
  pros:         string[]
  cons:         string[]
  useCases:     string[]

  // Hyperparameters — with full explanation
  hyperParams:  HyperParameter[]

  // Evaluation — which metrics to use and why
  evalMetrics:  EvalMetric[]

  // Code examples — annotated
  codeExamples: CodeExample[]

  // Common mistakes
  commonMistakes: CommonMistake[]

  // Variants
  variants:     AlgorithmVariant[]

  // History
  benchmarks:   BenchmarkEntry[]

  // Related
  neighbors:    string[]
  tags:         string[]
  complexity: {
    time:       string
    space:      string
    trainingNote: string      // e.g. "scales well to 10M rows"
  }
  hasVisualization: boolean
}

// ─── INTERVIEW Q&A TYPES ────────────────────────────────────────
export type QuestionDifficulty = 'fundamental' | 'intermediate' | 'tricky' | 'critical' | 'system-design'
export type QuestionCompany    = 'Google' | 'Meta' | 'Amazon' | 'Microsoft' | 'OpenAI' | 'Apple' | 'Netflix' | 'Uber' | 'General'
export type QuestionCategory   = 'conceptual' | 'mathematical' | 'coding' | 'system-design' | 'scenario' | 'tricky'

export interface InterviewQuestion {
  id:             string
  title:          string
  question:       string
  difficulty:     QuestionDifficulty
  category:       QuestionCategory
  companies:      QuestionCompany[]
  algorithms:     string[]
  answer:         string
  example?:       string
  keyPoints:      string[]
  commonMistakes: string[]
  followUps:      string[]
  relatedTopics:  string[]
  tags:           string[]
  estimatedTime:  number
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
  id:      string
  type:    'algorithm' | 'question'
  slug:    string
  title:   string
  addedAt: string
}

// ─── COMPARE TYPES ──────────────────────────────────────────────
export interface CompareSelection {
  algorithms: string[]
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
  category?:  AlgorithmCategory
  dataType?:  DataType
  search?:    string
  sortBy?:    'name' | 'score' | 'year' | 'category'
  sortOrder?: 'asc' | 'desc'
}

export interface InterviewFilters {
  difficulty?: QuestionDifficulty
  category?:   QuestionCategory
  company?:    QuestionCompany
  algorithm?:  string
  search?:     string
}
