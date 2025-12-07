import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { getProductBySlugServer, getProductsServer, getSettingsServer, getProductsForStaticGeneration } from "@/lib/store-server"
import { calculateDiscountPercentage, type Product } from "@/lib/store"
import { ExternalLink, ArrowLeft, Tag, Sparkles } from "lucide-react"
import Link from "next/link"

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlugServer(slug)

  if (!product) {
    return {
      title: "Produk Tidak Ditemukan | HudzStore",
    }
  }

  const settings = await getSettingsServer()
  const hasDiscount = product.original_price && product.original_price > product.price
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hudzstore.com"

  const productDescription = product.description || `Beli ${product.name} dengan harga terbaik di ${settings.siteName}. Produk digital premium berkualitas dengan garansi terpercaya.`
  const productTitle = `${product.name} | ${settings.siteName} - Produk Digital Premium`
  const categoryName = product.category === "gratis" ? "Produk Gratis" : "Produk Premium"
  const keywords = [
    product.name,
    "produk digital",
    "hudzstore",
    product.category,
    categoryName.toLowerCase(),
    "beli produk digital",
    "jual produk digital",
    "produk digital murah",
    "produk digital premium",
    "digital products indonesia",
    ...(product.name.split(" ").length > 1 ? product.name.split(" ") : []),
  ]

  return {
    title: productTitle,
    description: productDescription,
    keywords,
    authors: [{ name: settings.siteName }],
    openGraph: {
      title: productTitle,
      description: productDescription,
      type: "website",
      url: `${siteUrl}/produk/${product.slug || product.id}`,
      siteName: settings.siteName,
      locale: "id_ID",
      images: product.image
        ? [
            {
              url: product.image,
              width: 1200,
              height: 630,
              alt: `${product.name} - ${settings.siteName}`,
              type: "image/jpeg",
            },
          ]
        : [
            {
              url: `${siteUrl}/og-image.jpg`,
              width: 1200,
              height: 630,
              alt: productTitle,
            },
          ],
    },
    twitter: {
      card: "summary_large_image",
      title: productTitle,
      description: productDescription,
      creator: "@hudzstore",
      site: "@hudzstore",
      images: product.image ? [product.image] : [`${siteUrl}/og-image.jpg`],
    },
    alternates: {
      canonical: `${siteUrl}/produk/${product.slug || product.id}`,
    },
    other: {
      "product:price:amount": product.price.toString(),
      "product:price:currency": "IDR",
      "product:availability": "in stock",
      "product:condition": "new",
      "product:retailer": settings.siteName,
    },
  }
}

