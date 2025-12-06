"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { getSettings, type SiteSettings } from "@/lib/store"
import { ScrollReveal } from "./scroll-reveal"

export function Footer() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)

  useEffect(() => {
    async function loadSettings() {
      const data = await getSettings()
      setSettings(data)
    }
    loadSettings()
  }, [])

  return (
    <footer className="relative pt-32 pb-12 overflow-hidden" style={{ minHeight: '400px' }}>
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      {/* Background blobs for footer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
         <div className="hectic-blob w-64 h-64 bg-blue-900/10 bottom-0 left-0 animate-blob" />
         <div className="hectic-blob w-48 h-48 bg-purple-900/10 top-0 right-0 animate-blob" style={{ animationDelay: '3s' }} />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-20">
          <ScrollReveal animation="blur" delay={0}>
            <div>
              <Link href="/" className="text-2xl font-bold tracking-tighter mb-6 block group">
                {settings?.siteName || "HudzStore"}
                <span className="text-blue-400 group-hover:animate-bounce inline-block">.</span>
              </Link>
              <p className="text-white/50 leading-relaxed">
                {settings?.tagline || "Produk digital berkualitas dengan harga terjangkau"}
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="blur" delay={0.2}>
            <div>
              <h4 className="font-semibold mb-6">Menu</h4>
              <ul className="space-y-4 text-white/60">
                <li>
                  <Link href="/produk" className="hover:text-white transition-colors hover:translate-x-2 inline-block duration-200">
                    Produk
                  </Link>
                </li>
                <li>
                  <Link href="/gratis" className="hover:text-white transition-colors hover:translate-x-2 inline-block duration-200">
                    Gratis
                  </Link>
                </li>
                <li>
                  <a
                    href={settings?.communityLink || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors hover:translate-x-2 inline-block duration-200"
                  >
                    Komunitas
                  </a>
                </li>
              </ul>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="blur" delay={0.4}>
            <div>
              <h4 className="font-semibold mb-6">Hubungi Kami</h4>
              <p className="text-white/60 mb-4">Ada pertanyaan?</p>
              <a
                href={settings?.communityLink || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xl font-medium hover:text-blue-400 transition-colors inline-block hover:scale-105 duration-300"
              >
                Gabung Channel WA
              </a>
            </div>
          </ScrollReveal>
        </div>

        <ScrollReveal animation="blur" delay={0.6}>
          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/5 text-sm text-white/40">
            <p>&copy; 2025 {settings?.siteName || "HodewaStore"}. All rights reserved.</p>
          </div>
        </ScrollReveal>
      </div>
    </footer>
  )
}
