import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { HeroClient } from "@/components/hero"
import { Footer } from "@/components/footer"
import { ProductSection } from "@/components/product-section"
import { getSettingsServer, getProductsServer } from "@/lib/store-server"

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettingsServer()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hudzstore.com"
  const description = settings.tagline || "Temukan berbagai produk digital berkualitas dengan harga terjangkau. Jual beli produk digital premium Indonesia, template, script, dan tools digital terbaik."

  return {
    title: `${settings.siteName} | Produk Digital Premium & Template Terbaik Indonesia`,
    description,
    keywords: [
      "produk digital",
      "digital products",
      "premium",
      "indonesia",
      "hudzstore",
      "jual produk digital",
      "beli produk digital",
      "template premium",
      "script premium",
      "tools digital",
      "produk digital murah",
      "marketplace produk digital",
      "digital marketplace indonesia",
      "produk digital terpercaya",
      "jual beli digital",
      "ecommerce produk digital",
      "digital store",
      "toko online produk digital",
    ],
    openGraph: {
      title: `${settings.siteName} | Produk Digital Premium & Template Terbaik Indonesia`,
      description,
      type: "website",
      url: siteUrl,
      siteName: settings.siteName,
      locale: "id_ID",
      images: [
        {
          url: `${siteUrl}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: `${settings.siteName} - Produk Digital Premium Indonesia`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${settings.siteName} | Produk Digital Premium & Template Terbaik`,
      description,
      creator: "@hudzstore",
      site: "@hudzstore",
      images: [`${siteUrl}/og-image.jpg`],
    },
    alternates: {
      canonical: siteUrl,
    },
  }
}

export default async function Home() {
  const settings = await getSettingsServer()
  const products = await getProductsServer()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hudzstore.com"

  // Structured Data for Organization
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: settings.siteName,
    description: settings.tagline || "Marketplace produk digital premium terpercaya di Indonesia",
    url: siteUrl,
    logo: {
      "@type": "ImageObject",
      url: `${siteUrl}/logo.png`,
      width: 512,
      height: 512,
    },
    sameAs: settings.communityLink ? [settings.communityLink] : [],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      availableLanguage: ["Indonesian", "English"],
    },
    areaServed: {
      "@type": "Country",
      name: "Indonesia",
    },
  }

  // Structured Data for Website
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: settings.siteName,
    url: siteUrl,
    description: settings.tagline || "Marketplace produk digital premium terpercaya di Indonesia",
    publisher: {
      "@id": `${siteUrl}/#organization`,
    },
    inLanguage: "id-ID",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  }

  // Structured Data for ItemList (Products) - Enhanced
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${siteUrl}/#itemlist`,
    name: "Daftar Produk Digital Premium",
    description: "Koleksi produk digital premium terbaik dengan harga terjangkau",
    numberOfItems: products.length,
    itemListElement: products.slice(0, 20).map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        "@id": `${siteUrl}/produk/${product.slug || product.id}`,
        name: product.name,
        description: product.description || `Beli ${product.name} dengan harga terbaik`,
        image: product.image ? [product.image] : undefined,
        category: product.category === "gratis" ? "Produk Gratis" : "Produk Premium",
        brand: {
          "@type": "Brand",
          name: settings.siteName,
        },
        offers: {
          "@type": "Offer",
          price: product.price,
          priceCurrency: "IDR",
          availability: "https://schema.org/InStock",
          url: `${siteUrl}/produk/${product.slug || product.id}`,
          priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          ...(product.original_price && product.original_price > product.price && {
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
        url: `${siteUrl}/produk/${product.slug || product.id}`,
      },
    })),
  }

  // Structured Data for BreadcrumbList (Homepage)
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
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <main className="min-h-screen bg-black text-white selection:bg-blue-500/30">
        <Navbar />
        <HeroClient settings={settings} />
        <ProductSection />
        <Footer />
      </main>
    </>
  )
}
