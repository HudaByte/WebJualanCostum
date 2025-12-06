"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface AuroraProps {
  className?: string
  showRadialGradient?: boolean
  children?: React.ReactNode
}

export function Aurora({ className, showRadialGradient = true, children }: AuroraProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()
  const [isVisible, setIsVisible] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const observerRef = useRef<IntersectionObserver>()

  useEffect(() => {
    // Lazy load - only start when visible
    const canvas = canvasRef.current
    if (!canvas) return

    // Intersection Observer to pause when not visible
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
        setIsPaused(!entry.isIntersecting)
      },
      { threshold: 0 }
    )
    observerRef.current.observe(canvas)

    // Delay initialization to not block LCP
    const initTimeout = setTimeout(() => {
      const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true })
      if (!ctx) return

      let time = 0
      let lastFrameTime = performance.now()
      const targetFPS = 30 // Reduce from 60fps to 30fps for better performance
      const frameInterval = 1000 / targetFPS

      const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2) // Limit DPR for performance
        canvas.width = window.innerWidth * dpr
        canvas.height = window.innerHeight * dpr
        ctx.scale(dpr, dpr)
        canvas.style.width = `${window.innerWidth}px`
        canvas.style.height = `${window.innerHeight}px`
      }

      resize()
      const resizeHandler = () => {
        requestAnimationFrame(resize)
      }
      window.addEventListener("resize", resizeHandler, { passive: true })

      const animate = (currentTime: number) => {
        if (isPaused || !isVisible) {
          animationFrameRef.current = requestAnimationFrame(animate)
          return
        }

        const elapsed = currentTime - lastFrameTime
        if (elapsed < frameInterval) {
          animationFrameRef.current = requestAnimationFrame(animate)
          return
        }

        lastFrameTime = currentTime - (elapsed % frameInterval)
        time += 0.003 // Slower animation

        ctx.clearRect(0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1))

        // Simplified gradient - less calculations
        const gradient = ctx.createLinearGradient(0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1))
        gradient.addColorStop(0, `rgba(59, 130, 246, ${0.12 + Math.sin(time) * 0.08})`)
        gradient.addColorStop(0.5, `rgba(6, 182, 212, ${0.12 + Math.cos(time * 1.2) * 0.08})`)
        gradient.addColorStop(1, `rgba(99, 102, 241, ${0.12 + Math.sin(time * 0.8) * 0.08})`)

        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1))

        // Reduced waves from 3 to 2 for better performance
        for (let i = 0; i < 2; i++) {
          const waveY = (canvas.height / (window.devicePixelRatio || 1)) / 2 + Math.sin(time + i * 2) * 80
          const waveX = (canvas.width / (window.devicePixelRatio || 1)) / 2 + Math.cos(time * 0.5 + i) * 150

          const waveGradient = ctx.createRadialGradient(waveX, waveY, 0, waveX, waveY, 250)
          waveGradient.addColorStop(0, `rgba(59, 130, 246, ${0.25})`)
          waveGradient.addColorStop(1, "rgba(59, 130, 246, 0)")

          ctx.fillStyle = waveGradient
          ctx.beginPath()
          ctx.arc(waveX, waveY, 250, 0, Math.PI * 2)
          ctx.fill()
        }

        animationFrameRef.current = requestAnimationFrame(animate)
      }

      // Start animation after a small delay to not block initial render
      const startTimeout = setTimeout(() => {
        animationFrameRef.current = requestAnimationFrame(animate)
      }, 100)

      return () => {
        clearTimeout(initTimeout)
        clearTimeout(startTimeout)
        window.removeEventListener("resize", resizeHandler)
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
        if (observerRef.current) {
          observerRef.current.disconnect()
        }
      }
    }, 200) // Delay initialization

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [isPaused, isVisible])

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ willChange: "transform" }}
      />
      {showRadialGradient && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.3),rgba(0,0,0,0.8))]" />
      )}
      {children && <div className="relative z-10">{children}</div>}
    </div>
  )
}


