import { useEffect, useRef } from 'react'
import { Chart, RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js'
import type { Algorithm } from '@/types'
import { RATING_DIMENSIONS } from '@constants/index'

Chart.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

const COLORS = [
  { border: 'rgba(245,158,11,0.9)', fill: 'rgba(245,158,11,0.1)' },
  { border: 'rgba(34,211,238,0.8)', fill: 'rgba(34,211,238,0.07)' },
  { border: 'rgba(16,185,129,0.8)', fill: 'rgba(16,185,129,0.07)' },
  { border: 'rgba(244,63,94,0.8)',  fill: 'rgba(244,63,94,0.07)' },
]

interface RadarChartProps {
  algorithms: Algorithm[]
  size?: number
}

export default function RadarChart({ algorithms, size = 260 }: RadarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef  = useRef<Chart | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    // Destroy existing instance before recreating
    if (chartRef.current) {
      chartRef.current.destroy()
      chartRef.current = null
    }

    const labels = RATING_DIMENSIONS.map((d) => d.label)

    const datasets = algorithms.map((algo, i) => {
      const c = COLORS[i % COLORS.length]
      return {
        label: algo.shortName ?? algo.name,
        data: RATING_DIMENSIONS.map((d) => algo.ratings[d.key as keyof typeof algo.ratings]),
        borderColor: c.border,
        backgroundColor: c.fill,
        borderWidth: i === 0 ? 2 : 1.5,
        pointBackgroundColor: c.border,
        pointRadius: 3.5,
        pointHoverRadius: 5,
      }
    })

    chartRef.current = new Chart(canvasRef.current, {
      type: 'radar',
      data: { labels, datasets },
      options: {
        responsive: false,
        animation: { duration: 600 },
        scales: {
          r: {
            min: 0,
            max: 100,
            grid:         { color: 'rgba(255,255,255,0.05)' },
            ticks:        { display: false, stepSize: 25 },
            pointLabels:  { color: '#9ca3af', font: { size: 10, family: "'DM Sans', sans-serif" } },
            angleLines:   { color: 'rgba(255,255,255,0.04)' },
          },
        },
        plugins: {
          legend: {
            labels: {
              color: '#9ca3af',
              font: { size: 11 },
              boxWidth: 10,
              padding: 12,
            },
          },
          tooltip: {
            backgroundColor: 'var(--color-surface-2, #12151e)',
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1,
            titleColor: '#f1f0ed',
            bodyColor: '#9ca3af',
            padding: 10,
            callbacks: {
              label: (ctx) => ` ${ctx.dataset.label}: ${ctx.raw}/100`,
            },
          },
        },
      },
    })

    return () => {
      chartRef.current?.destroy()
      chartRef.current = null
    }
  }, [algorithms])

  return (
    <div className="flex justify-center">
      <canvas ref={canvasRef} width={size} height={size - 20} />
    </div>
  )
}
