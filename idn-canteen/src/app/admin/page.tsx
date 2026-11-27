'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import {
  AdminStats,
  OrderWithItems,
  ProductWithMeta,
  PRODUCT_CATEGORIES,
  ORDER_STATUS_LABEL,
  PAYMENT_METHOD_LABEL,
} from '@/types';

type AdminTab = 'overview' | 'orders' | 'products' | 'topup';

interface TopupItem {
  id: string;
  amount: number;
  status: string;
  reference: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface ProductFormState {
  id?: string;
  name: string;
  description: string;
  price: string;
  category: string;
  imageUrl: string;
  stock: string;
  isAvailable: boolean;
}

const EMPTY_PRODUCT_FORM: ProductFormState = {
  name: '',
  description: '',
  price: '',
  category: 'Makanan Berat',
  imageUrl: '',
  stock: '20',
  isAvailable: true,
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const [tab, setTab] = useState<AdminTab>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [products, setProducts] = useState<ProductWithMeta[]>([]);
  const [topups, setTopups] = useState<TopupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Filters
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('ALL');
  const [productSearch, setProductSearch] = useState('');
  const [productCatFilter, setProductCatFilter] = useState('ALL');
  const [productStockFilter, setProductStockFilter] = useState('ALL');

  // Product Modal State (Create / Edit)
  const [showProductModal, setShowProductModal] = useState(false);
  const [productForm, setProductForm] = useState<ProductFormState>(EMPTY_PRODUCT_FORM);
  const [savingProduct, setSavingProduct] = useState(false);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2600);
  };

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.push('/');
    }
  }, [user, router]);

  const fetchAllAdminData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes, productsRes, topupRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/orders?limit=100'),
        fetch('/api/admin/products?limit=100'),
        fetch('/api/admin/topup'),
      ]);

      const [statsJson, ordersJson, productsJson, topupJson] = await Promise.all([
        statsRes.json(),
        ordersRes.json(),
        productsRes.json(),
        topupRes.json(),
      ]);

      if (statsJson.success) setStats(statsJson.data);
      if (ordersJson.success) setOrders(ordersJson.data?.orders ?? []);
      if (productsJson.success) setProducts(productsJson.data?.products ?? []);
      if (topupJson.success) setTopups(topupJson.data?.topups ?? []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      showToast('Gagal memuat data dashboard', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllAdminData();
  }, [fetchAllAdminData]);

  // ─── Order Actions ──────────────────────────────────────────────────────────
  const handleUpdateOrderStatus = async (order: OrderWithItems, newStatus: string) => {
    if (newStatus === 'CANCELLED') {
      const refundNote =
        order.paymentMethod === 'BALANCE'
          ? ` Saldo Rp ${order.totalAmount.toLocaleString('id-ID')} akan otomatis di-refund ke ${order.user?.name}.`
          : '';
      if (!confirm(`Batalkan pesanan #${order.orderCode}?${refundNote}`)) return;
    }

    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || 'Gagal update status');

      showToast(
        newStatus === 'CANCELLED' && order.paymentMethod === 'BALANCE'
          ? `Pesanan #${order.orderCode} dibatalkan & saldo di-refund`
          : `Status #${order.orderCode} diubah ke ${ORDER_STATUS_LABEL[newStatus]}`
      );
      fetchAllAdminData();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Gagal mengubah status', 'error');
    }
  };

  // ─── Product CRUD Actions ───────────────────────────────────────────────────
  const openCreateProduct = () => {
    setProductForm(EMPTY_PRODUCT_FORM);
    setShowProductModal(true);
  };

  const openEditProduct = (p: ProductWithMeta) => {
    setProductForm({
      id: p.id,
      name: p.name,
      description: p.description ?? '',
      price: String(p.price),
      category: p.category,
      imageUrl: p.imageUrl ?? '',
      stock: String(p.stock),
      isAvailable: p.isAvailable,
    });
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProduct(true);
    try {
      const payload = {
        name: productForm.name.trim(),
        description: productForm.description.trim() || undefined,
        price: parseInt(productForm.price, 10),
        category: productForm.category,
        imageUrl: productForm.imageUrl.trim() || '',
        stock: parseInt(productForm.stock, 10),
        isAvailable: productForm.isAvailable,
      };

      const isEdit = !!productForm.id;
      const url = isEdit ? `/api/products/${productForm.id}` : '/api/products';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || 'Gagal menyimpan produk');

      showToast(isEdit ? 'Menu berhasil diperbarui' : 'Menu baru berhasil ditambahkan');
      setShowProductModal(false);
      fetchAllAdminData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Gagal menyimpan menu', 'error');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleToggleAvailable = async (p: ProductWithMeta) => {
    try {
      const res = await fetch(`/api/products/${p.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: !p.isAvailable }),
      });
      if (!res.ok) throw new Error('Gagal mengubah ketersediaan');
      showToast(`${p.name} sekarang ${!p.isAvailable ? 'Tersedia' : 'Non-aktif'}`);
      fetchAllAdminData();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Gagal update', 'error');
    }
  };

  const handleDeleteProduct = async (p: ProductWithMeta) => {
    if (!confirm(`Hapus menu "${p.name}" secara permanen?`)) return;
    try {
      const res = await fetch(`/api/products/${p.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || 'Gagal menghapus produk');
      showToast(`Menu "${p.name}" dihapus`);
      fetchAllAdminData();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Produk tidak dapat dihapus (mungkin ada riwayat pesanan)', 'error');
    }
  };

  // ─── Top-Up Verification Actions ────────────────────────────────────────────
  const handleTopupAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch(`/api/admin/topup/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || 'Gagal memproses top-up');
      showToast(json.data?.message || (action === 'approve' ? 'Top-up disetujui' : 'Top-up ditolak'));
      fetchAllAdminData();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Gagal memproses top-up', 'error');
    }
  };

  // Filtered Orders & Products
  const filteredOrders = useMemo(() => {
    if (orderStatusFilter === 'ALL') return orders;
    return orders.filter((o) => o.status === orderStatusFilter);
  }, [orders, orderStatusFilter]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(productSearch.toLowerCase());
      const matchCat = productCatFilter === 'ALL' || p.category === productCatFilter;
      const matchStock =
        productStockFilter === 'ALL' ||
        (productStockFilter === 'available' && p.isAvailable && p.stock > 0) ||
        (productStockFilter === 'low' && p.stock > 0 && p.stock <= 15) ||
        (productStockFilter === 'out' && (!p.isAvailable || p.stock === 0));
      return matchSearch && matchCat && matchStock;
    });
  }, [products, productSearch, productCatFilter, productStockFilter]);

  const activeQueueOrders = useMemo(
    () => orders.filter((o) => ['PENDING', 'PREPARING', 'READY'].includes(o.status)),
    [orders]
  );

  const pendingCount = orders.filter((o) => o.status === 'PENDING').length;

  const NAV_ITEMS: { key: AdminTab; label: string; icon: string; badge?: number }[] = [
    { key: 'overview', label: 'Overview', icon: 'dashboard' },
    { key: 'orders', label: 'Antrean Pesanan', icon: 'receipt_long', badge: activeQueueOrders.length },
    { key: 'products', label: 'Kelola Menu', icon: 'restaurant_menu' },
    { key: 'topup', label: 'Verifikasi Top-Up', icon: 'account_balance_wallet', badge: topups.length },
  ];

  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface antialiased min-h-screen">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-[100] px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-white font-label-md animate-slide-up ${
            toast.type === 'error' ? 'bg-error' : 'bg-emerald-600'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">
            {toast.type === 'error' ? 'error' : 'check_circle'}
          </span>
          <span>{toast.msg}</span>
        </div>
      )}

      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-surface-container-low z-50 flex-col py-space-lg shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="px-space-lg mb-space-lg flex items-center gap-space-sm">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-md">
            <span className="material-symbols-outlined text-[22px]">restaurant</span>
          </div>
          <div className="flex flex-col">
            <span className="font-headline-sm text-primary leading-none font-bold">IDN CANTEEN</span>
            <span className="font-label-sm text-on-surface-variant font-medium mt-1">Staff Portal</span>
          </div>
        </div>

        <nav className="flex-1 px-space-md space-y-space-xs">
          {NAV_ITEMS.map((item) => {
            const isActive = tab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setTab(item.key)}
                className={`w-full flex items-center justify-between px-space-md py-space-sm rounded-xl transition-colors ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                <div className="flex items-center gap-space-sm">
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  <span className="font-label-lg">{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white/25 text-white' : 'bg-primary text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="px-space-md pt-space-md space-y-1 border-t border-surface-container-high">
          <Link
            href="/"
            className="flex items-center gap-space-sm px-space-md py-space-sm rounded-xl text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">storefront</span>
            <span className="font-label-lg">Toko Siswa</span>
          </Link>
          <button
            type="button"
            onClick={async () => {
              await logout();
              router.push('/login');
            }}
            className="w-full flex items-center gap-space-sm px-space-md py-space-sm rounded-xl text-error hover:bg-error-container/50 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span className="font-label-lg">Keluar</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN SHELL WRAPPER ── */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 h-16 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 px-4 lg:px-space-lg flex items-center justify-between gap-4">
          <div className="flex items-center gap-space-sm">
            <span className="lg:hidden font-headline-sm text-primary font-bold">IDN ADMIN</span>
            <span className="hidden lg:inline font-label-md text-on-surface-variant">
              POS & Manajemen Kantin Sekolah
            </span>
          </div>

          <div className="flex items-center gap-space-sm md:gap-space-md">
            <button
              type="button"
              onClick={fetchAllAdminData}
              className="p-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-primary transition-colors flex items-center gap-1 text-xs font-semibold"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
              <span className="hidden sm:inline">Segarkan</span>
            </button>
            <div className="hidden sm:flex items-center gap-space-xs bg-surface-container px-space-sm py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-label-sm text-on-surface-variant font-medium">Kasir Aktif</span>
            </div>
            <div className="flex items-center gap-space-xs">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs">
                {user?.name?.charAt(0).toUpperCase() ?? 'A'}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="font-label-md text-on-surface leading-tight font-semibold">
                  {user?.name ?? 'Admin Kantin'}
                </span>
                <span className="font-label-sm text-on-surface-variant leading-tight">Administrator</span>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile/Tablet Tab Navigation */}
        <div className="lg:hidden bg-surface-container-lowest border-b border-surface-container px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar">
          {NAV_ITEMS.map((item) => {
            const isActive = tab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setTab(item.key)}
                className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container-low text-on-surface-variant'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-white/25 text-[10px] font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 w-full bg-surface p-4 lg:p-space-lg">
          <div className="flex flex-col w-full gap-space-lg max-w-[1360px] mx-auto">
            {/* ── TAB 1: OVERVIEW ── */}
            {tab === 'overview' && (
              <>
                {/* Header Operational Card */}
                <section className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-md bg-surface-container-lowest p-space-lg rounded-2xl shadow-[0_4px_20px_-2px_rgba(15,23,42,0.05)]">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-space-xs">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-label-sm bg-surface-container-high text-primary font-semibold">
                        Operasional Real-Time
                      </span>
                      <span className="text-on-surface-variant font-body-sm">• IDN Boarding School</span>
                    </div>
                    <h1 className="font-headline-lg-mobile md:font-headline-lg text-on-surface tracking-tight font-bold">
                      Admin Dashboard Kantin
                    </h1>
                    <p className="font-body-md text-on-surface-variant">
                      Pantau omzet harian, proses antrean pesanan, kelola katalog menu, dan verifikasi top-up saldo.
                    </p>
                  </div>

                  <div className="flex items-center gap-space-sm bg-surface-container-low p-2.5 px-space-md rounded-xl">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <div className="flex flex-col">
                      <span className="font-label-sm text-on-surface-variant">Status Layanan</span>
                      <span className="font-label-md text-on-surface font-bold">BUKA (Menerima Pesanan)</span>
                    </div>
                  </div>
                </section>

                {/* Key Metrics Bento Grid (4 KPI Cards) */}
                <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
                  {/* KPI 1: Total Pesanan Hari Ini */}
                  <div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-[0_4px_20px_-2px_rgba(15,23,42,0.05)] flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="font-label-md text-on-surface-variant uppercase tracking-wider">
                        Pesanan Masuk Hari Ini
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[22px]">shopping_cart</span>
                      </div>
                    </div>
                    <div className="mt-4 flex items-baseline gap-2">
                      <span className="font-headline-xl text-on-surface font-bold">
                        {loading ? '...' : stats?.todayOrders ?? 0}
                      </span>
                      <span className="font-label-lg text-on-surface-variant">Pesanan</span>
                    </div>
                    <div className="mt-3 flex items-center gap-1.5 text-secondary font-label-sm">
                      <span className="material-symbols-outlined text-[16px]">trending_up</span>
                      <span className="font-semibold">Aktif di antrean: {activeQueueOrders.length}</span>
                    </div>
                  </div>

                  {/* KPI 2: Omzet Hari Ini */}
                  <div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-[0_4px_20px_-2px_rgba(15,23,42,0.05)] flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="font-label-md text-on-surface-variant uppercase tracking-wider">
                        Omzet Hari Ini
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-secondary">
                        <span className="material-symbols-outlined text-[22px]">payments</span>
                      </div>
                    </div>
                    <div className="mt-4 flex items-baseline">
                      <span className="font-headline-lg text-on-surface font-bold">
                        {loading ? '...' : `Rp ${(stats?.todayRevenue ?? 0).toLocaleString('id-ID')}`}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <svg className="w-16 h-4 text-secondary overflow-visible" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5">
                        <path d="M 2 14 L 16 10 L 30 12 L 44 6 L 58 2" />
                      </svg>
                      <span className="font-label-sm text-on-surface-variant">Pendapatan terverifikasi</span>
                    </div>
                  </div>

                  {/* KPI 3: Jumlah Menu Aktif */}
                  <div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-[0_4px_20px_-2px_rgba(15,23,42,0.05)] flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="font-label-md text-on-surface-variant uppercase tracking-wider">
                        Menu Aktif
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[22px]">inventory_2</span>
                      </div>
                    </div>
                    <div className="mt-4 flex items-baseline gap-2">
                      <span className="font-headline-xl text-on-surface font-bold">
                        {loading ? '...' : stats?.activeMenuCount ?? 0}
                      </span>
                      <span className="font-label-lg text-on-surface-variant">Menu</span>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full font-label-sm bg-primary-fixed text-on-primary-fixed font-semibold">
                        Total: {products.length} Terdaftar
                      </span>
                    </div>
                  </div>

                  {/* KPI 4: Antrean & Top-Up Pending */}
                  <div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-[0_4px_20px_-2px_rgba(15,23,42,0.05)] flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="font-label-md text-on-surface-variant uppercase tracking-wider">
                        Top-Up Pending
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-error-container flex items-center justify-center text-error">
                        <span className="material-symbols-outlined text-[22px]">timer</span>
                      </div>
                    </div>
                    <div className="mt-4 flex items-baseline gap-2">
                      <span className="font-headline-xl text-error font-bold">
                        {loading ? '...' : stats?.pendingTopups ?? 0}
                      </span>
                      <span className="font-label-lg text-on-surface-variant">Permintaan</span>
                    </div>
                    <div className="mt-3 flex items-center gap-1.5 text-error font-label-sm">
                      <span className="material-symbols-outlined text-[16px]">priority_high</span>
                      <button
                        type="button"
                        onClick={() => setTab('topup')}
                        className="font-semibold hover:underline"
                      >
                        {pendingCount} pesanan menunggu • Cek Top-Up →
                      </button>
                    </div>
                  </div>
                </section>

                {/* Live Order Queue Snapshot */}
                <section className="bg-surface-container-lowest rounded-2xl shadow-[0_4px_20px_-2px_rgba(15,23,42,0.05)] overflow-hidden">
                  <div className="p-space-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-sm bg-surface-container-low">
                    <div className="flex items-center gap-space-sm">
                      <div className="w-3 h-3 rounded-full bg-secondary-container animate-ping" />
                      <div>
                        <h2 className="font-headline-sm text-on-surface font-bold">Antrean Pesanan Aktif Terbaru</h2>
                        <p className="font-body-sm text-on-surface-variant">
                          {activeQueueOrders.length} pesanan aktif yang sedang berjalan
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTab('orders')}
                      className="px-3 py-1.5 rounded-xl bg-surface-container-lowest text-primary font-label-md font-semibold shadow-sm hover:bg-surface-container transition-colors"
                    >
                      Lihat Semua Pesanan →
                    </button>
                  </div>

                  <OrderTable
                    orders={activeQueueOrders.slice(0, 8)}
                    loading={loading}
                    onUpdateStatus={handleUpdateOrderStatus}
                  />
                </section>
              </>
            )}

            {/* ── TAB 2: ANTREAN PESANAN LENGKAP ── */}
            {tab === 'orders' && (
              <section className="bg-surface-container-lowest rounded-2xl shadow-[0_4px_20px_-2px_rgba(15,23,42,0.05)] overflow-hidden">
                <div className="p-space-lg flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-container-high">
                  <div>
                    <h2 className="font-headline-md text-on-surface font-bold">Manajemen Antrean & Riwayat Pesanan</h2>
                    <p className="font-body-sm text-on-surface-variant">
                      Ubah status pesanan. Pembatalan pesanan metode BALANCE akan otomatis me-refund saldo siswa.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                    {['ALL', 'PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setOrderStatusFilter(st)}
                        className={`px-3 py-1.5 rounded-full font-label-sm font-semibold shrink-0 transition-all ${
                          orderStatusFilter === st
                            ? 'bg-primary text-on-primary shadow-sm'
                            : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                        }`}
                      >
                        {st === 'ALL' ? 'Semua' : ORDER_STATUS_LABEL[st]}
                      </button>
                    ))}
                  </div>
                </div>

                <OrderTable
                  orders={filteredOrders}
                  loading={loading}
                  onUpdateStatus={handleUpdateOrderStatus}
                />
              </section>
            )}

            {/* ── TAB 3: KELOLA MENU (CRUD LENGKAP) ── */}
            {tab === 'products' && (
              <section className="bg-surface-container-lowest rounded-2xl shadow-[0_4px_20px_-2px_rgba(15,23,42,0.05)] p-space-lg flex flex-col gap-space-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-sm border-b border-surface-container-high">
                  <div>
                    <h2 className="font-headline-md text-on-surface font-bold">Manajemen Katalog & Harga Menu</h2>
                    <p className="font-body-md text-on-surface-variant">
                      Tambah menu baru, perbarui harga & stok fisik, toggle ketersediaan, atau hapus produk.
                    </p>
                  </div>
                  <span className="font-label-md text-primary bg-primary-fixed px-3 py-1 rounded-full font-semibold self-start sm:self-auto">
                    {products.length} Total Produk
                  </span>
                </div>

                {/* Action Toolbar */}
                <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-space-md">
                  <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-space-sm">
                    <div className="relative flex-1">
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant">
                        search
                      </span>
                      <input
                        type="text"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        placeholder="Cari produk (contoh: Nasi Goreng, Es Teh)..."
                        className="w-full bg-surface-container-low text-on-surface pl-10 pr-4 py-2.5 rounded-xl font-body-md focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none transition-all placeholder:text-on-surface-variant"
                      />
                    </div>
                    <div className="flex items-center gap-space-xs">
                      <select
                        value={productCatFilter}
                        onChange={(e) => setProductCatFilter(e.target.value)}
                        className="bg-surface-container-low text-on-surface-variant px-3 py-2.5 rounded-xl font-label-md focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="ALL">Semua Kategori</option>
                        {PRODUCT_CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <select
                        value={productStockFilter}
                        onChange={(e) => setProductStockFilter(e.target.value)}
                        className="bg-surface-container-low text-on-surface-variant px-3 py-2.5 rounded-xl font-label-md focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="ALL">Semua Status Stok</option>
                        <option value="available">Tersedia</option>
                        <option value="low">Stok Tipis (≤ 15)</option>
                        <option value="out">Habis / Non-aktif</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={openCreateProduct}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary hover:bg-primary-container text-on-primary transition-colors rounded-xl font-label-lg font-semibold shadow-sm shrink-0"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    <span>Tambah Produk Baru</span>
                  </button>
                </div>

                {/* Product Management Table */}
                <div className="w-full overflow-x-auto rounded-xl bg-surface-container-low/40">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-surface-container text-on-surface-variant font-label-md">
                      <tr>
                        <th className="py-3 px-space-md">Gambar & Nama Produk</th>
                        <th className="py-3 px-space-md">Kategori</th>
                        <th className="py-3 px-space-md">Harga Satuan</th>
                        <th className="py-3 px-space-md">Stok Fisik</th>
                        <th className="py-3 px-space-md">Ketersediaan</th>
                        <th className="py-3 px-space-md text-right">Aksi Cepat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container-high text-body-md">
                      {filteredProducts.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-10 text-center text-on-surface-variant">
                            Tidak ada menu yang cocok dengan filter.
                          </td>
                        </tr>
                      ) : (
                        filteredProducts.map((p) => (
                          <tr key={p.id} className="hover:bg-surface-container-lowest transition-colors">
                            <td className="py-3.5 px-space-md">
                              <div className="flex items-center gap-space-sm">
                                {p.imageUrl ? (
                                  <img
                                    src={p.imageUrl}
                                    alt={p.name}
                                    className="w-12 h-12 rounded-lg object-cover bg-surface-container shrink-0"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-2xl shrink-0">
                                    🍽️
                                  </div>
                                )}
                                <div className="flex flex-col min-w-0">
                                  <span className="font-label-lg text-on-surface font-semibold truncate">{p.name}</span>
                                  <span className="font-body-sm text-on-surface-variant line-clamp-1 max-w-xs">
                                    {p.description || '—'}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-space-md">
                              <span className="px-2.5 py-1 rounded-full text-label-sm bg-primary-fixed text-on-primary-fixed font-semibold whitespace-nowrap">
                                {p.category}
                              </span>
                            </td>
                            <td className="py-3.5 px-space-md font-label-lg text-primary font-bold whitespace-nowrap">
                              Rp {p.price.toLocaleString('id-ID')}
                            </td>
                            <td className="py-3.5 px-space-md whitespace-nowrap">
                              <span className={`font-label-lg font-bold ${p.stock <= 5 ? 'text-error' : 'text-on-surface'}`}>
                                {p.stock}
                              </span>{' '}
                              <span className="text-on-surface-variant font-body-sm">pcs</span>
                            </td>
                            <td className="py-3.5 px-space-md">
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={p.isAvailable}
                                  onChange={() => handleToggleAvailable(p)}
                                  className="sr-only peer"
                                />
                                <div className="w-10 h-5 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-secondary" />
                                <span className="ml-2 font-label-sm text-on-surface font-medium whitespace-nowrap">
                                  {p.isAvailable ? 'Tersedia' : 'Non-aktif'}
                                </span>
                              </label>
                            </td>
                            <td className="py-3.5 px-space-md text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => openEditProduct(p)}
                                  className="px-3 py-1.5 rounded-lg text-primary bg-primary-fixed hover:bg-primary hover:text-on-primary font-label-sm font-semibold transition-colors"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteProduct(p)}
                                  className="px-3 py-1.5 rounded-lg text-error bg-error-container hover:bg-error hover:text-on-error font-label-sm font-semibold transition-colors"
                                >
                                  Hapus
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* ── TAB 4: VERIFIKASI TOP-UP ── */}
            {tab === 'topup' && (
              <section className="bg-surface-container-lowest rounded-2xl shadow-[0_4px_20px_-2px_rgba(15,23,42,0.05)] overflow-hidden">
                <div className="p-space-lg border-b border-surface-container-high flex items-center justify-between">
                  <div>
                    <h2 className="font-headline-md text-on-surface font-bold">Verifikasi Permintaan Top-Up Saldo</h2>
                    <p className="font-body-sm text-on-surface-variant">
                      Setujui atau tolak permintaan top-up saldo dari santri/staff. Saldo akan otomatis bertambah setelah disetujui.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-label-sm font-bold">
                    {topups.length} Menunggu
                  </span>
                </div>

                <div className="divide-y divide-surface-container-high">
                  {topups.length === 0 ? (
                    <div className="py-12 text-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-[40px] text-emerald-500 mb-2 block">task_alt</span>
                      Semua permintaan top-up telah diproses!
                    </div>
                  ) : (
                    topups.map((tx) => (
                      <div key={tx.id} className="p-space-md md:p-space-lg flex flex-wrap items-center justify-between gap-4 hover:bg-surface-container-low/50">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[24px]">account_balance_wallet</span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-label-lg text-on-surface font-bold truncate">{tx.user?.name}</p>
                            <p className="font-body-sm text-on-surface-variant truncate">
                              {tx.user?.email} • {new Date(tx.createdAt).toLocaleString('id-ID')}
                            </p>
                            {tx.reference && (
                              <p className="font-body-sm text-primary text-[12px] mt-0.5 truncate">{tx.reference}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 ml-auto">
                          <span className="font-headline-sm text-emerald-600 font-bold">
                            + Rp {tx.amount.toLocaleString('id-ID')}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleTopupAction(tx.id, 'approve')}
                              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-label-md font-semibold flex items-center gap-1 shadow-sm transition-colors"
                            >
                              <span className="material-symbols-outlined text-[16px]">check</span>
                              <span>Setujui</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleTopupAction(tx.id, 'reject')}
                              className="px-4 py-2 rounded-xl bg-error-container hover:bg-error hover:text-white text-on-error-container font-label-md font-semibold flex items-center gap-1 transition-colors"
                            >
                              <span className="material-symbols-outlined text-[16px]">close</span>
                              <span>Tolak</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            )}
          </div>
        </main>
      </div>

      {/* ── MODAL FORM TAMBAH / EDIT PRODUK ── */}
      {showProductModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-surface-container-lowest w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between border-b border-surface-container pb-3">
              <h3 className="font-headline-sm text-on-surface font-bold">
                {productForm.id ? 'Edit Menu Kantin' : 'Tambah Menu Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setShowProductModal(false)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block font-label-md text-on-surface mb-1">Nama Menu *</label>
                <input
                  type="text"
                  required
                  minLength={2}
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="Contoh: Nasi Goreng Spesial"
                  className="w-full h-11 px-3.5 rounded-xl bg-surface-container-low text-on-surface outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-label-md text-on-surface mb-1">Kategori *</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full h-11 px-3 rounded-xl bg-surface-container-low text-on-surface outline-none focus:ring-2 focus:ring-primary"
                  >
                    {PRODUCT_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-label-md text-on-surface mb-1">Harga (Rp) *</label>
                  <input
                    type="number"
                    required
                    min={500}
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    placeholder="15000"
                    className="w-full h-11 px-3.5 rounded-xl bg-surface-container-low text-on-surface outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block font-label-md text-on-surface mb-1">Stok *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-xl bg-surface-container-low text-on-surface outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productForm.isAvailable}
                      onChange={(e) => setProductForm({ ...productForm, isAvailable: e.target.checked })}
                      className="w-5 h-5 accent-primary rounded"
                    />
                    <span className="font-label-md text-on-surface font-semibold">Menu Tersedia</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-label-md text-on-surface mb-1">URL Gambar (opsional)</label>
                <input
                  type="url"
                  value={productForm.imageUrl}
                  onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full h-11 px-3.5 rounded-xl bg-surface-container-low text-on-surface outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block font-label-md text-on-surface mb-1">Deskripsi (opsional)</label>
                <textarea
                  rows={2}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Keterangan singkat porsi atau rasa..."
                  className="w-full p-3 rounded-xl bg-surface-container-low text-on-surface outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="flex-1 h-11 rounded-xl bg-surface-container text-on-surface font-label-md font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingProduct}
                  className="flex-1 h-11 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-md font-semibold shadow-sm disabled:opacity-50"
                >
                  {savingProduct ? 'Menyimpan...' : 'Simpan Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Reusable Order Table Component ──────────────────────────────────────────
function OrderTable({
  orders,
  loading,
  onUpdateStatus,
}: {
  orders: OrderWithItems[];
  loading: boolean;
  onUpdateStatus: (order: OrderWithItems, status: string) => void;
}) {
  if (loading) {
    return <div className="p-8 text-center text-on-surface-variant">Memuat data pesanan...</div>;
  }

  if (orders.length === 0) {
    return <div className="p-10 text-center text-on-surface-variant">Tidak ada pesanan pada filter ini.</div>;
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead className="bg-surface-container text-on-surface-variant font-label-md">
          <tr>
            <th className="py-3 px-space-md">Order ID</th>
            <th className="py-3 px-space-md">Pemesan</th>
            <th className="py-3 px-space-md">Rincian Produk</th>
            <th className="py-3 px-space-md">Total & Metode</th>
            <th className="py-3 px-space-md">Status Alur</th>
            <th className="py-3 px-space-md text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-container-high text-body-md">
          {orders.map((order) => {
            const isFinal = order.status === 'COMPLETED' || order.status === 'CANCELLED';
            return (
              <tr key={order.id} className="hover:bg-surface-container-low/60 transition-colors">
                <td className="py-3.5 px-space-md font-semibold text-primary font-label-lg whitespace-nowrap">
                  #{order.orderCode}
                </td>
                <td className="py-3.5 px-space-md">
                  <div className="font-label-lg text-on-surface font-semibold">{order.user?.name ?? 'User'}</div>
                  <div className="font-body-sm text-on-surface-variant">{order.user?.email}</div>
                </td>
                <td className="py-3.5 px-space-md">
                  <div className="flex items-center gap-1.5 flex-wrap max-w-xs">
                    {order.items.map((item) => (
                      <span
                        key={item.id}
                        className="px-2 py-0.5 rounded-md bg-surface-container text-on-surface font-label-sm"
                      >
                        {item.quantity}x {item.product.name}
                      </span>
                    ))}
                  </div>
                  {order.notes && (
                    <p className="font-body-sm text-primary text-[11px] mt-1">📝 {order.notes}</p>
                  )}
                </td>
                <td className="py-3.5 px-space-md whitespace-nowrap">
                  <div className="font-label-lg text-on-surface font-bold">
                    Rp {order.totalAmount.toLocaleString('id-ID')}
                  </div>
                  <div className="font-body-sm text-on-surface-variant">
                    {PAYMENT_METHOD_LABEL[order.paymentMethod] ?? order.paymentMethod}
                  </div>
                </td>
                <td className="py-3.5 px-space-md">
                  <select
                    value={order.status}
                    disabled={isFinal}
                    onChange={(e) => onUpdateStatus(order, e.target.value)}
                    className={`px-3 py-1.5 rounded-lg font-label-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary ${
                      order.status === 'PENDING'
                        ? 'bg-amber-100 text-amber-800'
                        : order.status === 'PREPARING'
                        ? 'bg-blue-100 text-blue-800'
                        : order.status === 'READY'
                        ? 'bg-emerald-100 text-emerald-800'
                        : order.status === 'COMPLETED'
                        ? 'bg-gray-100 text-gray-700'
                        : 'bg-error-container text-on-error-container'
                    }`}
                  >
                    <option value="PENDING">Menunggu</option>
                    <option value="PREPARING">Diproses</option>
                    <option value="READY">Siap Diambil</option>
                    <option value="COMPLETED">Selesai</option>
                    <option value="CANCELLED">Dibatalkan</option>
                  </select>
                </td>
                <td className="py-3.5 px-space-md text-right whitespace-nowrap">
                  {!isFinal ? (
                    <div className="inline-flex items-center gap-1.5">
                      {order.status === 'PENDING' && (
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(order, 'PREPARING')}
                          className="px-3 py-1.5 rounded-lg bg-primary text-on-primary font-label-sm font-semibold hover:bg-primary-container transition-colors"
                        >
                          Proses
                        </button>
                      )}
                      {order.status === 'PREPARING' && (
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(order, 'READY')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-label-sm font-semibold hover:bg-emerald-700 transition-colors"
                        >
                          Siap Ambil
                        </button>
                      )}
                      {order.status === 'READY' && (
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(order, 'COMPLETED')}
                          className="px-3 py-1.5 rounded-lg bg-secondary text-on-secondary font-label-sm font-semibold hover:opacity-90 transition-opacity"
                        >
                          Selesaikan
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onUpdateStatus(order, 'CANCELLED')}
                        className="px-2.5 py-1.5 rounded-lg bg-error-container text-on-error-container font-label-sm font-semibold hover:bg-error hover:text-white transition-colors"
                      >
                        Batalkan
                      </button>
                    </div>
                  ) : (
                    <span className="font-label-sm text-outline">Final</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
