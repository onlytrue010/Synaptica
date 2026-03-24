import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Timer, ChevronRight, RotateCcw, Trophy, Clock, CheckCircle2, XCircle, Zap, AlertCircle } from 'lucide-react'
import { Card } from '@components/ui/index'
import { useProgressStore } from '@store/progressStore'
import { interviewQuestions } from '@data/interviewQuestions'
import { DIFFICULTY_STYLES, DIFFICULTY_LABELS } from '@constants/index'
import { cn } from '@utils/index'
import type { QuestionDifficulty, QuestionCompany } from '@/types'

// ─── CONFIG ───────────────────────────────────────────────────────
const TIME_PER_QUESTION = 15 * 60  // 15 minutes in seconds
const XP_PER_CORRECT    = 30

// ─── TYPES ────────────────────────────────────────────────────────
interface MockSession {
  questionId: string
  selfGrade:  'correct' | 'partial' | 'incorrect' | null
  timeSpent:  number
}

// ─── TIMER DISPLAY ────────────────────────────────────────────────
function TimerDisplay({ seconds, total }: { seconds: number; total: number }) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  const pct  = (seconds / total) * 100
  const urgent = seconds < 120  // under 2 minutes

  return (
    <div className="flex items-center gap-3">
      <div className="relative w-10 h-10 flex-shrink-0">
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
          <circle cx="18" cy="18" r="15" fill="none"
            stroke="var(--color-surface-3)" strokeWidth="3" />
          <circle cx="18" cy="18" r="15" fill="none"
            stroke={urgent ? '#f43f5e' : 'var(--color-amber)'} strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="94.25"
            strokeDashoffset={94.25 * (1 - pct / 100)}
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <Clock size={12} className="absolute inset-0 m-auto"
          style={{ color: urgent ? '#f43f5e' : 'var(--color-amber)' }} />
      </div>
      <div>
        <div className="text-lg font-mono font-medium"
          style={{ color: urgent ? '#f43f5e' : 'var(--color-text-1)' }}>
          {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </div>
        <div className="text-[10px]" style={{ color: 'var(--color-text-3)' }}>remaining</div>
      </div>
    </div>
  )
}

