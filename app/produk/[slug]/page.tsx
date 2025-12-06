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
        <div className="pt-24 pb-16" style={{ minHeight: 'calc(100vh - 80px)' }}>
          <div className="container mx-auto px-4 md:px-6">
            {/* Breadcrumbs */}
            <nav className="mb-8 flex items-center gap-2 text-sm text-white/60" style={{ minHeight: '24px' }}>
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
              className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-8"
              style={{ minHeight: '32px' }}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Beranda</span>
            </Link>

            {/* Product Detail */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
              {/* Product Image */}
              <div className="relative">
                <div className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border border-white/10" style={{ minHeight: '400px', aspectRatio: '1 / 1' }}>
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain p-8"
                      loading="eager"
                      width={800}
                      height={800}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ minHeight: '400px' }}>
                      <div className="w-32 h-32 rounded-2xl bg-white/5 flex items-center justify-center">
                        {product.category === "gratis" ? (
                          <Sparkles className="w-16 h-16 text-green-400/50" />
                        ) : (
                          <Tag className="w-16 h-16 text-blue-400/50" />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Badge Container - Reserve space to prevent CLS */}
                  <div className="absolute top-6 right-6" style={{ minHeight: '32px', minWidth: (hasDiscount && discountPercent > 0) || product.category === "gratis" ? '120px' : '0' }}>
                    {hasDiscount && discountPercent > 0 && (
                      <div className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-bold rounded-full md:shadow-lg md:shadow-red-500/30 flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        {discountPercent}% OFF
                      </div>
                    )}
                    {product.category === "gratis" && !hasDiscount && (
                      <div className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold rounded-full md:shadow-lg md:shadow-green-500/30 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        GRATIS
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div className="flex flex-col justify-center" style={{ minHeight: '400px' }}>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent" style={{ minHeight: '60px' }}>
                  {product.name}
                </h1>

                <p className="text-white/70 text-lg mb-8 leading-relaxed" style={{ minHeight: '80px' }}>{product.description}</p>

                {/* Price Section */}
                <div className="mb-8" style={{ minHeight: '80px' }}>
                  {product.category === "gratis" ? (
                    <div className="text-4xl font-bold text-green-400" style={{ minHeight: '48px' }}>Gratis</div>
                  ) : (
                    <div className="space-y-2" style={{ minHeight: '80px' }}>
                      {hasDiscount ? (
                        <>
                          <div className="flex items-center gap-4" style={{ minHeight: '48px' }}>
                            <span className="text-4xl font-bold text-blue-400">
                              Rp {product.price.toLocaleString("id-ID")}
                            </span>
                            <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-semibold">
                              Hemat {discountPercent}%
                            </span>
                          </div>
                          <div className="text-xl text-white/60 line-through" style={{ minHeight: '28px' }}>
                            Rp {product.original_price!.toLocaleString("id-ID")}
                          </div>
                        </>
                      ) : (
                        <span className="text-4xl font-bold text-blue-400" style={{ minHeight: '48px', display: 'block' }}>
                          Rp {product.price.toLocaleString("id-ID")}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href={product.marketplace_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-4 px-8 bg-gradient-to-r from-blue-500 to-cyan-500 md:hover:from-blue-600 md:hover:to-cyan-600 text-white rounded-xl font-semibold text-lg md:transition-all duration-300 md:shadow-lg md:shadow-blue-500/25 md:hover:shadow-blue-500/40 group"
                    style={{ touchAction: 'manipulation' }}
                  >
                    <span>{product.button_text || (product.category === "gratis" ? "Ambil Gratis" : "Beli Sekarang")}</span>
                    <ExternalLink className="w-5 h-5 md:transition-transform md:group-hover:translate-x-1" />
                  </a>
                </div>

                {/* Additional Info */}
                <div className="mt-8 pt-8 border-t border-white/10">
                  <div className="space-y-4 text-sm text-white/60">
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
              <div className="mt-16" style={{ minHeight: '400px' }}>
                <h2 className="text-3xl font-bold mb-8" style={{ minHeight: '40px' }}>Produk Terkait</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-blue-900/30 to-cyan-900/30" style={{ minHeight: '200px', aspectRatio: '4 / 3' }}>
                          {relatedProduct.image ? (
                            <img
                              src={relatedProduct.image}
                              alt={relatedProduct.name}
                              className="w-full h-full object-contain p-4 md:transition-transform md:duration-700 md:group-hover:scale-105"
                              loading="lazy"
                              width={400}
                              height={300}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center" style={{ minHeight: '200px' }}>
                              <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center">
                                {relatedProduct.category === "gratis" ? (
                                  <Sparkles className="w-10 h-10 text-green-400/50" />
                                ) : (
                                  <Tag className="w-10 h-10 text-blue-400/50" />
                                )}
                              </div>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent hidden md:block" />
                          {/* Reserve space for badge to prevent CLS */}
                          <div className="absolute top-4 right-4" style={{ minHeight: '24px', minWidth: hasRelatedDiscount ? '70px' : '0' }}>
                            {hasRelatedDiscount && (
                              <div className="px-2 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full">
                                DISKON
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="p-6" style={{ minHeight: '100px' }}>
                          <h3 className="text-lg font-semibold mb-2 text-white md:group-hover:text-blue-400 md:transition-colors line-clamp-1" style={{ minHeight: '28px' }}>
                            {relatedProduct.name}
                          </h3>
                          <div className="text-blue-400 font-semibold" style={{ minHeight: '24px' }}>
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

