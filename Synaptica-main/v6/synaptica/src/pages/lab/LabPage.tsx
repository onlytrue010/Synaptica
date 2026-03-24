import { useEffect, useRef, useState, useCallback } from 'react'
import { Helmet } from 'react-helmet-async'
import { SectionLabel, SectionTitle, Reveal } from '@components/ui/index'
import { cn } from '@utils/index'

// ─── SHARED COLORS ───────────────────────────────────────────────
const COLORS = ['#f59e0b','#22d3ee','#10b981','#f43f5e','#c084fc','#fb923c','#34d399']
const isDark = () => document.documentElement.getAttribute('data-theme') !== 'light'
const BG = () => isDark() ? '#0d0f15' : '#f5f4f0'
const GRID = () => isDark() ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)'

// ═══════════════════════════════════════════════════════════════
// 1. K-MEANS CLUSTERING
// ═══════════════════════════════════════════════════════════════
interface Point { x: number; y: number }

function KMeansLab() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const state     = useRef({ pts: [] as Point[], centroids: [] as Point[], assignments: [] as number[], iter: 0, converged: false })
  const animRef   = useRef<ReturnType<typeof setInterval> | null>(null)
  const [k, setK] = useState(3)
  const [n, setN] = useState(80)
  const [iter, setIter] = useState(0)
  const [converged, setConverged] = useState(false)
  const [running, setRunning] = useState(false)

  const draw = useCallback(() => {
    const c = canvasRef.current; if (!c) return
    const ctx = c.getContext('2d')!
    const W = c.width, H = c.height
    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = BG(); ctx.fillRect(0, 0, W, H)
    // grid
    ctx.strokeStyle = GRID(); ctx.lineWidth = 1
    for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() }
    for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }
    const { pts, centroids, assignments } = state.current
    pts.forEach((p, i) => {
      const col = COLORS[assignments[i] % COLORS.length] ?? '#888'
      ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI * 2)
      ctx.fillStyle = col + '80'; ctx.fill()
      ctx.strokeStyle = col; ctx.lineWidth = 1.2; ctx.stroke()
    })
    centroids.forEach((c, ci) => {
      const col = COLORS[ci % COLORS.length]
      const s = 10
      ctx.beginPath()
      ctx.moveTo(c.x, c.y - s); ctx.lineTo(c.x + s * 0.866, c.y + s * 0.5); ctx.lineTo(c.x - s * 0.866, c.y + s * 0.5)
      ctx.closePath()
      ctx.fillStyle = col; ctx.fill()
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke()
      ctx.fillStyle = '#fff'; ctx.font = 'bold 8px monospace'
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(String(ci + 1), c.x, c.y + 1)
    })
  }, [])

  const reset = useCallback((newK = k, newN = n) => {
    if (animRef.current) { clearInterval(animRef.current); animRef.current = null; setRunning(false) }
    const c = canvasRef.current; if (!c) return
    const W = c.width, H = c.height
    // gaussian clusters for visual interest
    const pts: Point[] = []
    const clusterCenters = Array.from({ length: Math.min(newK + 1, 5) }, () => ({
      x: 60 + Math.random() * (W - 120), y: 40 + Math.random() * (H - 80)
    }))
    for (let i = 0; i < newN; i++) {
      const cc = clusterCenters[i % clusterCenters.length]
      pts.push({ x: cc.x + (Math.random() - 0.5) * 90, y: cc.y + (Math.random() - 0.5) * 90 })
    }
    const centroids = Array.from({ length: newK }, () => ({ x: 60 + Math.random() * (W - 120), y: 40 + Math.random() * (H - 80) }))
    state.current = { pts, centroids, assignments: new Array(newN).fill(0), iter: 0, converged: false }
    setIter(0); setConverged(false)
    draw()
  }, [k, n, draw])

  const step = useCallback(() => {
    const s = state.current; if (s.converged) return
    let changed = false
    s.assignments = s.pts.map((p, i) => {
      let best = 0, bd = Infinity
      s.centroids.forEach((c, ci) => { const d = (p.x-c.x)**2+(p.y-c.y)**2; if (d < bd) { bd = d; best = ci } })
      if (best !== s.assignments[i]) changed = true
      return best
    })
    s.centroids = s.centroids.map((_, ci) => {
      const m = s.pts.filter((_, i) => s.assignments[i] === ci)
      if (!m.length) return s.centroids[ci]
      return { x: m.reduce((a, p) => a + p.x, 0) / m.length, y: m.reduce((a, p) => a + p.y, 0) / m.length }
    })
    s.iter++; if (!changed) s.converged = true
    setIter(s.iter); setConverged(s.converged); draw()
    if (s.converged && animRef.current) { clearInterval(animRef.current); animRef.current = null; setRunning(false) }
  }, [draw])

  const toggleAuto = useCallback(() => {
    if (animRef.current) { clearInterval(animRef.current); animRef.current = null; setRunning(false) }
    else { setRunning(true); animRef.current = setInterval(step, 480) }
  }, [step])

  useEffect(() => {
    const c = canvasRef.current; if (!c) return
    const ro = new ResizeObserver(() => { c.width = c.offsetWidth; c.height = 300; reset(k, n) })
    ro.observe(c)
    return () => { ro.disconnect(); if (animRef.current) clearInterval(animRef.current) }
  }, [])
  useEffect(() => { reset(k, n) }, [k, n])

  return (
    <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--color-card-bg)', borderColor: 'var(--color-border)' }}>
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-start justify-between mb-1">
          <div className="text-sm font-medium" style={{ color: 'var(--color-text-1)' }}>K-Means Clustering</div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded" style={{ background: 'var(--color-amber)', color: '#080808' }}>Live</span>
        </div>
        <div className="text-xs mb-4" style={{ color: 'var(--color-text-3)' }}>Iteratively assigns points to nearest centroid (▲) and recomputes cluster centers. Click canvas to add points.</div>
        <div className="flex flex-wrap gap-4 items-center">
          <label className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-2)' }}>
            K (clusters)
            <input type="range" min={2} max={7} value={k} step={1} onChange={(e) => setK(+e.target.value)} style={{ width: 80 }} />
            <span className="font-mono w-4 text-right" style={{ color: 'var(--color-amber)' }}>{k}</span>
          </label>
          <label className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-2)' }}>
            Points
            <input type="range" min={20} max={200} value={n} step={10} onChange={(e) => setN(+e.target.value)} style={{ width: 80 }} />
            <span className="font-mono w-6 text-right" style={{ color: 'var(--color-amber)' }}>{n}</span>
          </label>
        </div>
      </div>
      <canvas ref={canvasRef} onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        state.current.pts.push({ x: e.clientX - r.left, y: e.clientY - r.top })
        draw()
      }} style={{ width: '100%', height: 300, cursor: 'crosshair', display: 'block' }} />
      <div className="px-5 py-3 border-t flex items-center gap-2 flex-wrap" style={{ borderColor: 'var(--color-border)' }}>
        <button onClick={() => reset(k, n)} className="text-xs px-3 py-1.5 rounded-lg border hover:bg-[var(--color-surface-2)] transition-colors" style={{ borderColor: 'var(--color-border-2)', color: 'var(--color-text-2)' }}>Reset</button>
        <button onClick={step} disabled={converged} className="text-xs px-3 py-1.5 rounded-lg border hover:bg-[var(--color-surface-2)] transition-colors disabled:opacity-40" style={{ borderColor: 'var(--color-border-2)', color: 'var(--color-text-2)' }}>Step</button>
        <button onClick={toggleAuto} className="text-xs px-4 py-1.5 rounded-lg font-medium transition-all" style={{ background: running ? 'rgba(244,63,94,0.15)' : 'var(--color-amber)', color: running ? '#f43f5e' : '#080808' }}>
          {running ? '■ Stop' : '▶ Auto'}
        </button>
        <div className="flex gap-4 ml-auto text-xs font-mono" style={{ color: 'var(--color-text-3)' }}>
          <span>Iter: <span style={{ color: 'var(--color-amber)' }}>{iter}</span></span>
          <span style={{ color: converged ? '#10b981' : 'var(--color-cyan)' }}>{converged ? '✓ Converged' : '● Running'}</span>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// 2. GRADIENT DESCENT
