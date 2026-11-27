'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

type PaymentOption = 'BALANCE' | 'QRIS' | 'CASH';

const QUICK_NOTE_CHIPS = ['Minta Sedotan', 'Pisahkan Plastik', 'Tidak Pakai Sambal', 'Sendok/Garpu'];

export default function CheckoutPage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    getTotalItems,
    getTotalPrice,
  } = useCartStore();

  const [paymentMethod, setPaymentMethod] = useState<PaymentOption>('BALANCE');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();
  const userBalance = user?.balance ?? 0;
  const isBalanceInsufficient = paymentMethod === 'BALANCE' && !!user && userBalance < totalPrice;

  const handleAppendQuickNote = (chip: string) => {
    setNotes((prev) => {
      if (!prev.trim()) return chip;
      if (prev.toLowerCase().includes(chip.toLowerCase())) return prev;
      return `${prev.trim()}, ${chip}`;
    });
  };

  const handleCheckout = async () => {
    if (!user) {
      router.push('/login?redirect=/checkout');
      return;
    }
    if (items.length === 0) return;

    if (isBalanceInsufficient) {
      setError('Saldo IDN Canteen Anda tidak mencukupi. Silakan Top-Up terlebih dahulu atau pilih metode lain.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/orders/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            itemNote: i.itemNote || undefined,
          })),
          paymentMethod,
          notes: notes.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Gagal memproses pesanan');
      }

      // Sinkronkan saldo user terbaru di authStore jika pakai BALANCE
      if (paymentMethod === 'BALANCE') {
        try {
          const meRes = await fetch('/api/auth/me');
          if (meRes.ok) {
            const meJson = await meRes.json();
            if (meJson.data?.user) {
              setUser({
                userId: meJson.data.user.id,
                email: meJson.data.user.email,
                role: meJson.data.user.role,
                name: meJson.data.user.name,
                balance: meJson.data.user.balance,
              });
            }
          }
        } catch {
          // Abaikan error sync saldo non-kritis
        }
      }

      clearCart();
      router.push(`/orders?success=${json.data.order.orderCode}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Terjadi kesalahan saat checkout');
    } finally {
      setLoading(false);
    }
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
          </nav>

          <div className="flex items-center gap-space-sm">
            <ThemeToggle />
            {user ? (
              <Link href="/profile" className="flex items-center gap-space-sm pl-space-xs py-1 pr-space-sm rounded-full bg-surface-container-low hover:bg-surface-container-high transition-colors">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs uppercase">
                  {user.name.charAt(0)}
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-label-md text-on-surface leading-tight font-semibold">{user.name.split(' ')[0]}</span>
                  <span className="font-label-sm text-primary leading-tight font-medium">
                    {user.role === 'ADMIN' ? 'Administrator' : `Rp ${userBalance.toLocaleString('id-ID')}`}
                  </span>
                </div>
              </Link>
            ) : (
              <Link href="/login?redirect=/checkout" className="px-space-md py-2 rounded-xl bg-primary text-white font-label-md">
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
            <Link href="/menu" className="w-11 h-11 flex items-center justify-center rounded-xl text-on-surface-variant hover:text-on-surface">
              <span className="material-symbols-outlined text-[22px]">search</span>
            </Link>
            <Link href="/profile" className="w-8 h-8 ml-1 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user ? user.name.charAt(0).toUpperCase() : <span className="material-symbols-outlined text-[18px]">person</span>}
            </Link>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 w-full pt-16 md:pt-24 pb-44 md:pb-16 bg-surface">
        <div className="max-w-[1024px] mx-auto px-gutter md:px-margin-tablet">
          {items.length === 0 ? (
            /* Empty Cart State */
            <div className="flex flex-col items-center justify-center min-h-[65vh] text-center px-4">
              <div className="w-24 h-24 rounded-full bg-surface-container-high flex items-center justify-center text-primary mb-5 shadow-sm">
                <span className="material-symbols-outlined text-[48px]">shopping_bag</span>
              </div>
              <h1 className="font-headline-md text-on-surface font-bold mb-2">Keranjang Jajan Kosong</h1>
              <p className="font-body-md text-on-surface-variant max-w-sm mb-6">
                Yuk pilih snack, makanan berat, atau minuman segar favoritmu sebelum jam istirahat dimulai!
              </p>
              <Link
                href="/menu"
                className="px-6 py-3.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-lg font-semibold shadow-md transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">restaurant_menu</span>
                <span>Jelajahi Daftar Menu</span>
              </Link>
            </div>
          ) : (
            <div className="pt-3 md:pt-0">
              {/* Top Navigation & Stage Indicator */}
              <div className="flex flex-col gap-space-sm mb-space-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-sm">
                    <button
                      type="button"
                      onClick={() => router.back()}
                      aria-label="Kembali ke Menu"
                      className="w-11 h-11 flex items-center justify-center rounded-xl bg-surface-container-lowest shadow-sm text-on-surface active:scale-95 transition-transform"
                    >
                      <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                    </button>
                    <div>
                      <h1 className="font-headline-sm md:font-headline-md text-on-surface font-bold">
                        Keranjang Jajan
                      </h1>
                      <p className="font-body-sm text-on-surface-variant">
                        {items.length} menu ({totalItems} porsi) dipilih
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm font-semibold">
                    IDN Boarding School
                  </span>
                </div>

                {/* Stepper Tracker */}
                <div className="flex items-center gap-space-xs p-1.5 bg-surface-container-low rounded-xl max-w-md">
                  <div className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-primary rounded-lg shadow-sm">
                    <span className="w-4 h-4 rounded-full bg-on-primary text-primary font-label-sm text-[10px] flex items-center justify-center font-bold">
                      1
                    </span>
                    <span className="font-label-sm text-on-primary font-semibold truncate">Cek Pesanan</span>
                  </div>
                  <div className="w-4 flex items-center justify-center text-outline-variant">
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  </div>
                  <div className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg opacity-75">
                    <span className="w-4 h-4 rounded-full bg-surface-container-highest text-on-surface-variant font-label-sm text-[10px] flex items-center justify-center font-bold">
                      2
                    </span>
                    <span className="font-label-sm text-on-surface-variant font-medium truncate">Pembayaran</span>
                  </div>
                </div>
              </div>

              {/* Grid 2 Kolom di Desktop, 1 Kolom di Mobile */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md items-start">
                {/* Left Column: Santri Info, Cart Items, Notes */}
                <div className="lg:col-span-7 flex flex-col gap-space-md">
                  {/* Santri & Pickup Card Notice */}
                  <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm">
                    <div className="flex items-start justify-between gap-space-sm pb-space-sm">
                      <div className="flex items-center gap-space-sm">
                        <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-primary text-[22px]">badge</span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-label-lg text-on-surface font-bold truncate">
                              {user ? user.name : 'Tamu (Belum Login)'}
                            </span>
                            {user && (
                              <span className="px-1.5 py-0.5 rounded bg-surface-container-high font-label-sm text-[10px] text-on-surface-variant font-semibold">
                                {user.role}
                              </span>
                            )}
                          </div>
                          <p className="font-body-sm text-on-surface-variant truncate">
                            {user ? user.email : 'Masuk untuk melanjutkan checkout'}
                          </p>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm font-semibold shrink-0">
                        <span className="material-symbols-outlined text-[14px]">bolt</span>
                        Siap Cepat
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-space-sm pt-space-sm border-t border-surface-container/60">
                      <div className="p-2.5 rounded-xl bg-surface-container-low flex flex-col gap-0.5">
                        <div className="flex items-center gap-1 text-on-surface-variant">
                          <span className="material-symbols-outlined text-[14px]">storefront</span>
                          <span className="font-label-sm text-[10px] uppercase tracking-wide">Titik Ambil</span>
                        </div>
                        <span className="font-label-md text-on-surface font-semibold truncate">Counter 1 - Lt. 1</span>
                        <span className="font-body-sm text-[11px] text-on-surface-variant truncate">Gedung Kantin Utama</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-surface-container-low flex flex-col gap-0.5">
                        <div className="flex items-center gap-1 text-on-surface-variant">
                          <span className="material-symbols-outlined text-[14px]">schedule</span>
                          <span className="font-label-sm text-[10px] uppercase tracking-wide">Estimasi Siap</span>
                        </div>
                        <span className="font-label-md text-primary font-semibold truncate">~5 Menit Setelah Order</span>
                        <span className="font-body-sm text-[11px] text-on-surface-variant truncate">Ambil tanpa antre</span>
                      </div>
                    </div>
                  </div>

                  {/* Cart Items Section */}
                  <div className="flex flex-col gap-space-sm">
                    <div className="flex items-center justify-between px-1">
                      <h2 className="font-label-lg text-on-surface font-bold">Daftar Jajanan</h2>
                      <span className="font-body-sm text-on-surface-variant">{items.length} Produk</span>
                    </div>

                    {items.map((item) => (
                      <div
                        key={item.productId}
                        className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex flex-col gap-space-sm"
                      >
                        <div className="flex gap-space-sm">
                          <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-surface-container">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <div className="flex items-start justify-between gap-1">
                                <h3 className="font-label-lg text-on-surface font-semibold truncate">
                                  {item.name}
                                </h3>
                                <button
                                  type="button"
                                  onClick={() => removeItem(item.productId)}
                                  aria-label={`Hapus ${item.name}`}
                                  className="text-outline hover:text-error transition-colors p-1"
                                >
                                  <span className="material-symbols-outlined text-[18px]">delete</span>
                                </button>
                              </div>
                              {item.itemNote ? (
                                <p className="font-body-sm text-primary text-[12px] truncate">
                                  📝 {item.itemNote}
                                </p>
                              ) : (
                                <p className="font-body-sm text-on-surface-variant truncate">
                                  @ Rp {item.price.toLocaleString('id-ID')} / porsi
                                </p>
                              )}
                            </div>

                            <div className="flex items-center justify-between mt-1.5">
                              <span className="font-headline-sm text-primary font-bold">
                                Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                              </span>

                              {/* Stepper */}
                              <div className="flex items-center bg-surface-container-low rounded-xl p-1 gap-2">
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-surface-container-lowest text-on-surface shadow-xs active:scale-90 transition-transform"
                                >
                                  <span className="material-symbols-outlined text-[14px]">remove</span>
                                </button>
                                <span className="font-label-md text-on-surface w-4 text-center font-bold">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                  disabled={item.quantity >= item.stock}
                                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-primary text-on-primary shadow-xs active:scale-90 transition-transform disabled:opacity-40"
                                >
                                  <span className="material-symbols-outlined text-[14px]">add</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Add More Items CTA */}
                    <Link
                      href="/menu"
                      className="w-full py-3 px-space-md rounded-2xl bg-surface-container-lowest shadow-sm flex items-center justify-center gap-2 text-primary font-label-lg font-semibold hover:bg-surface-container-low active:scale-[0.99] transition-all"
                    >
                      <span className="material-symbols-outlined text-[20px]">add_circle</span>
                      <span>Tambah Jajanan Lain dari Menu</span>
                    </Link>
                  </div>

                  {/* Catatan Pesanan Khusus */}
                  <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm">
                    <div className="flex items-center justify-between mb-space-sm">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[20px]">edit_note</span>
                        <h2 className="font-label-lg text-on-surface font-bold">Catatan Khusus Kantin</h2>
                      </div>
                      <span className="font-label-sm text-on-surface-variant">Opsional</span>
                    </div>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Contoh: Minta kantong plastik ramah lingkungan & sedotan..."
                      rows={2}
                      maxLength={500}
                      className="w-full p-3 rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline font-body-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                    />
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {QUICK_NOTE_CHIPS.map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => handleAppendQuickNote(chip)}
                          className="px-2.5 py-1 rounded-full bg-surface-container-low text-on-surface-variant font-label-sm text-[11px] hover:bg-surface-container transition-colors"
                        >
                          + {chip}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Payment Methods, Summary, Desktop CTA */}
                <div className="lg:col-span-5 flex flex-col gap-space-md">
                  {/* Payment Methods Selection */}
                  <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm">
                    <div className="flex items-center justify-between mb-space-sm">
                      <h2 className="font-label-lg text-on-surface font-bold">Pilih Metode Pembayaran</h2>
                      <span className="font-label-sm text-primary font-semibold">3 Jalur</span>
                    </div>

                    <div className="flex flex-col gap-2.5">
                      {/* Option 1: BALANCE */}
                      <label
                        onClick={() => setPaymentMethod('BALANCE')}
                        className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border-2 ${
                          paymentMethod === 'BALANCE'
                            ? 'bg-surface-container border-primary'
                            : 'bg-surface-container-low hover:bg-surface-container border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-space-sm min-w-0">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                              paymentMethod === 'BALANCE'
                                ? 'bg-primary text-on-primary'
                                : 'bg-surface-container-highest text-primary'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-label-md text-on-surface font-semibold truncate">
                                Saldo IDN Canteen
                              </span>
                              <span className="px-1.5 py-0.5 rounded bg-primary-fixed text-primary font-label-sm text-[10px] font-bold">
                                Instan
                              </span>
                            </div>
                            <p className="font-body-sm text-on-surface-variant truncate">
                              Sisa Saldo:{' '}
                              <span
                                className={`font-semibold ${
                                  user && userBalance < totalPrice ? 'text-error' : 'text-on-surface'
                                }`}
                              >
                                Rp {userBalance.toLocaleString('id-ID')}
                              </span>
                            </p>
                          </div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ml-2 ${
                            paymentMethod === 'BALANCE' ? 'bg-primary' : 'bg-surface-container-highest'
                          }`}
                        >
                          {paymentMethod === 'BALANCE' && (
                            <span className="material-symbols-outlined text-on-primary text-[14px]">check</span>
                          )}
                        </div>
                      </label>

                      {/* Option 2: QRIS */}
                      <label
                        onClick={() => setPaymentMethod('QRIS')}
                        className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border-2 ${
                          paymentMethod === 'QRIS'
                            ? 'bg-surface-container border-primary'
                            : 'bg-surface-container-low hover:bg-surface-container border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-space-sm min-w-0">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                              paymentMethod === 'QRIS'
                                ? 'bg-primary text-on-primary'
                                : 'bg-surface-container-highest text-primary'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span>
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-label-md text-on-surface font-semibold truncate">
                                QRIS / e-Wallet
                              </span>
                              <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 font-label-sm text-[10px] font-bold">
                                Cashless
                              </span>
                            </div>
                            <p className="font-body-sm text-on-surface-variant truncate">
                              GoPay, OVO, Dana, ShopeePay, Mobile Banking
                            </p>
                          </div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ml-2 ${
                            paymentMethod === 'QRIS' ? 'bg-primary' : 'bg-surface-container-highest'
                          }`}
                        >
                          {paymentMethod === 'QRIS' && (
                            <span className="material-symbols-outlined text-on-primary text-[14px]">check</span>
                          )}
                        </div>
                      </label>

                      {/* Option 3: CASH */}
                      <label
                        onClick={() => setPaymentMethod('CASH')}
                        className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border-2 ${
                          paymentMethod === 'CASH'
                            ? 'bg-surface-container border-primary'
                            : 'bg-surface-container-low hover:bg-surface-container border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-space-sm min-w-0">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                              paymentMethod === 'CASH'
                                ? 'bg-primary text-on-primary'
                                : 'bg-surface-container-highest text-primary'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[20px]">payments</span>
                          </div>
                          <div className="min-w-0">
                            <span className="font-label-md text-on-surface font-semibold truncate block">
                              Bayar Tunai di Kasir
                            </span>
                            <p className="font-body-sm text-on-surface-variant truncate">
                              Bayar langsung saat pengambilan pesanan
                            </p>
                          </div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ml-2 ${
                            paymentMethod === 'CASH' ? 'bg-primary' : 'bg-surface-container-highest'
                          }`}
                        >
                          {paymentMethod === 'CASH' && (
                            <span className="material-symbols-outlined text-on-primary text-[14px]">check</span>
                          )}
                        </div>
                      </label>
                    </div>

                    {isBalanceInsufficient && (
                      <div className="mt-3 p-3 rounded-xl bg-error-container text-on-error-container text-xs flex items-center justify-between gap-2">
                        <span>Saldo tidak cukup untuk pesanan ini.</span>
                        <Link href="/profile" className="font-bold underline shrink-0">
                          Top-Up Saldo
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Ringkasan Biaya */}
                  <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm">
                    <h2 className="font-label-lg text-on-surface font-bold mb-space-sm">Rincian Pembayaran</h2>
                    <div className="flex flex-col gap-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-body-md text-on-surface-variant">
                          Subtotal Jajanan ({totalItems} pcs)
                        </span>
                        <span className="font-label-md text-on-surface font-semibold">
                          Rp {totalPrice.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-on-surface-variant">
                          <span className="font-body-md">Biaya Kemasan</span>
                          <span className="material-symbols-outlined text-[14px]">eco</span>
                        </div>
                        <span className="font-label-md text-emerald-600 font-semibold">Gratis Siswa</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-body-md text-on-surface-variant">Biaya Layanan</span>
                        <span className="font-label-md text-emerald-600 font-semibold">Rp 0</span>
                      </div>
                      <div className="h-px bg-surface-container-high my-1" />
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex flex-col">
                          <span className="font-label-lg text-on-surface font-bold">Total Pembayaran</span>
                          <span className="font-body-sm text-[11px] text-on-surface-variant">
                            Sudah termasuk pajak kantin
                          </span>
                        </div>
                        <span className="font-headline-md text-primary font-bold">
                          Rp {totalPrice.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                      <div className="mt-4 bg-error-container text-on-error-container rounded-xl p-3 flex gap-2 text-sm">
                        <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
                        <span>{error}</span>
                      </div>
                    )}

                    {/* Desktop Confirm Button */}
                    <button
                      type="button"
                      onClick={handleCheckout}
                      disabled={loading || isBalanceInsufficient}
                      className="hidden md:flex w-full h-12 mt-4 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-lg font-semibold items-center justify-center gap-2 shadow-md active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <span>Memproses Transaksi...</span>
                      ) : (
                        <>
                          <span>Konfirmasi Pesanan</span>
                          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Trust & Halal Assurance Banner */}
                  <div className="p-3 rounded-2xl bg-surface-container-low flex items-center justify-between gap-space-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="material-symbols-outlined text-emerald-600 text-[20px]">verified</span>
                      <p className="font-body-sm text-[12px] text-on-surface-variant truncate">
                        100% Halal, Segar & Terdaftar Resmi Kantin IDN
                      </p>
                    </div>
                    <span className="font-label-sm text-[10px] text-primary uppercase font-bold tracking-wider shrink-0">
                      Hygiene Checked
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Sticky Bottom Checkout Bar (Mobile Only) */}
      {items.length > 0 && (
        <div className="md:hidden fixed bottom-16 inset-x-0 z-40 bg-surface-container-lowest/95 backdrop-blur-xl px-gutter py-3 shadow-[0_-8px_24px_rgba(19,27,46,0.08)] border-t border-surface-container">
          <div className="max-w-md mx-auto flex items-center justify-between gap-space-md">
            <div className="flex flex-col min-w-0">
              <span className="font-body-sm text-on-surface-variant">Total Tagihan</span>
              <div className="flex items-baseline gap-1">
                <span className="font-headline-sm text-primary font-bold">
                  Rp {totalPrice.toLocaleString('id-ID')}
                </span>
                <span className="font-label-sm text-[10px] text-on-surface-variant">({totalItems} pcs)</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCheckout}
              disabled={loading || isBalanceInsufficient}
              className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-lg font-semibold flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{loading ? 'Memproses...' : 'Konfirmasi Pesanan'}</span>
              {!loading && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
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
          <Link href="/profile" className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[24px]">account_circle</span>
            <span className="font-label-sm text-label-sm">Profil</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
