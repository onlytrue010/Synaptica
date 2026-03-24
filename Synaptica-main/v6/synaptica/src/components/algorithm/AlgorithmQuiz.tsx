import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, Trophy, RotateCcw, ChevronRight, Zap } from 'lucide-react'
import { useProgressStore } from '@store/progressStore'
import { cn } from '@utils/index'
import type { Algorithm } from '@/types'

// ─── QUIZ DATA PER ALGORITHM ────────────────────────────────────
interface QuizQuestion {
  id:       string
  question: string
  options:  string[]
  correct:  number       // index into options
  explain:  string       // shown after answering
}

// Generate quiz questions from algorithm data
function getQuestions(algo: Algorithm): QuizQuestion[] {
  const q: QuizQuestion[] = []

  // Q1 — Overall score / best dimension
  const topDim = Object.entries(algo.ratings).sort((a, b) => b[1] - a[1])[0]
  const dimLabels: Record<string, string> = {
    accuracy: 'Accuracy', speed: 'Speed', scalability: 'Scalability',
    interpretability: 'Interpretability', robustness: 'Robustness',
    easeOfUse: 'Ease of Use', dataEfficiency: 'Data Efficiency',
  }
  const weakDim = Object.entries(algo.ratings).sort((a, b) => a[1] - b[1])[0]
  q.push({
    id: `${algo.id}-q1`,
    question: `What is ${algo.name}'s strongest dimension out of the 7 ratings?`,
    options: [
      dimLabels[topDim[0]],
      dimLabels[weakDim[0]],
      dimLabels[Object.entries(algo.ratings).sort((a, b) => b[1] - a[1])[1]?.[0]] ?? 'Robustness',
      'Overall Score',
    ],
    correct: 0,
    explain: `${algo.name} scores ${topDim[1]}/100 on ${dimLabels[topDim[0]]}, making it its highest-rated dimension. Its weakest is ${dimLabels[weakDim[0]]} at ${weakDim[1]}/100.`,
  })

  // Q2 — Year / inventor
  const wrongYears = [algo.year - 5, algo.year + 3, algo.year - 12].filter(y => y > 1940 && y < 2025)
  q.push({
    id: `${algo.id}-q2`,
    question: `When was ${algo.name} introduced?`,
    options: shuffle([
      String(algo.year),
      String(wrongYears[0] ?? algo.year - 7),
      String(wrongYears[1] ?? algo.year + 5),
      String(wrongYears[2] ?? algo.year - 15),
    ]),
    correct: 0,
    explain: `${algo.name} was introduced in ${algo.year}${algo.inventor ? ` by ${algo.inventor}` : ''}. ${algo.paper ? `Published as: ${algo.paper}` : ''}`,
  })

  // Q3 — Category
  const allCategories = ['supervised', 'unsupervised', 'ensemble', 'deep-learning', 'reinforcement', 'generative', 'self-supervised', 'semi-supervised']
  const wrongCats = allCategories.filter(c => c !== algo.category).slice(0, 3)
  const catOptions = shuffle([algo.category, ...wrongCats])
  q.push({
    id: `${algo.id}-q3`,
    question: `Which ML category does ${algo.name} belong to?`,
    options: catOptions.map(c => c.replace('-', ' ')),
    correct: catOptions.indexOf(algo.category),
    explain: `${algo.name} is a ${algo.category.replace('-', ' ')} algorithm. Specifically, it falls under the "${algo.subcategory}" subcategory.`,
  })

  // Q4 — Time complexity
  q.push({
    id: `${algo.id}-q4`,
    question: `What is ${algo.name}'s time complexity?`,
    options: shuffle([
      algo.complexity.time,
      'O(n log n)',
      'O(n³)',
      'O(1)',
    ]),
    correct: 0,
    explain: `${algo.name} has time complexity ${algo.complexity.time}. ${algo.complexity.trainingNote}`,
  })

  // Q5 — Best use case (from useCases array)
  const correctUC = algo.useCases[0]
  const decoys = [
    'Real-time audio synthesis',
    '3D mesh reconstruction',
    'Quantum circuit simulation',
    'Hardware driver compilation',
  ].filter(d => !algo.useCases.includes(d)).slice(0, 3)
  const ucOptions = shuffle([correctUC, ...decoys])
  q.push({
    id: `${algo.id}-q5`,
    question: `Which of these is a primary real-world use case for ${algo.name}?`,
    options: ucOptions,
    correct: ucOptions.indexOf(correctUC),
    explain: `${algo.name} is commonly used for: ${algo.useCases.slice(0, 3).join(', ')}. ${algo.realWorldAnalogy ? `Intuition: ${algo.realWorldAnalogy}` : ''}`,
  })

  return q
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ─── XP REWARDS ─────────────────────────────────────────────────
const XP_PER_CORRECT = 20
const XP_PER_PERFECT = 50   // bonus for 5/5

// ─── QUESTION CARD ──────────────────────────────────────────────
function QuestionCard({
  q, qIndex, total,
  onAnswer,
}: {
  q: QuizQuestion
  qIndex: number
  total: number
  onAnswer: (correct: boolean) => void
}) {
  const [selected, setSelected] = useState<number | null>(null)
  const answered = selected !== null
  const isCorrect = selected === q.correct

  function handleSelect(i: number) {
    if (answered) return
    setSelected(i)
    onAnswer(i === q.correct)
  }

  return (
    <motion.div
      key={q.id}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Progress bar */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-surface-3)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${((qIndex) / total) * 100}%`, background: 'var(--color-amber)' }}
          />
        </div>
        <span className="text-xs font-mono flex-shrink-0" style={{ color: 'var(--color-text-3)' }}>
          {qIndex + 1} / {total}
        </span>
      </div>

      {/* Question */}
      <p className="text-sm font-medium mb-5 leading-relaxed" style={{ color: 'var(--color-text-1)' }}>
        {q.question}
      </p>

      {/* Options */}
      <div className="space-y-2.5 mb-5">
        {q.options.map((opt, i) => {
          const isSelected  = selected === i
          const isRight     = answered && i === q.correct
          const isWrong     = answered && isSelected && !isCorrect

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={answered}
              className={cn(
                'w-full text-left px-4 py-3 rounded-xl border text-sm transition-all duration-200',
                !answered && 'hover:border-amber-500/40 hover:bg-amber-500/5',
                isRight  && 'border-emerald-500/50 bg-emerald-500/8',
                isWrong  && 'border-rose-500/50 bg-rose-500/8',
                !answered && 'cursor-pointer',
                answered && !isRight && !isWrong && 'opacity-50',
              )}
              style={{
                borderColor: isRight ? '#10b981' : isWrong ? '#f43f5e' : isSelected ? 'var(--color-amber)' : 'var(--color-border)',
                background: isRight
                  ? 'rgba(16,185,129,0.08)'
                  : isWrong
                  ? 'rgba(244,63,94,0.08)'
                  : isSelected && !answered
                  ? 'rgba(245,158,11,0.06)'
                  : 'var(--color-surface-1)',
                color: 'var(--color-text-1)',
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <span>{opt}</span>
                {isRight && <CheckCircle2 size={15} className="flex-shrink-0 text-emerald-400" />}
                {isWrong && <XCircle      size={15} className="flex-shrink-0 text-rose-400" />}
              </div>
            </button>
          )
        })}
      </div>

      {/* Explanation (shown after answering) */}
      <AnimatePresence>
        {answered && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div
              className="p-4 rounded-xl text-sm leading-relaxed"
              style={{
                background: isCorrect ? 'rgba(16,185,129,0.07)' : 'rgba(244,63,94,0.07)',
                border: `1px solid ${isCorrect ? 'rgba(16,185,129,0.25)' : 'rgba(244,63,94,0.25)'}`,
                color: 'var(--color-text-2)',
              }}
            >
              <span className="font-medium" style={{ color: isCorrect ? '#10b981' : '#f43f5e' }}>
                {isCorrect ? '✓ Correct! ' : '✗ Not quite. '}
              </span>
              {q.explain}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── RESULTS SCREEN ─────────────────────────────────────────────
function ResultsScreen({
  score, total, xpEarned, algoName, onRetry,
}: {
  score: number; total: number; xpEarned: number; algoName: string; onRetry: () => void
}) {
  const pct     = Math.round((score / total) * 100)
  const perfect = score === total
  const good    = pct >= 60

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="text-center py-4"
    >
      {/* Score circle */}
      <div className="relative w-28 h-28 mx-auto mb-5">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="44" fill="none" stroke="var(--color-surface-3)" strokeWidth="8" />
          <circle
            cx="50" cy="50" r="44" fill="none"
            stroke={perfect ? '#f59e0b' : good ? '#10b981' : '#f43f5e'}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 44}`}
            strokeDashoffset={`${2 * Math.PI * 44 * (1 - score / total)}`}
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold font-mono" style={{ color: perfect ? 'var(--color-amber)' : good ? '#10b981' : '#f43f5e' }}>
            {score}/{total}
          </span>
          <span className="text-xs" style={{ color: 'var(--color-text-3)' }}>{pct}%</span>
        </div>
      </div>

      {/* Trophy for perfect */}
      {perfect && (
        <div className="flex items-center justify-center gap-2 mb-3">
          <Trophy size={16} className="text-amber-400" />
          <span className="text-sm font-medium" style={{ color: 'var(--color-amber)' }}>
            Perfect score!
          </span>
        </div>
      )}

      <h3 className="text-lg font-medium mb-1" style={{ color: 'var(--color-text-1)' }}>
        {perfect ? 'Mastered!' : good ? 'Good job!' : 'Keep studying'}
      </h3>
      <p className="text-sm mb-5" style={{ color: 'var(--color-text-3)' }}>
        {perfect
          ? `You know ${algoName} inside out.`
          : good
          ? `Solid understanding of ${algoName}.`
          : `Review the ${algoName} sections and try again.`}
      </p>

      {/* XP earned */}
      <div
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6"
        style={{ background: 'rgba(245,158,11,0.08)', borderColor: 'rgba(245,158,11,0.25)' }}
      >
        <Zap size={13} className="text-amber-400" />
        <span className="text-sm font-mono font-medium" style={{ color: 'var(--color-amber)' }}>
          +{xpEarned} XP earned
        </span>
      </div>

      {/* Retry */}
      <div className="flex justify-center">
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-medium transition-all hover:border-amber-500/40 hover:bg-amber-500/5"
          style={{ color: 'var(--color-text-2)', borderColor: 'var(--color-border-2)' }}
        >
          <RotateCcw size={13} /> Retake quiz
        </button>
      </div>
    </motion.div>
  )
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────
interface AlgorithmQuizProps {
  algo: Algorithm
}

