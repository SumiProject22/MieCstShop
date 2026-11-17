import React, { useState } from 'react';
import { Minus, Plus, ShoppingBag, X } from 'lucide-react';
import { Product } from '../types/shop';
import { formatIDR } from '../utils/format';
import { ResilientImage } from './ResilientImage';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export function ProductDetailModal({
  product,
  onClose,
  onAddToCart,
}: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const outOfStock = product.stock <= 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#362029]/45 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-product-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-[#FCF4F7] border border-[#E4C3CF] rounded-3xl overflow-hidden shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup detail produk"
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/95 border border-[#E4C3CF] text-[#362029] hover:bg-[#EED2DC] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12">
          <div className="md:col-span-6 bg-white border-b md:border-b-0 md:border-r border-[#E4C3CF] p-6 aspect-[4/3] md:aspect-auto md:min-h-[360px] flex items-center justify-center">
            <ResilientImage
              src={product.imageUrl}
              fallbackSrc={product.fallbackImageUrl}
              alt={product.name}
              fallbackLabel={product.name}
              className="w-full h-full max-h-[340px] object-contain"
            />
          </div>

          <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between gap-6">
            <div>
              <p className="text-xs font-medium text-[#9D254E]">
                {product.brand} · {product.category} · {product.lifeStage}
              </p>

              <h2
                id="detail-product-title"
                className="mt-2 font-display text-2xl font-bold text-[#362029] leading-tight"
              >
                {product.name}
              </h2>

              <p className="mt-3 tabular-nums text-2xl font-bold text-[#BA3360]">
                {formatIDR(product.price)}
              </p>

              <p className="mt-4 text-sm text-[#5F424E] leading-relaxed">
                {product.description}
              </p>

              <dl className="mt-5 pt-4 border-t border-[#E4C3CF] space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-[#5F424E]">Ukuran / Isi</dt>
                  <dd className="font-medium text-[#362029]">{product.weight}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[#5F424E]">Varian / Bahan</dt>
                  <dd className="font-medium text-[#362029] text-right">{product.flavor}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[#5F424E]">Keunggulan Utama</dt>
                  <dd className="font-medium text-[#362029] text-right">
                    {product.nutritionHighlight}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[#5F424E]">Ketersediaan</dt>
                  <dd className="tabular-nums font-medium text-[#362029]">
                    {outOfStock ? 'Stok habis' : `${product.stock} unit tersedia`}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center border border-[#DFB9C7] rounded-xl bg-white h-12 px-1">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Kurangi jumlah"
                  className="w-9 h-9 flex items-center justify-center text-[#362029] hover:text-[#BA3360] cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="tabular-nums w-8 text-center text-sm font-bold text-[#362029]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((q) => Math.min(Math.max(1, product.stock), q + 1))
                  }
                  aria-label="Tambah jumlah"
                  className="w-9 h-9 flex items-center justify-center text-[#362029] hover:text-[#BA3360] cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                disabled={outOfStock}
                onClick={() => {
                  onAddToCart(product, quantity);
                  onClose();
                }}
                className="flex-1 h-12 px-5 inline-flex items-center justify-center gap-2 rounded-xl bg-[#BA3360] text-white text-sm font-semibold hover:bg-[#9D254E] disabled:bg-[#DFC6D0] disabled:text-[#5F424E] transition-colors cursor-pointer whitespace-nowrap"
              >
                <ShoppingBag className="w-4 h-4" aria-hidden="true" />
                <span>Tambah ke Keranjang</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
