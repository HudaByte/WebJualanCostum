import { MetadataRoute } from "next"
import { getProductsServer } from "@/lib/store-server"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hudzstore.com"
  const products = await getProductsServer()

  // Homepage - Highest priority
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
  ]

  // Product pages - Prioritize by category and recency
  const now = new Date()
  products.forEach((product) => {
    const slug = product.slug || product.id
    const createdDate = new Date(product.created_at)
    const daysSinceCreation = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
    
    // Higher priority for newer products and premium products
    let priority = 0.8
    if (daysSinceCreation < 30) {
      priority = 0.9 // New products get higher priority
    } else if (daysSinceCreation < 90) {
      priority = 0.85
    }
    
    // Premium products get slightly higher priority
    if (product.category === "produk") {
      priority = Math.min(priority + 0.05, 0.95)
    }

    routes.push({
      url: `${baseUrl}/produk/${slug}`,
      lastModified: createdDate,
      changeFrequency: "weekly" as const,
      priority,
    })
  })

  // Sort by priority (highest first) for better SEO
  routes.sort((a, b) => (b.priority || 0) - (a.priority || 0))

  return routes
}

