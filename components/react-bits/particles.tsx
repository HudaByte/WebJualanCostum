"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface ParticlesProps {
  className?: string
  quantity?: number
  staticity?: number
  ease?: number
  size?: number
  refresh?: boolean
  color?: string
  vx?: number
  vy?: number
}

export function Particles({
  className,
  quantity = 30,
  staticity = 50,
  ease = 50,
  size = 0.4,
  refresh = false,
  color = "#3b82f6",
  vx = 0,
  vy = 0,
}: ParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Array<{
    x: number
    y: number
    vx: number
    vy: number
    radius: number
  }>>([])
  const animationFrameRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resize()
    window.addEventListener("resize", resize)

    // Initialize particles
    const initParticles = () => {
      particlesRef.current = []
      for (let i = 0; i < quantity; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5 + vx,
          vy: (Math.random() - 0.5) * 0.5 + vy,
          radius: Math.random() * size,
        })
      }
    }

    initParticles()

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particlesRef.current.forEach((particle, i) => {
        particle.x += particle.vx
        particle.y += particle.vy

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1

        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.fill()

        // Draw connections
        particlesRef.current.slice(i + 1).forEach((particle2) => {
          const dx = particle.x - particle2.x
          const dy = particle.y - particle2.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 100) {
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(particle2.x, particle2.y)
            ctx.strokeStyle = color
            ctx.globalAlpha = (100 - distance) / 100 * 0.2
            ctx.lineWidth = 0.5
            ctx.stroke()
            ctx.globalAlpha = 1
          }
        })
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resize)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [quantity, staticity, ease, size, refresh, color, vx, vy])

  return (
    <canvas
      ref={canvasRef}
      className={cn("absolute inset-0 w-full h-full pointer-events-none", className)}
      style={{ willChange: "transform" }}
    />
  )
}


