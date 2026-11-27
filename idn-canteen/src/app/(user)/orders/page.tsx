'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { OrderWithItems, ORDER_STATUS_LABEL, PAYMENT_METHOD_LABEL } from '@/types';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

type TabType = 'active' | 'history';

function OrdersContent() {
  const searchParams = useSearchParams();
  const successCode = searchParams.get('success');
  const { user } = useAuthStore();
  const { getTotalItems } = useCartStore();

  const [tab, setTab] = useState<TabType>('active');
  const [activeOrders, setActiveOrders] = useState<OrderWithItems[]>([]);
  const [historyOrders, setHistoryOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [tokenOrder, setTokenOrder] = useState<OrderWithItems | null>(null);

  const totalCartCount = getTotalItems();
  const userBalance = user?.balance ?? 0;

  const fetchAllOrders = useCallback(async () => {
    setLoading(true);
    try {
      const [activeRes, historyRes] = await Promise.all([
        fetch('/api/orders?status=PENDING,PREPARING,READY&limit=50'),
        fetch('/api/orders?status=COMPLETED,CANCELLED&limit=50'),
      ]);
      const [activeJson, historyJson] = await Promise.all([
        activeRes.json(),
        historyRes.json(),
      ]);

      setActiveOrders(activeJson.data?.orders ?? []);
      setHistoryOrders(historyJson.data?.orders ?? []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllOrders();
  }, [fetchAllOrders]);

  const getProgressPercent = (status: string) => {
    if (status === 'PENDING') return '15%';
    if (status === 'PREPARING') return '50%';
    if (status === 'READY') return '85%';
    if (status === 'COMPLETED') return '100%';
    return '0%';
  };

  const getStepIndex = (status: string) => {
    if (status === 'PENDING') return 0;
    if (status === 'PREPARING') return 1;
    if (status === 'READY') return 2;
    if (status === 'COMPLETED') return 3;
    return -1;
  };

  const displayedOrders = tab === 'active' ? activeOrders : historyOrders;

  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface antialiased min-h-screen flex flex-col justify-between">
      {/* ── DESKTOP HEADER ── */}
      <header className="hidden md:block fixed top-0 left-0 w-full z-50 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-20 max-w-[1280px] mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop flex items-center justify-between gap-space-md">
          <Link href="/" className="flex items-center gap-space-sm">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-md">
              <span className="material-symbols-outlined text-[22px]">restaurant</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-primary tracking-tight font-bold">IDN CANTEEN</span>
              <span className="font-label-sm text-on-surface-variant">Jajan Praktis, Istirahat Lebih Asik!</span>
            </div>
          </Link>

          <nav className="flex items-center gap-space-xs">
            <Link
              href="/"
              className="px-space-md py-space-sm rounded-xl font-label-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
            >
              Beranda
            </Link>
            <Link
              href="/menu"
              className="px-space-md py-space-sm rounded-xl font-label-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
            >
              Daftar Menu
            </Link>
            <Link
              href="/orders"
              aria-current="page"
              className="px-space-md py-space-sm rounded-xl transition-colors bg-primary-container text-on-primary-container font-headline-sm font-semibold"
            >
              Pesanan Saya
            </Link>
            {user?.role === 'ADMIN' && (
              <Link
                href="/admin"
                className="px-space-md py-space-sm rounded-xl font-label-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
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
                <span className="absolute -top-1 -right-1 bg-primary text-on-primary font-label-sm font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
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
                  <span className="font-label-md text-on-surface leading-tight font-semibold">
                    {user.name.split(' ')[0]}
                  </span>
                  <span className="font-label-sm text-primary leading-tight font-medium">
                    {user.role === 'ADMIN' ? 'Administrator' : `Rp ${userBalance.toLocaleString('id-ID')}`}
                  </span>
                </div>
              </Link>
            ) : (
              <Link href="/login" className="px-space-md py-2 rounded-xl bg-primary text-white font-label-md">
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
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-label-sm text-primary uppercase tracking-wider font-semibold">Kantin Buka</span>
            </div>
            <span className="font-headline-sm text-primary font-bold tracking-tight truncate">IDN</span>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle className="w-9 h-9" />
            <button
              type="button"
              onClick={fetchAllOrders}
              aria-label="Muat ulang pesanan"
              className="w-10 h-10 flex items-center justify-center rounded-xl text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[22px]">refresh</span>
            </button>
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
      <main className="flex-1 w-full pt-16 md:pt-20 pb-24 md:pb-16 bg-surface">
        <div className="w-full max-w-[1280px] mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop py-space-md md:py-space-lg space-y-space-lg">
          {/* Top Bar & Tab Selector */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
            <div className="space-y-space-xs">
              <div className="flex items-center gap-space-xs">
                <span className="inline-flex items-center px-space-sm py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm font-semibold">
                  Status Terkini Santri
                </span>
                <span className="font-body-sm text-on-surface-variant">• Layanan Kantin Digital</span>
              </div>
              <h1 className="font-headline-lg-mobile md:font-headline-lg text-on-surface tracking-tight font-bold">
                Pesanan & Riwayat Jajan
              </h1>
              <p className="font-body-md text-on-surface-variant">
                Pantau antrean jajananmu secara real-time tanpa perlu menunggu di depan counter.
              </p>
            </div>

            {/* Segmented Navigation Chips */}
            <div className="flex items-center p-1.5 rounded-2xl bg-surface-container-low shadow-sm overflow-x-auto shrink-0" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'active'}
                onClick={() => setTab('active')}
                className={`px-space-md py-space-sm rounded-xl font-label-lg transition-all flex items-center gap-space-xs shrink-0 ${
                  tab === 'active'
                    ? 'bg-primary text-on-primary shadow-md font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">timelapse</span>
                <span>Pesanan Aktif</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ml-1 ${
                    tab === 'active' ? 'bg-white/20 text-on-primary' : 'bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  {activeOrders.length}
                </span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={tab === 'history'}
                onClick={() => setTab('history')}
                className={`px-space-md py-space-sm rounded-xl font-label-lg transition-all flex items-center gap-space-xs shrink-0 ${
                  tab === 'history'
                    ? 'bg-primary text-on-primary shadow-md font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                <span>Riwayat</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ml-1 ${
                    tab === 'history' ? 'bg-white/20 text-on-primary' : 'bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  {historyOrders.length}
                </span>
              </button>
            </div>
          </div>

          {/* Success Banner setelah Checkout */}
          {successCode && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[22px]">check_circle</span>
                </div>
                <div>
                  <h3 className="font-label-lg text-emerald-900 font-bold">Pesanan Berhasil Dibuat!</h3>
                  <p className="font-body-sm text-emerald-700">
                    Kode pesanan: <strong className="font-bold">#{successCode}</strong> — Pesananmu sedang diteruskan ke kasir.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={fetchAllOrders}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-label-sm font-semibold hover:bg-emerald-700 transition-colors"
              >
                Segarkan Status
              </button>
            </div>
          )}

          {/* MAIN LAYOUT GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
            {/* LEFT & CENTRAL MAIN REGION */}
            <div className="lg:col-span-8 flex flex-col space-y-space-md">
              {loading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm space-y-4 animate-pulse">
                    <div className="flex justify-between">
                      <div className="h-5 w-36 bg-surface-container-high rounded" />
                      <div className="h-6 w-24 bg-surface-container-high rounded-full" />
                    </div>
                    <div className="h-20 bg-surface-container-low rounded-xl" />
                    <div className="h-14 bg-surface-container-low rounded-xl" />
                  </div>
                ))
              ) : displayedOrders.length === 0 ? (
                <div className="bg-surface-container-lowest rounded-3xl p-10 text-center shadow-sm flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-surface-container-high text-primary flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-[32px]">
                      {tab === 'active' ? 'timelapse' : 'history'}
                    </span>
                  </div>
                  <h3 className="font-headline-sm text-on-surface font-bold">
                    {tab === 'active' ? 'Belum Ada Pesanan Aktif' : 'Belum Ada Riwayat Pesanan'}
                  </h3>
                  <p className="font-body-sm text-on-surface-variant mt-1 max-w-xs">
                    {tab === 'active'
                      ? 'Yuk pesan snack atau makanan favoritmu di IDN Canteen sekarang!'
                      : 'Pesanan yang telah selesai atau dibatalkan akan muncul di sini.'}
                  </p>
                  <Link
                    href="/menu"
                    className="mt-5 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-label-md font-semibold shadow-sm hover:bg-primary-container transition-all"
                  >
                    Jelajahi Menu Kantin
                  </Link>
                </div>
              ) : tab === 'active' ? (
                /* ── TAB 1: PESANAN AKTIF ── */
                activeOrders.map((order) => {
                  const stepIdx = getStepIndex(order.status);
                  return (
                    <div
                      key={order.id}
                      className="bg-surface-container-lowest rounded-2xl p-space-md md:p-space-lg shadow-sm space-y-space-md"
                    >
                      {/* Card Header & Pickup ID */}
                      <div className="flex flex-wrap items-center justify-between gap-space-sm pb-space-xs">
                        <div className="flex items-center gap-space-sm">
                          <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center text-primary shrink-0">
                            <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                              restaurant_menu
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-space-xs flex-wrap">
                              <span className="font-headline-sm text-on-surface font-bold">
                                #{order.orderCode}
                              </span>
                              <span
                                className={`px-2.5 py-0.5 rounded-full font-label-sm font-semibold ${
                                  order.status === 'READY'
                                    ? 'bg-emerald-100 text-emerald-800 animate-pulse'
                                    : order.status === 'PREPARING'
                                    ? 'bg-secondary-fixed text-on-secondary-fixed animate-pulse'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {ORDER_STATUS_LABEL[order.status] ?? order.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-space-xs text-on-surface-variant font-body-sm mt-0.5">
                              <span className="material-symbols-outlined text-[15px]">schedule</span>
                              <span>
                                {new Date(order.createdAt).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}{' '}
                                WIB
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setTokenOrder(order)}
                          className="px-space-md py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-label-md font-semibold flex items-center gap-1.5 transition-transform active:scale-95 shadow-sm"
                        >
                          <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
                          <span>Token Kasir</span>
                        </button>
                      </div>

                      {/* 4-Step Tracker Flow */}
                      <div className="p-space-md rounded-2xl bg-surface-container-low space-y-space-md">
                        <div className="flex items-center justify-between">
                          <span className="font-label-md text-on-surface font-bold">Progres Pesanan Anda</span>
                          <span className="font-label-sm text-primary font-bold">
                            {order.status === 'READY'
                              ? 'Siap Diambil Sekarang!'
                              : order.status === 'PREPARING'
                              ? 'Sedang Disiapkan...'
                              : 'Menunggu Konfirmasi'}
                          </span>
                        </div>

                        <div className="relative pt-2 pb-1">
                          {/* Track Line */}
                          <div className="absolute top-7 left-6 right-6 h-1.5 bg-surface-container-highest rounded-full -translate-y-1/2 z-0">
                            <div
                              className="h-full bg-primary rounded-full transition-all duration-700"
                              style={{ width: getProgressPercent(order.status) }}
                            />
                          </div>

                          {/* Steps Grid */}
                          <div className="relative z-10 grid grid-cols-4 gap-2 text-center">
                            {[
                              { label: '1. Menunggu', sub: 'Terkirim', icon: 'check' },
                              { label: '2. Diproses', sub: 'Disiapkan', icon: 'soup_kitchen' },
                              { label: '3. Siap Ambil', sub: 'Counter 1', icon: 'inventory' },
                              { label: '4. Selesai', sub: 'Selamat Jajan', icon: 'done_all' },
                            ].map((step, idx) => {
                              const isCompleted = idx < stepIdx;
                              const isCurrent = idx === stepIdx;
                              return (
                                <div key={step.label} className="flex flex-col items-center">
                                  <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all ${
                                      isCompleted
                                        ? 'bg-primary text-on-primary shadow-md'
                                        : isCurrent
                                        ? 'bg-primary-container text-on-primary-container shadow-md ring-4 ring-primary-fixed animate-bounce'
                                        : 'bg-surface-container-highest text-on-surface-variant'
                                    }`}
                                  >
                                    <span className="material-symbols-outlined text-[20px]">{step.icon}</span>
                                  </div>
                                  <span
                                    className={`font-label-md text-[11px] md:text-[12px] ${
                                      isCurrent ? 'text-primary font-bold' : isCompleted ? 'text-on-surface font-semibold' : 'text-outline'
                                    }`}
                                  >
                                    {step.label}
                                  </span>
                                  <span className="font-body-sm text-[10px] text-on-surface-variant hidden sm:block">
                                    {step.sub}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Rincian Item Jajan */}
                      <div className="space-y-space-xs">
                        <span className="font-label-md text-on-surface font-bold flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[18px] text-primary">shopping_bag</span>
                          Rincian Item ({order.items.length} Menu)
                        </span>
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                {item.product.imageUrl ? (
                                  <img
                                    src={item.product.imageUrl}
                                    alt={item.product.name}
                                    className="w-11 h-11 rounded-lg object-cover shrink-0"
                                  />
                                ) : (
                                  <div className="w-11 h-11 rounded-lg bg-surface-container flex items-center justify-center text-xl shrink-0">
                                    🍽️
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <p className="font-label-md text-on-surface font-semibold truncate">
                                    {item.product.name}
                                  </p>
                                  {item.itemNote ? (
                                    <p className="font-body-sm text-primary text-[11px] truncate">
                                      📝 {item.itemNote}
                                    </p>
                                  ) : (
                                    <p className="font-body-sm text-on-surface-variant text-[11px]">
                                      Rp {item.unitPrice.toLocaleString('id-ID')} / porsi
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="text-right shrink-0 ml-2">
                                <span className="inline-block px-2 py-0.5 rounded bg-surface-container-high text-on-surface font-label-sm font-bold">
                                  {item.quantity}x
                                </span>
                                <p className="font-label-sm text-primary font-bold mt-0.5">
                                  Rp {item.subtotal.toLocaleString('id-ID')}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Lokasi & Pembayaran Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm pt-1">
                        <div className="p-3 rounded-xl bg-surface-container flex items-center gap-3">
                          <span className="material-symbols-outlined text-primary text-[22px]">storefront</span>
                          <div>
                            <p className="font-label-sm text-on-surface-variant uppercase text-[10px]">Lokasi Pengambilan</p>
                            <p className="font-label-md text-on-surface font-bold">Counter Kantin Lt. 1</p>
                          </div>
                        </div>
                        <div className="p-3 rounded-xl bg-surface-container flex items-center justify-between">
                          <div>
                            <p className="font-label-sm text-on-surface-variant uppercase text-[10px]">
                              {PAYMENT_METHOD_LABEL[order.paymentMethod] ?? order.paymentMethod}
                            </p>
                            <p className="font-headline-sm text-primary font-bold">
                              Rp {order.totalAmount.toLocaleString('id-ID')}
                            </p>
                          </div>
                          <span className="material-symbols-outlined text-secondary text-[22px]">payments</span>
                        </div>
                      </div>

                      {order.notes && (
                        <div className="px-3 py-2 rounded-xl bg-surface-container-low text-xs text-on-surface-variant flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px] text-primary">edit_note</span>
                          <span>Catatan: {order.notes}</span>
                        </div>
                      )}

                      {/* Bottom CTA */}
                      <button
                        type="button"
                        onClick={() => setTokenOrder(order)}
                        className="w-full py-3 px-space-md rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-lg font-semibold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
                      >
                        <span className="material-symbols-outlined text-[20px]">badge</span>
                        <span>Tunjukkan ke Petugas Kantin (Ambil Jajan)</span>
                      </button>
                    </div>
                  );
                })
              ) : (
                /* ── TAB 2: RIWAYAT PESANAN ── */
                <div className="grid grid-cols-1 gap-space-sm">
                  {historyOrders.map((order) => {
                    const isCancelled = order.status === 'CANCELLED';
                    return (
                      <div
                        key={order.id}
                        className="bg-surface-container-lowest p-space-md rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-space-md"
                      >
                        <div className="flex items-start sm:items-center gap-space-md min-w-0">
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                              isCancelled
                                ? 'bg-error-container text-error'
                                : 'bg-surface-container-high text-primary'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[26px]">
                              {isCancelled ? 'cancel' : 'receipt_long'}
                            </span>
                          </div>
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-space-xs flex-wrap">
                              <span className="font-label-lg text-on-surface font-bold">#{order.orderCode}</span>
                              <span className="font-body-sm text-on-surface-variant">
                                •{' '}
                                {new Date(order.createdAt).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <p className="font-body-md text-on-surface truncate">
                              {order.items.map((i) => `${i.product.name} (${i.quantity}x)`).join(', ')}
                            </p>
                            <p className="font-body-sm text-on-surface-variant">
                              Total: <strong className="text-on-surface">Rp {order.totalAmount.toLocaleString('id-ID')}</strong> (
                              {PAYMENT_METHOD_LABEL[order.paymentMethod] ?? order.paymentMethod})
                            </p>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-space-xs shrink-0">
                          <span
                            className={`inline-flex items-center gap-1 px-space-sm py-1 rounded-full font-label-md font-semibold ${
                              isCancelled
                                ? 'bg-error-container text-on-error-container'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              {isCancelled ? 'close' : 'check_circle'}
                            </span>
                            {ORDER_STATUS_LABEL[order.status] ?? order.status}
                          </span>
                          <Link
                            href="/menu"
                            className="font-label-sm text-primary hover:underline font-semibold"
                          >
                            Pesan Lagi →
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* RIGHT REGION: STICKY INFO & QUICK ACTION PANEL (Desktop) */}
            <div className="lg:col-span-4 space-y-space-md lg:sticky lg:top-24">
              {/* Student Help & Operational Info Banner */}
              <div className="p-space-md rounded-2xl bg-surface-container-high space-y-space-xs shadow-sm">
                <div className="flex items-center gap-space-xs text-primary">
                  <span className="material-symbols-outlined text-[20px]">notifications_active</span>
                  <span className="font-label-lg font-bold">Info Pengambilan Istirahat</span>
                </div>
                <p className="font-body-sm text-on-surface-variant leading-relaxed">
                  Pesanan langsung diteruskan ke kasir kantin. Klik <strong>Token Kasir</strong> atau tunjukkan kode pesanan di layar HP saat counter memanggil nama atau nomor antreanmu.
                </p>
              </div>

              {/* Quick Link Card */}
              <div className="p-space-md rounded-2xl bg-surface-container-lowest shadow-sm space-y-3">
                <h3 className="font-headline-sm text-on-surface font-bold">Butuh Tambahan Jajan?</h3>
                <p className="font-body-sm text-on-surface-variant">
                  Cek menu minuman dingin atau snack ringan lainnya sebelum kembali ke kelas.
                </p>
                <div className="flex flex-col gap-2">
                  <Link
                    href="/menu"
                    className="w-full py-2.5 px-4 rounded-xl bg-primary text-on-primary font-label-md font-semibold flex items-center justify-center gap-2 hover:bg-primary-container transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">restaurant_menu</span>
                    <span>Lihat Daftar Menu</span>
                  </Link>
                  <button
                    type="button"
                    onClick={fetchAllOrders}
                    className="w-full py-2.5 px-4 rounded-xl bg-surface-container text-primary font-label-md font-semibold flex items-center justify-center gap-2 hover:bg-surface-container-high transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">refresh</span>
                    <span>Perbarui Status Pesanan</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── MODAL: QR TOKEN DISPLAY UNTUK PETUGAS KANTIN ── */}
      {tokenOrder && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-space-md"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-surface-container-lowest max-w-sm w-full rounded-3xl p-space-lg shadow-2xl space-y-space-md animate-slide-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <div className="w-8 h-8 rounded-lg bg-primary-fixed text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                </div>
                <span className="font-headline-sm text-on-surface font-bold">Token Ambil Santri</span>
              </div>
              <button
                type="button"
                onClick={() => setTokenOrder(null)}
                className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="text-center space-y-1">
              <span className="font-headline-lg font-bold text-primary tracking-wider block">
                #{tokenOrder.orderCode}
              </span>
              <p className="font-body-sm text-on-surface-variant">
                Tunjukkan kode ini ke petugas kasir di Counter Kantin Lt. 1.
              </p>
            </div>

            {/* Clean SVG QR Code Representation */}
            <div className="p-space-md rounded-2xl bg-surface-container-low flex flex-col items-center justify-center space-y-2">
              <svg className="w-40 h-40 text-on-surface" fill="currentColor" viewBox="0 0 100 100">
                <rect fill="none" height="24" rx="2" stroke="currentColor" strokeWidth="4" width="24" x="10" y="10" />
                <rect height="10" width="10" x="17" y="17" />
                <rect fill="none" height="24" rx="2" stroke="currentColor" strokeWidth="4" width="24" x="66" y="10" />
                <rect height="10" width="10" x="73" y="17" />
                <rect fill="none" height="24" rx="2" stroke="currentColor" strokeWidth="4" width="24" x="10" y="66" />
                <rect height="10" width="10" x="17" y="73" />
                <rect height="6" width="6" x="42" y="14" />
                <rect height="6" width="12" x="48" y="22" />
                <rect height="10" width="6" x="42" y="32" />
                <rect height="6" width="12" x="14" y="42" />
                <rect height="8" width="10" x="30" y="44" />
                <rect height="10" width="10" x="46" y="46" />
                <rect height="6" width="12" x="62" y="44" />
                <rect height="10" width="6" x="80" y="42" />
                <rect height="6" width="10" x="44" y="62" />
                <rect height="10" width="8" x="64" y="64" />
                <rect height="6" width="10" x="78" y="68" />
                <rect height="8" width="8" x="42" y="78" />
                <rect height="10" width="14" x="60" y="80" />
                <rect height="6" width="8" x="80" y="82" />
              </svg>
              <span className="font-label-md text-primary font-bold">
                Total: Rp {tokenOrder.totalAmount.toLocaleString('id-ID')} • {ORDER_STATUS_LABEL[tokenOrder.status]}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setTokenOrder(null)}
              className="w-full py-3 rounded-xl bg-primary text-on-primary font-label-lg font-semibold hover:bg-primary-container transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 pb-safe bg-surface/90 backdrop-blur-xl shadow-[0_-4px_20px_rgba(15,23,42,0.05)] border-t border-surface-container">
        <div className="flex justify-around items-center h-16 px-2">
          <Link href="/" className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[24px]">home</span>
            <span className="font-label-sm text-label-sm">Beranda</span>
          </Link>
          <Link href="/menu" className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[24px]">restaurant_menu</span>
            <span className="font-label-sm text-label-sm">Menu</span>
          </Link>
          <Link href="/orders" aria-current="page" className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-primary font-semibold">
            <span className="material-symbols-outlined text-[24px]">receipt_long</span>
            <span className="font-label-sm text-label-sm">Pesanan</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[24px]">account_circle</span>
            <span className="font-label-sm text-label-sm">Profil</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-surface">
          <div className="flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-primary text-[36px] animate-spin">progress_activity</span>
            <p className="font-body-sm text-on-surface-variant">Memuat pesanan Anda...</p>
          </div>
        </div>
      }
    >
      <OrdersContent />
    </Suspense>
  );
}
