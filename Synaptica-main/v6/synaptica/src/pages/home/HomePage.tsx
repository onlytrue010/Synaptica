import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { ArrowRight, Zap, BookOpen, BarChart3, Code2, Brain, Trophy } from 'lucide-react'
import { Reveal, SectionLabel, SectionTitle } from '@components/ui/index'
import AlgorithmCard from '@components/algorithm/AlgorithmCard'
import { algorithms } from '@data/algorithms'
import { APP_NAME, APP_TAGLINE } from '@constants/index'

const MARQUEE_ITEMS = [
  '01 Linear Regression', '02 Random Forest', '03 XGBoost', '04 Transformers',
  '05 SVM', '06 K-Means', '07 DBSCAN', '08 LSTM', '09 GANs', '10 Diffusion Models',
  '11 PPO', '12 RLHF', '13 BERT', '14 Autoencoders', '15 PCA', '16 MAML',
  '17 SimCLR', '18 LightGBM', '19 VAE', '20 DQN',
]

const STATS = [
  { value: '68+',  label: 'Algorithms' },
  { value: '12',   label: 'Modules' },
  { value: '1000+',label: 'Interview Q&A' },
  { value: '74yrs',label: 'ML History' },
  { value: '200+', label: 'Visualizations' },
]

const FEATURES = [
  { icon: BarChart3, title: '7-Dimension Ratings',      desc: 'Every algorithm rated on accuracy, speed, scalability, interpretability, robustness, ease of use, and data efficiency.', color: 'amber',   path: '/algorithms'  },
  { icon: Brain,     title: 'Interactive Visualizations',desc: '68+ live, tweakable visualizations. Drag data points, tune parameters, watch models react in real-time.',              color: 'cyan',    path: '/lab'         },
  { icon: Trophy,    title: '1000+ Interview Q&A',       desc: 'Conceptual, coding, tricky, system design — tagged by company (Google, Meta, Amazon) and difficulty.',                  color: 'emerald', path: '/interview'   },
  { icon: BookOpen,  title: 'Structured Learning Paths', desc: 'Four paths from Beginner to Expert. XP system, streaks, and bookmarks track your progress.',                            color: 'rose',    path: '/learning'    },
  { icon: Zap,       title: 'Algorithm Compare Tool',    desc: 'Side-by-side radar chart comparison of up to 4 algorithms across all 7 performance dimensions.',                        color: 'amber',   path: '/compare'     },
  { icon: Code2,     title: 'Cheat Sheets & Formulas',  desc: 'Quick-reference cards, 35 KaTeX formulas, and 60+ glossary terms — everything you need in one place.',                 color: 'purple',  path: '/cheatsheets' },
  { icon: BarChart3, title: 'Real-World Case Studies',  desc: '12 production ML deployments — Netflix, Google, Stripe, DeepMind. Real algorithms, real scale, real lessons.',          color: 'cyan',    path: '/cases'       },
  { icon: Brain,     title: 'Which Algorithm?',         desc: 'Answer 5 questions and get a personalized algorithm recommendation with full rationale.',                                color: 'emerald', path: '/decision'    },
  { icon: BookOpen,  title: 'Must-Read Papers',         desc: '35 curated papers with TL;DRs — from AlexNet to AlphaFold, Transformer to LoRA.',                                      color: 'rose',    path: '/papers'      },
]

