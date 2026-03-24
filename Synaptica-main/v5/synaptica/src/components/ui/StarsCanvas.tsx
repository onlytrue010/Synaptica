import { useEffect, useRef } from 'react'
import { useTheme } from '@hooks/index'

interface Star {
  x: number
  y: number
  r: number
  a: number
  t: number
  s: number
  color: string
}

export default function StarsCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let stars: Star[] = []
    let W = 0
    let H = 0
    let animFrame: number

    function buildStars() {
      stars = []
      const count = Math.min(250, Math.floor((W * H) / 6000))
      for (let i = 0; i < count; i++) {
        const big   = Math.random() < 0.04
        const isCyan   = Math.random() < 0.15
        const isAmber  = Math.random() < 0.10
        stars.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: big ? 2.2 : Math.random() < 0.2 ? 1.3 : 0.7,
          a: Math.random() * 0.7 + 0.1,
          t: Math.random() * Math.PI * 2,
          s: 0.004 + Math.random() * 0.008,
          color: isCyan ? '#22d3ee' : isAmber ? '#f59e0b' : '#ffffff',
        })
      }
    }

    function resize() {
      W = canvas!.width  = window.innerWidth
      H = canvas!.height = window.innerHeight
      buildStars()
    }

    function draw() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, W, H)

      stars.forEach((s) => {
        s.t += s.s
        const alpha = s.a * (0.55 + 0.45 * Math.sin(s.t))

        ctx.save()
        ctx.globalAlpha = theme === 'light' ? alpha * 0.2 : alpha
        ctx.fillStyle = s.color

        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fill()

        // Soft glow ring on larger stars
        if (s.r > 1.5) {
          ctx.globalAlpha = alpha * 0.12
          ctx.beginPath()
          ctx.arc(s.x, s.y, s.r * 3.5, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.restore()
      })

      animFrame = requestAnimationFrame(draw)
    }

    resize()
    draw()

    window.addEventListener('resize', resize)
    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animFrame)
    }
  }, [theme])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        width: '100vw',
        height: '100vh',
      }}
    />
  )
}
