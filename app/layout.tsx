import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { getSettingsServer } from "@/lib/store-server"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "arial"],
})

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettingsServer()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hudzstore.com"
  const description = settings.tagline || "Temukan berbagai produk digital berkualitas dengan harga terjangkau. Jual beli produk digital premium Indonesia, template, script, dan tools digital terbaik."

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${settings.siteName} | Produk Digital Premium & Template Terbaik Indonesia`,
      template: `%s | ${settings.siteName}`,
    },
    description,
    keywords: [
      "produk digital",
      "digital products",
      "premium",
      "indonesia",
      "hodewastore",
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
    authors: [{ name: settings.siteName }],
    creator: settings.siteName,
    publisher: settings.siteName,
    category: "E-commerce",
    classification: "Digital Products Marketplace",
    openGraph: {
      type: "website",
      locale: "id_ID",
      alternateLocale: ["en_US"],
      url: siteUrl,
      siteName: settings.siteName,
      title: `${settings.siteName} | Produk Digital Premium & Template Terbaik Indonesia`,
      description,
      images: [
        {
          url: `${siteUrl}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: `${settings.siteName} - Produk Digital Premium Indonesia`,
          type: "image/jpeg",
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
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        noimageindex: false,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical: siteUrl,
    },
    verification: {
      google: "qUZcTLYr3c_NU_4n0_da2QXXTiWmb4WYP5b0WgnXTL4",
      // yandex: "your-yandex-verification-code",
      // bing: "your-bing-verification-code",
    },
    other: {
      "theme-color": "#000000",
      "color-scheme": "dark",
      "format-detection": "telephone=no",
    },
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#000000" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="google-site-verification" content="qUZcTLYr3c_NU_4n0_da2QXXTiWmb4WYP5b0WgnXTL4" />
      </head>
      <body className={cn("min-h-screen bg-black font-sans antialiased selection:bg-white/20", inter.variable)}>
        {children}
      </body>
    </html>
  )
}
