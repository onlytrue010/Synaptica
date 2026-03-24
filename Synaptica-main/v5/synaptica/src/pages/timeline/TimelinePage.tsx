import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { SectionLabel, SectionTitle, Reveal } from '@components/ui/index'

interface Event {
  year: number
  title: string
  desc: string
  type: 'milestone' | 'algorithm' | 'architecture' | 'paradigm'
  slug?: string
}

const EVENTS: Event[] = [
  { year: 1950, title: 'Turing Test',         desc: 'Alan Turing proposes "Can machines think?" — the foundational question of AI.',    type: 'milestone' },
  { year: 1957, title: 'Perceptron',           desc: 'Frank Rosenblatt invents the perceptron, the first trainable neural network.',    type: 'algorithm' },
  { year: 1963, title: 'Linear SVM',           desc: 'Vapnik & Chervonenkis develop the original Support Vector Machine.',             type: 'algorithm', slug: 'svm' },
  { year: 1969, title: 'XOR Problem',          desc: 'Minsky & Papert expose limitations of single-layer perceptrons.',                type: 'milestone' },
  { year: 1974, title: 'Backpropagation',      desc: 'Werbos derives backprop in his PhD thesis — the engine of all neural nets.',     type: 'milestone' },
  { year: 1986, title: 'Backprop Popularized', desc: 'Rumelhart, Hinton & Williams popularize backpropagation with MLPs.',             type: 'milestone' },
  { year: 1989, title: 'Convolutional Nets',   desc: 'LeCun trains first practical CNN for digit recognition.',                        type: 'architecture' },
  { year: 1995, title: 'Kernel SVM',           desc: 'Boser, Guyon & Vapnik introduce the kernel trick for non-linear SVMs.',         type: 'algorithm', slug: 'svm' },
  { year: 1997, title: 'LSTM',                 desc: 'Hochreiter & Schmidhuber solve the vanishing gradient with Long Short-Term Memory.', type: 'architecture' },
  { year: 2001, title: 'Random Forest',        desc: 'Leo Breiman combines bagging + feature randomness — still a Kaggle staple.',     type: 'algorithm', slug: 'random-forest' },
  { year: 2006, title: 'Deep Belief Nets',     desc: 'Hinton revives neural networks with layer-wise pre-training.',                   type: 'milestone' },
  { year: 2012, title: 'AlexNet',              desc: 'Deep CNN wins ImageNet by 10% — kicks off the deep learning revolution.',        type: 'milestone' },
  { year: 2013, title: 'Word2Vec',             desc: 'Mikolov creates dense word embeddings — NLP is transformed.',                    type: 'architecture' },
  { year: 2014, title: 'GANs',                 desc: 'Goodfellow invents Generative Adversarial Networks — generator vs discriminator.', type: 'architecture' },
  { year: 2015, title: 'ResNet',               desc: 'He et al. solve deep network training with residual connections (152 layers).',  type: 'architecture' },
  { year: 2016, title: 'XGBoost',              desc: 'Chen & Guestrin release XGBoost — wins most Kaggle structured-data competitions.', type: 'algorithm', slug: 'xgboost' },
  { year: 2017, title: 'Transformer',          desc: '"Attention Is All You Need" — Vaswani et al. replace RNNs entirely.',            type: 'architecture', slug: 'transformer' },
  { year: 2018, title: 'BERT & GPT',           desc: 'Pre-trained language models with fine-tuning redefine NLP benchmarks.',         type: 'paradigm' },
  { year: 2019, title: 'GPT-2',               desc: 'OpenAI releases GPT-2 — too dangerous to release, then does anyway.',            type: 'paradigm' },
  { year: 2020, title: 'GPT-3',               desc: '175B parameter model shows emergent few-shot learning capabilities.',            type: 'paradigm' },
  { year: 2021, title: 'CLIP & DALL-E',        desc: 'Contrastive vision-language models bridge text and images.',                     type: 'architecture' },
  { year: 2022, title: 'ChatGPT / RLHF',       desc: 'Instruction-tuned models with human feedback — AI reaches mass adoption.',      type: 'milestone', slug: 'transformer' },
  { year: 2023, title: 'LLaMA & Mistral',      desc: 'Open-source models match closed models — democratizing LLM research.',         type: 'paradigm' },
  { year: 2024, title: 'Reasoning Models',     desc: 'o1/o3 scale test-time compute — models think before they answer.',              type: 'milestone' },
]

const TYPE_COLORS: Record<string, { dot: string; label: string }> = {
  milestone:    { dot: '#f59e0b', label: 'Milestone'    },
  algorithm:    { dot: '#22d3ee', label: 'Algorithm'    },
  architecture: { dot: '#10b981', label: 'Architecture' },
  paradigm:     { dot: '#c084fc', label: 'Paradigm'     },
}

