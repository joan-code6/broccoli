import { useRef, useEffect, type ReactNode } from 'react'
import rough from 'roughjs/bundled/rough.esm.js'

interface RoughCardProps {
  children: ReactNode
  className?: string
  strokeWidth?: number
  stroke?: string
  fill?: string
  fillStyle?: 'hachure' | 'solid' | 'zigzag' | 'cross-hatch' | 'dots' | 'dashed' | 'zigzag-line'
  roughness?: number
  borderRadius?: number
}

function roundedRectPath(x: number, y: number, w: number, h: number, r: number, cornerSteps = 20) {
  const corners = [
    { cx: x + w - r, cy: y + r, startAngle: -Math.PI / 2, endAngle: 0 },
    { cx: x + w - r, cy: y + h - r, startAngle: 0, endAngle: Math.PI / 2 },
    { cx: x + r, cy: y + h - r, startAngle: Math.PI / 2, endAngle: Math.PI },
    { cx: x + r, cy: y + r, startAngle: Math.PI, endAngle: (3 * Math.PI) / 2 },
  ]

  const points: string[] = []
  points.push(`M ${x + r} ${y}`)

  points.push(`L ${x + w - r} ${y}`)
  for (let i = 0; i <= cornerSteps; i++) {
    const angle = corners[0].startAngle + (corners[0].endAngle - corners[0].startAngle) * (i / cornerSteps)
    points.push(`L ${corners[0].cx + r * Math.cos(angle)} ${corners[0].cy + r * Math.sin(angle)}`)
  }

  points.push(`L ${x + w} ${y + h - r}`)
  for (let i = 0; i <= cornerSteps; i++) {
    const angle = corners[1].startAngle + (corners[1].endAngle - corners[1].startAngle) * (i / cornerSteps)
    points.push(`L ${corners[1].cx + r * Math.cos(angle)} ${corners[1].cy + r * Math.sin(angle)}`)
  }

  points.push(`L ${x + r} ${y + h}`)
  for (let i = 0; i <= cornerSteps; i++) {
    const angle = corners[2].startAngle + (corners[2].endAngle - corners[2].startAngle) * (i / cornerSteps)
    points.push(`L ${corners[2].cx + r * Math.cos(angle)} ${corners[2].cy + r * Math.sin(angle)}`)
  }

  points.push(`L ${x} ${y + r}`)
  for (let i = 0; i <= cornerSteps; i++) {
    const angle = corners[3].startAngle + (corners[3].endAngle - corners[3].startAngle) * (i / cornerSteps)
    points.push(`L ${corners[3].cx + r * Math.cos(angle)} ${corners[3].cy + r * Math.sin(angle)}`)
  }

  points.push('Z')
  return points.join(' ')
}

export default function RoughCard({
  children,
  className = '',
  strokeWidth = 2,
  stroke = 'rgba(255,255,255,0.4)',
  fill = 'rgba(255,255,255,0.08)',
  fillStyle = 'solid',
  roughness = 1.2,
  borderRadius = 30,
}: RoughCardProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const svg = svgRef.current
    if (!container || !svg) return

    const draw = () => {
      const { width, height } = container.getBoundingClientRect()
      svg.setAttribute('width', String(width))
      svg.setAttribute('height', String(height))
      svg.innerHTML = ''

      const rc = rough.svg(svg)
      const path = roundedRectPath(2, 2, width - 4, height - 4, borderRadius)
      const node = rc.path(path, {
        stroke,
        strokeWidth,
        fill,
        fillStyle,
        roughness,
        bowing: 1.5,
      })
      svg.appendChild(node)
    }

    draw()
    const observer = new ResizeObserver(draw)
    observer.observe(container)
    return () => observer.disconnect()
  }, [stroke, strokeWidth, fill, fillStyle, roughness, borderRadius])

  return (
    <div ref={containerRef} className={`relative backdrop-blur-md ${className}`} style={{ borderRadius }}>
      <svg
        ref={svgRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 0, overflow: 'visible' }}
      />
      <div className="relative flex flex-col items-center text-center" style={{ zIndex: 1 }}>
        {children}
      </div>
    </div>
  )
}
