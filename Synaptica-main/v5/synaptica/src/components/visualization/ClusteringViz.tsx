import { useEffect, useRef, useState, useCallback } from 'react'
import * as d3 from 'd3'

interface Point { x: number; y: number; label: number }
const COLORS = ['#f59e0b', '#22d3ee', '#10b981', '#f43f5e', '#c084fc', '#fb923c']
const W = 380, H = 280

function generateBlobs(k: number, n: number): Point[] {
  const centers = Array.from({ length: k }, (_, i) => ({
    x: 0.15 + (i / (k - 1 || 1)) * 0.7 + (Math.random() - 0.5) * 0.15,
    y: 0.2 + Math.random() * 0.6,
  }))
  return Array.from({ length: n }, (_, i) => {
    const ci = i % k
    return {
      x: Math.max(0.03, Math.min(0.97, centers[ci].x + (Math.random() - 0.5) * 0.28)),
      y: Math.max(0.03, Math.min(0.97, centers[ci].y + (Math.random() - 0.5) * 0.28)),
      label: ci,
    }
  })
}

function kMeansStep(pts: Point[], centroids: { x: number; y: number }[], k: number) {
  const assigned = pts.map((p) => {
    let best = 0, bd = Infinity
    centroids.forEach((c, ci) => {
      const d = (p.x - c.x) ** 2 + (p.y - c.y) ** 2
      if (d < bd) { bd = d; best = ci }
    })
    return { ...p, label: best }
  })
  const newCentroids = centroids.map((_, ci) => {
    const members = assigned.filter((p) => p.label === ci)
    if (!members.length) return centroids[ci]
    return { x: members.reduce((s, p) => s + p.x, 0) / members.length, y: members.reduce((s, p) => s + p.y, 0) / members.length }
  })
  return { assigned, newCentroids }
}

interface Props { algo?: 'kmeans' | 'dbscan' }

export default function ClusteringViz({ algo = 'kmeans' }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [k, setK]             = useState(3)
  const [iter, setIter]       = useState(0)
  const [converged, setConverged] = useState(false)
  const [running, setRunning]  = useState(false)
  const timerRef               = useRef<ReturnType<typeof setInterval> | null>(null)

  const dataRef       = useRef<Point[]>(generateBlobs(3, 80))
  const centroidsRef  = useRef<{ x: number; y: number }[]>([])
  const assignedRef   = useRef<Point[]>([])

  const initCentroids = useCallback((newK: number, pts: Point[]) => {
    centroidsRef.current = Array.from({ length: newK }, () => ({
      x: 0.1 + Math.random() * 0.8, y: 0.1 + Math.random() * 0.8,
    }))
    assignedRef.current = pts.map((p) => ({ ...p, label: 0 }))
  }, [])

  const draw = useCallback(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const xS = d3.scaleLinear([0, 1], [0, W])
    const yS = d3.scaleLinear([0, 1], [0, H])

    // Points
    assignedRef.current.forEach((p) => {
      svg.append('circle')
        .attr('cx', xS(p.x)).attr('cy', yS(p.y)).attr('r', 4.5)
        .attr('fill', COLORS[p.label % COLORS.length] + 'cc')
        .attr('stroke', COLORS[p.label % COLORS.length]).attr('stroke-width', 1)
    })

    // Centroids
    if (algo === 'kmeans') {
      centroidsRef.current.forEach((c, ci) => {
        const col = COLORS[ci % COLORS.length]
        const s   = 9
        svg.append('polygon')
          .attr('points', `${xS(c.x)},${yS(c.y) - s} ${xS(c.x) + s * 0.866},${yS(c.y) + s * 0.5} ${xS(c.x) - s * 0.866},${yS(c.y) + s * 0.5}`)
          .attr('fill', col).attr('stroke', '#fff').attr('stroke-width', 1.5)
      })
    }
  }, [algo])

  const step = useCallback(() => {
    if (converged || algo !== 'kmeans') return
    const { assigned, newCentroids } = kMeansStep(dataRef.current, centroidsRef.current, k)
    const changed = assigned.some((p, i) => p.label !== assignedRef.current[i]?.label)
    assignedRef.current  = assigned
    centroidsRef.current = newCentroids
    setIter((v) => v + 1)
    if (!changed) { setConverged(true); stopTimer() }
    draw()
  }, [k, converged, algo, draw])

  const stopTimer = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; setRunning(false) }
  }

  const reset = useCallback((newK = k) => {
    stopTimer()
    const pts = generateBlobs(newK, 80)
    dataRef.current = pts
    initCentroids(newK, pts)
    assignedRef.current = pts
    setIter(0); setConverged(false)
    draw()
  }, [k, initCentroids, draw])

  const toggleAuto = () => {
    if (timerRef.current) { stopTimer(); return }
    setRunning(true)
    timerRef.current = setInterval(step, 600)
  }

  useEffect(() => { reset(k) }, [])
  useEffect(() => { reset(k) }, [k])
  useEffect(() => () => stopTimer(), [])

  return (
    <div>
      <div className="flex items-center gap-4 mb-3 flex-wrap">
        {algo === 'kmeans' && (
          <label className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-2)' }}>
            K = <input type="range" min={2} max={6} step={1} value={k} onChange={(e) => setK(+e.target.value)} style={{ width: 70 }} />
            <span className="font-mono" style={{ color: 'var(--color-amber)' }}>{k}</span>
          </label>
        )}
        <div className="flex gap-2 text-xs">
          <button onClick={() => reset(k)} className="px-3 py-1 rounded border" style={{ borderColor: 'var(--color-border-2)', color: 'var(--color-text-2)' }}>New data</button>
          {algo === 'kmeans' && <>
            <button onClick={step} disabled={converged} className="px-3 py-1 rounded border" style={{ borderColor: 'var(--color-border-2)', color: 'var(--color-text-2)' }}>Step</button>
            <button onClick={toggleAuto} className="px-3 py-1 rounded border font-medium transition-all"
              style={{ background: running ? 'rgba(244,63,94,0.12)' : 'var(--color-amber)', color: running ? '#f43f5e' : '#080808', borderColor: running ? '#f43f5e' : 'transparent' }}>
              {running ? 'Stop' : 'Auto'}
            </button>
          </>}
        </div>
        <div className="ml-auto text-xs font-mono flex gap-3" style={{ color: 'var(--color-text-3)' }}>
          {algo === 'kmeans' && <span>Iter: <span style={{ color: 'var(--color-amber)' }}>{iter}</span></span>}
          {algo === 'kmeans' && <span style={{ color: converged ? '#10b981' : 'var(--color-cyan)' }}>{converged ? 'Converged' : 'Running'}</span>}
        </div>
      </div>
      <svg
        ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`}
        style={{ borderRadius: 8, border: '1px solid var(--color-border)', display: 'block', cursor: 'crosshair' }}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const x = (e.clientX - rect.left) / rect.width
          const y = (e.clientY - rect.top) / rect.height
          dataRef.current.push({ x, y, label: 0 })
          assignedRef.current = [...dataRef.current]
          draw()
        }}
      />
    </div>
  )
}
