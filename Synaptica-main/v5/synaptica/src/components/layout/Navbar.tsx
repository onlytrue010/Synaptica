import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Sun, Moon, BookMarked, GitCompare, Search, Command } from 'lucide-react'
import { useTheme, useNavScroll, useIsMobile } from '@hooks/index'
import { useCompareStore } from '@store/filterStore'
import { useProgressStore } from '@store/progressStore'
import { useSearchStore } from '@store/searchStore'
import { NAV_LINKS, APP_NAME } from '@constants/index'
import { cn } from '@utils/index'

// Visible nav links (first 5 in desktop bar, rest in mobile)
const PRIMARY_NAV  = NAV_LINKS.slice(0, 5)
const OVERFLOW_NAV = NAV_LINKS.slice(5)

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const scrolled = useNavScroll(50)
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const { openSearch } = useSearchStore()

  const compareCount = useCompareStore((s) => s.algorithms.length)
  const bookmarkCount = useProgressStore((s) => s.bookmarks.length)

  const navStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    background: 'var(--color-nav-bg)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderBottom: '1px solid var(--color-border)',
    transition: 'padding 0.3s ease, box-shadow 0.3s ease',
    padding: scrolled ? '10px 32px' : '14px 32px',
    boxShadow: scrolled ? '0 4px 32px rgba(0,0,0,0.2)' : 'none',
  }

  return (
    <>
      <nav style={navStyle}>
        <div className="flex items-center justify-between max-w-[1400px] mx-auto">

          {/* Logo */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 group"
          >
            <SynapticaLogo />
            <div className="flex items-center gap-2">
              <span
                className="text-[17px] font-semibold tracking-tight"
                style={{ color: 'var(--color-text-1)' }}
              >
                <span style={{ color: 'var(--color-amber)' }}>S</span>
                {APP_NAME.slice(1)}
              </span>
              <span
                className="hidden sm:block text-[9px] font-mono tracking-[1.5px] uppercase px-1.5 py-0.5 rounded-full border"
                style={{
                  color: 'var(--color-cyan)',
                  background: 'var(--color-cyan-dim)',
                  borderColor: 'rgba(34,211,238,0.2)',
                }}
              >
                beta
              </span>
            </div>
          </button>

          {/* Desktop nav links — primary only */}
          {!isMobile && (
            <div className="flex items-center gap-1">
              {PRIMARY_NAV.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    cn(
                      'px-3.5 py-1.5 rounded-md text-[13px] transition-all duration-200 border',
                      isActive
                        ? 'border-amber-500/30'
                        : 'border-transparent hover:border-[var(--color-border)]'
                    )
                  }
                  style={({ isActive }) => ({
                    color: isActive ? 'var(--color-amber)' : 'var(--color-text-2)',
                    background: isActive ? 'var(--color-amber-dim)' : 'transparent',
                  })}
                >
                  {link.label}
                </NavLink>
              ))}
              {/* More dropdown */}
              <div className="relative group">
                <button className="px-3.5 py-1.5 rounded-md text-[13px] border border-transparent hover:border-[var(--color-border)] transition-all"
                  style={{ color: 'var(--color-text-2)' }}>
                  More ▾
                </button>
                <div className="absolute top-full left-0 mt-1 w-44 rounded-lg border py-1 z-30 hidden group-hover:block"
                  style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border-2)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
                  {OVERFLOW_NAV.map((link) => (
                    <NavLink key={link.path} to={link.path}
                      className="block px-3.5 py-2 text-xs transition-colors hover:bg-[var(--color-surface-3)]"
                      style={{ color: 'var(--color-text-2)' }}>
                      {link.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Search button */}
            <button
              onClick={openSearch}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs transition-all hover:bg-[var(--color-surface-2)]"
              style={{ borderColor: 'var(--color-border-2)', color: 'var(--color-text-3)' }}
              title="Search (⌘K)"
            >
              <Search size={13} />
              <span>Search</span>
              <kbd className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] border ml-1"
                style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-3)' }}>
                ⌘K
              </kbd>
            </button>

            {/* Search icon only on mobile */}
            <button onClick={openSearch} className="btn-icon sm:hidden" title="Search">
              <Search size={15} />
            </button>

            {/* Compare badge */}
            {compareCount > 0 && (
              <button
                onClick={() => navigate('/compare')}
                className="btn-icon relative"
                title="Compare algorithms"
              >
                <GitCompare size={15} />
                <span
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center"
                  style={{ background: 'var(--color-amber)', color: '#000' }}
                >
                  {compareCount}
                </span>
              </button>
            )}

            {/* Bookmarks badge */}
            {bookmarkCount > 0 && !isMobile && (
              <button className="btn-icon relative" title="Bookmarks">
                <BookMarked size={15} />
                <span
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center"
                  style={{ background: 'var(--color-cyan)', color: '#000' }}
                >
                  {bookmarkCount}
                </span>
              </button>
            )}

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="btn-icon"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark'
                ? <Sun size={15} />
                : <Moon size={15} />
              }
            </button>

            {/* CTA - desktop only */}
            {!isMobile && (
              <button
                onClick={() => navigate('/algorithms')}
                className="btn-primary text-[13px]"
                style={{ background: 'var(--color-amber)', color: '#080808' }}
              >
                Start Learning
              </button>
            )}

            {/* Hamburger - mobile only */}
            {isMobile && (
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="btn-icon"
                aria-label="Toggle menu"
              >
                {menuOpen ? <X size={16} /> : <Menu size={16} />}
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-[58px] left-0 right-0 z-50 border-b"
            style={{
              background: 'var(--color-surface-1)',
              borderColor: 'var(--color-border)',
            }}
          >
            <div className="p-4 flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setMenuOpen(false)}
                  className="px-3.5 py-2.5 rounded-lg text-[14px] transition-colors"
                  style={({ isActive }) => ({
                    color: isActive ? 'var(--color-amber)' : 'var(--color-text-2)',
                    background: isActive ? 'var(--color-amber-dim)' : 'transparent',
                  })}
                >
                  {link.label}
                </NavLink>
              ))}
              <div
                className="mt-3 pt-3 border-t"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <button
                  onClick={() => { navigate('/algorithms'); setMenuOpen(false) }}
                  className="w-full py-2.5 rounded-lg text-[14px] font-semibold"
                  style={{ background: 'var(--color-amber)', color: '#080808' }}
                >
                  Start Learning Free
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer so content doesn't sit under fixed nav */}
      <div style={{ height: scrolled ? 58 : 66 }} />
    </>
  )
}

function SynapticaLogo() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <polygon
        points="13,1.5 23.5,7.25 23.5,18.75 13,24.5 2.5,18.75 2.5,7.25"
        stroke="var(--color-amber)"
        strokeWidth="1.5"
        fill="rgba(245,158,11,0.08)"
      />
      <polygon
        points="13,7 18.5,10 18.5,16 13,19 7.5,16 7.5,10"
        stroke="rgba(34,211,238,0.4)"
        strokeWidth="1"
        fill="none"
      />
      <circle cx="13" cy="13" r="3" fill="var(--color-amber)" />
      <circle cx="13" cy="13" r="1.2" fill="#07080c" />
    </svg>
  )
}
