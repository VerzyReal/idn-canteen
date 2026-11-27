'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { ProductWithMeta } from '@/types';
import { ProductDetailModal } from '@/components/product/ProductDetailModal';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'available';

export default function MenuPage() {
  const { user } = useAuthStore();
  const {
    items: cartItems,
    addItem,
    updateQuantity,
    getTotalItems,
    getTotalPrice,
  } = useCartStore();

  const [products, setProducts] = useState<ProductWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('Semua');
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [selectedProduct, setSelectedProduct] = useState<ProductWithMeta | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const totalCartCount = getTotalItems();
  const totalCartPrice = getTotalPrice();

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products?limit=100');
      const json = await res.json();
      if (json.success && json.data?.products) {
        setProducts(json.data.products);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Hitung kategori & jumlah produk per kategori dari database
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { Semua: products.length };
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  const categories = useMemo(() => {
    const uniqueCats = Array.from(new Set(products.map((p) => p.category)));
    return ['Semua', ...uniqueCats];
  }, [products]);

  // Filter & Sort Produk
  const filteredProducts = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    const filtered = products.filter((p) => {
      const matchCategory = activeCategory === 'Semua' || p.category === activeCategory;
      const matchSearch =
        query === '' ||
        p.name.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query)) ||
        p.category.toLowerCase().includes(query);
      const isAvail = p.isAvailable && p.stock > 0;
      const matchAvail = !onlyAvailable || isAvail;

      return matchCategory && matchSearch && matchAvail;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name, 'id');
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name, 'id');
      if (sortBy === 'available') {
        const aAvail = a.isAvailable && a.stock > 0 ? 1 : 0;
        const bAvail = b.isAvailable && b.stock > 0 ? 1 : 0;
        return bAvail - aAvail;
      }
      // default: tersedia di atas, lalu urutan nama
      const aAvail = a.isAvailable && a.stock > 0 ? 1 : 0;
      const bAvail = b.isAvailable && b.stock > 0 ? 1 : 0;
      if (aAvail !== bAvail) return bAvail - aAvail;
      return a.name.localeCompare(b.name, 'id');
    });
  }, [products, searchQuery, activeCategory, onlyAvailable, sortBy]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 1800);
  };

  const getCartQty = (productId: string) => {
    return cartItems.find((i) => i.productId === productId)?.quantity ?? 0;
  };

  const handleAdd = (product: ProductWithMeta, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product.isAvailable || product.stock <= 0) return;
    addItem(product, 1);
    showToast(`Ditambahkan: ${product.name}`);
  };

  const handleUpdateQty = (product: ProductWithMeta, newQty: number, e: React.MouseEvent) => {
    e.stopPropagation();
    updateQuantity(product.id, newQty);
  };

  const getCategoryIcon = (cat: string) => {
    const lower = cat.toLowerCase();
    if (cat === 'Semua') return 'widgets';
    if (lower.includes('minum')) return 'local_cafe';
    if (lower.includes('snack')) return 'cookie';
    return 'lunch_dining';
  };

  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface antialiased min-h-screen flex flex-col justify-between">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-on-surface text-surface px-4 py-2.5 rounded-full shadow-xl font-label-sm flex items-center gap-2 animate-slide-up">
          <span className="material-symbols-outlined text-[18px] text-emerald-400">check_circle</span>
          <span className="font-medium text-white">{toastMessage}</span>
        </div>
      )}

      {/* ── DESKTOP & TABLET HEADER ── */}
      <header className="hidden md:block fixed top-0 left-0 w-full z-50 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-20 max-w-[1280px] mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop flex items-center justify-between gap-space-md">
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
          </div>

          <nav className="flex items-center gap-space-xs">
            <Link
              href="/"
              className="px-space-md py-space-sm rounded-xl font-label-lg text-label-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
            >
              Beranda
            </Link>
            <Link
              href="/menu"
              aria-current="page"
              className="px-space-md py-space-sm rounded-xl transition-colors bg-primary-container text-on-primary-container font-headline-sm font-semibold"
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

          <div className="flex items-center gap-space-sm shrink-0">
            <ThemeToggle />
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

      {/* ── MOBILE HEADER ── */}
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
              IDN
            </span>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle className="w-9 h-9" />
            <Link
              href="/checkout"
              className="relative w-11 h-11 flex items-center justify-center rounded-xl text-on-surface-variant hover:text-on-surface transition-colors"
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
      <main className="flex-1 w-full pt-16 md:pt-24 pb-32 md:pb-16 bg-surface">
        <div className="max-w-[1280px] mx-auto px-gutter md:px-margin-tablet lg:px-margin-desktop">
          {/* Header Title & Subtitle Section */}
          <section className="flex flex-col md:flex-row md:items-end justify-between gap-space-sm mb-4 md:mb-6 pt-3 md:pt-0">
            <div className="space-y-1">
              <div className="hidden md:inline-flex items-center gap-space-xs bg-surface-container-high text-primary px-space-sm py-1 rounded-full font-label-sm text-label-sm font-semibold tracking-wide mb-1">
                <span className="material-symbols-outlined text-[16px]">storefront</span>
                KANTIN UTAMA • GEDUNG LT. 1
              </div>
              <div className="flex items-center justify-between gap-2">
                <h1 className="font-headline-lg-mobile md:font-headline-xl text-on-surface tracking-tight font-bold">
                  Menu IDN Canteen
                </h1>
                <span className="md:hidden inline-flex items-center gap-1 bg-surface-container text-primary font-label-sm px-2.5 py-1 rounded-full font-semibold">
                  <span className="material-symbols-outlined text-[14px]">storefront</span>
                  Katalog Aktif
                </span>
              </div>
              <p className="font-body-md text-on-surface-variant">
                Semua jajanan favoritmu ada di sini ({products.length} Produk)
              </p>
            </div>

            {/* Desktop Summary Card */}
            <div className="hidden md:flex items-center gap-space-sm bg-surface-container-lowest p-space-sm rounded-2xl shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[22px]">inventory_2</span>
              </div>
              <div>
                <span className="font-label-sm text-on-surface-variant block uppercase tracking-wider">
                  Total Item Siap Jajan
                </span>
                <span className="font-headline-sm text-on-surface font-bold">
                  {products.filter((p) => p.isAvailable && p.stock > 0).length} Menu Tersedia
                </span>
              </div>
            </div>
          </section>

          {/* Search Bar & Sticky Filter Navigation */}
          <div className="sticky top-16 md:top-20 z-30 -mx-gutter md:mx-0 px-gutter md:px-space-md py-2.5 md:py-space-md bg-surface/95 md:bg-surface-container-lowest backdrop-blur-md md:rounded-2xl md:shadow-sm transition-all mb-4 md:mb-6">
            {/* Search & Sort Row */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 md:gap-space-sm mb-3">
              {/* Search Input */}
              <div className="md:col-span-6 lg:col-span-7 relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-outline">
                  <span className="material-symbols-outlined text-[20px]">search</span>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nasi goreng, mie, snack, atau minuman..."
                  className="w-full h-11 md:h-12 pl-10 pr-10 bg-surface-container-lowest md:bg-surface-container-low text-on-surface placeholder:text-outline font-body-md rounded-xl shadow-sm md:shadow-none focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-outline hover:text-on-surface"
                  >
                    <span className="material-symbols-outlined text-[18px]">cancel</span>
                  </button>
                )}
              </div>

              {/* Sort Select (Desktop inline, Mobile in quick controls below) */}
              <div className="hidden md:flex md:col-span-3 lg:col-span-3 relative items-center">
                <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[20px]">
                  swap_vert
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="w-full h-12 pl-10 pr-8 bg-surface-container-low rounded-xl font-label-md text-on-surface appearance-none focus:ring-2 focus:ring-primary/25 transition-all outline-none cursor-pointer"
                >
                  <option value="default">Urutan: Rekomendasi</option>
                  <option value="price-asc">Harga: Termurah</option>
                  <option value="price-desc">Harga: Termahal</option>
                  <option value="name-asc">Nama: A - Z</option>
                  <option value="name-desc">Nama: Z - A</option>
                  <option value="available">Stok Tersedia Dulu</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 text-outline pointer-events-none text-[18px]">
                  expand_more
                </span>
              </div>

              {/* Availability Toggle (Desktop) */}
              <div className="hidden md:flex md:col-span-3 lg:col-span-2 items-center justify-center px-3 bg-surface-container-low rounded-xl h-12">
                <label className="flex items-center gap-2 cursor-pointer select-none font-label-md text-on-surface">
                  <input
                    type="checkbox"
                    checked={onlyAvailable}
                    onChange={(e) => setOnlyAvailable(e.target.checked)}
                    className="w-4 h-4 accent-primary cursor-pointer rounded"
                  />
                  <span>Tersedia Saja</span>
                </label>
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
              {categories.map((cat) => {
                const isActive = activeCategory === cat;
                const count = categoryCounts[cat] ?? 0;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`shrink-0 flex items-center gap-1.5 px-4 h-9 rounded-full font-label-md transition-all ${
                      isActive
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {getCategoryIcon(cat)}
                    </span>
                    <span>
                      {cat} ({count})
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Mobile Quick Pill Controls: Filter Tersedia & Sort Dropdown */}
            <div className="flex md:hidden items-center justify-between gap-2 mt-2.5 pt-1">
              <button
                onClick={() => setOnlyAvailable(!onlyAvailable)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-label-sm transition-colors ${
                  onlyAvailable
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'bg-surface-container-low text-on-surface-variant'
                }`}
              >
                <span>Hanya yang Tersedia</span>
                <span className="material-symbols-outlined text-[15px]">
                  {onlyAvailable ? 'check_circle' : 'radio_button_unchecked'}
                </span>
              </button>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="appearance-none bg-surface-container-low text-on-surface-variant font-label-sm pl-3 pr-7 py-1.5 rounded-lg outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="default">Urutan: Rekomendasi</option>
                  <option value="price-asc">Harga Termurah</option>
                  <option value="price-desc">Harga Termahal</option>
                  <option value="name-asc">Nama A-Z</option>
                  <option value="name-desc">Nama Z-A</option>
                </select>
                <span className="material-symbols-outlined text-[15px] text-on-surface-variant absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  arrow_drop_down
                </span>
              </div>
            </div>
          </div>

          {/* Info Counter Row */}
          <div className="flex items-center justify-between px-1 mb-3">
            <div className="flex items-center gap-1.5">
              <span className="font-headline-sm text-on-surface font-bold">
                {activeCategory === 'Semua' ? 'Semua Jajanan' : activeCategory}
              </span>
              <span className="font-body-sm text-on-surface-variant">
                ({filteredProducts.length} menu ditampilkan)
              </span>
            </div>
            <span className="font-label-sm text-outline hidden sm:inline-block">
              Ketuk kartu untuk melihat detail & catatan khusus
            </span>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-space-md">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-surface-container-lowest rounded-2xl p-3 animate-pulse">
                  <div className="w-full aspect-[4/3] rounded-xl bg-surface-container-high mb-2.5"></div>
                  <div className="h-3 bg-surface-container-high rounded w-16 mb-2"></div>
                  <div className="h-4 bg-surface-container-high rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-surface-container-high rounded w-1/2 mb-3"></div>
                  <div className="h-8 bg-surface-container-high rounded"></div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 px-4 text-center bg-surface-container-lowest rounded-3xl shadow-sm">
              <div className="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center text-primary mb-3">
                <span className="material-symbols-outlined text-[32px]">sentiment_dissatisfied</span>
              </div>
              <h3 className="font-headline-sm text-on-surface font-bold">Jajanan tidak ditemukan</h3>
              <p className="font-body-sm text-on-surface-variant mt-1 max-w-[260px]">
                Coba cari dengan kata kunci lain atau periksa filter kategori & ketersediaan.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('Semua');
                  setOnlyAvailable(false);
                  setSortBy('default');
                }}
                className="mt-4 px-5 py-2 rounded-xl bg-primary text-on-primary font-label-md font-semibold shadow-sm hover:bg-primary-container transition-all"
              >
                Reset Semua Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-space-md">
              {filteredProducts.map((product) => {
                const isOutOfStock = !product.isAvailable || product.stock <= 0;
                const cartQty = getCartQty(product.id);

                return (
                  <article
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    className={`group flex flex-col bg-surface-container-lowest rounded-2xl p-2.5 md:p-space-md shadow-sm hover:shadow-md transition-all relative overflow-hidden cursor-pointer ${
                      isOutOfStock ? 'opacity-70 grayscale-[30%]' : ''
                    }`}
                  >
                    {/* Thumbnail & Stock Status Badge */}
                    <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-surface-container mb-2">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl bg-surface-container">
                          🍽️
                        </div>
                      )}

                      {/* Status Badge */}
                      {isOutOfStock ? (
                        <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-red-600/90 text-white font-label-sm text-[10px] font-semibold flex items-center gap-1 backdrop-blur-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-white"></span> Habis
                        </span>
                      ) : (
                        <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-emerald-500/90 text-white font-label-sm text-[10px] font-semibold flex items-center gap-1 backdrop-blur-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-white"></span> Tersedia
                        </span>
                      )}

                      {/* Stock Count Pill if low stock */}
                      {!isOutOfStock && product.stock <= 10 && (
                        <span className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-full bg-amber-100/95 text-amber-900 font-label-sm text-[10px] font-semibold backdrop-blur-sm">
                          Sisa {product.stock}
                        </span>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex flex-col flex-grow justify-between">
                      <div>
                        <span className="font-label-sm text-[10px] text-primary uppercase font-bold tracking-wide">
                          {product.category}
                        </span>
                        <h3 className="font-label-lg text-on-surface line-clamp-1 mt-0.5 font-semibold group-hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                        <p className="font-body-sm text-on-surface-variant line-clamp-1 mt-0.5">
                          {product.description || 'Menu pilihan kantin IDN'}
                        </p>
                      </div>

                      {/* Price & Interactive Cart Controls */}
                      <div className="flex items-end justify-between mt-3 pt-2 border-t border-surface-container/60 gap-1">
                        <div className="flex flex-col">
                          <span className="font-label-sm text-[10px] text-outline">Harga</span>
                          <span className="font-headline-sm text-[14px] md:text-[16px] text-primary font-bold">
                            Rp {product.price.toLocaleString('id-ID')}
                          </span>
                        </div>

                        {isOutOfStock ? (
                          <button
                            disabled
                            onClick={(e) => e.stopPropagation()}
                            className="px-2.5 h-8 rounded-xl bg-gray-100 text-gray-400 font-label-sm text-[11px] font-semibold cursor-not-allowed"
                          >
                            Habis
                          </button>
                        ) : cartQty > 0 ? (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center bg-surface-container rounded-xl p-0.5 shadow-sm"
                          >
                            <button
                              type="button"
                              onClick={(e) => handleUpdateQty(product, cartQty - 1, e)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg text-on-surface-variant hover:text-error hover:bg-surface-container-high transition-colors"
                            >
                              <span className="material-symbols-outlined text-[15px]">remove</span>
                            </button>
                            <span className="font-label-md px-2 text-on-surface font-bold text-xs">
                              {cartQty}
                            </span>
                            <button
                              type="button"
                              disabled={cartQty >= product.stock}
                              onClick={(e) => handleUpdateQty(product, cartQty + 1, e)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg text-primary hover:bg-surface-container-high transition-colors disabled:opacity-40"
                            >
                              <span className="material-symbols-outlined text-[15px]">add</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => handleAdd(product, e)}
                            className="w-8 h-8 md:w-9 md:h-9 rounded-full md:rounded-xl bg-primary hover:bg-primary-container text-on-primary flex items-center justify-center shadow-sm active:scale-90 transition-all"
                            title="Tambah ke keranjang"
                          >
                            <span className="material-symbols-outlined text-[18px]">add</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
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
                <span className="font-label-md text-white font-semibold truncate">
                  {totalCartCount} Item di Keranjang
                </span>
                <span className="font-label-sm text-blue-200 font-medium">
                  Rp {totalCartPrice.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
            <Link
              href="/checkout"
              className="h-10 px-4 rounded-xl bg-primary-container text-white font-label-md font-semibold flex items-center gap-1.5 shrink-0 active:scale-95 transition-transform shadow-md"
            >
              <span>Checkout</span>
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
            className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[24px]">home</span>
            <span className="font-label-sm text-label-sm">Beranda</span>
          </Link>
          <Link
            href="/menu"
            aria-current="page"
            className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-primary font-semibold"
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
    </div>
  );
}