// Generate static params for better performance (optional)
export async function generateStaticParams() {
  const products = await getProductsForStaticGeneration()
  // Include both slug and ID for products without slug
  const params = products
    .filter((p) => p.slug || p.id)
    .map((product) => ({
      slug: product.slug || product.id,
    }))
  return params
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  // Parallel fetching for better performance
  const [product, settings, allProducts] = await Promise.all([
    getProductBySlugServer(slug),
    getSettingsServer(),
    getProductsServer(),
  ])

  if (!product) {
    notFound()
  }

  const hasDiscount = product.original_price && product.original_price > product.price
  const discountPercent = hasDiscount
    ? product.discount_percentage || calculateDiscountPercentage(product.original_price!, product.price)
    : 0

  // Get related products (same category, exclude current product)
  const relatedProducts = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3)

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hudzstore.com"
  
  // Enhanced Structured Data for SEO
  const productUrl = `${siteUrl}/produk/${product.slug || product.id}`
  const categoryName = product.category === "gratis" ? "Produk Gratis" : "Produk Premium"
  
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${productUrl}#product`,
    name: product.name,
    description: product.description || `Beli ${product.name} dengan harga terbaik di ${settings.siteName}`,
    image: product.image ? [product.image] : undefined,
    category: categoryName,
    brand: {
      "@type": "Brand",
      name: settings.siteName,
    },
    sku: product.id,
    mpn: product.slug || product.id,
    offers: {
      "@type": "Offer",
      "@id": `${productUrl}#offer`,
      price: product.price,
      priceCurrency: "IDR",
      availability: "https://schema.org/InStock",
      url: productUrl,
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: settings.siteName,
      },
      ...(hasDiscount && {
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: product.price,
          priceCurrency: "IDR",
          referenceQuantity: {
            "@type": "QuantitativeValue",
            value: 1,
          },
        },
        wasPrice: product.original_price,
      }),
    },
    aggregateOffer: hasDiscount
      ? {
          "@type": "AggregateOffer",
          priceCurrency: "IDR",
          lowPrice: product.price,
          highPrice: product.original_price,
          offerCount: 1,
        }
      : undefined,
    url: productUrl,
  }

  // Breadcrumb Structured Data
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: categoryName,
        item: `${siteUrl}#${product.category === "gratis" ? "gratis" : "produk"}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: productUrl,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <main className="min-h-screen bg-black text-white selection:bg-blue-500/30">
        <Navbar />
        <div className="pt-20 sm:pt-24 pb-12 sm:pb-16">
          <div className="container mx-auto px-4 sm:px-6">
            {/* Breadcrumbs */}
            <nav className="mb-6 sm:mb-8 flex items-center gap-2 text-xs sm:text-sm text-white/60">
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <span>/</span>
              <Link
                href={`#${product.category === "gratis" ? "gratis" : "produk"}`}
                className="hover:text-white transition-colors capitalize"
              >
                {product.category === "gratis" ? "Produk Gratis" : "Produk Premium"}
              </Link>
              <span>/</span>
              <span className="text-white line-clamp-1">{product.name}</span>
            </nav>

            {/* Back Button */}
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6 sm:mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm sm:text-base">Kembali ke Beranda</span>
            </Link>

            {/* Product Detail */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
              {/* Product Image */}
              <div className="relative">
                <div className="relative aspect-square rounded-2xl lg:rounded-3xl overflow-hidden bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border border-white/10">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain p-4 sm:p-6 lg:p-8"
                      loading="eager"
                      width={800}
                      height={800}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center min-h-[250px] sm:min-h-[300px] lg:min-h-[400px]">
                      <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-white/5 flex items-center justify-center">
                        {product.category === "gratis" ? (
                          <Sparkles className="w-12 h-12 sm:w-16 sm:h-16 text-green-400/50" />
                        ) : (
                          <Tag className="w-12 h-12 sm:w-16 sm:h-16 text-blue-400/50" />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Badge Container - Reserve space to prevent CLS */}
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4 lg:top-6 lg:right-6">
                    {hasDiscount && discountPercent > 0 && (
                      <div className="px-2 py-1 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs sm:text-sm font-bold rounded-full md:shadow-lg md:shadow-red-500/30 flex items-center gap-1 sm:gap-2">
                        <Tag className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="whitespace-nowrap">{discountPercent}% OFF</span>
                      </div>
                    )}
                    {product.category === "gratis" && !hasDiscount && (
                      <div className="px-2 py-1 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs sm:text-sm font-bold rounded-full md:shadow-lg md:shadow-green-500/30 flex items-center gap-1 sm:gap-2">
                        <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="whitespace-nowrap">GRATIS</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div className="flex flex-col justify-center">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  {product.name}
                </h1>

                <p className="text-white/70 text-base sm:text-lg mb-6 sm:mb-8 leading-relaxed">{product.description}</p>

                {/* Price Section */}
                <div className="mb-6 sm:mb-8">
                  {product.category === "gratis" ? (
                    <div className="text-3xl sm:text-4xl font-bold text-green-400">Gratis</div>
                  ) : (
                    <div className="space-y-2">
                      {hasDiscount ? (
                        <>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <span className="text-3xl sm:text-4xl font-bold text-blue-400">
                              Rp {product.price.toLocaleString("id-ID")}
                            </span>
                            <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-semibold w-fit">
                              Hemat {discountPercent}%
                            </span>
                          </div>
                          <div className="text-lg sm:text-xl text-white/60 line-through">
                            Rp {product.original_price!.toLocaleString("id-ID")}
                          </div>
                        </>
                      ) : (
                        <span className="text-3xl sm:text-4xl font-bold text-blue-400 block">
                          Rp {product.price.toLocaleString("id-ID")}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <a
                    href={product.marketplace_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-3 sm:py-4 px-6 sm:px-8 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl font-semibold text-base sm:text-lg transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 group active:scale-95"
                    style={{ touchAction: 'manipulation' }}
                  >
                    <span>{product.button_text || (product.category === "gratis" ? "Ambil Gratis" : "Beli Sekarang")}</span>
                    <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1" />
                  </a>
                </div>

                {/* Additional Info */}
                <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-white/10">
                  <div className="space-y-3 sm:space-y-4 text-sm text-white/60">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white/80">Kategori:</span>
                      <span className="capitalize">{product.category === "gratis" ? "Produk Gratis" : "Produk Premium"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
              <div className="mt-12 sm:mt-16">
                <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Produk Terkait</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {relatedProducts.map((relatedProduct) => {
                    const relatedSlug = relatedProduct.slug || relatedProduct.id
                    const hasRelatedDiscount =
                      relatedProduct.original_price && relatedProduct.original_price > relatedProduct.price

                    return (
                      <Link
                        key={relatedProduct.id}
                        href={`/produk/${relatedSlug}`}
                        className="group relative bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-sm md:backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden md:hover:border-blue-500/50 md:transition-all"
                        style={{ touchAction: 'manipulation' }}
                      >
                        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-blue-900/30 to-cyan-900/30">
                          {relatedProduct.image ? (
                            <img
                              src={relatedProduct.image}
                              alt={relatedProduct.name}
                              className="w-full h-full object-contain p-3 sm:p-4 transition-transform duration-700 group-hover:scale-105"
                              loading="lazy"
                              width={400}
                              height={300}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center min-h-[180px] sm:min-h-[200px]">
                              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/5 flex items-center justify-center">
                                {relatedProduct.category === "gratis" ? (
                                  <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-green-400/50" />
                                ) : (
                                  <Tag className="w-8 h-8 sm:w-10 sm:h-10 text-blue-400/50" />
                                )}
                              </div>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent hidden sm:block" />
                          {/* Reserve space for badge to prevent CLS */}
                          <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
                            {hasRelatedDiscount && (
                              <div className="px-2 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full">
                                DISKON
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="p-4 sm:p-6">
                          <h3 className="text-base sm:text-lg font-semibold mb-2 text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                            {relatedProduct.name}
                          </h3>
                          <div className="text-blue-400 font-semibold text-sm sm:text-base">
                            {relatedProduct.category === "gratis" ? (
                              "Gratis"
                            ) : (
                              <>Rp {relatedProduct.price.toLocaleString("id-ID")}</>
                            )}
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
        <Footer />
      </main>
    </>
  )
}

