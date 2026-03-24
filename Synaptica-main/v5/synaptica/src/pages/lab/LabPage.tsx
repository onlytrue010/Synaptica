import { useEffect, useRef, useState, useCallback } from 'react'
import { Helmet } from 'react-helmet-async'
import { SectionLabel, SectionTitle, Reveal } from '@components/ui/index'

/* ──────────────────────────────────────────────────
   K-MEANS CANVAS EXPERIMENT
────────────────────────────────────────────────── */
const COLORS = ['#f59e0b','#22d3ee','#10b981','#f43f5e','#c084fc','#fb923c','#34d399']

interface Point { x: number; y: number }
interface Centroid { x: number; y: number }

function KMeansLab() {
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const stateRef   = useRef({ pts: [] as Point[], centroids: [] as Centroid[], assignments: [] as number[], iter: 0, converged: false })
  const animRef    = useRef<ReturnType<typeof setInterval> | null>(null)
  const [k, setK]              = useState(3)
  const [n, setN]              = useState(80)
  const [iter, setIter]        = useState(0)
  const [converged, setConverged] = useState(false)
  const [running, setRunning]  = useState(false)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const { pts, centroids, assignments } = stateRef.current
    const W = canvas.width, H = canvas.height
    ctx.clearRect(0, 0, W, H)

    // Background
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light'
    ctx.fillStyle = isDark ? '#0d0f15' : '#f8f7f4'
    ctx.fillRect(0, 0, W, H)

    // Points
    pts.forEach((p, i) => {
      const c = COLORS[assignments[i] % COLORS.length] ?? '#888'
      ctx.beginPath(); ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2)
      ctx.fillStyle = c + '99'; ctx.fill()
      ctx.strokeStyle = c; ctx.lineWidth = 1; ctx.stroke()
    })

    // Centroids (triangles)
    centroids.forEach((c, ci) => {
      const col = COLORS[ci % COLORS.length]
      const s = 11
      ctx.beginPath()
      ctx.moveTo(c.x, c.y - s); ctx.lineTo(c.x + s * 0.866, c.y + s * 0.5); ctx.lineTo(c.x - s * 0.866, c.y + s * 0.5)
      ctx.closePath()
      ctx.fillStyle = col; ctx.fill()
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke()
      ctx.fillStyle = '#fff'; ctx.font = 'bold 8px sans-serif'
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(String(ci + 1), c.x, c.y + 1)
    })
  }, [])

  const reset = useCallback((newK = k, newN = n) => {
    if (animRef.current) { clearInterval(animRef.current); animRef.current = null; setRunning(false) }
    const canvas = canvasRef.current
    if (!canvas) return
    const W = canvas.width, H = canvas.height
    const pts: Point[] = Array.from({ length: newN }, () => ({
      x: 40 + Math.random() * (W - 80), y: 30 + Math.random() * (H - 60),
    }))
    const centroids: Centroid[] = Array.from({ length: newK }, () => ({
      x: 40 + Math.random() * (W - 80), y: 30 + Math.random() * (H - 60),
    }))
    stateRef.current = { pts, centroids, assignments: new Array(newN).fill(0), iter: 0, converged: false }
    setIter(0); setConverged(false)
    draw()
  }, [k, n, draw])

  const step = useCallback(() => {
    const s = stateRef.current
    if (s.converged) return
    // Assign
    let changed = false
    s.assignments = s.pts.map((p, i) => {
      let best = 0, bd = Infinity
      s.centroids.forEach((c, ci) => {
        const d = (p.x - c.x) ** 2 + (p.y - c.y) ** 2
        if (d < bd) { bd = d; best = ci }
      })
      if (best !== s.assignments[i]) changed = true
      return best
    })
    // Move centroids
    s.centroids = s.centroids.map((_, ci) => {
      const members = s.pts.filter((_, i) => s.assignments[i] === ci)
      if (!members.length) return s.centroids[ci]
      return { x: members.reduce((a, p) => a + p.x, 0) / members.length, y: members.reduce((a, p) => a + p.y, 0) / members.length }
    })
    s.iter++
    if (!changed) s.converged = true
    setIter(s.iter); setConverged(s.converged)
    draw()
    if (s.converged && animRef.current) { clearInterval(animRef.current); animRef.current = null; setRunning(false) }
  }, [draw])

  const toggleAuto = useCallback(() => {
    if (animRef.current) { clearInterval(animRef.current); animRef.current = null; setRunning(false) }
    else { setRunning(true); animRef.current = setInterval(step, 550) }
  }, [step])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ro = new ResizeObserver(() => {
      canvas.width = canvas.offsetWidth
      canvas.height = 320
      reset(k, n)
    })
    ro.observe(canvas)
    return () => { ro.disconnect(); if (animRef.current) clearInterval(animRef.current) }
  }, [])

  useEffect(() => { reset(k, n) }, [k, n])

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    stateRef.current.pts.push({ x: e.clientX - r.left, y: e.clientY - r.top })
    draw()
  }

  return (
    <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--color-card-bg)', borderColor: 'var(--color-border)' }}>
      <div className="px-5 pt-5 pb-3">
        <div className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-1)' }}>K-Means Clustering</div>
        <div className="text-xs mb-4" style={{ color: 'var(--color-text-3)' }}>Adjust K and points, then step through or auto-run. Click canvas to add points.</div>

        <div className="flex flex-wrap gap-5 mb-4 items-center">
          <label className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-2)' }}>
            K = <input type="range" min={2} max={7} value={k} step={1} onChange={(e) => setK(+e.target.value)} style={{ width: 80 }} />
            <span className="font-mono w-4" style={{ color: 'var(--color-amber)' }}>{k}</span>
          </label>
          <label className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-2)' }}>
            Points = <input type="range" min={20} max={200} value={n} step={10} onChange={(e) => setN(+e.target.value)} style={{ width: 80 }} />
            <span className="font-mono w-6" style={{ color: 'var(--color-amber)' }}>{n}</span>
          </label>
        </div>
      </div>

      <canvas ref={canvasRef} onClick={handleCanvasClick} style={{ width: '100%', height: 320, cursor: 'crosshair', display: 'block' }} />

      <div className="px-5 py-4 border-t flex items-center gap-3 flex-wrap" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex gap-2">
          <button onClick={() => reset(k, n)} className="text-xs px-3 py-1.5 rounded-lg border transition-colors hover:bg-[var(--color-surface-2)]"
            style={{ borderColor: 'var(--color-border-2)', color: 'var(--color-text-2)' }}>New data</button>
          <button onClick={step} disabled={converged} className="text-xs px-3 py-1.5 rounded-lg border transition-colors hover:bg-[var(--color-surface-2)]"
            style={{ borderColor: 'var(--color-border-2)', color: 'var(--color-text-2)' }}>Step once</button>
          <button onClick={toggleAuto}
            className="text-xs px-4 py-1.5 rounded-lg font-medium transition-all"
            style={{ background: running ? 'rgba(244,63,94,0.15)' : 'var(--color-amber)', color: running ? '#f43f5e' : '#080808' }}>
            {running ? 'Stop' : 'Auto run'}
          </button>
        </div>
        <div className="flex gap-4 ml-auto text-xs font-mono" style={{ color: 'var(--color-text-3)' }}>
          <span>Iter: <span style={{ color: 'var(--color-amber)' }}>{iter}</span></span>
          <span>Status: <span style={{ color: converged ? '#10b981' : 'var(--color-cyan)' }}>{converged ? 'Converged' : 'Running'}</span></span>
        </div>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────────
   GRADIENT DESCENT EXPERIMENT
