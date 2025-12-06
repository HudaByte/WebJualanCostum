"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import {
  Package,
  Settings,
  LogOut,
  Plus,
  Trash2,
  Edit,
  X,
  Save,
  ShoppingBag,
  Gift,
  Loader2,
  Upload,
  MousePointer,
} from "lucide-react"
import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  getSettings,
  updateSettings,
  calculateDiscountPercentage,
  generateSlug,
  type Product,
  type SiteSettings,
} from "@/lib/store"
import { createBrowserClient } from "@supabase/ssr"

const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

interface AdminDashboardProps {
  onLogout: () => void
}

type Tab = "products" | "settings"

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>("products")
  const [products, setProducts] = useState<Product[]>([])
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [isAddingProduct, setIsAddingProduct] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const [productsData, settingsData] = await Promise.all([getProducts(), getSettings()])
      setProducts(productsData)
      setSettings(settingsData)
      setLoading(false)
    }
    loadData()
  }, [])

  const refreshProducts = async () => {
    const data = await getProducts()
    setProducts(data)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">
            Admin Panel<span className="text-blue-400">.</span>
          </h1>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab("products")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
              activeTab === "products" ? "bg-blue-500 text-white" : "bg-white/5 text-white/60 hover:bg-white/10"
            }`}
          >
            <Package className="w-5 h-5" />
            Produk
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
              activeTab === "settings" ? "bg-blue-500 text-white" : "bg-white/5 text-white/60 hover:bg-white/10"
            }`}
          >
            <Settings className="w-5 h-5" />
            Pengaturan
          </button>
        </div>

        {/* Content */}
        {activeTab === "products" && (
          <ProductsTab
            products={products}
            onRefresh={refreshProducts}
            isAddingProduct={isAddingProduct}
            setIsAddingProduct={setIsAddingProduct}
            editingProduct={editingProduct}
            setEditingProduct={setEditingProduct}
          />
        )}

        {activeTab === "settings" && settings && <SettingsTab settings={settings} onUpdate={(s) => setSettings(s)} />}
      </div>
    </div>
  )
}

