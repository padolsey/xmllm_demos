'use client'

import { useEffect, useRef } from 'react'

export default function VectorAnimation({ isRunning }: { isRunning: boolean }) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!isRunning || !svgRef.current) return

    // Create new path every few seconds
    const interval = setInterval(() => {
      const svg = svgRef.current
      if (!svg) return

      // Create random path
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      const start = `${Math.random() * 100} ${Math.random() * 100}`
      const end = `${Math.random() * 100} ${Math.random() * 100}`
      path.setAttribute('d', `M ${start} C ${start} ${end} ${end}`)
      path.setAttribute('stroke', '#3b82f6')
      path.setAttribute('stroke-width', '0.5')
      path.setAttribute('fill', 'none')
      path.setAttribute('opacity', '0')

      // Animate path
      path.animate(
        [
          { opacity: 0, strokeDashoffset: 1000 },
          { opacity: 0.2, strokeDashoffset: 0 },
          { opacity: 0, strokeDashoffset: -1000 }
        ],
        {
          duration: 4000,
          easing: 'ease-in-out'
        }
      )

      svg.appendChild(path)
      setTimeout(() => path.remove(), 4000)
    }, 500)

    return () => clearInterval(interval)
  }, [isRunning])

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    />
  )
} 