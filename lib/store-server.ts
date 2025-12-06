import { createClient as createServerClient, createStaticClient } from "@/lib/supabase/server"

// Type definitions (duplicated to avoid importing from store.ts which uses browser client)
export interface Product {
  id: string
  name: string
  description: string
  price: number
  original_price?: number | null
  discount_percentage?: number | null
  slug?: string | null
  category: "produk" | "gratis"
  image: string | null
  marketplace_link: string
  button_text: string
  created_at: string
}

export interface SiteSettings {
  siteName: string
  tagline: string
  communityLink: string
  heroTitle: string
  heroSubtitle: string
}

const defaultSettings: SiteSettings = {
  siteName: "HudzStore",
  tagline: "Produk Digital Terbaik",
  communityLink: "https://t.me/yourgroup",
  heroTitle: "Produk Digital Premium",
  heroSubtitle: "Temukan berbagai produk digital berkualitas dengan harga terjangkau",
}

// Server-only functions
export async function getProductsServer(): Promise<Product[]> {
  const supabase = await createServerClient()
  const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching products:", error)
    return []
  }
  return data || []
}

// Function for static generation (no cookies needed)
export function getProductsForStaticGeneration(): Promise<Product[]> {
  const supabase = createStaticClient()
  return supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })
    .then(({ data, error }) => {
      if (error) {
        console.error("Error fetching products for static generation:", error)
        return []
      }
      return data || []
    })
}

export async function getProductBySlugServer(slugOrId: string): Promise<Product | null> {
  const supabase = await createServerClient()
  
  // First try to find by slug (if slugOrId is not a UUID format)
  // UUID format: 8-4-4-4-12 hexadecimal characters
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId)
  
  if (!isUUID) {
    // Try to find by slug first
    const { data, error } = await supabase.from("products").select("*").eq("slug", slugOrId).single()
    
    if (!error && data) {
      return data
    }
  }
  
  // If not found by slug or slugOrId is UUID format, try by ID
  const { data: dataById, error: errorById } = await supabase
    .from("products")
    .select("*")
    .eq("id", slugOrId)
    .single()

  if (errorById || !dataById) {
    console.error("Error fetching product by slug/ID:", errorById?.message || "Product not found")
    return null
  }
  
  return dataById
}

export async function getSettingsServer(): Promise<SiteSettings> {
  const supabase = await createServerClient()
  const { data, error } = await supabase.from("site_settings").select("key, value")

  if (error || !data) {
    console.error("Error fetching settings:", error)
    return defaultSettings
  }

  const settings = { ...defaultSettings }
  data.forEach((row: { key: string; value: string }) => {
    if (row.key in settings) {
      ;(settings as Record<string, string>)[row.key] = row.value
    }
  })
  return settings
}