function ProductsTab({
  products,
  onRefresh,
  isAddingProduct,
  setIsAddingProduct,
  editingProduct,
  setEditingProduct,
}: {
  products: Product[]
  onRefresh: () => Promise<void>
  isAddingProduct: boolean
  setIsAddingProduct: (v: boolean) => void
  editingProduct: Product | null
  setEditingProduct: (p: Product | null) => void
}) {
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (confirm("Yakin ingin menghapus produk ini?")) {
      setDeleting(id)
      await deleteProduct(id)
      await onRefresh()
      setDeleting(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Kelola Produk</h2>
          <p className="text-white/60">Total: {products.length} produk</p>
        </div>
        <button
          onClick={() => setIsAddingProduct(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-xl font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Tambah Produk
        </button>
      </div>

      {/* Product Form Modal */}
      {(isAddingProduct || editingProduct) && (
        <ProductForm
          product={editingProduct}
          onClose={() => {
            setIsAddingProduct(false)
            setEditingProduct(null)
          }}
          onSave={async () => {
            setIsAddingProduct(false)
            setEditingProduct(null)
            await onRefresh()
          }}
        />
      )}

      {/* Products List */}
      <div className="space-y-4">
        {products.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-2xl">
            <Package className="w-12 h-12 text-white/30 mx-auto mb-4" />
            <p className="text-white/60">Belum ada produk</p>
          </div>
        ) : (
          products.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 animate-fadeIn"
            >
              <div className="w-16 h-16 rounded-lg bg-white/10 overflow-hidden flex-shrink-0">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {product.category === "gratis" ? (
                      <Gift className="w-6 h-6 text-white/30" />
                    ) : (
                      <ShoppingBag className="w-6 h-6 text-white/30" />
                    )}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold truncate">{product.name}</h3>
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full ${
                      product.category === "gratis" ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"
                    }`}
                  >
                    {product.category === "gratis" ? "Gratis" : "Berbayar"}
                  </span>
                </div>
                <p className="text-sm text-white/60 truncate">{product.description}</p>
                <p className="text-sm text-blue-400 font-medium">
                  {product.category === "gratis" ? "Gratis" : `Rp ${product.price.toLocaleString("id-ID")}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingProduct(product)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Edit className="w-5 h-5 text-white/60" />
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  disabled={deleting === product.id}
                  className="p-2 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                >
                  {deleting === product.id ? (
                    <Loader2 className="w-5 h-5 text-red-400 animate-spin" />
                  ) : (
                    <Trash2 className="w-5 h-5 text-red-400" />
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function ProductForm({
  product,
  onClose,
  onSave,
}: {
  product: Product | null
  onClose: () => void
  onSave: () => Promise<void>
}) {
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || 0,
    original_price: product?.original_price || null,
    slug: product?.slug || "",
    category: product?.category || ("produk" as "produk" | "gratis"),
    image: product?.image || "",
    marketplace_link: product?.marketplace_link || "",
    button_text: product?.button_text || "",
  })

  // Auto-generate slug when name changes
  useEffect(() => {
    if (formData.name && !product) {
      // Only auto-generate for new products
      const autoSlug = generateSlug(formData.name)
      setFormData((prev) => ({ ...prev, slug: autoSlug }))
    }
  }, [formData.name, product])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      alert("Format file tidak didukung. Gunakan JPG, PNG, GIF, atau WebP.")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran file maksimal 5MB.")
      return
    }

    setUploading(true)
    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `products/${fileName}`

      const { error: uploadError } = await supabase.storage.from("product-images").upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

      if (uploadError) throw uploadError

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("product-images").getPublicUrl(filePath)

      setFormData({ ...formData, image: publicUrl })
    } catch (error) {
      console.error("Upload error:", error)
      alert("Gagal mengupload gambar. Silakan coba lagi.")
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    // Calculate discount percentage if original_price is set
    let discountPercentage = null
    if (formData.original_price && formData.original_price > formData.price && formData.category === "produk") {
      discountPercentage = calculateDiscountPercentage(formData.original_price, formData.price)
    }

    // Generate slug if not provided
    const finalSlug = formData.slug || generateSlug(formData.name)

    const productData = {
      ...formData,
      slug: finalSlug,
      discount_percentage: discountPercentage,
      // Remove original_price if it's not greater than price
      original_price: formData.original_price && formData.original_price > formData.price ? formData.original_price : null,
    }

    if (product) {
      await updateProduct(product.id, productData)
    } else {
      await addProduct(productData)
    }
    await onSave()
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-6 animate-fadeIn">
      <div
        className="w-full max-w-lg bg-zinc-900 rounded-2xl border border-white/10 overflow-hidden max-h-[90vh] overflow-y-auto animate-scaleIn"
      >
        <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-zinc-900 z-10">
          <h3 className="text-xl font-bold">{product ? "Edit Produk" : "Tambah Produk"}</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">Nama Produk</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-blue-500/50"
              placeholder="Nama produk..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">Deskripsi</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-blue-500/50 resize-none"
              placeholder="Deskripsi produk..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Kategori</label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value as "produk" | "gratis",
                    // Reset original_price if switching to gratis
                    original_price: e.target.value === "gratis" ? null : formData.original_price,
                  })
                }
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50"
              >
                <option value="produk" className="bg-zinc-900">
                  Berbayar
                </option>
                <option value="gratis" className="bg-zinc-900">
                  Gratis
                </option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Harga (Rp)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                disabled={formData.category === "gratis"}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-blue-500/50 disabled:opacity-50"
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          {/* Original Price & Discount Section */}
          {formData.category === "produk" && (
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                Harga Asli (Rp) <span className="text-white/40 text-xs">(Opsional - untuk diskon)</span>
              </label>
              <input
                type="number"
                value={formData.original_price || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    original_price: e.target.value ? Number(e.target.value) : null,
                  })
                }
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-blue-500/50"
                placeholder="Kosongkan jika tidak ada diskon"
                min="0"
              />
              {formData.original_price && formData.original_price > formData.price && (
                <p className="mt-2 text-sm text-green-400">
                  Diskon: {calculateDiscountPercentage(formData.original_price, formData.price)}%
                </p>
              )}
              {formData.original_price && formData.original_price <= formData.price && (
                <p className="mt-2 text-sm text-red-400">Harga asli harus lebih besar dari harga sekarang</p>
              )}
            </div>
          )}

          {/* Slug Field */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">
              URL Slug <span className="text-white/40 text-xs">(Auto-generated dari nama)</span>
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-blue-500/50"
              placeholder="nama-produk-url"
            />
            <p className="mt-1 text-xs text-white/40">
              URL akan menjadi: /produk/{formData.slug || generateSlug(formData.name || "nama-produk")}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">Gambar Produk</label>

            {/* Preview */}
            {formData.image && (
              <div className="mb-3 relative">
                <img
                  src={formData.image}
                  alt="Preview"
                  className="w-full h-40 object-contain bg-white/5 rounded-xl border border-white/10"
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, image: "" })}
                  className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-500 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex gap-3">
              {/* Upload Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 border-dashed rounded-xl text-white/60 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Mengupload...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Upload Gambar
                  </>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* URL Input */}
            <div className="mt-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-white/40">atau masukkan URL</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>
              <input
                type="url"
                value={formData.image || ""}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-blue-500/50"
                placeholder="https://..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">Link Marketplace</label>
            <input
              type="url"
              value={formData.marketplace_link}
              onChange={(e) => setFormData({ ...formData, marketplace_link: e.target.value })}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-blue-500/50"
              placeholder="https://tokopedia.com/..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">
              <span className="flex items-center gap-2">
                <MousePointer className="w-4 h-4" />
                Teks Tombol (Opsional)
              </span>
            </label>
            <input
              type="text"
              value={formData.button_text}
              onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-blue-500/50"
              placeholder={formData.category === "gratis" ? "Ambil Gratis" : "Beli Sekarang"}
            />
            <p className="text-xs text-white/40 mt-1.5">Kosongkan untuk menggunakan teks default</p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-white/10 rounded-xl font-medium hover:bg-white/5 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Simpan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function SettingsTab({
  settings,
  onUpdate,
}: {
  settings: SiteSettings
  onUpdate: (s: SiteSettings) => void
}) {
  const [formData, setFormData] = useState(settings)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    const updated = await updateSettings(formData)
    onUpdate(updated)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">Pengaturan Website</h2>

      <div className="space-y-6 bg-white/5 rounded-2xl p-6 border border-white/10">
        <div>
          <label className="block text-sm font-medium text-white/60 mb-2">Nama Website</label>
          <input
            type="text"
            value={formData.siteName}
            onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-blue-500/50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/60 mb-2">Tagline</label>
          <input
            type="text"
            value={formData.tagline}
            onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-blue-500/50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/60 mb-2">Hero Title</label>
          <input
            type="text"
            value={formData.heroTitle}
            onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-blue-500/50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/60 mb-2">Hero Subtitle</label>
          <textarea
            value={formData.heroSubtitle}
            onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-blue-500/50 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/60 mb-2">Link Komunitas (Telegram/Discord/dll)</label>
          <input
            type="url"
            value={formData.communityLink}
            onChange={(e) => setFormData({ ...formData, communityLink: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-blue-500/50"
            placeholder="https://t.me/..."
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 bg-blue-500 hover:bg-blue-600 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saved ? (
            <>Tersimpan!</>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Simpan Pengaturan
            </>
          )}
        </button>
      </div>
    </div>
  )
}
