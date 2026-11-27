'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ProductWithMeta } from '@/types';
import { ProductDetailModal } from './ProductDetailModal';

interface ProductCardProps {
  product: ProductWithMeta;
}

export function ProductCard({ product }: ProductCardProps) {
  const [showModal, setShowModal] = useState(false);
  const isOutOfStock = !product.isAvailable || product.stock === 0;

  return (
    <>
      <div
        className={`card-hover overflow-hidden ${isOutOfStock ? 'opacity-70' : ''}`}
        onClick={() => !isOutOfStock && setShowModal(true)}
      >
        {/* Gambar */}
        <div className="relative h-32 bg-gray-100 -mx-4 -mt-4 mb-3">
          {product.imageUrl ? (
            <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full bg-orange-50">
              <span className="text-4xl">🍽️</span>
            </div>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">HABIS</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <span className="text-[10px] font-medium text-orange-500 uppercase tracking-wide">
            {product.category}
          </span>
          <h3 className="font-semibold text-gray-900 text-sm mt-0.5 line-clamp-1">{product.name}</h3>
          {product.description && (
            <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{product.description}</p>
          )}
          <div className="flex items-center justify-between mt-2">
            <p className="font-bold text-primary-500 text-sm">
              Rp {product.price.toLocaleString('id-ID')}
            </p>
            {!isOutOfStock && (
              <button className="w-7 h-7 bg-primary-500 text-white rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <ProductDetailModal product={product} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}

