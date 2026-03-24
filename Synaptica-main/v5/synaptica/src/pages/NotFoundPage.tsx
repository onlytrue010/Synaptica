import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowLeft } from 'lucide-react'

export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <>
      <Helmet><title>404 — Synaptica</title></Helmet>
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6">
        <div className="font-mono text-8xl font-bold mb-4" style={{ color: 'var(--color-border-2)' }}>404</div>
        <h1 className="font-serif text-3xl font-normal mb-3" style={{ color: 'var(--color-text-1)' }}>
          Page not found
        </h1>
        <p className="text-sm mb-8 max-w-sm" style={{ color: 'var(--color-text-3)' }}>
          This algorithm hasn't been discovered yet. Try heading back to the library.
        </p>
        <button onClick={() => navigate('/')} className="flex items-center gap-2 btn-primary text-sm px-5 py-2.5"
          style={{ background: 'var(--color-amber)', color: '#080808' }}>
          <ArrowLeft size={14} /> Back to home
        </button>
      </div>
    </>
  )
}
