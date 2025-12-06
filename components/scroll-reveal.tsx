"use client"

import type React from "react"
import { useIntersection } from "@/hooks/use-intersection"
import { cn } from "@/lib/utils"

interface ScrollRevealProps {
  children: React.ReactNode
  className?: string
  animation?: "up" | "left" | "right" | "zoom" | "blur"
  delay?: number
  duration?: number
}

export function ScrollReveal({ 
  children, 
  className, 
  animation = "up", 
  delay = 0,
  duration = 0.8
}: ScrollRevealProps) {
  const { ref, isIntersecting } = useIntersection({ threshold: 0.1 })
  
  const animationClass = {
    up: "reveal-on-scroll",
    left: "reveal-left",
    right: "reveal-right",
    zoom: "reveal-zoom",
    blur: "reveal-blur"
  }[animation]

  return (
    <div
      ref={ref}
      className={cn(
        animationClass,
        isIntersecting && "is-visible",
        className
      )}
      style={{
        transitionDelay: `${delay}s`,
        transitionDuration: `${duration}s`
      }}
    >
      {children}
    </div>
  )
}
