import Link from "next/link"
import { ArrowLeft, Package } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function NotFound() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-blue-500/30">
      <Navbar />
      <div className="pt-24 pb-16 min-h-[60vh] flex items-center justify-center">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-white/5 flex items-center justify-center">
              <Package className="w-12 h-12 text-white/30" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Produk Tidak Ditemukan</h1>
            <p className="text-white/60 text-lg mb-8">
              Maaf, produk yang Anda cari tidak ditemukan atau mungkin telah dihapus.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl font-medium transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Beranda
              </Link>
              <Link
                href="#produk"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-all border border-white/10"
              >
                Lihat Semua Produk
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}


