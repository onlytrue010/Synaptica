import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

interface Point { x: number; y: number; label: 0 | 1 }

function euclidean(a: Point, b: Point) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

function knnPredict(pts: Point[], test: Point, k: number): number {
  const sorted = [...pts].sort((a, b) => euclidean(a, test) - euclidean(b, test))
  const votes  = sorted.slice(0, k).reduce((s, p) => s + p.label, 0)
  return votes >= k / 2 ? 1 : 0
}

function generateData(n = 60): Point[] {
  const pts: Point[] = []
  for (let i = 0; i < n; i++) {
    const label = i < n / 2 ? 0 : 1
    const cx = label === 0 ? 0.28 : 0.72
    const cy = label === 0 ? 0.35 : 0.65
    pts.push({
      x: Math.max(0.05, Math.min(0.95, cx + (Math.random() - 0.5) * 0.44)),
      y: Math.max(0.05, Math.min(0.95, cy + (Math.random() - 0.5) * 0.44)),
      label,
    })
  }
  return pts
}

const W = 360, H = 300, RES = 28

export default function DecisionBoundaryViz() {
  const svgRef   = useRef<SVGSVGElement>(null)
  const [k, setK]        = useState(5)
  const [pts, setPts]    = useState<Point[]>(() => generateData())
  const [adding, setAdding] = useState<0 | 1 | null>(null)

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const xScale = d3.scaleLinear([0, 1], [0, W])
    const yScale = d3.scaleLinear([0, 1], [0, H])

    // Draw decision boundary grid
    const cellW = W / RES, cellH = H / RES
    for (let r = 0; r < RES; r++) {
      for (let c = 0; c < RES; c++) {
        const px = (c + 0.5) / RES
        const py = (r + 0.5) / RES
        const pred = knnPredict(pts, { x: px, y: py, label: 0 }, k)
        svg.append('rect')
          .attr('x', c * cellW).attr('y', r * cellH)
          .attr('width', cellW + 1).attr('height', cellH + 1)
          .attr('fill', pred === 0 ? '#22d3ee' : '#f59e0b')
          .attr('opacity', 0.18)
      }
    }

    // Draw points
    pts.forEach((p) => {
      svg.append('circle')
        .attr('cx', xScale(p.x)).attr('cy', yScale(p.y))
        .attr('r', 5.5)
        .attr('fill', p.label === 0 ? '#22d3ee' : '#f59e0b')
        .attr('stroke', '#fff').attr('stroke-width', 1.5)
        .attr('opacity', 0.92)
    })

    // Click to add point
    svg.on('click', (event) => {
      if (adding === null) return
      const [mx, my] = d3.pointer(event)
      const newPt: Point = { x: mx / W, y: my / H, label: adding }
      setPts((prev) => [...prev, newPt])
    })

  }, [pts, k, adding])

  return (
    <div>
      <div className="flex items-center gap-4 mb-3 flex-wrap">
        <label className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-2)' }}>
          K = <input type="range" min={1} max={15} step={2} value={k} onChange={(e) => setK(+e.target.value)} style={{ width: 80 }} />
          <span className="font-mono w-3" style={{ color: 'var(--color-amber)' }}>{k}</span>
        </label>
        <div className="flex gap-2 text-xs">
          <button
            onClick={() => setAdding(adding === 0 ? null : 0)}
            className="px-2.5 py-1 rounded border transition-all"
            style={{
              background: adding === 0 ? 'rgba(34,211,238,0.15)' : 'transparent',
              borderColor: adding === 0 ? '#22d3ee' : 'var(--color-border-2)',
              color: adding === 0 ? '#22d3ee' : 'var(--color-text-2)',
            }}
          >+ Cyan</button>
          <button
            onClick={() => setAdding(adding === 1 ? null : 1)}
            className="px-2.5 py-1 rounded border transition-all"
            style={{
              background: adding === 1 ? 'rgba(245,158,11,0.15)' : 'transparent',
              borderColor: adding === 1 ? '#f59e0b' : 'var(--color-border-2)',
              color: adding === 1 ? '#f59e0b' : 'var(--color-text-2)',
            }}
          >+ Amber</button>
          <button
            onClick={() => setPts(generateData())}
            className="px-2.5 py-1 rounded border transition-all"
            style={{ borderColor: 'var(--color-border-2)', color: 'var(--color-text-2)' }}
          >Reset</button>
        </div>
      </div>
      <svg
        ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`}
        style={{ borderRadius: 8, border: '1px solid var(--color-border)', cursor: adding !== null ? 'crosshair' : 'default' }}
      />
      <p className="text-[11px] mt-2" style={{ color: 'var(--color-text-3)' }}>
        {adding !== null ? `Click to add a ${adding === 0 ? 'cyan' : 'amber'} point` : 'Drag K slider to see how boundary changes'}
      </p>
    </div>
  )
}
