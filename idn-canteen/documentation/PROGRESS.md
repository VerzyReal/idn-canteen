# Progres Proyek — IDN Canteen E-Commerce Platform

Terakhir diperbarui: 2026-11-27
Posisi saat ini: **SEMUA TAHAP SELESAI (Tahap 1, 2, & 3 — 100% Terkompilasi & Siap Produksi)**

---

## Status Verifikasi Build
- [x] TypeScript Type Check (`tsc --noEmit`): **Lolos 100% tanpa error**
- [x] Production Build (`next build`): **Lolos 100% (24 Routes terkompilasi)**
- [x] Prisma Client v5.22.0: **Berhasil di-generate**
- [x] State Management (Zustand LocalStorage): **Terintegrasi**
- [x] Transaksi Atomik Checkout: **Siap diuji**

- [x] Struktur folder Next.js 14 App Router dibuat
- [x] `prisma/schema.prisma` — skema lengkap (User, Product, Order, OrderItem, WalletTransaction)
- [x] `prisma/seed.ts` — 1 Admin, 1 Siswa (Rp 100.000), 1 Staff, 10 menu kantin Indonesia
- [x] `package.json` — Next.js 14, TypeScript, Tailwind, Prisma, Zustand, Zod, Jose, Bcryptjs
- [x] `tailwind.config.js` — Design tokens IDN Canteen (orange primary, status colors, animasi)
- [x] `tsconfig.json`, `next.config.ts`, `postcss.config.js`
- [x] `.env.example` & `.env.local` — template konfigurasi
- [x] `.gitignore`

### ✅ TAHAP 2 — Backend REST API & Auth (SELESAI)

**Auth:**
- [x] `POST /api/auth/login` — bcrypt verify + JWT HttpOnly cookie
- [x] `POST /api/auth/register` — hash password + set cookie
- [x] `POST /api/auth/logout` — clear cookie
- [x] `GET  /api/auth/me` — get current user dari cookie

**Products:**
- [x] `GET    /api/products` — list dengan filter (category, search, available) + pagination
- [x] `POST   /api/products` — create (Admin only)
- [x] `GET    /api/products/[id]` — detail
- [x] `PATCH  /api/products/[id]` — update (Admin only)
- [x] `DELETE /api/products/[id]` — hapus (Admin only)

**Orders:**
- [x] `GET  /api/orders` — list pesanan user/admin dengan filter status
- [x] `POST /api/orders/checkout` — transaksi atomik (validasi stok + potong saldo + buat order)
- [x] `GET  /api/orders/[id]` — detail pesanan
- [x] `PATCH /api/orders/[id]` — update status (Admin, dengan auto-refund saldo saat CANCELLED)

**Wallet:**
- [x] `GET  /api/wallet` — riwayat transaksi + saldo
- [x] `POST /api/wallet/topup` — request top-up (PENDING, menunggu admin)

**Admin:**
- [x] `GET   /api/admin/stats` — KPI: omzet hari ini, pesanan, menu aktif, pending topup
- [x] `GET   /api/admin/topup` — daftar pending top-up
- [x] `PATCH /api/admin/topup/[id]` — approve/reject top-up (dengan update saldo atomik)

**Middleware:**
- [x] `src/middleware.ts` — proteksi rute user & admin dengan JWT cookie

### ✅ TAHAP 2 — Frontend Core (SELESAI)

- [x] `src/app/globals.css` — Tailwind + custom classes (btn, card, badge, bottom-nav)
- [x] `src/app/layout.tsx` — Root layout + Inter font + AuthProvider
- [x] `src/app/page.tsx` — Beranda (search, filter kategori, katalog produk)
- [x] `src/app/(auth)/login/page.tsx` — Form login
- [x] `src/app/(auth)/register/page.tsx` — Form registrasi
- [x] `src/app/(user)/menu/page.tsx` — Daftar menu + filter + sort
- [x] `src/app/(user)/checkout/page.tsx` — Keranjang + checkout atomik
- [x] `src/app/(user)/orders/page.tsx` — Pesanan aktif + riwayat + progress bar
- [x] `src/app/(user)/profile/page.tsx` — Profil + top-up + riwayat mutasi
- [x] `src/app/admin/page.tsx` — Admin dashboard (KPI, antrian, menu, topup)
- [x] `src/app/not-found.tsx` — 404 page
- [x] `src/components/product/ProductCard.tsx`
- [x] `src/components/product/ProductDetailModal.tsx`
- [x] `src/components/layout/BottomNav.tsx`
- [x] `src/components/providers/AuthProvider.tsx`

**State Management:**
- [x] `src/store/cartStore.ts` — Zustand + localStorage persist
- [x] `src/store/authStore.ts` — Zustand auth state

**Types & Libs:**
- [x] `src/types/index.ts`
- [x] `src/lib/prisma.ts`
- [x] `src/lib/auth.ts` — JWT sign/verify/cookie utils
- [x] `src/lib/api-helpers.ts`
- [x] `src/lib/validations.ts` — Zod schemas

---

### 🚀 TAHAP 3 — Konversi Frontend Stitch

- [x] **Modul 1: Beranda Desktop & Mobile (`idn_canteen_beranda` & `idn_canteen_beranda_mobile`)**
  - Menggabungkan layout responsif desktop navbar + mobile header.
  - Ticker strip & alert operasional (07:00 - 15:30 WIB).
  - Search bar real-time & dynamic quick category chips.
  - Banner promo & 3 langkah mudah jajan.
  - Katalog produk terhubung dinamis ke `GET /api/products`.
  - Floating Quick Cart Bar (mobile) & badge cart counter (desktop).
  - Integrasi Zustand cart & modal detail produk.