const COLOR_MAP: Record<string, string> = {
  amber:   'text-amber-400 bg-amber-500/10',
  cyan:    'text-cyan-400 bg-cyan-500/10',
  emerald: 'text-emerald-400 bg-emerald-500/10',
  purple:  'text-purple-400 bg-purple-500/10',
  rose:    'text-rose-400 bg-rose-500/10',
}

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <>
      <Helmet>
        <title>{APP_NAME} — {APP_TAGLINE}</title>
        <meta name="description" content="The most complete ML reference. 68+ algorithms with interactive visualizations, 1000+ interview Q&A, and structured learning paths." />
      </Helmet>

      {/* ── HERO ──────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pb-20 overflow-hidden">

        {/* Grid overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black, transparent)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black, transparent)',
        }} />

        {/* Amber glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] rounded-full pointer-events-none z-0 animate-glow-pulse"
          style={{ background: 'radial-gradient(ellipse, var(--color-amber-dim) 0%, transparent 70%)' }} />

        {/* Cyan glow */}
        <div className="absolute top-2/3 left-1/3 w-[350px] h-[280px] rounded-full pointer-events-none z-0"
          style={{ background: 'radial-gradient(ellipse, rgba(34,211,238,0.08) 0%, transparent 70%)' }} />

        <div className="relative z-10 max-w-4xl mx-auto">

          {/* Eyebrow pill */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full border text-xs font-mono tracking-widest uppercase"
            style={{ color: 'var(--color-cyan)', background: 'var(--color-cyan-dim)', borderColor: 'rgba(34,211,238,0.2)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            v1.0 · 68 Algorithms · 1000+ Q&A · Interactive
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif font-normal tracking-tight leading-tight mb-5"
            style={{
              fontSize: 'clamp(40px, 7vw, 76px)',
              color: 'var(--color-text-1)',
              letterSpacing: '-2px',
            }}
          >
            The{' '}
            <em style={{ color: 'var(--color-amber)', fontStyle: 'italic' }}>Definitive</em>
            {' '}Guide to<br />
            <strong style={{ fontWeight: 700 }}>Machine Learning</strong>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg leading-relaxed mb-10 mx-auto max-w-xl"
            style={{ color: 'var(--color-text-2)' }}
          >
            Every algorithm. Every technique. Every interview question.
            Complete interactive visualizations — from perceptrons to transformers.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            <button
              onClick={() => navigate('/algorithms')}
              className="flex items-center gap-2 px-7 py-3 rounded-lg font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: 'var(--color-amber)',
                color: '#080808',
                boxShadow: '0 4px 24px rgba(245,158,11,0.25)',
              }}
            >
              Explore Algorithms <ArrowRight size={15} />
            </button>
            <button
              onClick={() => navigate('/interview')}
              className="flex items-center gap-2 px-7 py-3 rounded-lg font-medium text-sm border transition-all duration-200 hover:-translate-y-0.5"
              style={{
                color: 'var(--color-text-1)',
                borderColor: 'var(--color-border-2)',
                background: 'transparent',
              }}
            >
              Interview Prep
            </button>
          </motion.div>
        </div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
        >
          <div className="w-5 h-8 rounded-full border flex justify-center pt-1.5" style={{ borderColor: 'var(--color-border-3)' }}>
            <div className="w-0.5 h-2 rounded-full bg-amber-400 animate-bounce" />
          </div>
          <span className="text-[10px] font-mono tracking-widest uppercase" style={{ color: 'var(--color-text-3)' }}>
            Scroll
          </span>
        </motion.div>
      </section>

      {/* ── MARQUEE STRIP ─────────────────────────────── */}
      <div className="overflow-hidden border-y py-3" style={{ background: 'var(--color-surface-1)', borderColor: 'var(--color-border)' }}>
        <div className="flex gap-4 animate-marquee whitespace-nowrap" style={{ width: 'max-content' }}>
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span
              key={i}
              className="flex-shrink-0 text-xs font-mono px-4 py-1 rounded border"
              style={{ color: 'var(--color-text-2)', borderColor: 'var(--color-border)', background: 'var(--color-surface-2)' }}
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── STATS ROW ──────────────────────────────────── */}
      <div className="border-b" style={{ background: 'var(--color-surface-1)', borderColor: 'var(--color-border)' }}>
        <div className="max-w-[1400px] mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 80}>
              <div
                className="flex flex-col items-center py-6 border-r last:border-r-0 text-center"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <div className="text-3xl font-bold font-mono" style={{ color: 'var(--color-text-1)' }}>
                  <span style={{ color: 'var(--color-amber)' }}>{s.value}</span>
                </div>
                <div className="text-[11px] uppercase tracking-wide mt-1" style={{ color: 'var(--color-text-3)' }}>
                  {s.label}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* ── FEATURED ALGORITHMS ────────────────────────── */}
      <section className="py-20 px-6 sm:px-10 lg:px-16 max-w-[1400px] mx-auto">
        <Reveal>
          <SectionLabel>Algorithm Library</SectionLabel>
        </Reveal>
        <Reveal delay={80}>
          <SectionTitle className="mb-3">
            Every <em style={{ color: 'var(--color-amber)', fontStyle: 'italic' }}>Algorithm</em> — Deep Dives
          </SectionTitle>
        </Reveal>
        <Reveal delay={160}>
          <p className="text-base mb-10 max-w-lg" style={{ color: 'var(--color-text-2)' }}>
            7-dimension ratings, benchmark history, full math derivations, code examples, and interactive visualizations.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {algorithms.slice(0, 6).map((algo, i) => (
            <AlgorithmCard key={algo.id} algo={algo} index={i} />
          ))}
        </div>

        <Reveal>
          <div className="flex justify-center">
            <button
              onClick={() => navigate('/algorithms')}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200 hover:-translate-y-0.5"
              style={{ color: 'var(--color-text-1)', borderColor: 'var(--color-border-2)' }}
            >
              View all 68+ algorithms <ArrowRight size={14} />
            </button>
          </div>
        </Reveal>
      </section>

      {/* ── FEATURES GRID ──────────────────────────────── */}
      <section className="py-20 px-6 sm:px-10 lg:px-16 border-t" style={{ background: 'var(--color-surface-1)', borderColor: 'var(--color-border)' }}>
        <div className="max-w-[1400px] mx-auto">
          <Reveal><SectionLabel>Platform Features</SectionLabel></Reveal>
          <Reveal delay={80}>
            <SectionTitle className="mb-12">
              Built for <em style={{ color: 'var(--color-amber)', fontStyle: 'italic' }}>Mastery</em>
            </SectionTitle>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 60}>
                <div
                  onClick={() => navigate(f.path)}
                  className="p-6 rounded-xl border transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
                  style={{ background: 'var(--color-card-bg)', borderColor: 'var(--color-border)' }}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${COLOR_MAP[f.color]}`}>
                    <f.icon size={18} />
                  </div>
                  <h3 className="text-sm font-medium mb-2 group-hover:text-amber-400 transition-colors" style={{ color: 'var(--color-text-1)' }}>
                    {f.title}
                  </h3>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-3)' }}>
                    {f.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ─────────────────────────────────── */}
      <section className="py-24 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, var(--color-amber-dim) 0%, transparent 70%)' }} />
        <div className="relative max-w-xl mx-auto">
          <Reveal>
            <h2 className="font-serif text-4xl sm:text-5xl font-normal tracking-tight mb-5" style={{ color: 'var(--color-text-1)', letterSpacing: '-1px' }}>
              Start your ML<br /><em style={{ color: 'var(--color-amber)' }}>journey today</em>
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-base mb-8" style={{ color: 'var(--color-text-2)' }}>
              Free forever. No signup required.
            </p>
          </Reveal>
          <Reveal delay={200}>
            <button
              onClick={() => navigate('/algorithms')}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg font-semibold text-sm transition-all duration-200 hover:-translate-y-1"
              style={{ background: 'var(--color-amber)', color: '#080808', boxShadow: '0 4px 24px rgba(245,158,11,0.3)' }}
            >
              Explore All Algorithms <ArrowRight size={15} />
            </button>
          </Reveal>
        </div>
      </section>
    </>
  )
}