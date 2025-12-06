"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface AnimatedContentProps {
  children: React.ReactNode
  className?: string
  direction?: "up" | "down" | "left" | "right"
  delay?: number
  duration?: number
  threshold?: number
  once?: boolean
}

export function AnimatedContent({
  children,
  className,
  direction = "up",
  delay = 0,
  duration = 0.6,
  threshold = 0.1,
  once = true,
}: AnimatedContentProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener("change", handleChange)

    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (once) {
            observer.unobserve(element)
          }
        } else if (!once) {
          setIsVisible(false)
        }
      },
      { threshold }
    )

    observer.observe(element)

    return () => {
      mediaQuery.removeEventListener("change", handleChange)
      observer.disconnect()
    }
  }, [threshold, once])

  const directionClasses = {
    up: "translate-y-8",
    down: "-translate-y-8",
    left: "translate-x-8",
    right: "-translate-x-8",
  }

  // Skip animation if reduced motion is preferred
  if (prefersReducedMotion) {
    return <div className={cn(className)}>{children}</div>
  }

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all ease-out",
        isVisible ? "opacity-100 translate-x-0 translate-y-0" : `opacity-0 ${directionClasses[direction]}`,
        className
      )}
      style={{
        transitionDuration: `${duration}s`,
        transitionDelay: `${delay}s`,
        willChange: isVisible ? "auto" : "transform, opacity",
      }}
    >
      {children}
    </div>
  )
}