────────────────────────────────────────────────── */
function GradientDescentLab() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [lr, setLr]           = useState(0.1)
  const [steps, setSteps]     = useState(0)
  const [loss, setLoss]       = useState<number | null>(null)
  const posRef = useRef({ x: 0.8, y: 0.8 })

  const drawSurface = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const W = canvas.width, H = canvas.height
    ctx.clearRect(0, 0, W, H)
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light'
    ctx.fillStyle = isDark ? '#0d0f15' : '#f8f7f4'
    ctx.fillRect(0, 0, W, H)

    // Draw loss landscape as contour-like colour bands
    const imageData = ctx.createImageData(W, H)
    for (let px = 0; px < W; px++) {
      for (let py = 0; py < H; py++) {
        const nx = px / W * 4 - 2
        const ny = py / H * 4 - 2
        const z = nx * nx * 0.8 + ny * ny * 1.4 + Math.sin(nx * 3) * 0.4 + Math.cos(ny * 2.5) * 0.3
        const t = Math.min(z / 6, 1)
        const idx = (py * W + px) * 4
        if (isDark) {
          imageData.data[idx]   = Math.round(15  + t * 30)
          imageData.data[idx+1] = Math.round(15  + t * 25)
          imageData.data[idx+2] = Math.round(t < 0.3 ? 60 + t * 120 : 20 + t * 40)
          imageData.data[idx+3] = 255
        } else {
          imageData.data[idx]   = Math.round(220 - t * 60)
          imageData.data[idx+1] = Math.round(220 - t * 80)
          imageData.data[idx+2] = Math.round(240 - t * 40)
          imageData.data[idx+3] = 255
        }
      }
    }
    ctx.putImageData(imageData, 0, 0)

    // Draw ball
    const bx = (posRef.current.x / 4 + 0.5) * W
    const by = (posRef.current.y / 4 + 0.5) * H
    ctx.beginPath(); ctx.arc(bx, by, 8, 0, Math.PI * 2)
    ctx.fillStyle = '#f59e0b'; ctx.fill()
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke()

    // Minimum marker
    const mx = 0.5 * W, my = 0.5 * H
    ctx.beginPath(); ctx.arc(mx, my, 5, 0, Math.PI * 2)
    ctx.fillStyle = '#10b981'; ctx.fill()
  }, [])

  const gradientStep = useCallback(() => {
    const p = posRef.current
    const gx = 2 * 0.8 * p.x + Math.cos(p.x * 3) * 3 * 0.4
    const gy = 2 * 1.4 * p.y - Math.sin(p.y * 2.5) * 2.5 * 0.3
    p.x = p.x - lr * gx
    p.y = p.y - lr * gy
    const z = p.x ** 2 * 0.8 + p.y ** 2 * 1.4 + Math.sin(p.x * 3) * 0.4 + Math.cos(p.y * 2.5) * 0.3
    setLoss(Math.round(z * 1000) / 1000)
    setSteps((s) => s + 1)
    drawSurface()
  }, [lr, drawSurface])

  const resetGD = useCallback(() => {
    posRef.current = { x: 1.6 + (Math.random() - 0.5) * 0.6, y: 1.6 + (Math.random() - 0.5) * 0.6 }
    setSteps(0); setLoss(null)
    drawSurface()
  }, [drawSurface])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ro = new ResizeObserver(() => { canvas.width = canvas.offsetWidth; canvas.height = 280; drawSurface() })
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [])

  useEffect(() => { resetGD() }, [])

  return (
    <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--color-card-bg)', borderColor: 'var(--color-border)' }}>
      <div className="px-5 pt-5 pb-3">
        <div className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-1)' }}>Gradient Descent</div>
        <div className="text-xs mb-4" style={{ color: 'var(--color-text-3)' }}>Amber ball descends the loss surface. Green dot is global minimum. Adjust learning rate.</div>
        <label className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-2)' }}>
          Learning rate <input type="range" min={0.01} max={0.5} value={lr} step={0.01} onChange={(e) => setLr(+e.target.value)} style={{ width: 100 }} />
          <span className="font-mono" style={{ color: 'var(--color-amber)' }}>{lr.toFixed(2)}</span>
        </label>
      </div>
      <canvas ref={canvasRef} style={{ width: '100%', height: 280, display: 'block' }} />
      <div className="px-5 py-4 border-t flex items-center gap-3 flex-wrap" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex gap-2">
          <button onClick={resetGD} className="text-xs px-3 py-1.5 rounded-lg border transition-colors hover:bg-[var(--color-surface-2)]"
            style={{ borderColor: 'var(--color-border-2)', color: 'var(--color-text-2)' }}>Reset</button>
          <button onClick={gradientStep} className="text-xs px-4 py-1.5 rounded-lg font-medium"
            style={{ background: 'var(--color-amber)', color: '#080808' }}>Step</button>
          <button onClick={() => { for (let i = 0; i < 20; i++) gradientStep() }}
            className="text-xs px-3 py-1.5 rounded-lg border transition-colors hover:bg-[var(--color-surface-2)]"
            style={{ borderColor: 'var(--color-border-2)', color: 'var(--color-text-2)' }}>×20 steps</button>
        </div>
        <div className="flex gap-4 ml-auto text-xs font-mono" style={{ color: 'var(--color-text-3)' }}>
          <span>Steps: <span style={{ color: 'var(--color-amber)' }}>{steps}</span></span>
          {loss !== null && <span>Loss: <span style={{ color: 'var(--color-cyan)' }}>{loss}</span></span>}
        </div>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────────
   LAB PAGE
────────────────────────────────────────────────── */
export default function LabPage() {
  return (
    <>
      <Helmet>
        <title>Live Lab — Synaptica</title>
        <meta name="description" content="Interactive ML experiments. Run K-Means, gradient descent, and more directly in your browser." />
      </Helmet>

      <div className="border-b py-14 px-6 sm:px-10 lg:px-16" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-1)' }}>
        <div className="max-w-[1400px] mx-auto">
          <Reveal><SectionLabel>Live Lab</SectionLabel></Reveal>
          <Reveal delay={80}>
            <SectionTitle>
              <em style={{ color: 'var(--color-amber)', fontStyle: 'italic' }}>Interactive</em> ML Experiments
            </SectionTitle>
          </Reveal>
          <Reveal delay={160}>
            <p className="text-base mt-3 max-w-lg" style={{ color: 'var(--color-text-2)' }}>
              No setup required. Run experiments, tweak parameters, and watch algorithms work — directly in your browser.
            </p>
          </Reveal>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Reveal><KMeansLab /></Reveal>
          <Reveal delay={100}><GradientDescentLab /></Reveal>
        </div>
      </div>
    </>
  )
}