// ═══════════════════════════════════════════════════════════════
function GradientDescentLab() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [lr, setLr]       = useState(0.08)
  const [optimizer, setOptimizer] = useState<'sgd' | 'momentum' | 'adam'>('sgd')
  const [steps, setSteps] = useState(0)
  const [loss, setLoss]   = useState<number | null>(null)
  const posRef   = useRef({ x: 1.6, y: 1.5 })
  const velRef   = useRef({ x: 0, y: 0 })       // momentum
  const mRef     = useRef({ x: 0, y: 0 })        // adam 1st moment
  const vRef     = useRef({ x: 0, y: 0 })        // adam 2nd moment
  const stepRef  = useRef(0)
  const pathRef  = useRef<Point[]>([])

  const lossAt = (x: number, y: number) =>
    x*x*0.8 + y*y*1.4 + Math.sin(x*3)*0.4 + Math.cos(y*2.5)*0.3

  const gradAt = (x: number, y: number) => ({
    x: 2*0.8*x + Math.cos(x*3)*3*0.4,
    y: 2*1.4*y - Math.sin(y*2.5)*2.5*0.3,
  })

  const drawSurface = useCallback(() => {
    const c = canvasRef.current; if (!c) return
    const ctx = c.getContext('2d')!
    const W = c.width, H = c.height
    ctx.clearRect(0, 0, W, H)
    const dark = isDark()
    // draw heatmap
    const img = ctx.createImageData(W, H)
    for (let px = 0; px < W; px++) {
      for (let py = 0; py < H; py++) {
        const nx = px / W * 4 - 2, ny = py / H * 4 - 2
        const z = lossAt(nx, ny)
        const t = Math.min(z / 7, 1)
        const idx = (py * W + px) * 4
        img.data[idx]   = Math.round(dark ? 10 + t*35 : 230 - t*80)
        img.data[idx+1] = Math.round(dark ? 12 + t*20 : 225 - t*90)
        img.data[idx+2] = Math.round(dark ? t < 0.3 ? 55 + t*130 : 18 + t*40 : 245 - t*60)
        img.data[idx+3] = 255
      }
    }
    ctx.putImageData(img, 0, 0)
    // draw path
    const path = pathRef.current
    if (path.length > 1) {
      ctx.beginPath()
      ctx.moveTo((path[0].x / 4 + 0.5) * W, (path[0].y / 4 + 0.5) * H)
      path.forEach((p) => ctx.lineTo((p.x / 4 + 0.5) * W, (p.y / 4 + 0.5) * H))
      ctx.strokeStyle = 'rgba(245,158,11,0.5)'; ctx.lineWidth = 1.5; ctx.stroke()
    }
    // minimum
    const mx = 0.5*W, my = 0.5*H
    ctx.beginPath(); ctx.arc(mx, my, 5, 0, Math.PI*2)
    ctx.fillStyle = '#10b981'; ctx.fill()
    // ball
    const bx = (posRef.current.x / 4 + 0.5) * W
    const by = (posRef.current.y / 4 + 0.5) * H
    ctx.beginPath(); ctx.arc(bx, by, 7, 0, Math.PI*2)
    ctx.fillStyle = '#f59e0b'; ctx.fill()
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke()
  }, [])

  const doStep = useCallback(() => {
    const p = posRef.current
    const g = gradAt(p.x, p.y)
    stepRef.current++

    if (optimizer === 'sgd') {
      p.x -= lr * g.x; p.y -= lr * g.y
    } else if (optimizer === 'momentum') {
      const β = 0.9
      velRef.current.x = β * velRef.current.x + lr * g.x
      velRef.current.y = β * velRef.current.y + lr * g.y
      p.x -= velRef.current.x; p.y -= velRef.current.y
    } else { // adam
      const β1 = 0.9, β2 = 0.999, ε = 1e-8, t = stepRef.current
      mRef.current.x = β1*mRef.current.x + (1-β1)*g.x
      mRef.current.y = β1*mRef.current.y + (1-β1)*g.y
      vRef.current.x = β2*vRef.current.x + (1-β2)*g.x**2
      vRef.current.y = β2*vRef.current.y + (1-β2)*g.y**2
      const mhx = mRef.current.x/(1-β1**t), mhy = mRef.current.y/(1-β1**t)
      const vhx = vRef.current.x/(1-β2**t), vhy = vRef.current.y/(1-β2**t)
      p.x -= lr * mhx / (Math.sqrt(vhx) + ε)
      p.y -= lr * mhy / (Math.sqrt(vhy) + ε)
    }
    pathRef.current.push({ x: p.x, y: p.y })
    const z = lossAt(p.x, p.y)
    setLoss(Math.round(z * 1000) / 1000); setSteps(stepRef.current)
    drawSurface()
  }, [lr, optimizer, drawSurface])

  const resetGD = useCallback(() => {
    posRef.current = { x: 1.4 + (Math.random()-0.5)*0.4, y: 1.4 + (Math.random()-0.5)*0.4 }
    velRef.current = { x: 0, y: 0 }; mRef.current = { x: 0, y: 0 }; vRef.current = { x: 0, y: 0 }
    stepRef.current = 0; pathRef.current = [{ ...posRef.current }]
    setSteps(0); setLoss(null); drawSurface()
  }, [drawSurface])

  useEffect(() => {
    const c = canvasRef.current; if (!c) return
    const ro = new ResizeObserver(() => { c.width = c.offsetWidth; c.height = 280; resetGD() })
    ro.observe(c); return () => ro.disconnect()
  }, [])
  useEffect(() => { resetGD() }, [optimizer])

  return (
    <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--color-card-bg)', borderColor: 'var(--color-border)' }}>
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-start justify-between mb-1">
          <div className="text-sm font-medium" style={{ color: 'var(--color-text-1)' }}>Gradient Descent Optimizer</div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded" style={{ background: 'var(--color-cyan)', color: '#080808' }}>Compare</span>
        </div>
        <div className="text-xs mb-4" style={{ color: 'var(--color-text-3)' }}>
          Amber ball descends the loss landscape. Green dot = global min. Compare SGD, Momentum, and Adam.
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex gap-1">
            {(['sgd','momentum','adam'] as const).map((opt) => (
              <button key={opt} onClick={() => setOptimizer(opt)}
                className={cn('px-2.5 py-1 rounded text-[11px] font-mono border transition-all', optimizer === opt ? 'border-amber-500/40 bg-amber-500/10 text-amber-400' : 'border-transparent')}
                style={{ color: optimizer === opt ? undefined : 'var(--color-text-3)' }}>
                {opt.toUpperCase()}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-xs ml-auto" style={{ color: 'var(--color-text-2)' }}>
            LR
            <input type="range" min={0.01} max={0.3} step={0.01} value={lr} onChange={(e) => setLr(+e.target.value)} style={{ width: 80 }} />
            <span className="font-mono" style={{ color: 'var(--color-amber)' }}>{lr.toFixed(2)}</span>
          </label>
        </div>
      </div>
      <canvas ref={canvasRef} style={{ width: '100%', height: 400, display: 'block' }} />
      <div className="px-5 py-3 border-t flex items-center gap-2 flex-wrap" style={{ borderColor: 'var(--color-border)' }}>
        <button onClick={resetGD} className="text-xs px-3 py-1.5 rounded-lg border hover:bg-[var(--color-surface-2)] transition-colors" style={{ borderColor: 'var(--color-border-2)', color: 'var(--color-text-2)' }}>Reset</button>
        <button onClick={doStep} className="text-xs px-4 py-1.5 rounded-lg font-medium" style={{ background: 'var(--color-amber)', color: '#080808' }}>Step</button>
        <button onClick={() => { for (let i = 0; i < 30; i++) doStep() }} className="text-xs px-3 py-1.5 rounded-lg border hover:bg-[var(--color-surface-2)] transition-colors" style={{ borderColor: 'var(--color-border-2)', color: 'var(--color-text-2)' }}>×30</button>
        <div className="flex gap-4 ml-auto text-xs font-mono" style={{ color: 'var(--color-text-3)' }}>
          <span>Steps: <span style={{ color: 'var(--color-amber)' }}>{steps}</span></span>
          {loss !== null && <span>Loss: <span style={{ color: 'var(--color-cyan)' }}>{loss}</span></span>}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// 3. PERCEPTRON / DECISION BOUNDARY
// ═══════════════════════════════════════════════════════════════
function PerceptronLab() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [weights, setWeights] = useState({ w1: 0.5, w2: -0.3, bias: 0.0 })
  const [accuracy, setAccuracy] = useState(0)
  const [trainingMode, setTrainingMode] = useState<0 | 1>(0)
  const ptsRef = useRef<{ x: number; y: number; label: 0 | 1 }[]>([])

  const sigmoid = (z: number) => 1 / (1 + Math.exp(-z))

  const draw = useCallback((w = weights) => {
    const c = canvasRef.current; if (!c) return
    const ctx = c.getContext('2d')!
    const W = c.width, H = c.height
    ctx.clearRect(0, 0, W, H)
    // draw decision boundary regions
    const imgData = ctx.createImageData(W, H)
    for (let px = 0; px < W; px++) {
      for (let py = 0; py < H; py++) {
        const nx = (px / W) * 2 - 1, ny = 1 - (py / H) * 2
        const z = w.w1 * nx + w.w2 * ny + w.bias
        const p = sigmoid(z)
        const idx = (py * W + px) * 4
        if (isDark()) {
          imgData.data[idx]   = p > 0.5 ? Math.round(p * 40) : 0
          imgData.data[idx+1] = p < 0.5 ? Math.round((1-p) * 55) : 0
          imgData.data[idx+2] = 0
          imgData.data[idx+3] = 200
        } else {
          imgData.data[idx]   = Math.round(255 - (1-p)*40)
          imgData.data[idx+1] = Math.round(255 - p*40)
          imgData.data[idx+2] = Math.round(240 - p*30)
          imgData.data[idx+3] = 255
        }
      }
    }
    ctx.putImageData(imgData, 0, 0)
    // axes
    const cx = W/2, cy = H/2
    ctx.strokeStyle = GRID(); ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, H); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke()
    // decision boundary line z=0 => w1*x + w2*y + b = 0 => y = -(w1*x + b)/w2
    if (Math.abs(w.w2) > 0.01) {
      const x1 = -1, y1 = -(w.w1*x1 + w.bias)/w.w2
      const x2 = 1,  y2 = -(w.w1*x2 + w.bias)/w.w2
      const px1 = (x1+1)/2*W, py1 = (1-y1)/2*H
      const px2 = (x2+1)/2*W, py2 = (1-y2)/2*H
      ctx.beginPath(); ctx.moveTo(px1, py1); ctx.lineTo(px2, py2)
      ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2; ctx.stroke()
    }
    // points
    let correct = 0
    ptsRef.current.forEach(({ x, y, label }) => {
      const px = (x+1)/2*W, py = (1-y)/2*H
      const z = w.w1*x + w.w2*y + w.bias
      const pred = z > 0 ? 1 : 0
      if (pred === label) correct++
      ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI*2)
      ctx.fillStyle = label === 1 ? '#f59e0b' : '#22d3ee'
      ctx.fill()
      ctx.strokeStyle = pred === label ? '#fff' : '#f43f5e'
      ctx.lineWidth = pred === label ? 1.5 : 2; ctx.stroke()
    })
    if (ptsRef.current.length > 0) setAccuracy(Math.round(correct / ptsRef.current.length * 100))
  }, [weights])

  const autoLearn = useCallback(() => {
    if (ptsRef.current.length < 2) return
    // one step of perceptron learning rule
    let dw1 = 0, dw2 = 0, db = 0
    ptsRef.current.forEach(({ x, y, label }) => {
      const z = weights.w1*x + weights.w2*y + weights.bias
      const pred = sigmoid(z)
      const err = label - pred
      dw1 += err * x; dw2 += err * y; db += err
    })
    const lr = 0.05 / ptsRef.current.length
    const nw = { w1: weights.w1 + lr*dw1, w2: weights.w2 + lr*dw2, bias: weights.bias + lr*db }
    setWeights(nw); draw(nw)
  }, [weights, draw])

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current!
    const r = c.getBoundingClientRect()
    const nx = ((e.clientX - r.left) / r.width) * 2 - 1
    const ny = 1 - ((e.clientY - r.top) / r.height) * 2
    ptsRef.current.push({ x: nx, y: ny, label: trainingMode })
    draw()
  }, [trainingMode, draw])

  useEffect(() => {
    const c = canvasRef.current; if (!c) return
    const ro = new ResizeObserver(() => { c.width = c.offsetWidth; c.height = 280; draw() })
    ro.observe(c); return () => ro.disconnect()
  }, [])
  useEffect(() => { draw() }, [weights])

  return (
    <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--color-card-bg)', borderColor: 'var(--color-border)' }}>
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-start justify-between mb-1">
          <div className="text-sm font-medium" style={{ color: 'var(--color-text-1)' }}>Perceptron Decision Boundary</div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded" style={{ background: '#c084fc', color: '#080808' }}>Interactive</span>
        </div>
        <div className="text-xs mb-4" style={{ color: 'var(--color-text-3)' }}>
          Click to place <span style={{ color: '#f59e0b' }}>●</span> class A or <span style={{ color: '#22d3ee' }}>●</span> class B points. Tune weights or auto-learn with gradient descent.
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex gap-1">
            {([0, 1] as const).map((cls) => (
              <button key={cls} onClick={() => setTrainingMode(cls)}
                className={cn('px-3 py-1 rounded text-xs border transition-all', trainingMode === cls ? 'border-opacity-60' : 'border-transparent')}
                style={{
                  color: trainingMode === cls ? (cls === 1 ? '#f59e0b' : '#22d3ee') : 'var(--color-text-3)',
                  borderColor: trainingMode === cls ? (cls === 1 ? '#f59e0b80' : '#22d3ee80') : undefined,
                  background: trainingMode === cls ? (cls === 1 ? '#f59e0b15' : '#22d3ee15') : undefined,
                }}>
                {cls === 1 ? '● Class A' : '● Class B'}
              </button>
            ))}
          </div>
          {['w1', 'w2', 'bias'].map((key) => (
            <label key={key} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-text-2)' }}>
              {key}
              <input type="range" min={-3} max={3} step={0.05} value={weights[key as keyof typeof weights]}
                onChange={(e) => { const nw = { ...weights, [key]: +e.target.value }; setWeights(nw); draw(nw) }}
                style={{ width: 60 }} />
              <span className="font-mono w-10 text-right" style={{ color: 'var(--color-amber)' }}>
                {weights[key as keyof typeof weights].toFixed(2)}
              </span>
            </label>
          ))}
        </div>
      </div>
      <canvas ref={canvasRef} onClick={handleClick} style={{ width: '100%', height: 330, cursor: 'crosshair', display: 'block' }} />
      <div className="px-5 py-3 border-t flex items-center gap-2 flex-wrap" style={{ borderColor: 'var(--color-border)' }}>
        <button onClick={() => { ptsRef.current = []; draw() }} className="text-xs px-3 py-1.5 rounded-lg border hover:bg-[var(--color-surface-2)] transition-colors" style={{ borderColor: 'var(--color-border-2)', color: 'var(--color-text-2)' }}>Clear</button>
        <button onClick={autoLearn} className="text-xs px-4 py-1.5 rounded-lg font-medium" style={{ background: 'var(--color-amber)', color: '#080808' }}>Learn step</button>
        <button onClick={() => { for (let i = 0; i < 50; i++) autoLearn() }} className="text-xs px-3 py-1.5 rounded-lg border hover:bg-[var(--color-surface-2)] transition-colors" style={{ borderColor: 'var(--color-border-2)', color: 'var(--color-text-2)' }}>×50 steps</button>
        <div className="flex gap-4 ml-auto text-xs font-mono" style={{ color: 'var(--color-text-3)' }}>
          <span>Points: <span style={{ color: 'var(--color-amber)' }}>{ptsRef.current.length}</span></span>
          {ptsRef.current.length > 0 && <span>Accuracy: <span style={{ color: accuracy > 80 ? '#10b981' : accuracy > 60 ? '#f59e0b' : '#f43f5e' }}>{accuracy}%</span></span>}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// 4. NEURAL NETWORK ARCHITECTURE BUILDER (visual only)
