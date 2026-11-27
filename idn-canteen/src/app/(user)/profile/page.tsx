'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { WalletTransactionWithMeta, TOPUP_DENOMINATIONS } from '@/types';
import { ThemeToggle, ThemeSelector } from '@/components/ui/ThemeToggle';

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser, logout } = useAuthStore();
  const { getTotalItems } = useCartStore();

  const [transactions, setTransactions] = useState<WalletTransactionWithMeta[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  const [selectedNominal, setSelectedNominal] = useState<number | ''>(50000);
  const [customAmount, setCustomAmount] = useState('');
  const [topupMethod, setTopupMethod] = useState('QRIS Instan');
  const [topupLoading, setTopupLoading] = useState(false);
  const [topupSuccess, setTopupSuccess] = useState('');
  const [topupError, setTopupError] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);

  const totalCartCount = getTotalItems();

  const fetchWalletData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/wallet?limit=30');
      const json = await res.json();
      if (json.success && json.data) {
        setTransactions(json.data.transactions ?? []);
        const newBal = json.data.balance ?? 0;
        setBalance(newBal);
        if (user) {
          setUser({ ...user, balance: newBal });
        }
      }
    } catch (err) {
      console.error('Failed to fetch wallet:', err);
    } finally {
      setLoading(false);
    }
  }, [setUser]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);

  const handleTopup = async () => {
    const amount = typeof selectedNominal === 'number' ? selectedNominal : parseInt(customAmount, 10);
    if (!amount || isNaN(amount) || amount < 10000) {
      setTopupError('Nominal top-up minimal Rp 10.000');
      return;
    }
    if (amount > 5000000) {
      setTopupError('Nominal top-up maksimal Rp 5.000.000');
      return;
    }

    setTopupLoading(true);
    setTopupError('');
    setTopupSuccess('');

    try {
      const res = await fetch('/api/wallet/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          reference: `Top-Up via ${topupMethod} (Rp ${amount.toLocaleString('id-ID')})`,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Gagal mengajukan top-up');
      }

      setTopupSuccess(
        `Permintaan top-up Rp ${amount.toLocaleString('id-ID')} berhasil dikirim. Menunggu verifikasi admin.`
      );
      setCustomAmount('');
      await fetchWalletData();
    } catch (e: unknown) {
      setTopupError(e instanceof Error ? e.message : 'Gagal mengajukan top-up');
    } finally {
      setTopupLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const getTxStyle = (type: string) => {
    if (type === 'TOPUP') {
      return {
        icon: 'south_west',
        bg: 'bg-emerald-100 text-emerald-700',
        amountClass: 'text-emerald-600',
        prefix: '+',
      };
    }
    if (type === 'REFUND') {
      return {
        icon: 'replay',
        bg: 'bg-primary-fixed text-primary',
        amountClass: 'text-primary',
        prefix: '+',
      };
    }
    return {
      icon: 'fastfood',
      bg: 'bg-orange-100 text-orange-700',
      amountClass: 'text-error',
      prefix: '−',
    };
  };

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
            <Link href="/" className="px-space-md py-space-sm rounded-xl font-label-lg text-on-surface-variant hover:bg-surface-container-high transition-colors">
              Beranda
            </Link>
            <Link href="/menu" className="px-space-md py-space-sm rounded-xl font-label-lg text-on-surface-variant hover:bg-surface-container-high transition-colors">
              Daftar Menu
            </Link>
            <Link href="/orders" className="px-space-md py-space-sm rounded-xl font-label-lg text-on-surface-variant hover:bg-surface-container-high transition-colors">
              Pesanan Saya
            </Link>
            {user?.role === 'ADMIN' && (
              <Link href="/admin" className="px-space-md py-space-sm rounded-xl font-label-lg text-on-surface-variant hover:bg-surface-container-high transition-colors">
                Admin Dashboard
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-space-sm shrink-0">
            <ThemeToggle />
            <Link
              href="/checkout"
              className="relative p-space-sm rounded-xl bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant transition-colors flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-on-primary font-label-sm font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                  {totalCartCount}
                </span>
              )}
            </Link>

            <div className="flex items-center gap-space-sm pl-space-xs py-1 pr-space-sm rounded-full bg-primary-fixed">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs uppercase">
                {user?.name?.charAt(0) ?? '?'}
              </div>
              <div className="flex flex-col text-left">
                <span className="font-label-md text-on-primary-fixed leading-tight font-semibold">
                  {user?.name?.split(' ')[0] ?? 'User'}
                </span>
                <span className="font-label-sm text-primary leading-tight font-medium">
                  {user?.role === 'ADMIN' ? 'Administrator' : `Rp ${balance.toLocaleString('id-ID')}`}
                </span>
              </div>
            </div>
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
            <Link href="/menu" className="w-11 h-11 flex items-center justify-center rounded-xl text-on-surface-variant">
              <span className="material-symbols-outlined text-[22px]">search</span>
            </Link>
            <Link href="/checkout" className="relative w-11 h-11 flex items-center justify-center rounded-xl text-on-surface-variant">
              <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
              {totalCartCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary text-on-primary font-label-sm text-[10px] flex items-center justify-center font-bold">
                  {totalCartCount}
                </span>
              )}
            </Link>
            <div className="w-8 h-8 ml-1 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user?.name?.charAt(0).toUpperCase() ?? '?'}
            </div>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 w-full pt-16 md:pt-24 pb-24 md:pb-16 bg-surface">
        <div className="max-w-[1024px] mx-auto px-gutter md:px-margin-tablet space-y-5 pt-2 md:pt-0">
          {/* Top bar header inside content */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-high text-primary font-label-sm font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Kantin IDN Terhubung
                </span>
              </div>
              <h1 className="font-headline-lg-mobile md:font-headline-lg text-on-surface tracking-tight font-bold">
                {user?.role === 'ADMIN' ? 'Profil Akun Admin' : 'Profil & Kartu Santri'}
              </h1>
            </div>
            <button
              type="button"
              onClick={fetchWalletData}
              aria-label="Segarkan data saldo"
              className="w-10 h-10 rounded-full bg-surface-container-lowest shadow-sm flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">refresh</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* LEFT COLUMN: Profile Card, IDN Smart Card, Quick Actions */}
            <div className="lg:col-span-5 space-y-5">
              {/* Santri Profile Banner */}
              <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xl shadow-inner">
                      {user?.name?.charAt(0).toUpperCase() ?? '?'}
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-primary text-on-primary rounded-full p-1 shadow-sm flex items-center justify-center">
                      <span className="material-symbols-outlined text-[12px]">verified</span>
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h2 className="font-label-lg text-on-surface font-bold truncate">
                        {user?.name ?? 'Memuat...'}
                      </h2>
                      <span className="px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-[10px] font-bold">
                        {user?.role ?? 'USER'}
                      </span>
                    </div>
                    <p className="font-body-sm text-on-surface-variant truncate">{user?.email ?? '—'}</p>
                    <p className="font-label-sm text-primary flex items-center gap-1 mt-0.5">
                      <span className="material-symbols-outlined text-[13px]">domain</span>
                      IDN Boarding School
                    </p>
                  </div>
                </div>
              </div>

              {/* Kartu Digital Santri & Quick Actions (Hanya untuk STUDENT / STAFF) */}
              {user?.role !== 'ADMIN' && (
                <>
                  {/* Kartu Digital Santri IDN (NFC Virtual Card) */}
                  <div className="relative overflow-hidden rounded-2xl shadow-xl bg-gradient-to-tr from-primary to-secondary p-space-lg text-on-primary min-h-[205px] flex flex-col justify-between">
                    <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-white/10 blur-xl pointer-events-none" />
                    <div className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full bg-secondary-container/20 blur-lg pointer-events-none" />

                    {/* Header Card */}
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                          <span className="material-symbols-outlined text-[20px] text-white">school</span>
                        </div>
                        <div>
                          <span className="block font-label-lg text-white font-bold tracking-wider leading-none">
                            IDN SMART CARD
                          </span>
                          <span className="block font-label-sm text-white/80 tracking-widest text-[10px]">
                            DIGITAL CANTEEN
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-label-sm px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 backdrop-blur-md flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
                          Aktif
                        </span>
                        <span className="material-symbols-outlined text-white/80 text-[22px]">contactless</span>
                      </div>
                    </div>

                    {/* NFC Chip & Account ID */}
                    <div className="relative z-10 my-3 flex items-center justify-between">
                      <div className="w-11 h-8 rounded-md bg-gradient-to-br from-tertiary-fixed to-tertiary-fixed-dim shadow-md flex items-center justify-center relative overflow-hidden">
                        <div className="w-full h-full opacity-60 flex flex-col justify-around py-1 px-1.5">
                          <div className="w-full h-[1px] bg-tertiary" />
                          <div className="w-full h-[1px] bg-tertiary" />
                          <div className="w-full h-[1px] bg-tertiary" />
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-label-sm text-white/70 uppercase tracking-widest text-[9px]">ID Akun Santri</p>
                        <p className="font-label-lg tracking-[0.15em] text-white font-mono text-[14px]">
                          IDN •••• {user?.userId?.slice(-4).toUpperCase() ?? '0000'}
                        </p>
                      </div>
                    </div>

                    {/* Sisa Saldo */}
                    <div className="relative z-10 flex items-end justify-between pt-2">
                      <div>
                        <span className="block font-label-sm text-white/80 text-[11px]">Sisa Saldo Jajan Aktif</span>
                        <div className="flex items-baseline gap-1">
                          <span className="font-headline-sm text-white/90">Rp</span>
                          <span className="font-headline-lg-mobile text-white font-bold tracking-tight">
                            {balance.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions (4 Grid Button) */}
                  <div className="grid grid-cols-4 gap-2">
                    <a
                      href="#section-topup"
                      className="group flex flex-col items-center justify-center p-2.5 rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all text-center"
                    >
                      <div className="w-11 h-11 rounded-xl bg-primary text-on-primary flex items-center justify-center mb-1.5 shadow-sm group-hover:scale-105 transition-transform">
                        <span className="material-symbols-outlined text-[22px]">add_card</span>
                      </div>
                      <span className="font-label-md text-on-surface leading-tight">Top Up</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => setShowQrModal(true)}
                      className="group flex flex-col items-center justify-center p-2.5 rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all text-center"
                    >
                      <div className="w-11 h-11 rounded-xl bg-surface-container-high text-primary flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                        <span className="material-symbols-outlined text-[22px]">qr_code_scanner</span>
                      </div>
                      <span className="font-label-md text-on-surface leading-tight">QR Kasir</span>
                    </button>

                    <Link
                      href="/orders"
                      className="group flex flex-col items-center justify-center p-2.5 rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all text-center"
                    >
                      <div className="w-11 h-11 rounded-xl bg-surface-container-high text-primary flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                        <span className="material-symbols-outlined text-[22px]">receipt_long</span>
                      </div>
                      <span className="font-label-md text-on-surface leading-tight">Pesanan</span>
                    </Link>

                    <Link
                      href="/menu"
                      className="group flex flex-col items-center justify-center p-2.5 rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all text-center"
                    >
                      <div className="w-11 h-11 rounded-xl bg-surface-container-high text-primary flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                        <span className="material-symbols-outlined text-[22px]">restaurant_menu</span>
                      </div>
                      <span className="font-label-md text-on-surface leading-tight">Menu</span>
                    </Link>
                  </div>
                </>
              )}

              {/* Pengaturan Tema & Akun (Desktop & Mobile) */}
              <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm space-y-3">
                <h3 className="font-headline-sm text-on-surface font-bold">Tema Tampilan</h3>
                <ThemeSelector />
                <div className="hidden lg:block pt-2">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full py-3 rounded-xl bg-error-container/70 hover:bg-error-container text-on-error-container font-label-md font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    <span>Keluar dari Akun</span>
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Panel Admin (jika ADMIN) atau Top-Up & Mutasi (jika STUDENT/STAFF) */}
            <div className="lg:col-span-7 space-y-5">
              {user?.role === 'ADMIN' ? (
                <section className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary-fixed text-primary flex items-center justify-center">
                      <span className="material-symbols-outlined text-[28px]">admin_panel_settings</span>
                    </div>
                    <div>
                      <h3 className="font-headline-sm text-on-surface font-bold">Panel Pengelola Kantin</h3>
                      <p className="font-body-sm text-on-surface-variant">
                        Akun Administrator tidak menggunakan saldo jajan pribadi. Kelola seluruh operasional kantin melalui Admin Dashboard.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <Link
                      href="/admin"
                      className="flex items-center gap-3 p-4 rounded-xl bg-primary text-on-primary shadow-md hover:bg-primary-container transition-colors"
                    >
                      <span className="material-symbols-outlined text-[24px]">dashboard</span>
                      <div>
                        <span className="font-label-lg font-bold block">Buka Admin Dashboard</span>
                        <span className="font-body-sm text-blue-100 text-[11px]">KPI, Antrean, Menu & Top-Up</span>
                      </div>
                    </Link>

                    <Link
                      href="/menu"
                      className="flex items-center gap-3 p-4 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface transition-colors"
                    >
                      <span className="material-symbols-outlined text-primary text-[24px]">storefront</span>
                      <div>
                        <span className="font-label-lg font-bold block">Lihat Katalog Toko</span>
                        <span className="font-body-sm text-on-surface-variant text-[11px]">Pratinjau tampilan siswa</span>
                      </div>
                    </Link>
                  </div>
                </section>
              ) : (
                <>
              {/* SECTION TOP UP CEPAT SALDO */}
              <section id="section-topup" className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-headline-sm text-on-surface font-bold">Isi Ulang Saldo Kantin</h3>
                    <p className="font-body-sm text-on-surface-variant">
                      Pilih nominal instan atau masukkan nominal custom (min. Rp 10.000)
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-primary text-[24px]">account_balance_wallet</span>
                </div>

                {/* Nominal Pills */}
                <div>
                  <span className="font-label-sm text-on-surface-variant block mb-2">Pilih Nominal Top Up</span>
                  <div className="grid grid-cols-2 gap-2.5">
                    {TOPUP_DENOMINATIONS.map((nom) => {
                      const isActive = selectedNominal === nom;
                      return (
                        <button
                          key={nom}
                          type="button"
                          onClick={() => {
                            setSelectedNominal(nom);
                            setCustomAmount('');
                          }}
                          className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-label-md text-left relative overflow-hidden transition-all ${
                            isActive
                              ? 'bg-primary text-on-primary shadow-sm'
                              : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                          }`}
                        >
                          <span className="font-semibold">Rp {nom.toLocaleString('id-ID')}</span>
                          <span
                            className={`material-symbols-outlined text-[16px] ${
                              isActive ? 'text-on-primary' : 'text-outline-variant'
                            }`}
                          >
                            check_circle
                          </span>
                          {nom === 50000 && (
                            <span className="absolute -top-0.5 -right-4 bg-tertiary-fixed text-on-tertiary-fixed text-[8px] font-bold px-4 py-0.5 transform rotate-12 uppercase">
                              Populer
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Input Manual Custom */}
                <div className="space-y-1.5">
                  <label className="font-label-sm text-on-surface-variant" htmlFor="custom-nominal">
                    Atau Masukkan Nominal Lain
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 font-label-md text-on-surface-variant font-bold">Rp</span>
                    <input
                      id="custom-nominal"
                      type="number"
                      min={10000}
                      max={5000000}
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value);
                        setSelectedNominal('');
                      }}
                      placeholder="Contoh: 75000"
                      className="w-full h-11 pl-11 pr-4 rounded-xl bg-surface-container-low text-on-surface font-label-md placeholder:text-outline outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 shadow-inner"
                    />
                  </div>
                </div>

                {/* Metode Referensi Top-Up */}
                <div className="space-y-2 pt-1">
                  <span className="font-label-sm text-on-surface-variant block">Jalur Pembayaran Top-Up</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { id: 'QRIS Instan', label: 'QRIS Instan', sub: 'GoPay, OVO, Dana, M-Banking', icon: 'qr_code_2' },
                      { id: 'Tunai Kasir', label: 'Setor Tunai Kasir', sub: 'Serahkan uang ke kasir kantin', icon: 'payments' },
                    ].map((m) => (
                      <label
                        key={m.id}
                        onClick={() => setTopupMethod(m.id)}
                        className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border-2 ${
                          topupMethod === m.id
                            ? 'bg-surface-container border-primary'
                            : 'bg-surface-container-low hover:bg-surface-container border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="material-symbols-outlined text-primary text-[20px]">{m.icon}</span>
                          <div className="min-w-0">
                            <span className="font-label-md text-on-surface block truncate">{m.label}</span>
                            <p className="font-body-sm text-on-surface-variant text-[11px] truncate">{m.sub}</p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {topupSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    <span>{topupSuccess}</span>
                  </div>
                )}

                {topupError && (
                  <div className="p-3 rounded-xl bg-error-container text-on-error-container text-xs flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">error</span>
                    <span>{topupError}</span>
                  </div>
                )}

                {/* CTA Button */}
                <button
                  type="button"
                  onClick={handleTopup}
                  disabled={topupLoading || (!selectedNominal && !customAmount)}
                  className="w-full h-12 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-lg font-semibold flex items-center justify-center gap-2 shadow-md active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[20px]">payments</span>
                  <span>{topupLoading ? 'Mengirim Permintaan...' : 'Ajukan Top Up Saldo'}</span>
                </button>
              </section>

              {/* RIWAYAT MUTASI WALLET */}
              <section className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-headline-sm text-on-surface font-bold">Mutasi Saldo & Aktivitas</h3>
                    <p className="font-body-sm text-on-surface-variant">Riwayat top-up, pembayaran, & refund</p>
                  </div>
                  <span className="font-label-sm text-primary font-semibold">
                    {transactions.length} Transaksi
                  </span>
                </div>

                {loading ? (
                  <div className="space-y-2.5 animate-pulse">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-14 rounded-xl bg-surface-container-low" />
                    ))}
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-8 text-on-surface-variant text-sm">
                    Belum ada riwayat transaksi saldo.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {transactions.map((tx) => {
                      const style = getTxStyle(tx.type);
                      return (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${style.bg}`}>
                              <span className="material-symbols-outlined text-[20px]">{style.icon}</span>
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-label-md text-on-surface font-semibold truncate">
                                {tx.reference ?? tx.type}
                              </h4>
                              <p className="font-body-sm text-on-surface-variant text-[11px]">
                                {new Date(tx.createdAt).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className={`font-label-md font-bold block ${style.amountClass}`}>
                              {style.prefix} Rp {tx.amount.toLocaleString('id-ID')}
                            </span>
                            <span
                              className={`font-label-sm text-[10px] font-semibold ${
                                tx.status === 'SUCCESS'
                                  ? 'text-emerald-600'
                                  : tx.status === 'PENDING'
                                  ? 'text-amber-600'
                                  : 'text-error'
                              }`}
                            >
                              {tx.status === 'SUCCESS'
                                ? 'Berhasil'
                                : tx.status === 'PENDING'
                                ? 'Menunggu Admin'
                                : 'Ditolak'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
                </>
              )}

              {/* Tombol Keluar (Mobile) */}
              <div className="lg:hidden">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full py-3 rounded-xl bg-error-container/70 hover:bg-error-container text-on-error-container font-label-md font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  <span>Keluar dari Akun</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal QR Bayar Kasir */}
      {showQrModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-surface-container-lowest rounded-3xl p-6 w-full max-w-sm flex flex-col items-center text-center shadow-2xl relative animate-slide-up">
            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-[28px]">qr_code_2</span>
            </div>
            <h3 className="font-headline-sm text-on-surface font-bold">Tunjukkan ke Kasir</h3>
            <p className="font-body-sm text-on-surface-variant mb-4">
              Kasir kantin akan memindai QR kartu santri Anda
            </p>
            <div className="bg-white p-4 rounded-2xl shadow-inner border border-outline-variant/30 mb-3">
              <svg className="w-40 h-40 text-on-surface" fill="currentColor" viewBox="0 0 100 100">
                <rect fill="none" height="28" rx="4" stroke="currentColor" strokeWidth="5" width="28" x="5" y="5" />
                <rect fill="currentColor" height="14" width="14" x="12" y="12" />
                <rect fill="none" height="28" rx="4" stroke="currentColor" strokeWidth="5" width="28" x="67" y="5" />
                <rect fill="currentColor" height="14" width="14" x="74" y="12" />
                <rect fill="none" height="28" rx="4" stroke="currentColor" strokeWidth="5" width="28" x="5" y="67" />
                <rect fill="currentColor" height="14" width="14" x="12" y="74" />
                <rect fill="currentColor" height="8" width="8" x="42" y="10" />
                <rect fill="currentColor" height="8" width="8" x="52" y="20" />
                <rect fill="currentColor" height="8" width="16" x="42" y="32" />
                <rect fill="currentColor" height="10" width="10" x="15" y="42" />
                <rect fill="currentColor" height="10" width="10" x="35" y="50" />
                <rect fill="currentColor" height="6" width="15" x="55" y="42" />
                <rect fill="currentColor" height="18" width="8" x="42" y="72" />
                <rect fill="currentColor" height="8" width="14" x="55" y="62" />
                <rect fill="currentColor" height="8" width="18" x="75" y="50" />
                <rect fill="currentColor" height="15" width="15" x="75" y="75" />
              </svg>
            </div>
            <div className="bg-surface-container-low px-4 py-2 rounded-xl mb-4 w-full">
              <p className="font-label-sm text-on-surface-variant text-[11px]">ID KARTU SANTRI</p>
              <p className="font-label-lg font-mono text-primary font-bold">
                IDN-{user?.userId?.slice(-6).toUpperCase() ?? 'SANTRI'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-surface-container-high text-on-surface font-label-md font-semibold"
            >
              Selesai
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
          <Link href="/orders" className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[24px]">receipt_long</span>
            <span className="font-label-sm text-label-sm">Pesanan</span>
          </Link>
          <Link href="/profile" aria-current="page" className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-primary font-semibold">
            <span className="material-symbols-outlined text-[24px]">account_circle</span>
            <span className="font-label-sm text-label-sm">Profil</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
