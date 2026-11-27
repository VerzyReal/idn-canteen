'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { ProductWithMeta } from '@/types';
import { ProductDetailModal } from '@/components/product/ProductDetailModal';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function BerandaPage() {
  const { user } = useAuthStore();
  const { items: cartItems, addItem, getTotalItems, getTotalPrice } = useCartStore();

  const [products, setProducts] = useState<ProductWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'Semua' | 'Makanan' | 'Minuman'>('Semua');
  const [selectedProduct, setSelectedProduct] = useState<ProductWithMeta | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const totalCartCount = getTotalItems();
  const totalCartPrice = getTotalPrice();

  // Fetch products from GET /api/products
  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const res = await fetch('/api/products?limit=50');
        const json = await res.json();
        if (json.success && json.data?.products) {
          setProducts(json.data.products);
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  // Filter products by search and category
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));

      let matchCategory = true;
      if (activeCategory === 'Makanan') {
        matchCategory = p.category.toLowerCase().includes('makan') || p.category.toLowerCase().includes('snack');
      } else if (activeCategory === 'Minuman') {
        matchCategory = p.category.toLowerCase().includes('minum');
      }

      return matchSearch && matchCategory;
    });
  }, [products, searchQuery, activeCategory]);

  const showToast = (name: string) => {
    setToastMessage(`Ditambahkan: ${name}`);
    setTimeout(() => {
      setToastMessage(null);
    }, 2000);
  };

  const handleQuickAdd = (product: ProductWithMeta, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product.isAvailable || product.stock <= 0) return;
    addItem(product, 1);
    showToast(product.name);
  };

  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface antialiased min-h-screen flex flex-col justify-between">
      {/* Toast Notification Feedback */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-on-surface text-surface px-4 py-2.5 rounded-full shadow-xl font-label-sm flex items-center gap-2 transition-all transform animate-slide-up">
          <span className="material-symbols-outlined text-[18px] text-emerald-400">check_circle</span>
          <span className="font-medium text-white">{toastMessage}</span>
        </div>
      )}

      {/* ── DESKTOP & TABLET HEADER (Hidden on mobile) ── */}
      <header className="hidden md:block fixed top-0 left-0 w-full z-50 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-20 max-w-[1280px] mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop flex items-center justify-between gap-space-md">
          {/* Logo Brand */}
          <div className="flex items-center gap-space-md shrink-0">
            <Link href="/" className="flex items-center gap-space-sm">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-md">
                <span className="material-symbols-outlined text-[22px]">restaurant</span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm text-primary tracking-tight font-bold">
                  IDN CANTEEN
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant hidden sm:inline-block">
                  Jajan Praktis, Istirahat Lebih Asik!
                </span>
              </div>
            </Link>
            <div className="hidden xl:flex items-center gap-space-xs bg-surface-container px-space-sm py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                Kantin Sedang Buka
              </span>
            </div>
          </div>

          {/* Desktop Search Bar */}
          <div className="flex items-center flex-1 max-w-xs xl:max-w-sm px-space-sm">
            <div className="w-full flex items-center bg-surface-container-low px-space-md py-space-xs rounded-xl focus-within:ring-2 focus-within:ring-primary/20">
              <span className="material-symbols-outlined text-outline mr-space-xs text-[20px]">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari snack atau minuman..."
                className="w-full bg-transparent border-0 outline-none font-body-sm text-body-sm text-on-surface placeholder:text-outline"
              />
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-space-xs">
            <Link
              href="/"
              className="px-space-md py-space-sm rounded-xl transition-colors bg-primary-container text-on-primary-container font-headline-sm font-semibold"
            >
              Beranda
            </Link>
            <Link
              href="/menu"
              className="px-space-md py-space-sm rounded-xl font-label-lg text-label-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
            >
              Daftar Menu
            </Link>
            <Link
              href="/orders"
              className="px-space-md py-space-sm rounded-xl font-label-lg text-label-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
            >
              Pesanan Saya
            </Link>
            {user?.role === 'ADMIN' && (
              <Link
                href="/admin"
                className="px-space-md py-space-sm rounded-xl font-label-lg text-label-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
              >
                Admin Dashboard
              </Link>
            )}
          </nav>

          {/* User Profile & Cart Button */}
          <div className="flex items-center gap-space-sm shrink-0">
            <ThemeToggle />
            {/* Cart Button */}
            <Link
              href="/checkout"
              className="relative p-space-sm rounded-xl bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-on-primary font-label-sm text-label-sm font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                  {totalCartCount}
                </span>
              )}
            </Link>

            {/* User Profile Pill */}
            {user ? (
              <Link
                href="/profile"
                className="flex items-center gap-space-sm pl-space-xs py-1 pr-space-sm rounded-full bg-surface-container-low hover:bg-surface-container-high transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs uppercase">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="font-label-md text-label-md text-on-surface leading-tight font-semibold">
                    {user.name.split(' ')[0]}
                  </span>
                  <span className="font-label-sm text-label-sm text-primary leading-tight font-medium">
                    {user.role === 'ADMIN' ? 'Administrator' : `Rp ${(user.balance ?? 0).toLocaleString('id-ID')}`}
                  </span>
                </div>
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-space-md py-2 rounded-xl bg-primary text-white font-label-md hover:bg-primary-container transition-all"
              >
                Masuk
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ── MOBILE HEADER (Visible only on mobile screens) ── */}
      <header className="md:hidden fixed top-0 inset-x-0 z-50 bg-surface/85 backdrop-blur-xl pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-gutter flex items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-sm min-w-0">
            <div className="flex items-center gap-1.5 bg-primary/10 px-2.5 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-label-sm text-primary uppercase tracking-wider font-semibold">
                Kantin Buka
              </span>
            </div>
            <span className="font-headline-sm text-primary font-bold tracking-tight truncate">
              IDN CANTEEN
            </span>
          </div>

          <div className="flex items-center gap-1">
            <ThemeToggle className="w-9 h-9" />
            <Link
              href="/menu"
              className="w-10 h-10 flex items-center justify-center rounded-xl text-on-surface-variant hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-[22px]">search</span>
            </Link>
            <Link
              href="/checkout"
              className="relative w-10 h-10 flex items-center justify-center rounded-xl text-on-surface-variant hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
              {totalCartCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary text-on-primary font-label-sm text-[10px] flex items-center justify-center font-bold">
                  {totalCartCount}
                </span>
              )}
            </Link>
            <Link
              href="/profile"
              className="w-8 h-8 ml-1 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shrink-0"
            >
              {user ? user.name.charAt(0).toUpperCase() : <span className="material-symbols-outlined text-[18px]">person</span>}
            </Link>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="w-full pt-16 md:pt-20 bg-surface flex-1">
        <div className="flex flex-col w-full">
          {/* Top Operational Alert & Ticker Strip (Desktop & Mobile) */}
          <section className="w-full bg-surface-container-high py-space-sm px-margin md:px-margin-tablet lg:px-margin-desktop overflow-hidden">
            <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-space-xs text-on-surface">
              <div className="flex items-center gap-space-sm text-xs sm:text-sm">
                <span className="inline-flex items-center justify-center w-2.5 h-2.5 rounded-full bg-secondary animate-ping"></span>
                <span className="inline-flex items-center justify-center w-2.5 h-2.5 rounded-full bg-secondary -ml-3"></span>
                <span className="font-label-md text-label-md text-on-surface font-semibold tracking-wide">
                  🟢 Kantin Sedang Buka • Jam Operasional: 07:00 - 15:30 WIB • Siap melayani jajan istirahat kamu!
                </span>
              </div>
              <div className="hidden lg:flex items-center gap-space-md text-on-surface-variant font-label-sm text-label-sm">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-primary">verified</span>
                  100% Higienis & Halal
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-primary">timer</span>
                  Siap Ambil ~5 Menit
                </span>
              </div>
            </div>
          </section>

          {/* Mobile User Greeting Banner (Visible on mobile) */}
          <section className="md:hidden px-margin pt-4 pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-headline-sm text-on-surface font-bold">
                  Halo {user ? user.name.split(' ')[0] : 'Santri IDN'}!
                </span>
                <span className="text-xl animate-bounce">👋</span>
              </div>
              {user?.role === 'ADMIN' ? (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 px-3 py-1 bg-primary-fixed rounded-full shadow-sm"
                >
                  <span className="material-symbols-outlined text-[15px] text-primary">
                    admin_panel_settings
                  </span>
                  <span className="font-label-sm text-label-sm text-primary font-semibold">
                    Panel Admin
                  </span>
                </Link>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-surface-container-high rounded-full shadow-sm">
                  <span className="material-symbols-outlined text-[15px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                    account_balance_wallet
                  </span>
                  <span className="font-label-sm text-label-sm text-primary font-semibold">
                    Rp {(user?.balance ?? 0).toLocaleString('id-ID')}
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* Hero Main Section (Desktop & Mobile Unified) */}
          <section className="w-full py-space-md md:py-space-xl px-margin md:px-margin-tablet lg:px-margin-desktop relative overflow-hidden bg-gradient-to-b from-surface via-surface-container-low to-surface">
            {/* Ambient backdrops */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-fixed/40 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute top-1/2 -left-20 w-80 h-80 bg-secondary-fixed/40 rounded-full blur-3xl pointer-events-none"></div>

            <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-space-lg md:gap-space-xl items-center relative z-10">
              {/* Text & Interaction Column */}
              <div className="lg:col-span-7 flex flex-col items-start gap-space-md">
                {/* Tagline Pill */}
                <div className="inline-flex items-center gap-space-xs px-space-md py-1.5 rounded-full bg-surface-container-highest shadow-sm">
                  <span className="material-symbols-outlined text-primary text-[18px]">bolt</span>
                  <span className="font-label-md text-label-md text-primary font-bold">
                    Jajan Praktis, Istirahat Lebih Asik!
                  </span>
                </div>

                {/* Headline */}
                <h1 className="font-headline-lg-mobile md:font-headline-xl text-headline-lg-mobile md:text-headline-xl text-on-surface tracking-tight leading-tight">
                  Lagi Pengen Jajan Apa?
                </h1>

                {/* Subtitle */}
                <p className="font-body-md md:font-body-lg text-body-md md:text-body-lg text-on-surface-variant max-w-xl">
                  Temukan snack dan minuman favoritmu di IDN Canteen. Pesan dengan mudah tanpa perlu antre saat jam istirahat sekolah tiba.
                </p>

                {/* Search Bar with Pill Filter Row */}
                <div className="w-full max-w-xl bg-surface-container-lowest p-space-sm rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] flex flex-col gap-space-sm">
                  <div className="flex items-center px-space-sm py-1 bg-surface-container-low rounded-xl">
                    <span className="material-symbols-outlined text-outline mr-space-xs text-[22px]">search</span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari snack atau minuman favoritmu..."
                      className="w-full bg-transparent border-0 outline-none font-body-md text-body-md text-on-surface placeholder:text-outline"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="text-outline hover:text-on-surface px-2"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Quick Category Filters */}
                  <div className="flex items-center gap-space-xs overflow-x-auto no-scrollbar pb-1 pt-1">
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-medium shrink-0 ml-1">
                      Kategori Cepat:
                    </span>
                    <button
                      onClick={() => setActiveCategory('Semua')}
                      className={`px-space-md py-1 rounded-full font-label-sm text-label-sm font-semibold shrink-0 transition-all ${
                        activeCategory === 'Semua'
                          ? 'bg-primary text-on-primary shadow-sm'
                          : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                      }`}
                    >
                      ✨ Semua
                    </button>
                    <button
                      onClick={() => setActiveCategory('Makanan')}
                      className={`px-space-md py-1 rounded-full font-label-sm text-label-sm font-semibold shrink-0 transition-all ${
                        activeCategory === 'Makanan'
                          ? 'bg-primary text-on-primary shadow-sm'
                          : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                      }`}
                    >
                      🍟 Makanan / Snack
                    </button>
                    <button
                      onClick={() => setActiveCategory('Minuman')}
                      className={`px-space-md py-1 rounded-full font-label-sm text-label-sm font-semibold shrink-0 transition-all ${
                        activeCategory === 'Minuman'
                          ? 'bg-primary text-on-primary shadow-sm'
                          : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                      }`}
                    >
                      🧃 Minuman Dingin
                    </button>
                  </div>
                </div>

                {/* Hero CTAs */}
                <div className="flex flex-wrap items-center gap-space-sm pt-space-xs">
                  <Link
                    href="/menu"
                    className="px-space-xl py-3.5 bg-primary hover:bg-primary-container active:scale-[0.98] text-on-primary rounded-xl font-label-lg text-label-lg shadow-md hover:shadow-lg transition-all flex items-center gap-space-xs font-semibold"
                  >
                    <span>Jelajahi Menu</span>
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                  </Link>
                  <Link
                    href="/orders"
                    className="px-space-lg py-3.5 bg-surface-container hover:bg-surface-container-high text-primary font-label-lg text-label-lg rounded-xl transition-colors flex items-center gap-space-xs font-semibold"
                  >
                    <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                    <span>Lihat Pesanan Saya</span>
                  </Link>
                </div>
              </div>

              {/* Hero Visual Graphic (Desktop) / Promo Card (Mobile) */}
              <div className="lg:col-span-5 relative flex justify-center items-center mt-4 lg:mt-0">
                <div className="relative w-full max-w-[440px] aspect-[4/5] rounded-3xl overflow-hidden shadow-[0_12px_36px_rgba(0,0,0,0.12)] bg-surface-container">
                  <img
                    alt="IDN Canteen Menu Sehat & Higienis"
                    className="w-full h-full object-cover"
                    src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-on-surface/80 via-transparent to-transparent"></div>
                  <div className="absolute bottom-space-md left-space-md right-space-md text-surface-bright">
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm mb-1 font-semibold">
                      Paling Laris Minggu Ini
                    </span>
                    <h3 className="font-headline-sm text-headline-sm text-surface-container-lowest font-bold">
                      Siap Santap Saat Bel Istirahat
                    </h3>
                    <p className="font-body-sm text-body-sm text-surface-dim mt-0.5">
                      Hemat waktu antre dengan pesan online di IDN Canteen.
                    </p>
                  </div>
                </div>

                {/* Floating Badge Top Left: Halal & Higienis */}
                <div className="hidden sm:flex absolute -top-4 -left-4 sm:left-2 bg-surface-container-lowest p-space-sm rounded-2xl shadow-xl items-center gap-space-sm animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[24px]">verified_user</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md text-on-surface font-bold leading-tight">
                      100% Halal & Higienis
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant leading-tight">
                      Terjamin & Terpantau
                    </span>
                  </div>
                </div>

                {/* Floating Badge Bottom Right: 5 Menit Ambil */}
                <div className="hidden sm:flex absolute -bottom-4 -right-2 sm:right-0 bg-surface-container-lowest p-space-sm rounded-2xl shadow-xl items-center gap-space-sm">
                  <div className="w-10 h-10 rounded-xl bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed">
                    <span className="material-symbols-outlined text-[24px]">avg_pace</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md text-on-surface font-bold leading-tight">
                      Siap dalam 5 Menit
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant leading-tight">
                      Ambil tanpa ribet
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Category Showcase */}
          <section className="w-full py-space-xl px-margin md:px-margin-tablet lg:px-margin-desktop bg-surface">
            <div className="max-w-[1280px] mx-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-space-sm mb-space-lg">
                <div>
                  <span className="font-label-sm text-label-sm text-primary font-bold tracking-widest uppercase">
                    Jelajahi Berdasarkan Kategori
                  </span>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface mt-1 font-bold">
                    Pilihan Menu Favorit
                  </h2>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm">
                  Semua produk diperbarui setiap pagi langsung dari kitchen dan rak etalase kantin sekolah.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
                {/* Category Card A: Snacks */}
                <div
                  onClick={() => setActiveCategory('Makanan')}
                  className={`bg-surface-container-lowest rounded-3xl p-space-lg shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden group cursor-pointer border-2 ${
                    activeCategory === 'Makanan' ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <div className="absolute top-0 right-0 w-44 h-44 bg-primary-fixed/20 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500"></div>
                  <div>
                    <div className="flex items-center justify-between mb-space-md">
                      <span className="px-space-md py-1 rounded-full bg-surface-container text-primary font-label-md text-label-md font-bold tracking-wide">
                        KATEGORI A — MAKANAN / SNACKS
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-semibold">
                        Tersedia Lengkap
                      </span>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant mb-space-md">
                      Pilihan snack hits & menu kenyang: <span className="font-semibold text-on-surface">Nasi Goreng, Mie Ayam, Nasi Uduk, Risoles, Martabak Mini, Chitato, Roti AOKA.</span>
                    </p>
                  </div>
                  <div className="w-full py-3 px-space-md bg-surface-container group-hover:bg-primary group-hover:text-on-primary text-primary font-label-lg text-label-lg rounded-xl transition-all flex items-center justify-center gap-space-xs font-semibold">
                    <span>Lihat Snack & Makanan</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </div>
                </div>

                {/* Category Card B: Drinks */}
                <div
                  onClick={() => setActiveCategory('Minuman')}
                  className={`bg-surface-container-lowest rounded-3xl p-space-lg shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden group cursor-pointer border-2 ${
                    activeCategory === 'Minuman' ? 'border-secondary' : 'border-transparent'
                  }`}
                >
                  <div className="absolute top-0 right-0 w-44 h-44 bg-secondary-fixed/30 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500"></div>
                  <div>
                    <div className="flex items-center justify-between mb-space-md">
                      <span className="px-space-md py-1 rounded-full bg-surface-container text-secondary font-label-md text-label-md font-bold tracking-wide">
                        KATEGORI B — MINUMAN / DRINKS
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-semibold">
                        Dingin & Segar
                      </span>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant mb-space-md">
                      Minuman dingin menyegarkan: <span className="font-semibold text-on-surface">Es Teh Manis, Jus Jeruk Segar, Teh Pucuk, Cimory Yogurt, Pocari Sweat, Milku.</span> Selalu tersimpan dingin!
                    </p>
                  </div>
                  <div className="w-full py-3 px-space-md bg-surface-container group-hover:bg-secondary group-hover:text-on-secondary text-secondary font-label-lg text-label-lg rounded-xl transition-all flex items-center justify-center gap-space-xs font-semibold">
                    <span>Lihat Minuman Dingin</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Popular Products Section (Populer & Favorit Siswa) */}
          <section className="w-full py-space-xl px-margin md:px-margin-tablet lg:px-margin-desktop bg-surface-container-low" id="daftar-menu">
            <div className="max-w-[1280px] mx-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-space-sm mb-space-lg">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-tertiary mb-1">
                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      local_fire_department
                    </span>
                    <span className="font-label-sm text-label-sm font-bold uppercase tracking-wider">
                      Top Rekomendasi Hari Ini
                    </span>
                  </div>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">
                    Populer & Favorit Siswa
                  </h2>
                </div>
                <div className="flex items-center gap-space-xs">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    Menampilkan {filteredProducts.length} Produk Pilihan
                  </span>
                </div>
              </div>

              {/* Dynamic Items Grid */}
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-space-md">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="bg-surface-container-lowest rounded-2xl p-space-md animate-pulse">
                      <div className="w-full aspect-[4/3] rounded-xl bg-surface-container-high mb-space-sm"></div>
                      <div className="h-4 bg-surface-container-high rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-surface-container-high rounded w-1/2 mb-4"></div>
                      <div className="h-8 bg-surface-container-high rounded"></div>
                    </div>
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-16 bg-surface-container-lowest rounded-3xl p-8">
                  <div className="text-5xl mb-3">🍽️</div>
                  <h3 className="font-headline-sm text-on-surface font-bold">Menu Tidak Ditemukan</h3>
                  <p className="font-body-sm text-on-surface-variant mt-1">
                    Coba ganti kata kunci pencarian atau ubah filter kategori.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setActiveCategory('Semua');
                    }}
                    className="mt-4 px-4 py-2 rounded-xl bg-primary text-white font-label-md"
                  >
                    Reset Filter
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-space-md">
                  {filteredProducts.map((p) => {
                    const isOutOfStock = !p.isAvailable || p.stock <= 0;
                    return (
                      <div
                        key={p.id}
                        onClick={() => setSelectedProduct(p)}
                        className={`bg-surface-container-lowest rounded-2xl p-space-sm md:p-space-md shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all flex flex-col justify-between group cursor-pointer ${
                          isOutOfStock ? 'opacity-65' : ''
                        }`}
                      >
                        <div>
                          <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-surface-container-high mb-space-sm">
                            {p.imageUrl ? (
                              <img
                                src={p.imageUrl}
                                alt={p.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-3xl bg-surface-container">
                                🍽️
                              </div>
                            )}
                            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-surface-container-lowest/90 backdrop-blur-sm text-primary font-label-sm text-label-sm font-bold shadow-sm">
                              {p.category}
                            </span>
                            <span
                              className={`absolute top-2 right-2 px-2 py-0.5 rounded-full font-label-sm text-label-sm font-medium ${
                                isOutOfStock
                                  ? 'bg-red-500 text-white'
                                  : 'bg-emerald-600 text-white'
                              }`}
                            >
                              {isOutOfStock ? 'Habis' : 'Tersedia'}
                            </span>
                          </div>
                          <h3 className="font-headline-sm text-headline-sm text-on-surface truncate font-semibold">
                            {p.name}
                          </h3>
                          <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-1 mb-space-sm">
                            {p.description || 'Pilihan lezat IDN Canteen'}
                          </p>
                        </div>

                        <div className="pt-space-xs border-t border-surface-container flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="font-label-sm text-label-sm text-outline">Harga</span>
                            <span className="font-label-lg text-label-lg text-primary font-bold">
                              Rp {p.price.toLocaleString('id-ID')}
                            </span>
                          </div>
                          <button
                            onClick={(e) => handleQuickAdd(p, e)}
                            disabled={isOutOfStock}
                            className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center shadow-sm transition-all ${
                              isOutOfStock
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-primary hover:bg-primary-container active:scale-90 text-on-primary'
                            }`}
                            title="Tambah ke keranjang"
                          >
                            <span className="material-symbols-outlined text-[20px]">add</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* How It Works Section: 3 Langkah Mudah Jajan */}
          <section className="w-full py-space-xl px-margin md:px-margin-tablet lg:px-margin-desktop bg-surface">
            <div className="max-w-[1280px] mx-auto">
              <div className="text-center max-w-xl mx-auto mb-space-xl">
                <span className="font-label-sm text-label-sm text-primary font-bold tracking-widest uppercase">
                  Alur Pesanan Simpel
                </span>
                <h2 className="font-headline-lg text-headline-lg text-on-surface mt-1 font-bold">
                  Cara Mudah Jajan di IDN Canteen
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-2">
                  Hanya butuh 3 langkah singkat tanpa perlu berdesakan saat lonceng istirahat berbunyi.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg relative">
                {/* Connecting Line for Desktop */}
                <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-0.5 bg-surface-container -translate-y-6 z-0"></div>

                {/* Step 1 */}
                <div className="bg-surface-container-lowest rounded-3xl p-space-lg shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-primary text-on-primary font-headline-sm text-headline-sm font-bold flex items-center justify-center mb-space-md shadow-md">
                    1
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1 font-bold">
                    Pilih Snack & Minuman
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Buka menu lewat HP atau laptop. Masukkan snack, mie, atau minuman favoritmu ke keranjang belanja.
                  </p>
                  <div className="mt-space-md inline-flex items-center gap-1 text-primary font-label-sm text-label-sm font-semibold">
                    <span className="material-symbols-outlined text-[16px]">touch_app</span>
                    Cepat & Praktis
                  </div>
                </div>

                {/* Step 2 */}
                <div className="bg-surface-container-lowest rounded-3xl p-space-lg shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-secondary text-on-secondary font-headline-sm text-headline-sm font-bold flex items-center justify-center mb-space-md shadow-md">
                    2
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1 font-bold">
                    Bayar via Saldo / QRIS
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Selesaikan transaksi memakai Saldo IDN Canteen, QRIS, atau bayar tunai di kasir cepat.
                  </p>
                  <div className="mt-space-md inline-flex items-center gap-1 text-secondary font-label-sm text-label-sm font-semibold">
                    <span className="material-symbols-outlined text-[16px]">qr_code_scanner</span>
                    Cashless Ready
                  </div>
                </div>

                {/* Step 3 */}
                <div className="bg-surface-container-lowest rounded-3xl p-space-lg shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-tertiary text-on-tertiary font-headline-sm text-headline-sm font-bold flex items-center justify-center mb-space-md shadow-md">
                    3
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1 font-bold">
                    Ambil di Counter Tanpa Antre
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Tunjukkan kode pemesanan di loket pengambilan khusus. Pesananmu sudah dikemas rapi!
                  </p>
                  <div className="mt-space-md inline-flex items-center gap-1 text-tertiary font-label-sm text-label-sm font-semibold">
                    <span className="material-symbols-outlined text-[16px]">task_alt</span>
                    Langsung Santap
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Big Call To Action Banner */}
          <section className="w-full py-space-xl px-margin md:px-margin-tablet lg:px-margin-desktop">
            <div className="max-w-[1280px] mx-auto bg-gradient-to-r from-primary to-primary-container rounded-3xl p-space-xl text-on-primary relative overflow-hidden shadow-xl">
              <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
              <div className="absolute top-0 right-1/3 w-64 h-64 bg-secondary/20 rounded-full blur-xl pointer-events-none"></div>

              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-space-lg">
                <div className="max-w-2xl text-center lg:text-left">
                  <span className="px-space-md py-1 rounded-full bg-white/20 text-on-primary font-label-sm text-label-sm font-semibold uppercase tracking-wider inline-block mb-space-sm backdrop-blur-sm">
                    Waktu Istirahat Sangat Berharga
                  </span>
                  <h2 className="font-headline-lg md:font-headline-xl font-bold tracking-tight text-white">
                    Temukan Jajanan Favoritmu!
                  </h2>
                  <p className="font-body-md md:font-body-lg text-on-primary-container mt-space-xs max-w-xl text-blue-100">
                    Cek menu lengkap dan pesan sebelum bel istirahat berbunyi agar kamu punya waktu santai lebih lama bersama teman.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-space-sm shrink-0 w-full sm:w-auto">
                  <Link
                    href="/menu"
                    className="w-full sm:w-auto px-space-xl py-4 bg-surface-container-lowest text-primary hover:bg-surface-container-high rounded-xl font-label-lg text-label-lg font-bold shadow-lg hover:shadow-xl transition-all text-center flex items-center justify-center gap-2"
                  >
                    <span>Pesan Sekarang</span>
                    <span className="material-symbols-outlined text-[20px]">shopping_cart_checkout</span>
                  </Link>
                  <Link
                    href="/orders"
                    className="w-full sm:w-auto px-space-lg py-4 bg-white/10 hover:bg-white/20 text-on-primary rounded-xl font-label-lg text-label-lg font-semibold transition-colors text-center"
                  >
                    Cek Status Jajan
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Floating Quick Cart Bar (Mobile Only: Docked above Bottom Nav) */}
      {totalCartCount > 0 && (
        <div className="md:hidden fixed bottom-20 inset-x-4 z-40 max-w-md mx-auto">
          <div className="bg-inverse-surface/95 backdrop-blur-xl text-inverse-on-surface px-4 py-3 rounded-2xl shadow-xl flex items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary shrink-0">
                <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-label-md text-label-md text-white font-semibold truncate">
                  {totalCartCount} Item di Keranjang
                </span>
                <span className="font-label-sm text-label-sm text-blue-200 font-medium">
                  Rp {totalCartPrice.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
            <Link
              href="/checkout"
              className="h-10 px-4 rounded-xl bg-primary-container text-white font-label-md text-label-md font-semibold flex items-center gap-1.5 shrink-0 active:scale-95 transition-transform shadow-md"
            >
              <span>Lihat Keranjang</span>
              <span>🛒</span>
            </Link>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 pb-safe bg-surface/90 backdrop-blur-xl shadow-[0_-4px_20px_rgba(15,23,42,0.05)] border-t border-surface-container">
        <div className="flex justify-around items-center h-16 px-2">
          <Link
            href="/"
            className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-primary font-semibold"
          >
            <span className="material-symbols-outlined text-[24px]">home</span>
            <span className="font-label-sm text-label-sm">Beranda</span>
          </Link>
          <Link
            href="/menu"
            className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[24px]">restaurant_menu</span>
            <span className="font-label-sm text-label-sm">Menu</span>
          </Link>
          <Link
            href="/orders"
            className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[24px]">receipt_long</span>
            <span className="font-label-sm text-label-sm">Pesanan</span>
          </Link>
          <Link
            href="/profile"
            className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[24px]">account_circle</span>
            <span className="font-label-sm text-label-sm">Profil</span>
          </Link>
        </div>
      </nav>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* Desktop Footer */}
      <footer className="w-full bg-surface-container-lowest mt-space-xl border-t border-surface-container pb-20 md:pb-0">
        <div className="max-w-[1280px] mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop py-space-xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-space-xl">
            <div className="space-y-space-sm md:col-span-1">
              <div className="flex items-center gap-space-xs">
                <span className="font-headline-sm text-headline-sm text-primary font-bold">IDN CANTEEN</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Jajan Praktis, Istirahat Lebih Asik! Layanan pemesanan dan pembayaran digital kantin sekolah terpadu.
              </p>
            </div>

            <div className="space-y-space-sm">
              <span className="font-label-lg text-label-lg text-on-surface font-bold block">Menu & Layanan</span>
              <ul className="space-y-space-xs font-body-sm text-body-sm text-on-surface-variant">
                <li><Link className="hover:text-primary transition-colors" href="/menu">Daftar Menu Harian</Link></li>
                <li><Link className="hover:text-primary transition-colors" href="/menu">Snack & Camilan</Link></li>
                <li><Link className="hover:text-primary transition-colors" href="/menu">Minuman Segar</Link></li>
                <li><Link className="hover:text-primary transition-colors" href="/profile">Top-up Saldo Kartu</Link></li>
              </ul>
            </div>

            <div className="space-y-space-sm">
              <span className="font-label-lg text-label-lg text-on-surface font-bold block">Operasional & Lokasi</span>
              <div className="space-y-space-xs font-body-sm text-body-sm text-on-surface-variant">
                <div className="flex items-start gap-space-xs">
                  <span className="material-symbols-outlined text-[18px] text-primary shrink-0">schedule</span>
                  <span>07:00 - 15:30 WIB (Senin - Jumat)</span>
                </div>
                <div className="flex items-start gap-space-xs">
                  <span className="material-symbols-outlined text-[18px] text-primary shrink-0">location_on</span>
                  <span>Gedung Kantin Lt. 1 IDN Boarding School</span>
                </div>
              </div>
            </div>

            <div className="space-y-space-sm">
              <span className="font-label-lg text-label-lg text-on-surface font-bold block">Komunitas & Bantuan</span>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Hubungi pengelola kantin atau laporkan keluhan menu dengan mudah.
              </p>
              <div className="flex items-center gap-space-sm text-on-surface-variant">
                <a className="p-space-xs rounded-lg hover:bg-surface-container-high hover:text-primary transition-colors" href="#">
                  <span className="material-symbols-outlined text-[20px]">chat</span>
                </a>
                <a className="p-space-xs rounded-lg hover:bg-surface-container-high hover:text-primary transition-colors" href="#">
                  <span className="material-symbols-outlined text-[20px]">mail</span>
                </a>
                <a className="p-space-xs rounded-lg hover:bg-surface-container-high hover:text-primary transition-colors" href="#">
                  <span className="material-symbols-outlined text-[20px]">help_center</span>
                </a>
              </div>
            </div>
          </div>

          <div className="mt-space-xl pt-space-md border-t border-surface-container flex flex-col sm:flex-row items-center justify-between gap-space-sm">
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              © 2026 IDN CANTEEN. Seluruh hak cipta dilindungi.
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              Sistem Kantin Digital Resmi Sekolah
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