export default function AlgorithmQuiz({ algo }: AlgorithmQuizProps) {
  const { completedQuizzes, markQuizDone, addXP } = useProgressStore()
  const quizId    = `quiz-${algo.id}`
  const isDone    = completedQuizzes.includes(quizId)

  const [questions]   = useState<QuizQuestion[]>(() => getQuestions(algo))
  const [qIndex, setQIndex]   = useState(0)
  const [answers, setAnswers] = useState<boolean[]>([])
  const [answered, setAnswered] = useState(false)
  const [finished, setFinished] = useState(false)
  const [xpEarned, setXpEarned] = useState(0)
  const [started, setStarted]   = useState(false)

  const score = answers.filter(Boolean).length

  const handleAnswer = useCallback((correct: boolean) => {
    setAnswered(true)
    const newAnswers = [...answers, correct]
    setAnswers(newAnswers)
    if (correct) addXP(XP_PER_CORRECT)
  }, [answers, addXP])

  const handleNext = useCallback(() => {
    if (qIndex + 1 >= questions.length) {
      // Quiz complete
      const finalScore  = answers.filter(Boolean).length + (answers[qIndex] ? 0 : 0)
      const perfect     = finalScore === questions.length
      const bonus       = perfect ? XP_PER_PERFECT : 0
      if (bonus > 0) addXP(bonus)
      const total = answers.filter(Boolean).length * XP_PER_CORRECT + bonus
      setXpEarned(total)
      markQuizDone(quizId)
      setFinished(true)
    } else {
      setQIndex((i) => i + 1)
      setAnswered(false)
    }
  }, [qIndex, questions.length, answers, addXP, markQuizDone, quizId])

  const handleRetry = useCallback(() => {
    setQIndex(0)
    setAnswers([])
    setAnswered(false)
    setFinished(false)
    setXpEarned(0)
  }, [])

  // ── Not started yet ─────────────────────────────────────────
  if (!started) {
    return (
      <div className="py-6 text-center">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}
        >
          <Trophy size={22} className="text-amber-400" />
        </div>

        <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--color-text-1)' }}>
          {algo.name} Quiz
        </h3>
        <p className="text-sm mb-1" style={{ color: 'var(--color-text-2)' }}>
          {questions.length} multiple-choice questions
        </p>
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-3)' }}>
          Earn up to {questions.length * XP_PER_CORRECT + XP_PER_PERFECT} XP for a perfect score
        </p>

        {isDone && (
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs mb-4"
            style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)' }}
          >
            <CheckCircle2 size={12} /> Previously completed
          </div>
        )}

        <div className="flex justify-center gap-3">
          <button
            onClick={() => setStarted(true)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all hover:-translate-y-0.5"
            style={{ background: 'var(--color-amber)', color: '#080808' }}
          >
            {isDone ? 'Retake quiz' : 'Start quiz'} <ChevronRight size={14} />
          </button>
        </div>

        {/* XP legend */}
        <div className="flex items-center justify-center gap-4 mt-6 text-xs" style={{ color: 'var(--color-text-3)' }}>
          <div className="flex items-center gap-1.5">
            <Zap size={11} className="text-amber-400" />
            <span>{XP_PER_CORRECT} XP per correct answer</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Trophy size={11} className="text-amber-400" />
            <span>+{XP_PER_PERFECT} XP bonus for perfect</span>
          </div>
        </div>
      </div>
    )
  }

  // ── Finished ────────────────────────────────────────────────
  if (finished) {
    return (
      <ResultsScreen
        score={score}
        total={questions.length}
        xpEarned={xpEarned}
        algoName={algo.name}
        onRetry={handleRetry}
      />
    )
  }

  // ── Active quiz ─────────────────────────────────────────────
  return (
    <div>
      <AnimatePresence mode="wait">
        <QuestionCard
          key={qIndex}
          q={questions[qIndex]}
          qIndex={qIndex}
          total={questions.length}
          onAnswer={handleAnswer}
        />
      </AnimatePresence>

      {/* Next button — only shows after answering */}
      <AnimatePresence>
        {answered && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 flex justify-end"
          >
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all hover:-translate-y-0.5"
              style={{ background: 'var(--color-amber)', color: '#080808' }}
            >
              {qIndex + 1 >= questions.length ? 'See results' : 'Next question'}
              <ChevronRight size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}