- [x] **Modul 2: Daftar Menu Mobile (`idn_canteen_daftar_menu_mobile`)**
  - Halaman `/menu` responsif (2-kolom mobile & 3-4 kolom desktop) dengan desain Stitch.
  - Menampilkan seluruh item beserta status stok (`Tersedia` / `Habis` / badge sisa stok menipis).
  - Filter kategori dinamis dengan counter per kategori & toggle *Hanya yang Tersedia*.
  - Pengurutan harga (Termurah / Termahal), nama (A-Z / Z-A), dan ketersediaan.
  - Stepper kuantitas (`-` / `+`) terhubung langsung ke Zustand Cart Store & Floating Quick Cart Bar.
- [x] **Modul 3: Modal Detail Produk (`idn_canteen_detail_produk_modal_mobile`)**
  - Komponen `<ProductDetailModal />` diselaraskan 100% dengan bottom sheet Stitch.
  - Menampilkan gambar 16:10, badge status (`Tersedia`/`Habis`) & kategori, stok, deskripsi, dan box harga.
  - Input catatan khusus per item (`itemNote`) tersimpan langsung ke Zustand Cart Store.
  - Kontrol kuantitas (`-` / `+`) dengan validasi batas stok & dukungan tombol Escape.
- [x] **Modul 4: Keranjang & Checkout (`idn_canteen_keranjang_checkout_mobile`)**
  - Halaman `/checkout` responsif (1-kolom mobile dengan Sticky Bottom Checkout Bar & 2-kolom desktop).
  - Stepper tracker, kartu identitas & titik ambil, daftar item dengan kontrol stepper `−`/`+`, hapus, dan catatan item.
  - Pilihan metode pembayaran (`BALANCE`, `QRIS`, `CASH`) dengan validasi saldo live & link cepat Top-Up jika kurang.
  - Terhubung langsung ke `POST /api/orders/checkout` (`prisma.$transaction` atomik) + sinkronisasi saldo & clear cart otomatis.
- [x] **Modul 5: Pesanan Saya (`idn_canteen_pesanan_saya`)**
  - Halaman `/orders` dengan desain Stitch responsif (Desktop 2-kolom dengan sticky info panel & Mobile tab bar).
  - Tab **Pesanan Aktif** (`PENDING`, `PREPARING`, `READY`) lengkap dengan 4-Step Tracker Flow (`1. Menunggu` → `2. Diproses` → `3. Siap Ambil` → `4. Selesai`) & progress bar dinamis.
  - Modal **Token Ambil Santri** dengan QR Code SVG + Kode Pesanan `#IDN-...`.
  - Tab **Riwayat Pesanan** (`COMPLETED`, `CANCELLED`) dengan ringkasan item, metode bayar, dan pintasan *Pesan Lagi*.
- [x] **Modul 6: Profil & Top-Up Saldo (`idn_canteen_profil_top_up_saldo_mobile`)**
  - Halaman `/profile` responsif (2-kolom desktop & 1-kolom mobile) dengan kartu digital **IDN SMART CARD**.
  - Menampilkan info akun, saldo aktif live dari `GET /api/wallet`, dan Modal QR Kasir.
  - Pilihan nominal Top-Up (`10.000`, `20.000`, `50.000`, `100.000`) & custom amount (`POST /api/wallet/topup`).
  - Daftar mutasi `WalletTransaction` (`TOPUP`, `PAYMENT`, `REFUND`) lengkap dengan status verifikasi.
- [x] **Modul 7: Admin Dashboard (`idn_canteen_admin_dashboard`)**
  - Halaman `/admin` dilindungi middleware & role check (`ADMIN`), dilengkapi sidebar desktop & tab bar mobile.
  - **KPI Cards:** Omzet hari ini, total pesanan masuk, jumlah menu aktif, dan permintaan top-up pending.
  - **Order Queue:** Ubah status (`PENDING` → `PREPARING` → `READY` → `COMPLETED` / `CANCELLED`) dengan auto-refund saldo untuk metode `BALANCE`.
  - **Menu Management (CRUD):** Modal tambah/edit produk (nama, kategori, harga, stok, deskripsi, URL gambar), toggle `isAvailable` langsung, dan hapus produk.
  - **Top-Up Verification:** Setujui atau tolak permintaan top-up saldo pengguna secara atomik.

---

## Cara Menjalankan

### 1. Setup Database
```bash
# Pastikan PostgreSQL berjalan, lalu buat database
createdb idn_canteen

# Edit file .env.local dengan kredensial database Anda
# DATABASE_URL="postgresql://user:password@localhost:5432/idn_canteen?schema=public"
```

### 2. Install & Setup Prisma
```bash
cd idn-canteen
npm install
npx prisma generate
npx prisma db push        # Push schema ke database
npx prisma db seed        # atau: npm run db:seed
```

### 3. Jalankan Server
```bash
npm run dev
# Buka http://localhost:3000
```

### 4. Akun Demo
| Role   | Email                    | Password    | Saldo      |
|--------|--------------------------|-------------|------------|
| Admin  | admin@idncanteen.com     | admin123    | —          |
| Siswa  | budi@student.ac.id       | student123  | Rp 100.000 |
| Staff  | siti@staff.ac.id         | staff123    | Rp 150.000 |

---

## Catatan & Keputusan Teknis

- **JWT HttpOnly Cookie** dipilih atas NextAuth untuk kontrol penuh dan kompatibilitas App Router
- **Prisma `$transaction`** dipakai di checkout untuk atomisitas (stok + saldo tidak bisa race condition)
- **Zustand + localStorage** untuk cart persisten across page refreshes
- **Zod** untuk validasi input di semua API endpoint
- **Tailwind utility classes** dipertahankan 100% untuk kemudahan integrasi desain Stitch

