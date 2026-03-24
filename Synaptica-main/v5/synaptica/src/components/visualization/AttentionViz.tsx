import { useState, useEffect, useRef } from 'react'
import * as d3 from 'd3'

const TOKENS = ['The', 'cat', 'sat', 'on', 'the', 'mat']
const W = 560, H = 260, TOKEN_W = 72, TOKEN_H = 36

// Simulated attention weights per query token
const ATTENTION: number[][] = [
  [0.60, 0.10, 0.05, 0.05, 0.15, 0.05],
  [0.12, 0.55, 0.18, 0.05, 0.05, 0.05],
  [0.05, 0.25, 0.50, 0.08, 0.05, 0.07],
  [0.05, 0.05, 0.10, 0.60, 0.10, 0.10],
  [0.20, 0.05, 0.05, 0.05, 0.55, 0.10],
  [0.05, 0.08, 0.22, 0.05, 0.10, 0.50],
]

// Layer-specific variation
const LAYER_SCALES = [
  [1.0, 0.8, 0.5, 0.4, 0.9, 0.3],
  [0.7, 1.0, 0.9, 0.6, 0.5, 0.4],
  [0.4, 0.6, 1.0, 0.8, 0.4, 0.9],
]

function getWeights(query: number, layer: number): number[] {
  const base = ATTENTION[query]
  const scales = LAYER_SCALES[layer % 3]
  const raw = base.map((w, i) => w * scales[i])
  const total = raw.reduce((a, b) => a + b, 0)
  return raw.map((w) => w / total)
}

export default function AttentionViz() {
  const svgRef   = useRef<SVGSVGElement>(null)
  const [query, setQuery]   = useState(2)
  const [layer, setLayer]   = useState(0)
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const weights    = getWeights(query, layer)
    const maxWeight  = Math.max(...weights)
    const pad        = (W - TOKENS.length * TOKEN_W - (TOKENS.length - 1) * 12) / 2
    const tokenX     = (i: number) => pad + i * (TOKEN_W + 12)
    const srcY       = 40   // query row y-center
    const keyY       = H - 50  // key row y-center

    // Attention lines from query down to each key
    weights.forEach((w, i) => {
      const opacity   = 0.1 + w * 0.9
      const thickness = 0.5 + w * 6
      const isMax     = w === maxWeight

      svg.append('line')
        .attr('x1', tokenX(query) + TOKEN_W / 2)
        .attr('y1', srcY + TOKEN_H / 2)
        .attr('x2', tokenX(i) + TOKEN_W / 2)
        .attr('y2', keyY - TOKEN_H / 2)
        .attr('stroke', isMax ? '#f59e0b' : '#22d3ee')
        .attr('stroke-width', thickness)
        .attr('opacity', opacity)
    })

    // Key row tokens
    TOKENS.forEach((tok, i) => {
      const w       = weights[i]
      const isMax   = w === maxWeight
      const g       = svg.append('g').attr('cursor', 'pointer')
        .on('click', () => setQuery(i))

      g.append('rect')
        .attr('x', tokenX(i)).attr('y', keyY - TOKEN_H / 2)
        .attr('width', TOKEN_W).attr('height', TOKEN_H)
        .attr('rx', 6)
        .attr('fill', isMax ? 'rgba(245,158,11,0.18)' : 'rgba(34,211,238,0.10)')
        .attr('stroke', isMax ? '#f59e0b' : 'rgba(34,211,238,0.4)')
        .attr('stroke-width', isMax ? 1.5 : 0.75)

      g.append('text')
        .attr('x', tokenX(i) + TOKEN_W / 2).attr('y', keyY)
        .attr('text-anchor', 'middle').attr('dominant-baseline', 'central')
        .attr('font-size', 13).attr('font-weight', isMax ? 600 : 400)
        .attr('fill', isMax ? '#f59e0b' : '#9ca3af')
        .text(tok)

      // Weight label below
      g.append('text')
        .attr('x', tokenX(i) + TOKEN_W / 2).attr('y', keyY + TOKEN_H / 2 + 14)
        .attr('text-anchor', 'middle').attr('font-size', 10).attr('font-family', 'JetBrains Mono, monospace')
        .attr('fill', isMax ? '#f59e0b' : '#6b7280')
        .text((w * 100).toFixed(0) + '%')
    })

    // Query row (single highlighted token)
    TOKENS.forEach((tok, i) => {
      const isQuery = i === query
      const g = svg.append('g').attr('cursor', 'pointer').on('click', () => setQuery(i))

      g.append('rect')
        .attr('x', tokenX(i)).attr('y', srcY - TOKEN_H / 2)
        .attr('width', TOKEN_W).attr('height', TOKEN_H)
        .attr('rx', 6)
        .attr('fill', isQuery ? 'rgba(245,158,11,0.22)' : 'rgba(255,255,255,0.04)')
        .attr('stroke', isQuery ? '#f59e0b' : 'rgba(255,255,255,0.1)')
        .attr('stroke-width', isQuery ? 2 : 0.5)

      g.append('text')
        .attr('x', tokenX(i) + TOKEN_W / 2).attr('y', srcY)
        .attr('text-anchor', 'middle').attr('dominant-baseline', 'central')
        .attr('font-size', 13).attr('font-weight', isQuery ? 700 : 400)
        .attr('fill', isQuery ? '#f59e0b' : '#9ca3af')
        .text(tok)
    })

    // Row labels
    svg.append('text')
      .attr('x', pad - 12).attr('y', srcY).attr('text-anchor', 'end')
      .attr('dominant-baseline', 'central').attr('font-size', 10)
      .attr('fill', '#6b7280').text('Query')
    svg.append('text')
      .attr('x', pad - 12).attr('y', keyY).attr('text-anchor', 'end')
      .attr('dominant-baseline', 'central').attr('font-size', 10)
      .attr('fill', '#6b7280').text('Keys')

  }, [query, layer])

  useEffect(() => {
    if (!animate) return
    let i = 0
    const timer = setInterval(() => {
      i = (i + 1) % TOKENS.length
      setQuery(i)
    }, 900)
    return () => clearInterval(timer)
  }, [animate])

  return (
    <div>
      <div className="flex items-center gap-4 mb-3 flex-wrap text-xs" style={{ color: 'var(--color-text-2)' }}>
        <span>
          Layer:{' '}
          {[0, 1, 2].map((l) => (
            <button
              key={l}
              onClick={() => setLayer(l)}
              className="mx-0.5 px-2 py-0.5 rounded border transition-all"
              style={{
                borderColor: layer === l ? '#f59e0b' : 'var(--color-border-2)',
                color: layer === l ? '#f59e0b' : 'var(--color-text-2)',
                background: layer === l ? 'rgba(245,158,11,0.1)' : 'transparent',
              }}
            >
              {l + 1}
            </button>
          ))}
        </span>
        <button
          onClick={() => setAnimate((v) => !v)}
          className="px-3 py-1 rounded border transition-all"
          style={{
            borderColor: animate ? '#22d3ee' : 'var(--color-border-2)',
            color: animate ? '#22d3ee' : 'var(--color-text-2)',
            background: animate ? 'rgba(34,211,238,0.1)' : 'transparent',
          }}
        >
          {animate ? 'Stop' : 'Animate'}
        </button>
      </div>
      <svg
        ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`}
        style={{ borderRadius: 8, border: '1px solid var(--color-border)' }}
      />
      <p className="text-[11px] mt-2" style={{ color: 'var(--color-text-3)' }}>
        Click any token to see its attention pattern. Line thickness = attention weight.
      </p>
    </div>
  )
}
