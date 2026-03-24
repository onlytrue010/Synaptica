import { motion } from 'framer-motion'

export default function PageLoader() {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8"
      style={{ background: 'var(--color-bg)' }}
    >
      {/* Spinning hex logo */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        style={{ width: 72, height: 72 }}
      >
        <svg viewBox="0 0 72 72" fill="none" width="72" height="72">
          <polygon
            points="36,3 65,19.5 65,52.5 36,69 7,52.5 7,19.5"
            stroke="var(--color-amber)"
            strokeWidth="1.5"
            fill="rgba(245,158,11,0.06)"
          />
          <polygon
            points="36,16 54,26 54,46 36,56 18,46 18,26"
            stroke="rgba(34,211,238,0.35)"
            strokeWidth="1"
            fill="none"
          />
          <circle cx="36" cy="36" r="6" fill="rgba(245,158,11,0.15)" stroke="var(--color-amber)" strokeWidth="1.5" />
          <circle cx="36" cy="36" r="2.5" fill="var(--color-amber)" />
        </svg>
      </motion.div>

      {/* Progress bar */}
      <div
        className="w-48 h-0.5 rounded-full overflow-hidden"
        style={{ background: 'var(--color-border-2)' }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, var(--color-amber), var(--color-cyan))' }}
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
        />
      </div>

      <motion.p
        className="text-xs font-mono tracking-widest uppercase"
        style={{ color: 'var(--color-text-3)' }}
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        Loading...
      </motion.p>
    </div>
  )
}