export default function TimelinePage() {
  const [active, setActive] = useState<Event | null>(null)
  const navigate = useNavigate()

  return (
    <>
      <Helmet>
        <title>ML Timeline — Synaptica</title>
        <meta name="description" content="The complete history of machine learning from 1950 to 2024." />
      </Helmet>

      {/* Header */}
      <div className="border-b py-14 px-6 sm:px-10 lg:px-16" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-1)' }}>
        <div className="max-w-[1400px] mx-auto">
          <Reveal><SectionLabel>ML History</SectionLabel></Reveal>
          <Reveal delay={80}>
            <SectionTitle>
              1950 <em style={{ color: 'var(--color-amber)', fontStyle: 'italic' }}>→</em> 2024
            </SectionTitle>
          </Reveal>
          <Reveal delay={160}>
            <p className="text-base mt-3 max-w-lg" style={{ color: 'var(--color-text-2)' }}>
              74 years of breakthroughs. Every milestone, algorithm, and paradigm shift that shaped modern AI.
            </p>
          </Reveal>
          {/* Legend */}
          <Reveal delay={220}>
            <div className="flex flex-wrap gap-4 mt-5">
              {Object.entries(TYPE_COLORS).map(([type, val]) => (
                <div key={type} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-text-2)' }}>
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: val.dot }} />
                  {val.label}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>

      {/* Timeline area */}
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 py-14">

        {/* Detail panel */}
        {active && (
          <div
            className="mb-10 p-5 rounded-xl border"
            style={{ background: 'var(--color-surface-2)', borderColor: 'rgba(245,158,11,0.3)' }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono" style={{ color: 'var(--color-amber)' }}>{active.year}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded border font-mono" style={{ color: TYPE_COLORS[active.type].dot, borderColor: `${TYPE_COLORS[active.type].dot}44` }}>
                    {active.type}
                  </span>
                </div>
                <h3 className="text-lg font-medium mb-1" style={{ color: 'var(--color-text-1)' }}>{active.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-2)' }}>{active.desc}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {active.slug && (
                  <button
                    onClick={() => navigate(`/algorithms/${active.slug}`)}
                    className="text-xs px-3 py-1.5 rounded-lg border transition-all hover:bg-amber-500/10"
                    style={{ color: 'var(--color-amber)', borderColor: 'rgba(245,158,11,0.3)' }}
                  >
                    Deep Dive →
                  </button>
                )}
                <button onClick={() => setActive(null)} className="text-xs px-2 py-1.5 rounded-lg border" style={{ color: 'var(--color-text-3)', borderColor: 'var(--color-border)' }}>
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Horizontal scroll timeline */}
        <div className="relative">
          {/* Track line */}
          <div
            className="absolute top-[22px] left-0 right-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent, var(--color-border-2) 5%, var(--color-border-2) 95%, transparent)` }}
          />
          {/* Fill line */}
          <div
            className="absolute top-[22px] left-0 h-px transition-all duration-700"
            style={{ background: `linear-gradient(90deg, var(--color-amber), var(--color-cyan))`, width: '100%' }}
          />

          <div className="flex overflow-x-auto pb-4 gap-0" style={{ scrollbarWidth: 'thin' }}>
            {EVENTS.map((ev) => {
              const color = TYPE_COLORS[ev.type].dot
              const isActive = active?.year === ev.year
              return (
                <div
                  key={ev.year}
                  className="flex-shrink-0 w-[100px] sm:w-[110px] text-center cursor-pointer group"
                  style={{ paddingTop: '44px' }}
                  onClick={() => setActive(isActive ? null : ev)}
                >
                  <div
                    className="relative mx-auto mb-3 transition-all duration-200"
                    style={{
                      width: isActive ? 16 : 12,
                      height: isActive ? 16 : 12,
                      borderRadius: '50%',
                      background: color,
                      boxShadow: isActive ? `0 0 16px ${color}88` : 'none',
                      marginTop: isActive ? -46 : -44,
                    }}
                  />
                  <div className="text-[10px] font-mono mb-1 transition-colors group-hover:text-amber-400"
                    style={{ color: isActive ? 'var(--color-amber)' : 'var(--color-text-3)' }}>
                    {ev.year}
                  </div>
                  <div className="text-[10px] leading-tight px-1 transition-colors group-hover:text-amber-400"
                    style={{ color: isActive ? color : 'var(--color-text-2)' }}>
                    {ev.title}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Cards grid below */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {EVENTS.map((ev, i) => (
            <Reveal key={ev.year} delay={i * 30}>
              <div
                className="p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-500/30"
                style={{ background: 'var(--color-card-bg)', borderColor: 'var(--color-border)' }}
                onClick={() => setActive(ev)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: TYPE_COLORS[ev.type].dot }} />
                  <span className="text-[10px] font-mono" style={{ color: 'var(--color-text-3)' }}>{ev.year}</span>
                </div>
                <h4 className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-1)' }}>{ev.title}</h4>
                <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--color-text-3)' }}>{ev.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </>
  )
}