// ═══════════════════════════════════════════════════════════════
function NeuralNetBuilder() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [layers, setLayers] = useState([4, 6, 6, 3])
  const [activationFn, setActivationFn] = useState<'relu' | 'sigmoid' | 'tanh'>('relu')
  const [showWeights, setShowWeights] = useState(true)

  const draw = useCallback(() => {
    const c = canvasRef.current; if (!c) return
    const ctx = c.getContext('2d')!
    const W = c.width, H = c.height
    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = BG(); ctx.fillRect(0, 0, W, H)
    const dark = isDark()

    const maxN = Math.max(...layers)
    const xStep = W / (layers.length + 1)
    const nodeR = Math.min(14, (H * 0.8) / (maxN * 2.4))

    // compute positions
    const nodePos: { x: number; y: number }[][] = layers.map((n, li) => {
      const x = xStep * (li + 1)
      const totalH = (n - 1) * nodeR * 2.8
      const startY = (H - totalH) / 2
      return Array.from({ length: n }, (_, ni) => ({ x, y: startY + ni * nodeR * 2.8 }))
    })

    // draw connections
    if (showWeights) {
      nodePos.forEach((layer, li) => {
        if (li === layers.length - 1) return
        layer.forEach((from) => {
          nodePos[li + 1].forEach((to) => {
            const w = Math.random() * 2 - 1
            ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(to.x, to.y)
            ctx.strokeStyle = w > 0
              ? `rgba(245,158,11,${Math.abs(w) * 0.18})`
              : `rgba(34,211,238,${Math.abs(w) * 0.18})`
            ctx.lineWidth = Math.abs(w) * 1.5
            ctx.stroke()
          })
        })
      })
    }

    // draw nodes
    const ACT_COLOR: Record<string, string> = { relu: '#f59e0b', sigmoid: '#22d3ee', tanh: '#c084fc' }
    const col = ACT_COLOR[activationFn]

    nodePos.forEach((layer, li) => {
      const isInput  = li === 0
      const isOutput = li === layers.length - 1

      // layer label
      ctx.fillStyle = dark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)'
      ctx.font = '10px monospace'; ctx.textAlign = 'center'
      const labels = ['Input', ...Array.from({ length: layers.length - 2 }, (_, i) => `Hidden ${i+1}`), 'Output']
      ctx.fillText(labels[li], layer[0].x, H - 10)

      layer.forEach(({ x, y }) => {
        ctx.beginPath(); ctx.arc(x, y, nodeR, 0, Math.PI * 2)
        if (isInput) {
          ctx.fillStyle = dark ? '#1a2535' : '#dde4ef'
        } else if (isOutput) {
          ctx.fillStyle = dark ? '#1a2520' : '#d8edd6'
        } else {
          ctx.fillStyle = dark ? '#1a1f15' : '#ede8d0'
        }
        ctx.fill()
        ctx.strokeStyle = isInput ? '#22d3ee' : isOutput ? '#10b981' : col
        ctx.lineWidth = 1.5; ctx.stroke()
      })

      // layer size label
      ctx.fillStyle = dark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'
      ctx.font = '9px monospace'
      ctx.fillText(`${layers[li]}`, layer[0].x, layer[0].y - nodeR - 4)
    })
  }, [layers, activationFn, showWeights])

  const addLayer = () => { if (layers.length < 8) setLayers([...layers.slice(0,-1), 4, layers[layers.length-1]]) }
  const removeLayer = () => { if (layers.length > 2) setLayers([layers[0], ...layers.slice(2)]) }
  const changeLayerSize = (i: number, delta: number) => {
    const next = [...layers]
    next[i] = Math.max(1, Math.min(12, next[i] + delta))
    setLayers(next)
  }

  useEffect(() => {
    const c = canvasRef.current; if (!c) return
    const ro = new ResizeObserver(() => { c.width = c.offsetWidth; c.height = 260; draw() })
    ro.observe(c); return () => ro.disconnect()
  }, [])
  useEffect(() => { draw() }, [draw])

  const totalParams = layers.slice(0, -1).reduce((s, n, i) => s + n * layers[i+1] + layers[i+1], 0)

  return (
    <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--color-card-bg)', borderColor: 'var(--color-border)' }}>
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-start justify-between mb-1">
          <div className="text-sm font-medium" style={{ color: 'var(--color-text-1)' }}>Neural Network Visualizer</div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded" style={{ background: '#10b981', color: '#080808' }}>Builder</span>
        </div>
        <div className="text-xs mb-4" style={{ color: 'var(--color-text-3)' }}>
          Add/remove layers and neurons. Connection thickness encodes weight magnitude. <span style={{ color: '#f59e0b' }}>Gold</span> = positive, <span style={{ color: '#22d3ee' }}>cyan</span> = negative.
        </div>
        <div className="flex flex-wrap gap-4 items-center mb-2">
          <div className="flex gap-1">
            {(['relu','sigmoid','tanh'] as const).map((fn) => (
              <button key={fn} onClick={() => setActivationFn(fn)}
                className={cn('px-2.5 py-1 rounded text-[11px] font-mono border transition-all', activationFn === fn ? 'border-amber-500/40 bg-amber-500/10 text-amber-400' : 'border-transparent')}
                style={{ color: activationFn === fn ? undefined : 'var(--color-text-3)' }}>
                {fn}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: 'var(--color-text-2)' }}>
            <input type="checkbox" checked={showWeights} onChange={(e) => setShowWeights(e.target.checked)} />
            Show weights
          </label>
          <div className="flex gap-1.5 ml-auto">
            <button onClick={removeLayer} className="text-xs px-2.5 py-1 rounded border transition-colors hover:bg-[var(--color-surface-2)]" style={{ borderColor: 'var(--color-border-2)', color: 'var(--color-text-2)' }}>− Layer</button>
            <button onClick={addLayer} className="text-xs px-2.5 py-1 rounded border transition-colors hover:bg-[var(--color-surface-2)]" style={{ borderColor: 'var(--color-border-2)', color: 'var(--color-text-2)' }}>+ Layer</button>
          </div>
        </div>
        {/* Per-layer neuron controls */}
        <div className="flex gap-2 flex-wrap">
          {layers.map((n, i) => (
            <div key={i} className="flex flex-col items-center gap-0.5">
              <button onClick={() => changeLayerSize(i, 1)} className="text-[10px] leading-none" style={{ color: 'var(--color-text-3)' }}>▲</button>
              <span className="text-[10px] font-mono" style={{ color: 'var(--color-amber)' }}>{n}</span>
              <button onClick={() => changeLayerSize(i, -1)} className="text-[10px] leading-none" style={{ color: 'var(--color-text-3)' }}>▼</button>
            </div>
          ))}
        </div>
      </div>
      <canvas ref={canvasRef} style={{ width: '100%', height: 300, display: 'block' }} />
      <div className="px-5 py-3 border-t flex items-center gap-4 text-xs font-mono flex-wrap" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-3)' }}>
        <span>Layers: <span style={{ color: 'var(--color-amber)' }}>{layers.length}</span></span>
        <span>Architecture: <span style={{ color: 'var(--color-amber)' }}>{layers.join('→')}</span></span>
        <span>Params ≈ <span style={{ color: 'var(--color-cyan)' }}>{totalParams.toLocaleString()}</span></span>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// 5. BIAS-VARIANCE TRADEOFF EXPLORER
