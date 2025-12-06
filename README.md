# WebJualanCostum

Platform e-commerce untuk menjual produk digital dengan teknologi modern Next.js dan Supabase.

## 📋 Deskripsi

WebJualanCostum adalah aplikasi web untuk marketplace produk digital yang dibangun dengan Next.js 16, React 19, dan TypeScript. Aplikasi ini menggunakan Supabase sebagai backend untuk menyimpan data produk dan konfigurasi toko.

## 🚀 Teknologi yang Digunakan

- **Next.js 16** - Framework React dengan App Router
- **React 19** - Library UI modern
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling utility-first
- **Supabase** - Backend as a Service (Database & Storage)
- **Motion** - Animasi yang smooth
- **React Hook Form** - Form handling
- **Zod** - Schema validation

## 📦 Instalasi

1. Clone repository ini
```bash
git clone <repository-url>
cd WebJualanCostum
```

2. Install dependencies
```bash
pnpm install
```

3. Setup environment variables
Buat file `.env.local` di root project dengan konfigurasi berikut:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

4. Setup database
Jalankan script SQL yang ada di folder `scripts/` pada Supabase SQL Editor:
- `001-create-tables.sql`
- `002-create-storage-bucket.sql`
- `003-add-button-text-field.sql`
- `004-add-discount-fields.sql`

## 🏃 Cara Menjalankan

### Development Mode
```bash
pnpm dev
```
Aplikasi akan berjalan di `http://localhost:3000`

### Production Build
```bash
pnpm build
pnpm start
```

### Linting
```bash
pnpm lint
```

## 📁 Struktur Project

```
WebJualanCostum/
├── app/              # Next.js App Router pages
├── components/       # React components
├── lib/              # Utilities & Supabase clients
├── hooks/            # Custom React hooks
├── scripts/          # SQL migration scripts
└── public/           # Static assets
```

## 🔧 Fitur

- ✅ Halaman produk dengan detail
- ✅ Admin dashboard untuk mengelola produk
- ✅ Responsive design
- ✅ SEO optimized dengan metadata & structured data
- ✅ Animasi dan efek visual modern
- ✅ Dark theme

## 📝 Catatan

- Pastikan Supabase project sudah dikonfigurasi dengan benar
- Storage bucket harus dibuat untuk menyimpan gambar produk
- Database tables harus dibuat sesuai dengan script SQL yang disediakan

## 📄 License

Private project

