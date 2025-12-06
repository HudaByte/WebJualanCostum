"use client"

import type React from "react"
import { ArrowDown } from "lucide-react"
import { useCallback, useMemo } from "react"
import type { SiteSettings } from "@/lib/store"
import { ScrollReveal } from "./scroll-reveal"

interface HeroClientProps {
  settings: SiteSettings
}

export function HeroClient({ settings }: HeroClientProps) {

  // Memoize callbacks to prevent re-renders - optimized for INP
  const scrollToProducts = useCallback((e?: React.MouseEvent) => {
    e?.preventDefault()
    // Use requestAnimationFrame for better INP
    requestAnimationFrame(() => {
      const element = document.querySelector("#produk")
      if (element) {
        element.scrollIntoView({ behavior: "smooth" })
      }
    })
  }, [])

  const scrollToGratis = useCallback((e?: React.MouseEvent) => {
    e?.preventDefault()
    requestAnimationFrame(() => {
      const element = document.querySelector("#gratis")
      if (element) element.scrollIntoView({ behavior: "smooth" })
    })
  }, [])

  // Memoize settings to prevent unnecessary re-renders
  const heroTitle = useMemo(() => settings?.heroTitle || "Produk Digital", [settings?.heroTitle])
  const heroSubtitle = useMemo(
    () => settings?.heroSubtitle || "Temukan berbagai produk digital berkualitas dengan harga terjangkau. Akses instant ke marketplace terpercaya.",
    [settings?.heroSubtitle]
  )

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 md:pt-28">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.3),rgba(0,0,0,0.8))]" />

      {/* Hectic Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="hectic-blob w-72 h-72 bg-purple-500/30 top-1/4 left-1/4 animate-blob" />
        <div className="hectic-blob w-96 h-96 bg-blue-500/20 bottom-1/4 right-1/4 animate-blob" style={{ animationDelay: '2s' }} />
        <div className="hectic-blob w-64 h-64 bg-pink-500/30 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-blob" style={{ animationDelay: '4s' }} />
        
        {/* Floating shapes */}
        <div className="absolute top-20 left-20 w-12 h-12 border-2 border-white/20 rounded-full animate-float-fast" />
        <div className="absolute bottom-40 right-20 w-20 h-20 border border-white/10 rotate-45 animate-spin-slow" />
        <div className="absolute top-1/3 right-1/3 w-4 h-4 bg-white/40 rounded-full animate-pulse-fast" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center">
        {/* Animated Badge */}
        <ScrollReveal animation="zoom" duration={0.6}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6 sm:mb-8 hover:scale-105 transition-transform duration-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-xs font-medium text-white/80 uppercase tracking-wider">
              Produk Digital Terpercaya
            </span>
          </div>
        </ScrollReveal>

        {/* Hero Title */}
        <ScrollReveal animation="blur" delay={0.2} duration={0.8}>
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-bold tracking-tighter mb-6 sm:mb-8 text-gradient leading-tight hover:scale-[1.02] transition-transform duration-500 cursor-default">
            {heroTitle}
            <br />
          </h1>
        </ScrollReveal>

        {/* Subtitle */}
        <ScrollReveal animation="blur" delay={0.4} duration={0.8}>
          <p className="text-base sm:text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-8 sm:mb-12 leading-relaxed px-4">
            {heroSubtitle}
          </p>
        </ScrollReveal>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
          <ScrollReveal animation="left" delay={0.6} duration={0.6} className="w-full sm:w-auto">
            <button
              onClick={scrollToProducts}
              className="group relative w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-black rounded-full font-semibold text-base sm:text-lg overflow-hidden spring-300 hover:scale-110 hover:-rotate-2 active:scale-95 touch-manipulation shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]"
              aria-label="Lihat Produk"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Lihat Produk{" "}
                <ArrowDown className="w-4 h-4 group-hover:translate-y-1 spring-300" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-white opacity-0 group-hover:opacity-100 spring-300" />
            </button>
          </ScrollReveal>
          
          <ScrollReveal animation="right" delay={0.6} duration={0.6} className="w-full sm:w-auto">
            <button
              onClick={scrollToGratis}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 glass rounded-full font-semibold text-base sm:text-lg text-white hover:bg-white/10 spring-300 hover:scale-110 hover:rotate-2 active:scale-95 flex items-center justify-center gap-2 touch-manipulation hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              aria-label="Produk Gratis"
            >
              Produk Gratis
            </button>
          </ScrollReveal>
        </div>

        {/* Scroll Indicator */}
        <ScrollReveal animation="up" delay={0.8} duration={0.6}>
          <div className="mt-12 sm:mt-16 flex flex-col items-center gap-2 animate-bounce">
            <span className="text-xs text-white/40 uppercase tracking-widest">Scroll</span>
            <div className="w-[1px] h-12 bg-gradient-to-b from-white/0 via-white/40 to-white/0" />
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