// ═══════════════════════════════════════════════════════════════
function BiasVarianceLab() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [degree, setDegree] = useState(3)
  const [noise, setNoise] = useState(0.2)
  const [nPts, setNPts] = useState(20)
  const dataRef = useRef<{x: number; y: number}[]>([])
  const [mse, setMse] = useState<number | null>(null)

  const trueFn = (x: number) => Math.sin(x * Math.PI) * 0.8

  const polyFit = (xs: number[], ys: number[], d: number): number[] => {
    // Vandermonde least squares (simple implementation)
    const n = xs.length, p = d + 1
    // Build X matrix
    const X: number[][] = xs.map((x) => Array.from({ length: p }, (_, i) => Math.pow(x, i)))
    // XtX
    const XtX: number[][] = Array.from({ length: p }, (_, i) => Array.from({ length: p }, (_, j) => X.reduce((s, row) => s + row[i] * row[j], 0)))
    // Xty
    const Xty: number[] = Array.from({ length: p }, (_, i) => xs.reduce((s, _, k) => s + X[k][i] * ys[k], 0))
    // Solve with Gaussian elimination
    const aug = XtX.map((row, i) => [...row, Xty[i]])
    for (let col = 0; col < p; col++) {
      let maxRow = col
      for (let row = col + 1; row < p; row++) if (Math.abs(aug[row][col]) > Math.abs(aug[maxRow][col])) maxRow = row;
      [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]]
      if (Math.abs(aug[col][col]) < 1e-12) continue
      for (let row = 0; row < p; row++) {
        if (row === col) continue
        const f = aug[row][col] / aug[col][col]
        for (let j = col; j <= p; j++) aug[row][j] -= f * aug[col][j]
      }
    }
    return Array.from({ length: p }, (_, i) => aug[i][p] / aug[i][i])
  }

  const evalPoly = (coeffs: number[], x: number) => coeffs.reduce((s, c, i) => s + c * Math.pow(x, i), 0)

  const regenerate = useCallback((newNoise = noise, newN = nPts) => {
    dataRef.current = Array.from({ length: newN }, (_, i) => {
      const x = (i / (newN - 1)) * 2 - 1
      return { x, y: trueFn(x) + (Math.random() - 0.5) * newNoise * 2 }
    })
  }, [])

  const draw = useCallback((d = degree) => {
    const c = canvasRef.current; if (!c) return
    const ctx = c.getContext('2d')!
    const W = c.width, H = c.height
    const dark = isDark()
    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = BG(); ctx.fillRect(0, 0, W, H)
    // axes
    const pad = 30
    const toScreen = (x: number, y: number) => ({ sx: pad + (x + 1) / 2 * (W - 2*pad), sy: H/2 - y * (H/2 - pad) })
    ctx.strokeStyle = GRID(); ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(pad, H/2); ctx.lineTo(W-pad, H/2); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(W/2, pad); ctx.lineTo(W/2, H-pad); ctx.stroke()

    // true function
    ctx.beginPath()
    for (let i = 0; i <= 100; i++) {
      const x = -1 + i * 0.02
      const { sx, sy } = toScreen(x, trueFn(x))
      i === 0 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy)
    }
    ctx.strokeStyle = '#10b981'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]); ctx.stroke(); ctx.setLineDash([])

    // fit polynomial
    const pts = dataRef.current
    if (pts.length > d) {
      try {
        const coeffs = polyFit(pts.map((p) => p.x), pts.map((p) => p.y), d)
        ctx.beginPath()
        for (let i = 0; i <= 100; i++) {
          const x = -1 + i * 0.02
          const y = Math.max(-1.5, Math.min(1.5, evalPoly(coeffs, x)))
          const { sx, sy } = toScreen(x, y)
          i === 0 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy)
        }
        ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2; ctx.stroke()

        const mseVal = pts.reduce((s, p) => s + (p.y - evalPoly(coeffs, p.x)) ** 2, 0) / pts.length
        setMse(Math.round(mseVal * 10000) / 10000)
      } catch { setMse(null) }
    }

    // data points
    pts.forEach(({ x, y }) => {
      const { sx, sy } = toScreen(x, y)
      ctx.beginPath(); ctx.arc(sx, sy, 3.5, 0, Math.PI*2)
      ctx.fillStyle = dark ? '#22d3ee90' : '#0e7a9090'; ctx.fill()
      ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 1; ctx.stroke()
    })

    // legend
    ctx.font = '10px monospace'; ctx.textAlign = 'left'; ctx.textBaseline = 'top'
    ctx.fillStyle = '#10b981'; ctx.fillText('── true fn', 8, 8)
    ctx.fillStyle = '#f59e0b'; ctx.fillText(`── degree ${d} fit`, 8, 22)
    ctx.fillStyle = '#22d3ee'; ctx.fillText('● data', 8, 36)
  }, [degree])

  useEffect(() => {
    const c = canvasRef.current; if (!c) return
    const ro = new ResizeObserver(() => { c.width = c.offsetWidth; c.height = 260; regenerate(noise, nPts); draw(degree) })
    ro.observe(c); return () => ro.disconnect()
  }, [])

  useEffect(() => { regenerate(noise, nPts); draw(degree) }, [degree, noise, nPts])

  const biasLabel = degree <= 2 ? 'High bias (underfitting)' : degree >= 8 ? 'High variance (overfitting)' : 'Good balance'
  const biasColor = degree <= 2 ? '#f43f5e' : degree >= 8 ? '#f59e0b' : '#10b981'

  return (
    <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--color-card-bg)', borderColor: 'var(--color-border)' }}>
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-start justify-between mb-1">
          <div className="text-sm font-medium" style={{ color: 'var(--color-text-1)' }}>Bias–Variance Tradeoff</div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded" style={{ background: '#f43f5e', color: '#fff' }}>Theory</span>
        </div>
        <div className="text-xs mb-4" style={{ color: 'var(--color-text-3)' }}>
          Polynomial regression on noisy sine data. Increase degree to see underfitting → good fit → overfitting.
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <label className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-2)' }}>
            Polynomial degree
            <input type="range" min={1} max={12} step={1} value={degree} onChange={(e) => setDegree(+e.target.value)} style={{ width: 80 }} />
            <span className="font-mono" style={{ color: 'var(--color-amber)' }}>{degree}</span>
          </label>
          <label className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-2)' }}>
            Noise
            <input type="range" min={0.05} max={0.8} step={0.05} value={noise} onChange={(e) => setNoise(+e.target.value)} style={{ width: 60 }} />
            <span className="font-mono" style={{ color: 'var(--color-amber)' }}>{noise.toFixed(2)}</span>
          </label>
          <label className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-2)' }}>
            Points
            <input type="range" min={8} max={40} step={1} value={nPts} onChange={(e) => setNPts(+e.target.value)} style={{ width: 60 }} />
            <span className="font-mono" style={{ color: 'var(--color-amber)' }}>{nPts}</span>
          </label>
          <button onClick={() => { regenerate(noise, nPts); draw(degree) }} className="text-xs px-3 py-1.5 rounded-lg border ml-auto hover:bg-[var(--color-surface-2)] transition-colors" style={{ borderColor: 'var(--color-border-2)', color: 'var(--color-text-2)' }}>New data</button>
        </div>
      </div>
      <canvas ref={canvasRef} style={{ width: '100%', height: 260, display: 'block' }} />
      <div className="px-5 py-3 border-t flex items-center gap-4 text-xs flex-wrap" style={{ borderColor: 'var(--color-border)' }}>
        <span className="font-medium" style={{ color: biasColor }}>{biasLabel}</span>
        {mse !== null && <span className="font-mono" style={{ color: 'var(--color-text-3)' }}>Train MSE: <span style={{ color: 'var(--color-cyan)' }}>{mse}</span></span>}
        <span className="text-[10px] ml-auto" style={{ color: 'var(--color-text-3)' }}>
          params = {degree + 1}
        </span>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// LAB PAGE
