import { Outlet, useLocation } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import StarsCanvas from '@components/ui/StarsCanvas'
import ScrollToTop from '@components/ui/ScrollToTop'

export default function RootLayout() {
  const location = useLocation()
  const mainRef = useRef<HTMLDivElement>(null)

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [location.pathname])

  return (
    <div className="relative min-h-screen flex flex-col" style={{ background: 'var(--color-bg)' }}>
      {/* Animated star background — fixed, behind everything */}
      <StarsCanvas />

      {/* Fixed navigation */}
      <Navbar />

      {/* Page content */}
      <main ref={mainRef} className="flex-1 relative z-10">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />

      {/* Scroll to top button */}
      <ScrollToTop />
    </div>
  )
}
