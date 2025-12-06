import { createClient } from "@/lib/supabase/client"

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

// Helper function to calculate discount percentage
export function calculateDiscountPercentage(originalPrice: number, currentPrice: number): number {
  if (originalPrice <= currentPrice || originalPrice === 0) return 0
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
}

// Helper function to generate slug from name
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
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

// Products
export async function getProducts(): Promise<Product[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching products:", error)
    return []
  }
  return data || []
}

export async function getProductsByCategory(category: "produk" | "gratis"): Promise<Product[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category", category)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching products by category:", error)
    return []
  }
  return data || []
}

export async function addProduct(product: Omit<Product, "id" | "created_at">): Promise<Product | null> {
  const supabase = createClient()
  const { data, error } = await supabase.from("products").insert(product).select().single()

  if (error) {
    console.error("Error adding product:", error)
    return null
  }
  return data
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  const supabase = createClient()
  const { data, error } = await supabase.from("products").update(updates).eq("id", id).select().single()

  if (error) {
    console.error("Error updating product:", error)
    return null
  }
  return data
}

export async function deleteProduct(id: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase.from("products").delete().eq("id", id)

  if (error) {
    console.error("Error deleting product:", error)
    return false
  }
  return true
}

// Settings
export async function getSettings(): Promise<SiteSettings> {
  const supabase = createClient()
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

export async function updateSettings(updates: Partial<SiteSettings>): Promise<SiteSettings> {
  const supabase = createClient()

  const promises = Object.entries(updates).map(([key, value]) =>
    supabase.from("site_settings").upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" }),
  )

  await Promise.all(promises)
  return getSettings()
}

// Auth (admin password - client side only)
const ADMIN_PASSWORD = "Hudzganteng"

export function verifyAdminPassword(password: string): boolean {
  return password === ADMIN_PASSWORD
}

export function isAdminLoggedIn(): boolean {
  if (typeof window === "undefined") return false
  return sessionStorage.getItem("admin_logged_in") === "true"
}

export function setAdminLoggedIn(value: boolean): void {
  if (value) {
    sessionStorage.setItem("admin_logged_in", "true")
  } else {
    sessionStorage.removeItem("admin_logged_in")
  }
}
