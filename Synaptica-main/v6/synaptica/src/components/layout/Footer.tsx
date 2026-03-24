import { useNavigate } from 'react-router-dom'
import { APP_NAME } from '@constants/index'

const FOOTER_LINKS = {
  Platform: [
    { label: 'Algorithms',        path: '/algorithms'  },
    { label: 'Compare Tool',      path: '/compare'     },
    { label: 'Interview Prep',    path: '/interview'   },
    { label: 'Live Lab',          path: '/lab'         },
    { label: 'Learning Paths',    path: '/learning'    },
  ],
  Reference: [
    { label: 'Cheat Sheets',      path: '/cheatsheets' },
    { label: 'Formula Sheet',     path: '/formulas'    },
    { label: 'Glossary',          path: '/glossary'    },
    { label: 'Must-Read Papers',  path: '/papers'      },
    { label: 'Case Studies',      path: '/cases'       },
  ],
  Tools: [
    { label: 'Which Algorithm?',  path: '/decision'    },
    { label: 'ML Timeline',       path: '/timeline'    },
    { label: 'Data Matrix',       path: '/data-matrix' },
    { label: 'Performance Guide', path: '/performance' },
  ],
  Community: [
    { label: 'GitHub',   path: 'https://github.com' },
    { label: 'Discord',  path: '#' },
    { label: 'Twitter',  path: '#' },
    { label: 'Feedback', path: '#' },
  ],
}

export default function Footer() {
  const navigate = useNavigate()
  const year = new Date().getFullYear()

  return (
    <footer
      className="relative z-10 border-t"
      style={{
        background: 'var(--color-surface-1)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="max-w-[1400px] mx-auto px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <svg width="24" height="24" viewBox="0 0 26 26" fill="none">
                <polygon points="13,1.5 23.5,7.25 23.5,18.75 13,24.5 2.5,18.75 2.5,7.25"
                  stroke="var(--color-amber)" strokeWidth="1.5" fill="rgba(245,158,11,0.08)" />
                <circle cx="13" cy="13" r="3" fill="var(--color-amber)" />
              </svg>
              <span className="text-[16px] font-semibold" style={{ color: 'var(--color-text-1)' }}>
                <span style={{ color: 'var(--color-amber)' }}>S</span>ynaptica
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--color-text-3)' }}>
              The most complete machine learning reference. Every algorithm. Every technique. Every interview question.
            </p>
            <div className="flex gap-2">
              {['68+ Algos', '1000+ Q&A', 'Interactive'].map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-mono px-2 py-0.5 rounded border"
                  style={{
                    color: 'var(--color-cyan)',
                    borderColor: 'rgba(34,211,238,0.2)',
                    background: 'var(--color-cyan-dim)',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <h4
                className="text-[11px] font-medium tracking-widest uppercase mb-4"
                style={{ color: 'var(--color-text-3)' }}
              >
                {section}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() =>
                        link.path.startsWith('http')
                          ? window.open(link.path, '_blank')
                          : navigate(link.path)
                      }
                      className="text-sm transition-colors duration-200 hover:text-amber-400 text-left"
                      style={{ color: 'var(--color-text-3)' }}
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-8 border-t"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <p className="text-xs font-mono" style={{ color: 'var(--color-text-3)' }}>
            © {year} {APP_NAME} — Built for the ML community
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono" style={{ color: 'var(--color-amber)' }}>
              Amber + Cyan Edition
            </span>
            <span className="text-xs" style={{ color: 'var(--color-text-3)' }}>
              Dark &amp; Light · Mobile Ready
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}