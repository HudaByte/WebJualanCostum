"use client"

import { useMemo } from "react"
import Link from "next/link"
import { ExternalLink, ShoppingCart, Gift, Sparkles, Zap, Tag } from "lucide-react"
import { type Product, calculateDiscountPercentage } from "@/lib/store"
import { ScrollReveal } from "./scroll-reveal"
import { useProductsRealtime } from "@/hooks/use-products-realtime"

export function ProductSection() {
  // Use real-time hook untuk auto-update products tanpa reload
  const { products: allProducts, loading } = useProductsRealtime()

  // Filter products berdasarkan category - akan auto-update saat products berubah
  const paidProducts = useMemo(
    () => allProducts.filter((p) => p.category === "produk"),
    [allProducts]
  )
  const freeProducts = useMemo(
    () => allProducts.filter((p) => p.category === "gratis"),
    [allProducts]
  )

  const ProductCard = ({ product, index }: { product: Product; index: number }) => {
    const hasDiscount = product.original_price && product.original_price > product.price
    const discountPercent = hasDiscount
      ? product.discount_percentage || calculateDiscountPercentage(product.original_price!, product.price)
      : 0
    const productSlug = product.slug || product.id
    const productUrl = `/produk/${productSlug}`

    return (
      <ScrollReveal animation="up" delay={index * 0.1}>
        <div className="group relative">
          {/* Glow effect on hover */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl opacity-0 group-hover:opacity-30 blur-xl spring-500 will-change-[opacity]" />

          <div className="relative h-full bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
            {/* Image Container - Fixed aspect ratio with object-contain */}
            <Link href={productUrl} prefetch={true} className="block">
              <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-blue-900/30 to-cyan-900/30 cursor-pointer">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-contain p-4 spring-500 group-hover:scale-105 will-change-transform"
                    style={{ contentVisibility: "auto" }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center">
                      {product.category === "gratis" ? (
                        <Gift className="w-10 h-10 text-green-400/50" />
                      ) : (
                        <ShoppingCart className="w-10 h-10 text-blue-400/50" />
                      )}
                    </div>
                  </div>
                )}

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Discount Badge */}
                {hasDiscount && discountPercent > 0 && (
                  <div className="absolute top-4 right-4 px-3 py-1.5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg shadow-red-500/30 flex items-center gap-1 z-10 animate-pulse-fast">
                    <Tag className="w-3 h-3" />
                    {discountPercent}% OFF
                  </div>
                )}

                {/* Free Badge */}
                {product.category === "gratis" && (
                  <div className="absolute top-4 right-4 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full shadow-lg shadow-green-500/30 flex items-center gap-1 z-10 animate-bounce">
                    <Sparkles className="w-3 h-3" />
                    GRATIS
                  </div>
                )}

                {/* Price overlay */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex flex-col gap-1">
                    {product.category === "gratis" ? (
                      <span className="text-2xl font-bold text-green-400 drop-shadow-lg">Gratis</span>
                    ) : hasDiscount ? (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-blue-400 drop-shadow-lg">
                            Rp {product.price.toLocaleString("id-ID")}
                          </span>
                        </div>
                        <span className="text-sm text-white/60 line-through drop-shadow-md">
                          Rp {product.original_price!.toLocaleString("id-ID")}
                        </span>
                      </>
                    ) : (
                      <span className="text-2xl font-bold text-blue-400 drop-shadow-lg">
                        Rp {product.price.toLocaleString("id-ID")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>

            {/* Content */}
            <div className="p-6">
              <Link href={productUrl} prefetch={true}>
                <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-blue-400 transition-colors line-clamp-1 cursor-pointer">
                  {product.name}
                </h3>
              </Link>
              <p className="text-white/50 text-sm mb-5 line-clamp-2 min-h-[40px]">{product.description}</p>

              <div className="flex flex-col sm:flex-row gap-2">
                <Link
                  href={productUrl}
                  prefetch={true}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 sm:py-3 px-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium spring-300 border border-white/10 text-sm sm:text-base touch-manipulation active:scale-95"
                >
                  Lihat Detail
                </Link>
                <a
                  href={product.marketplace_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 sm:py-3 px-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl font-medium spring-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 group/btn text-sm sm:text-base touch-manipulation active:scale-95"
                >
                  <span>{product.button_text || (product.category === "gratis" ? "Ambil" : "Beli")}</span>
                  <ExternalLink className="w-4 h-4 spring-300 group-hover/btn:translate-x-1" />
                </a>
              </div>
            </div>

            {/* Decorative corner accent */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/20 to-transparent rounded-bl-[100px]" />
          </div>
        </div>
      </ScrollReveal>
    )
  }

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="relative">
          <div className="h-[400px] bg-gradient-to-b from-white/[0.08] to-white/[0.02] rounded-3xl border border-white/10 animate-pulse">
            <div className="aspect-[4/3] bg-white/5" />
            <div className="p-6 space-y-4">
              <div className="h-6 bg-white/10 rounded-lg w-3/4" />
              <div className="h-4 bg-white/5 rounded-lg w-full" />
              <div className="h-4 bg-white/5 rounded-lg w-2/3" />
              <div className="h-12 bg-white/10 rounded-xl mt-4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const EmptyState = ({ message, icon: Icon }: { message: string; icon: typeof ShoppingCart }) => {
    return (
      <ScrollReveal animation="zoom">
        <div className="text-center py-16">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-3xl blur-2xl" />
            <div className="relative bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-xl rounded-3xl border border-white/10 p-8 sm:p-12 max-w-md">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 rounded-2xl bg-white/5 flex items-center justify-center animate-bounce">
                <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-white/30" />
              </div>
              <p className="text-white/50 text-base sm:text-lg px-4">{message}</p>
            </div>
          </div>
        </div>
      </ScrollReveal>
    )
  }

  const SectionHeader = ({
    icon: Icon,
    title,
    subtitle,
    gradientFrom,
    gradientTo,
  }: {
    icon: typeof ShoppingCart
    title: string
    subtitle: string
    gradientFrom: string
    gradientTo: string
  }) => {
    return (
      <div className="mb-12 sm:mb-16 text-center md:text-left relative z-10">
        <ScrollReveal animation="left">
          <div className="inline-flex items-center gap-2 sm:gap-3 mb-4 px-3 sm:px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
            <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${gradientFrom === "blue" ? "text-blue-400" : "text-green-400"} animate-pulse`} />
            <span className="text-xs sm:text-sm font-medium text-white/70">
              {gradientFrom === "blue" ? "Premium Collection" : "Free Resources"}
            </span>
          </div>
        </ScrollReveal>

        <ScrollReveal animation="blur" delay={0.1}>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4">
            <span
              className={`bg-gradient-to-r from-${gradientFrom}-400 to-${gradientTo}-400 bg-clip-text text-transparent`}
            >
              {title}
            </span>
          </h2>
        </ScrollReveal>

        <ScrollReveal animation="blur" delay={0.2}>
          <p className="text-white/50 text-base sm:text-lg max-w-2xl px-4 md:px-0">
            {subtitle}
          </p>
        </ScrollReveal>

        <ScrollReveal animation="right" delay={0.3}>
          <div
            className={`h-1 w-20 sm:w-24 bg-gradient-to-r from-${gradientFrom}-500 to-${gradientTo}-500 rounded-full mt-4 sm:mt-6 mx-auto md:mx-0 animate-pulse`}
          />
        </ScrollReveal>
      </div>
    )
  }

  return (
    <>
      {/* Produk Berbayar Section */}
      <section id="produk" className="py-24 md:py-32 relative scroll-mt-24">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[150px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" />
          
          {/* Hectic Blobs */}
          <div className="hectic-blob w-32 h-32 bg-blue-400/20 top-10 right-10 animate-blob" />
          <div className="hectic-blob w-40 h-40 bg-purple-400/20 bottom-20 left-20 animate-blob animation-delay-2000" style={{ animationDelay: '2s' }} />

          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <SectionHeader
            icon={Zap}
            title="Produk Premium"
            subtitle="Koleksi produk digital berkualitas tinggi untuk meningkatkan produktivitas dan kreativitas Anda"
            gradientFrom="blue"
            gradientTo="cyan"
          />

          {loading ? (
            <LoadingSkeleton />
          ) : paidProducts.length === 0 ? (
            <EmptyState message="Belum ada produk premium tersedia" icon={ShoppingCart} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {paidProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Produk Gratis Section */}
      <section id="gratis" className="py-24 md:py-32 relative scroll-mt-24">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[150px] animate-pulse" />
          <div className="absolute bottom-1/3 left-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />

           {/* Hectic Blobs */}
           <div className="hectic-blob w-48 h-48 bg-green-400/20 top-1/2 left-10 animate-blob" />
           <div className="hectic-blob w-24 h-24 bg-yellow-400/20 bottom-10 right-10 animate-blob animation-delay-4000" style={{ animationDelay: '4s' }} />
           
           {/* Floating shapes */}
           <div className="absolute top-20 right-20 w-8 h-8 border border-white/20 rounded-lg animate-spin-slow" />
           <div className="absolute bottom-40 left-10 w-4 h-4 bg-emerald-400/40 rounded-full animate-float-fast" />

          {/* Diagonal lines pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.01)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.01)_50%,rgba(255,255,255,0.01)_75%,transparent_75%)] bg-[size:60px_60px]" />
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <SectionHeader
            icon={Gift}
            title="Produk Gratis"
            subtitle="Download gratis berbagai resource digital pilihan tanpa biaya apapun"
            gradientFrom="green"
            gradientTo="emerald"
          />

          {loading ? (
            <LoadingSkeleton />
          ) : freeProducts.length === 0 ? (
            <EmptyState message="Belum ada produk gratis tersedia" icon={Gift} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {freeProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
