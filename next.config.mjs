/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    // Vercel Image Optimization akan otomatis diaktifkan jika unoptimized: false
    // Untuk sekarang tetap unoptimized karena sudah dikonfigurasi
  },
  // Optimasi untuk Vercel
  output: 'standalone',
  // Enable React strict mode untuk production
  reactStrictMode: true,
  // Optimasi untuk production build
  swcMinify: true,
}

export default nextConfig
