import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { LifeStage, Product, ProductCategory, ProductInput } from '../types/shop';
import { PRODUCT_IMAGE_PRESETS } from '../data/products';

interface AdminProductModalProps {
  isOpen: boolean;
  editingProduct: Product | null;
  onClose: () => void;
  onSave: (input: ProductInput, existingId?: string) => Promise<void>;
}

const EMPTY_FORM: ProductInput = {
  name: '',
  brand: '',
  category: 'Makanan Kering',
  lifeStage: 'Semua Usia',
  price: 95000,
  weight: '1 kg',
  flavor: '',
  stock: 20,
  imageUrl: PRODUCT_IMAGE_PRESETS[0].url,
  description: '',
  nutritionHighlight: 'Protein Tinggi · Omega 3 & 6 · Taurin',
  isBestSeller: false,
};

export function AdminProductModal({
  isOpen,
  editingProduct,
  onClose,
  onSave,
}: AdminProductModalProps) {
  const [form, setForm] = useState<ProductInput>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (editingProduct) {
      setForm({
        name: editingProduct.name,
        brand: editingProduct.brand,
        category: editingProduct.category,
        lifeStage: editingProduct.lifeStage,
        price: editingProduct.price,
        weight: editingProduct.weight,
        flavor: editingProduct.flavor,
        stock: editingProduct.stock,
        imageUrl: editingProduct.imageUrl,
        description: editingProduct.description,
        nutritionHighlight: editingProduct.nutritionHighlight,
        isBestSeller: Boolean(editingProduct.isBestSeller),
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrorMsg('');
  }, [editingProduct, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSaving(true);
    try {
      await onSave(form, editingProduct?.id);
      onClose();
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Gagal menyimpan data produk.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#362029]/45 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-product-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-[#FCF4F7] border border-[#E4C3CF] rounded-3xl p-6 sm:p-8 shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup form produk"
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-xl text-[#5F424E] hover:bg-[#EED2DC] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-5">
          <p className="text-xs font-medium text-[#9D254E]">
            Panel Admin · Manajemen Katalog (CRUD)
          </p>
          <h2
            id="admin-product-title"
            className="mt-1 font-display text-2xl font-bold text-[#362029]"
          >
            {editingProduct ? 'Edit Produk Makanan Kucing' : 'Tambah Produk Baru'}
          </h2>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-[#EED2DC] border border-[#BA3360] text-xs font-medium text-[#9D254E]">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#362029] mb-1">
                Nama Produk
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Contoh: Royal Salmon Care"
                className="w-full h-10 px-3 rounded-xl bg-[#F6E2E9]/65 border border-[#DFB9C7] text-sm text-[#362029] focus:outline-none focus:bg-white focus:border-[#BA3360]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#362029] mb-1">
                Merek / Brand
              </label>
              <input
                type="text"
                required
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                placeholder="Contoh: Feline Nourish"
                className="w-full h-10 px-3 rounded-xl bg-[#F6E2E9]/65 border border-[#DFB9C7] text-sm text-[#362029] focus:outline-none focus:bg-white focus:border-[#BA3360]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#362029] mb-1">
                Kategori
              </label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value as ProductCategory })
                }
                className="w-full h-10 px-3 rounded-xl bg-[#F6E2E9]/65 border border-[#DFB9C7] text-sm text-[#362029] focus:outline-none focus:bg-white focus:border-[#BA3360]"
              >
                <option value="Makanan Kering">Makanan Kering</option>
                <option value="Makanan Basah">Makanan Basah</option>
                <option value="Snack / Krim">Snack / Krim</option>
                <option value="Perawatan / Grooming">Perawatan / Grooming</option>
                <option value="Aksesoris Grooming">Aksesoris Grooming</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#362029] mb-1">
                Tahap Usia Kucing
              </label>
              <select
                value={form.lifeStage}
                onChange={(e) =>
                  setForm({ ...form, lifeStage: e.target.value as LifeStage })
                }
                className="w-full h-10 px-3 rounded-xl bg-[#F6E2E9]/65 border border-[#DFB9C7] text-sm text-[#362029] focus:outline-none focus:bg-white focus:border-[#BA3360]"
              >
                <option value="Semua Usia">Semua Usia</option>
                <option value="Kitten (1-12 Bulan)">Kitten (1-12 Bulan)</option>
                <option value="Dewasa (1+ Tahun)">Dewasa (1+ Tahun)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#362029] mb-1">
                Harga (Rp)
              </label>
              <input
                type="number"
                required
                min={1000}
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                className="w-full h-10 px-3 rounded-xl bg-[#F6E2E9]/65 border border-[#DFB9C7] text-sm tabular-nums text-[#362029] focus:outline-none focus:bg-white focus:border-[#BA3360]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#362029] mb-1">
                Berat Kemasan
              </label>
              <input
                type="text"
                required
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: e.target.value })}
                placeholder="1.5 kg"
                className="w-full h-10 px-3 rounded-xl bg-[#F6E2E9]/65 border border-[#DFB9C7] text-sm text-[#362029] focus:outline-none focus:bg-white focus:border-[#BA3360]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#362029] mb-1">
                Stok
              </label>
              <input
                type="number"
                required
                min={0}
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                className="w-full h-10 px-3 rounded-xl bg-[#F6E2E9]/65 border border-[#DFB9C7] text-sm tabular-nums text-[#362029] focus:outline-none focus:bg-white focus:border-[#BA3360]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#362029] mb-1">
              Varian Rasa
            </label>
            <input
              type="text"
              required
              value={form.flavor}
              onChange={(e) => setForm({ ...form, flavor: e.target.value })}
              placeholder="Contoh: Salmon & Ayam Segar"
              className="w-full h-10 px-3 rounded-xl bg-[#F6E2E9]/65 border border-[#DFB9C7] text-sm text-[#362029] focus:outline-none focus:bg-white focus:border-[#BA3360]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#362029] mb-1">
              Pilih Foto Katalog atau Tempel URL Foto
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {PRODUCT_IMAGE_PRESETS.map((preset) => (
                <button
                  key={preset.url}
                  type="button"
                  onClick={() => setForm({ ...form, imageUrl: preset.url })}
                  className={`px-2.5 py-1 rounded-lg text-xs border cursor-pointer ${
                    form.imageUrl === preset.url
                      ? 'bg-[#EED2DC] border-[#BA3360] text-[#BA3360] font-semibold'
                      : 'bg-white border-[#DFB9C7] text-[#5F424E]'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <input
              type="text"
              required
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              className="w-full h-10 px-3 rounded-xl bg-[#F6E2E9]/65 border border-[#DFB9C7] text-xs text-[#362029] focus:outline-none focus:bg-white focus:border-[#BA3360]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#362029] mb-1">
              Ringkasan Kandungan Gizi
            </label>
            <input
              type="text"
              value={form.nutritionHighlight}
              onChange={(e) =>
                setForm({ ...form, nutritionHighlight: e.target.value })
              }
              className="w-full h-10 px-3 rounded-xl bg-[#F6E2E9]/65 border border-[#DFB9C7] text-sm text-[#362029] focus:outline-none focus:bg-white focus:border-[#BA3360]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#362029] mb-1">
              Deskripsi Produk
            </label>
            <textarea
              rows={3}
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Jelaskan manfaat nutrisi dan keunggulan makanan kucing ini..."
              className="w-full p-3 rounded-xl bg-[#F6E2E9]/65 border border-[#DFB9C7] text-sm text-[#362029] focus:outline-none focus:bg-white focus:border-[#BA3360]"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-[#362029] cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(form.isBestSeller)}
              onChange={(e) =>
                setForm({ ...form, isBestSeller: e.target.checked })
              }
              className="accent-[#BA3360]"
            />
            <span>Tandai sebagai produk favorit pelanggan</span>
          </label>

          <div className="pt-2 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="h-11 px-4 rounded-xl border border-[#DFB9C7] bg-white text-sm font-medium text-[#362029] hover:bg-[#EED2DC] cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="h-11 px-5 rounded-xl bg-[#BA3360] text-white text-sm font-semibold hover:bg-[#9D254E] disabled:opacity-60 cursor-pointer"
            >
              {saving
                ? 'Menyimpan...'
                : editingProduct
                ? 'Simpan Perubahan'
                : 'Tambahkan Produk'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