// ═══════════════════════════════════════════════════════════════
const EXPERIMENTS = [
  { id: 'kmeans',       label: 'K-Means',        tag: 'Clustering',  color: '#f59e0b' },
  { id: 'gd',          label: 'Gradient Descent', tag: 'Optimization', color: '#22d3ee' },
  { id: 'perceptron',  label: 'Perceptron',       tag: 'Classification', color: '#c084fc' },
  { id: 'nn',          label: 'Neural Net',       tag: 'Architecture', color: '#10b981' },
  { id: 'biasvariance',label: 'Bias-Variance',    tag: 'Theory',      color: '#f43f5e' },
]

export default function LabPage() {
  const [active, setActive] = useState('all')

  const visible = active === 'all' ? EXPERIMENTS : EXPERIMENTS.filter((e) => e.id === active)

  return (
    <>
      <Helmet>
        <title>Live Lab — Synaptica</title>
        <meta name="description" content="5 interactive ML experiments — K-Means, gradient descent, perceptron, neural net builder, and bias-variance tradeoff." />
      </Helmet>

      {/* ── HEADER ─────────────────────────────────── */}
      <div className="border-b py-14 px-6 sm:px-10 lg:px-16"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-1)' }}>
        <div className="max-w-[1400px] mx-auto">
          <Reveal><SectionLabel>Live Lab</SectionLabel></Reveal>
          <Reveal delay={80}>
            <SectionTitle>
              <em style={{ color: 'var(--color-amber)', fontStyle: 'italic' }}>Interactive</em> ML Experiments
            </SectionTitle>
          </Reveal>
          <Reveal delay={160}>
            <p className="text-base mt-3 max-w-lg" style={{ color: 'var(--color-text-2)' }}>
              5 experiments. No setup. Tweak parameters, add data points, and watch algorithms think — live in your browser.
            </p>
          </Reveal>
          <Reveal delay={220}>
            <div className="flex flex-wrap gap-2 mt-5">
              <button
                onClick={() => setActive('all')}
                className={cn('px-3 py-1 rounded-full text-xs border transition-all', active === 'all' ? 'border-amber-500/40 text-amber-400 bg-amber-500/10' : 'border-transparent')}
                style={{ color: active === 'all' ? undefined : 'var(--color-text-3)' }}
              >All experiments</button>
              {EXPERIMENTS.map((exp) => (
                <button
                  key={exp.id}
                  onClick={() => setActive(active === exp.id ? 'all' : exp.id)}
                  className={cn('px-3 py-1 rounded-full text-xs border transition-all')}
                  style={{
                    color: active === exp.id ? exp.color : 'var(--color-text-3)',
                    borderColor: active === exp.id ? exp.color + '60' : 'transparent',
                    background: active === exp.id ? exp.color + '12' : 'transparent',
                  }}
                >
                  {exp.label}
                </button>
              ))}
            </div>
          </Reveal>
        </div>
      </div>

      {/* ── EXPERIMENTS ─────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 py-10">
        <div className={cn(
          'grid gap-6',
          visible.length === 1 ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'
        )}>
          {visible.map((exp) => (
            <Reveal key={exp.id}>
              {exp.id === 'kmeans'       && <KMeansLab />}
              {exp.id === 'gd'          && <GradientDescentLab />}
              {exp.id === 'perceptron'  && <PerceptronLab />}
              {exp.id === 'nn'          && <NeuralNetBuilder />}
              {exp.id === 'biasvariance'&& <BiasVarianceLab />}
            </Reveal>
          ))}
        </div>
      </div>
    </>
  )
}