// ─── SELF GRADE BUTTONS ───────────────────────────────────────────
function SelfGradePanel({ onGrade }: { onGrade: (g: 'correct' | 'partial' | 'incorrect') => void }) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium" style={{ color: 'var(--color-text-1)' }}>
        How well did you answer?
      </p>
      <div className="grid grid-cols-3 gap-3">
        {([
          { id: 'correct' as const,   label: 'Got it',        desc: 'Full answer',    icon: CheckCircle2, color: '#10b981' },
          { id: 'partial' as const,   label: 'Partial',       desc: 'Key points only', icon: AlertCircle,  color: '#f59e0b' },
          { id: 'incorrect' as const, label: 'Missed it',     desc: 'Need to review', icon: XCircle,      color: '#f43f5e' },
        ] as const).map(opt => (
          <button
            key={opt.id}
            onClick={() => onGrade(opt.id)}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 hover:-translate-y-0.5"
            style={{ borderColor: opt.color + '40', background: opt.color + '08' }}
          >
            <opt.icon size={20} style={{ color: opt.color }} />
            <div className="text-sm font-medium" style={{ color: opt.color }}>{opt.label}</div>
            <div className="text-[10px]" style={{ color: 'var(--color-text-3)' }}>{opt.desc}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── SESSION RESULTS ─────────────────────────────────────────────
function SessionResults({
  sessions,
  questions,
  onReset,
}: {
  sessions: MockSession[]
  questions: typeof interviewQuestions
  onReset: () => void
}) {
  const correct  = sessions.filter(s => s.selfGrade === 'correct').length
  const partial  = sessions.filter(s => s.selfGrade === 'partial').length
  const xpEarned = sessions.reduce((sum, s) => {
    const g = s.selfGrade
    return sum + (g === 'correct' ? XP_PER_CORRECT : g === 'partial' ? Math.round(XP_PER_CORRECT / 2) : 0)
  }, 0)
  const avgTime = Math.round(sessions.reduce((s, r) => s + r.timeSpent, 0) / sessions.length)
  const pct     = Math.round(((correct + partial * 0.5) / sessions.length) * 100)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Score circle */}
      <div className="text-center mb-8">
        <div className="relative w-32 h-32 mx-auto mb-4">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="44" fill="none"
              stroke="var(--color-surface-3)" strokeWidth="8" />
            <circle cx="50" cy="50" r="44" fill="none"
              stroke={pct >= 70 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#f43f5e'}
              strokeWidth="8" strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 44}`}
              strokeDashoffset={`${2 * Math.PI * 44 * (1 - pct / 100)}`}
              style={{ transition: 'stroke-dashoffset 1s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold font-mono"
              style={{ color: pct >= 70 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#f43f5e' }}>
              {pct}%
            </span>
          </div>
        </div>
        <h3 className="text-xl font-medium mb-1" style={{ color: 'var(--color-text-1)' }}>
          {pct >= 80 ? 'Interview Ready!' : pct >= 50 ? 'Good Progress' : 'Keep Practicing'}
        </h3>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border"
          style={{ background: 'rgba(245,158,11,0.08)', borderColor: 'rgba(245,158,11,0.25)' }}>
          <Zap size={13} className="text-amber-400" />
          <span className="text-sm font-mono font-medium" style={{ color: 'var(--color-amber)' }}>
            +{xpEarned} XP earned
          </span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Correct',  value: correct,                     color: '#10b981' },
          { label: 'Partial',  value: partial,                     color: '#f59e0b' },
          { label: 'Missed',   value: sessions.length - correct - partial, color: '#f43f5e' },
          { label: 'Avg time', value: `${Math.floor(avgTime/60)}:${String(avgTime%60).padStart(2,'0')}`, color: 'var(--color-cyan)' },
        ].map(s => (
          <div key={s.label} className="text-center rounded-xl p-3"
            style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
            <div className="text-xl font-mono font-medium" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[10px] uppercase tracking-wide mt-0.5" style={{ color: 'var(--color-text-3)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Per-question breakdown */}
      <div className="space-y-2 mb-6">
        {sessions.map((session, i) => {
          const q   = questions.find(q => q.id === session.questionId)
          const g   = session.selfGrade
          const col = g === 'correct' ? '#10b981' : g === 'partial' ? '#f59e0b' : '#f43f5e'
          if (!q) return null
          return (
            <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-xl border"
              style={{ background: 'var(--color-surface-1)', borderColor: 'var(--color-border)' }}>
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: col }} />
              <span className="text-sm flex-1 truncate" style={{ color: 'var(--color-text-2)' }}>{q.title}</span>
              <span className="text-[10px] font-mono" style={{ color: 'var(--color-text-3)' }}>
                {Math.floor(session.timeSpent / 60)}m {session.timeSpent % 60}s
              </span>
              <span className="text-[10px] font-medium capitalize" style={{ color: col }}>{g}</span>
            </div>
          )
        })}
      </div>

      <div className="flex justify-center">
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl border text-sm font-medium transition-all hover:border-amber-500/40 hover:bg-amber-500/5"
          style={{ color: 'var(--color-text-2)', borderColor: 'var(--color-border-2)' }}
        >
          <RotateCcw size={14} /> New mock interview
        </button>
      </div>
    </motion.div>
  )
}

// ─── SETUP SCREEN ─────────────────────────────────────────────────
interface SetupConfig {
  difficulty: QuestionDifficulty | 'all'
  company:    QuestionCompany | 'all'
  count:      number
}

function SetupScreen({ onStart }: { onStart: (cfg: SetupConfig) => void }) {
  const [config, setConfig] = useState<SetupConfig>({ difficulty: 'all', company: 'all', count: 5 })

  const DIFFS: (QuestionDifficulty | 'all')[] = ['all', 'fundamental', 'intermediate', 'tricky', 'critical', 'system-design']
  const COMPANIES: (QuestionCompany | 'all')[] = ['all', 'Google', 'Meta', 'Amazon', 'Microsoft', 'OpenAI', 'Apple', 'Netflix']
  const COUNTS = [3, 5, 10]

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-3" style={{ color: 'var(--color-text-1)' }}>
          Difficulty
        </label>
        <div className="flex flex-wrap gap-2">
          {DIFFS.map(d => (
            <button
              key={d}
              onClick={() => setConfig(c => ({ ...c, difficulty: d }))}
              className={cn('px-3 py-1.5 rounded-full text-xs border transition-all capitalize',
                config.difficulty === d ? 'border-amber-500/40 text-amber-400 bg-amber-500/10' : 'border-transparent')}
              style={{ color: config.difficulty === d ? undefined : 'var(--color-text-3)' }}
            >
              {d === 'all' ? 'All levels' : DIFFICULTY_LABELS[d]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-3" style={{ color: 'var(--color-text-1)' }}>
          Company focus
        </label>
        <div className="flex flex-wrap gap-2">
          {COMPANIES.map(c => (
            <button
              key={c}
              onClick={() => setConfig(cfg => ({ ...cfg, company: c }))}
              className={cn('px-3 py-1.5 rounded-full text-xs border transition-all',
                config.company === c ? 'border-amber-500/40 text-amber-400 bg-amber-500/10' : 'border-transparent')}
              style={{ color: config.company === c ? undefined : 'var(--color-text-3)' }}
            >
              {c === 'all' ? 'All companies' : c}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-3" style={{ color: 'var(--color-text-1)' }}>
          Number of questions
        </label>
        <div className="flex gap-2">
          {COUNTS.map(n => (
            <button
              key={n}
              onClick={() => setConfig(c => ({ ...c, count: n }))}
              className={cn('px-5 py-2 rounded-xl border text-sm font-medium transition-all',
                config.count === n ? 'border-amber-500/40 text-amber-400 bg-amber-500/10' : 'border-transparent')}
              style={{ color: config.count === n ? undefined : 'var(--color-text-3)', borderColor: config.count !== n ? 'var(--color-border)' : undefined }}
            >
              {n} questions
              <span className="text-xs ml-1.5" style={{ color: 'var(--color-text-3)' }}>
                ~{n * 8}min
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="pt-2">
        <button
          onClick={() => onStart(config)}
          className="flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-medium transition-all hover:-translate-y-0.5"
          style={{ background: 'var(--color-amber)', color: '#080808' }}
        >
          <Timer size={15} /> Start mock interview
        </button>
        <p className="text-xs mt-3" style={{ color: 'var(--color-text-3)' }}>
          15 minutes per question · Read the question, think, then reveal the model answer to self-grade.
        </p>
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────
export default function MockInterview() {
  const { addXP } = useProgressStore()

  type Phase = 'setup' | 'question' | 'answer' | 'complete'

  const [phase, setPhase]         = useState<Phase>('setup')
  const [queue, setQueue]         = useState<typeof interviewQuestions>([])
  const [qIndex, setQIndex]       = useState(0)
  const [sessions, setSessions]   = useState<MockSession[]>([])
  const [timeLeft, setTimeLeft]   = useState(TIME_PER_QUESTION)
  const [startTime, setStartTime] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const currentQ = queue[qIndex]

  // Timer
  useEffect(() => {
    if (phase !== 'question') return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { setPhase('answer'); return 0 }
        return t - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [phase, qIndex])

  function startSession(cfg: SetupConfig) {
    let pool = [...interviewQuestions]
    if (cfg.difficulty !== 'all') pool = pool.filter(q => q.difficulty === cfg.difficulty)
    if (cfg.company !== 'all')    pool = pool.filter(q => q.companies.includes(cfg.company as QuestionCompany))
    // Shuffle and take count
    const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, cfg.count)
    if (shuffled.length === 0) return
    setQueue(shuffled)
    setQIndex(0)
    setSessions([])
    setTimeLeft(TIME_PER_QUESTION)
    setStartTime(Date.now())
    setShowAnswer(false)
    setPhase('question')
  }

  function revealAnswer() {
    if (timerRef.current) clearInterval(timerRef.current)
    setPhase('answer')
    setShowAnswer(true)
  }

  function handleGrade(grade: 'correct' | 'partial' | 'incorrect') {
    const timeSpent = Math.round((Date.now() - startTime) / 1000)
    const session: MockSession = { questionId: currentQ.id, selfGrade: grade, timeSpent }
    const newSessions = [...sessions, session]
    setSessions(newSessions)

    const xp = grade === 'correct' ? XP_PER_CORRECT : grade === 'partial' ? Math.round(XP_PER_CORRECT / 2) : 0
    if (xp > 0) addXP(xp)

    if (qIndex + 1 >= queue.length) {
      setPhase('complete')
    } else {
      setQIndex(i => i + 1)
      setTimeLeft(TIME_PER_QUESTION)
      setStartTime(Date.now())
      setShowAnswer(false)
      setPhase('question')
    }
  }

  function reset() {
    setPhase('setup')
    setQueue([])
    setQIndex(0)
    setSessions([])
    setShowAnswer(false)
  }

  if (phase === 'complete') {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Trophy size={16} className="text-amber-400" />
          <span className="text-sm font-medium" style={{ color: 'var(--color-text-1)' }}>Session Complete</span>
        </div>
        <SessionResults sessions={sessions} questions={queue} onReset={reset} />
      </Card>
    )
  }

  return (
    <Card className="p-6">
      {phase === 'setup' && (
        <div>
          <div className="flex items-center gap-2 mb-5">
            <Timer size={16} style={{ color: 'var(--color-amber)' }} />
            <h3 className="text-base font-medium" style={{ color: 'var(--color-text-1)' }}>Mock Interview Mode</h3>
          </div>
          <p className="text-sm mb-6" style={{ color: 'var(--color-text-2)' }}>
            Simulate a real interview. Read each question, think for up to 15 minutes, then reveal the model answer and grade yourself honestly.
          </p>
          <SetupScreen onStart={startSession} />
        </div>
      )}

      {(phase === 'question' || phase === 'answer') && currentQ && (
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <span className={cn('text-[10px] font-mono font-medium px-2 py-0.5 rounded border',
                DIFFICULTY_STYLES[currentQ.difficulty])}>
                {DIFFICULTY_LABELS[currentQ.difficulty]}
              </span>
              <span className="text-xs font-mono" style={{ color: 'var(--color-text-3)' }}>
                {qIndex + 1} / {queue.length}
              </span>
            </div>
            <TimerDisplay seconds={timeLeft} total={TIME_PER_QUESTION} />
          </div>

          {/* Question */}
          <div className="mb-6 p-4 rounded-xl"
            style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
            <p className="text-base leading-relaxed font-medium" style={{ color: 'var(--color-text-1)' }}>
              {currentQ.question}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {currentQ.companies.map(c => (
                <span key={c} className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                  style={{ color: 'var(--color-text-3)', background: 'var(--color-surface-3)' }}>
                  {c}
                </span>
              ))}
              <span className="text-[10px] font-mono flex items-center gap-1 px-1.5 py-0.5 rounded"
                style={{ color: 'var(--color-text-3)', background: 'var(--color-surface-3)' }}>
                <Clock size={9} /> {currentQ.estimatedTime}min suggested
              </span>
            </div>
          </div>

          {/* Thinking space hint */}
          {phase === 'question' && (
            <div className="mb-5 px-4 py-3 rounded-xl border-l-2"
              style={{ background: 'rgba(34,211,238,0.05)', borderLeftColor: 'var(--color-cyan)' }}>
              <p className="text-xs" style={{ color: 'var(--color-text-3)' }}>
                Think through your answer. Consider: key points, intuition, formula, real example. When ready, reveal the model answer.
              </p>
            </div>
          )}

          {/* Reveal button or self-grade */}
          {phase === 'question' && (
            <button
              onClick={revealAnswer}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all hover:-translate-y-0.5"
              style={{ background: 'var(--color-amber)', color: '#080808' }}
            >
              Reveal model answer <ChevronRight size={14} />
            </button>
          )}

          {/* Answer + self grade */}
          {phase === 'answer' && showAnswer && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-5 p-4 rounded-xl border"
                  style={{ background: 'var(--color-surface-1)', borderColor: 'var(--color-border)' }}>
                  <div className="text-[10px] font-mono uppercase tracking-widest mb-2"
                    style={{ color: 'var(--color-amber)' }}>Model answer</div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--color-text-2)' }}>
                    {currentQ.answer}
                  </p>
                  {currentQ.keyPoints.length > 0 && (
                    <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                      <div className="text-[10px] font-mono uppercase tracking-widest mb-2"
                        style={{ color: 'var(--color-text-3)' }}>Key points</div>
                      <ul className="space-y-1">
                        {currentQ.keyPoints.map((p, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--color-text-2)' }}>
                            <span className="text-emerald-400 mt-0.5 flex-shrink-0">✓</span>{p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <SelfGradePanel onGrade={handleGrade} />
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      )}
    </Card>
  )
}