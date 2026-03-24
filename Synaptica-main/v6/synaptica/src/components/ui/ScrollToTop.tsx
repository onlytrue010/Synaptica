import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp } from 'lucide-react'

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-200 hover:-translate-y-1"
          style={{
            background: 'var(--color-surface-2)',
            borderColor: 'var(--color-border-2)',
            color: 'var(--color-text-2)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          }}
          aria-label="Scroll to top"
        >
          <ArrowUp size={15} />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
