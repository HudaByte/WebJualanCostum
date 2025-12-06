import { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hudzstore.com"

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/adminhodewa/", "/api/", "/_next/", "/static/"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/adminhodewa/", "/api/"],
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: ["/adminhodewa/", "/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl.replace(/^https?:\/\//, ""), // Remove protocol for host directive
  }
}

