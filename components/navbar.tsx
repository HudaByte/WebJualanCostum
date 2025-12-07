"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { getSettings, type SiteSettings } from "@/lib/store"

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [settings, setSettings] = useState<SiteSettings | null>(null)

  useEffect(() => {
    async function fetchSettings() {
      const data = await getSettings()
      setSettings(data)
    }
    fetchSettings()
  }, [])

  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 50)
          ticking = false
        })
        ticking = true
      }
    }
    
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobileMenuOpen) {
        const target = event.target as HTMLElement
        if (!target.closest('[data-mobile-menu]')) {
          setIsMobileMenuOpen(false)
        }
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMobileMenuOpen])

  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "Produk", href: "#produk" },
    { name: "Gratis", href: "#gratis" },
    { name: "Channel WA", href: settings?.communityLink || "#", external: true },
  ]

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault()
      const element = document.querySelector(href)
      if (element) {
        element.scrollIntoView({ behavior: "smooth" })
      }
      setIsMobileMenuOpen(false)
    }
  }

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 px-4 md:px-6 pt-4 md:pt-6 pb-0 spring-500", // animate-slideDown - DISABLED
          isScrolled ? "pt-2 md:pt-4" : "",
        )}
        style={{ minHeight: '80px', height: isScrolled ? '70px' : '80px' }}
      >
        <div className="relative max-w-7xl mx-auto" data-mobile-menu>
          <div
            className={cn(
              "rounded-2xl md:rounded-full spring-500 flex items-center justify-between px-4 md:px-6 py-3",
              "glass bg-black/60 backdrop-blur-xl border border-white/10",
            )}
          >
            <a
              href="#home"
              onClick={(e) => scrollToSection(e, "#home")}
              className="text-xl md:text-2xl font-bold tracking-tighter cursor-pointer"
            >
              {settings?.siteName || "HudzStore"}
              <span className="text-blue-400">.</span>
            </a>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) =>
                link.external ? (
                  <a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-white/70 hover:text-white transition-colors relative group"
                  >
                    {link.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-400 transition-all group-hover:w-full" />
                  </a>
                ) : (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => scrollToSection(e, link.href)}
                    className="text-sm font-medium text-white/70 hover:text-white transition-colors cursor-pointer relative group"
                  >
                    {link.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-400 transition-all group-hover:w-full" />
                  </a>
                ),
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Dropdown Menu */}
          {isMobileMenuOpen && (
            <div
              className={cn(
                "absolute top-full left-0 right-0 mt-2 md:hidden z-50",
                "glass bg-white/10 backdrop-blur-xl border border-white/20",
                "rounded-2xl shadow-2xl shadow-black/20",
                "overflow-hidden spring-300",
                // "animate-fadeInDown" - DISABLED
              )}
            >
              <div className="flex flex-col p-2">
                {navLinks.map((link, index) => (
                  <div
                    key={link.name}
                    // className="animate-fadeInUp" - DISABLED
                    // style={{
                    //   animationDelay: `${index * 0.05}s`,
                    //   animationFillMode: "both",
                    // }}
                  >
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block px-4 py-3 text-base font-medium text-white/90 hover:text-white hover:bg-white/10 rounded-lg spring-300 transition-colors"
                      >
                        {link.name}
                      </a>
                    ) : (
                      <a
                        href={link.href}
                        onClick={(e) => scrollToSection(e, link.href)}
                        className="block px-4 py-3 text-base font-medium text-white/90 hover:text-white hover:bg-white/10 rounded-lg spring-300 transition-colors cursor-pointer"
                      >
                        {link.name}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>

    </>
  )
}
