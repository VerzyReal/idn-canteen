'use client';

import { useState, useEffect } from 'react';
import { ProductWithMeta } from '@/types';
import { useCartStore } from '@/store/cartStore';

interface ProductDetailModalProps {
  product: ProductWithMeta;
  onClose: () => void;
}

export function ProductDetailModal({ product, onClose }: ProductDetailModalProps) {
  const { items, addItem } = useCartStore();
  const existingItem = items.find((i) => i.productId === product.id);

  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState(existingItem?.itemNote ?? '');

  // Tutup modal dengan tombol Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const isOutOfStock = !product.isAvailable || product.stock <= 0;
  const maxAddable = Math.max(1, product.stock);

  const handleAdd = () => {
    if (isOutOfStock) return;
    addItem(product, quantity, note.trim());
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end md:justify-center pointer-events-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-product-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-inverse-surface/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Sheet */}
      <div className="relative z-10 w-full max-w-md mx-auto bg-surface-container-lowest rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden border-t md:border border-surface-container-high animate-slide-up">
        {/* Drag Handle (Mobile) */}
        <div className="w-full flex items-center justify-center pt-3 pb-1 md:hidden cursor-grab" onClick={onClose}>
          <div className="w-10 h-1 rounded-full bg-outline-variant" />
        </div>

        {/* Header Modal */}
        <div className="flex items-center justify-between px-4 pt-2 md:pt-4 pb-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-label-sm text-[11px] font-semibold">
            <span className="material-symbols-outlined text-[13px]">storefront</span>
            Detail Jajanan
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal"
            className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto px-4 pb-4 space-y-3.5 no-scrollbar">
          {/* Gambar Produk */}
          <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden bg-surface-container">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-5xl bg-surface-container">
                🍽️
              </div>
            )}

            {/* Status & Category Pills */}
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
              {isOutOfStock ? (
                <span className="px-2.5 py-1 rounded-full bg-red-600/90 text-white font-label-sm text-[10px] font-semibold flex items-center gap-1 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" /> Habis
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/90 text-on-primary font-label-sm text-[10px] font-semibold flex items-center gap-1 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-surface-container-lowest animate-pulse" /> Tersedia
                </span>
              )}
              <span className="px-2.5 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-primary font-label-sm text-[10px] font-semibold shadow-sm">
                {product.category}
              </span>
            </div>
          </div>

          {/* Judul & Deskripsi */}
          <div>
            <div className="flex items-start justify-between gap-2">
              <h2
                id="modal-product-title"
                className="font-headline-sm text-[20px] text-on-surface font-bold leading-tight"
              >
                {product.name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-md bg-surface-container text-on-surface-variant font-label-sm text-[11px] font-semibold shrink-0">
                Stok: {product.stock}
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1.5 leading-relaxed">
              {product.description || 'Menu lezat dan higienis siap santap dari IDN Canteen.'}
            </p>
          </div>

          {/* Info Harga Box */}
          <div className="p-3 rounded-xl bg-surface-container-low flex items-center justify-between border border-surface-container">
            <div className="flex flex-col">
              <span className="font-label-sm text-[11px] text-outline flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">payments</span>
                Harga Satuan
              </span>
              <span className="font-headline-sm text-[18px] text-primary font-bold mt-0.5">
                Rp {product.price.toLocaleString('id-ID')}
              </span>
            </div>
            <span className="font-label-sm text-[10px] text-on-surface-variant bg-surface-container px-2.5 py-1.5 rounded-lg text-right max-w-[150px] font-medium">
              Bayar pakai Saldo IDN, QRIS, atau Tunai
            </span>
          </div>

          {/* Catatan Khusus */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="item-note-input"
              className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px] text-primary">edit_note</span>
              Catatan Khusus Pesanan
              <span className="text-[11px] font-normal text-outline">(opsional)</span>
            </label>
            <input
              id="item-note-input"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: Tidak pakai sambal, kuah banyak..."
              maxLength={200}
              disabled={isOutOfStock}
              className="w-full h-11 px-3.5 bg-surface-container-lowest border border-outline-variant focus:border-primary text-on-surface placeholder:text-outline font-body-sm text-body-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50"
            />
          </div>

          {/* Kontrol Jumlah Porsi */}
          {!isOutOfStock && (
            <div className="flex items-center justify-between pt-1">
              <span className="font-label-md text-label-md text-on-surface font-semibold">
                Jumlah Porsi:
              </span>
              <div className="flex items-center bg-surface-container-low rounded-xl p-1 border border-surface-container">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  aria-label="Kurangi jumlah"
                  className="w-8 h-8 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container flex items-center justify-center shadow-sm active:scale-90 transition-transform disabled:opacity-40"
                >
                  <span className="material-symbols-outlined text-[16px]">remove</span>
                </button>
                <span className="font-headline-sm text-[15px] px-4 text-on-surface font-bold">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(maxAddable, q + 1))}
                  disabled={quantity >= maxAddable}
                  aria-label="Tambah jumlah"
                  className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center shadow-sm active:scale-90 transition-transform disabled:opacity-40"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Footer CTA */}
        <div className="p-4 pt-2.5 bg-surface-container-lowest border-t border-surface-container pb-safe">
          {isOutOfStock ? (
            <button
              type="button"
              disabled
              className="w-full h-12 bg-gray-200 text-gray-500 font-label-lg font-bold rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">block</span>
              <span>Menu Sedang Habis</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleAdd}
              className="w-full h-12 bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg font-bold rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2 active:scale-[0.99] transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">add_shopping_cart</span>
              <span>
                Tambah ke Keranjang — Rp {(product.price * quantity).toLocaleString('id-ID')}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
