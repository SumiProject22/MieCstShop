import React, { useEffect, useState } from 'react';
import { Check, CheckCircle2, Copy, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { CartItem, OrderConfirmation, PaymentMethod, UserProfile } from '../types/shop';
import { formatIDR } from '../utils/format';
import { ResilientImage } from './ResilientImage';
import { submitOrder } from '../services/shopService';
import { QrisCodeCard } from './QrisCodeCard';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQty: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  currentUser: UserProfile | null;
}

const FREE_SHIPPING_THRESHOLD = 150000;
const EWALLET_NUMBER = '089691336269';
const EWALLET_OWNER = 'Zaskia Sabrina';

export function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  currentUser,
}: CartDrawerProps) {
  const [step, setStep] = useState<'cart' | 'checkout' | 'confirmed'>('cart');
  const [customerName, setCustomerName] = useState(currentUser?.fullName || '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('QRIS');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmation, setConfirmation] = useState<OrderConfirmation | null>(null);
  const [copiedWallet, setCopiedWallet] = useState(false);

  useEffect(() => {
    if (currentUser?.fullName && !customerName) {
      setCustomerName(currentUser.fullName);
    }
  }, [currentUser, customerName]);

  if (!isOpen) return null;

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : 18000;
  const total = subtotal + shippingCost;
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  const handleCopyEwallet = async () => {
    try {
      await navigator.clipboard.writeText(EWALLET_NUMBER);
      setCopiedWallet(true);
      window.setTimeout(() => setCopiedWallet(false), 2000);
    } catch {
      setCopiedWallet(false);
    }
  };

  const handleClose = () => {
    if (step === 'confirmed') {
      setStep('cart');
      setConfirmation(null);
    }
    onClose();
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customerName.trim() || !phone.trim() || !address.trim()) {
      setErrorMsg('Mohon lengkapi nama penerima, nomor WhatsApp, dan alamat pengiriman.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitOrder({
        customerName: customerName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        paymentMethod,
        items,
        subtotal,
        shippingCost,
        total,
        userId: currentUser?.id,
      });
      setConfirmation(result);
      onClearCart();
      setStep('confirmed');
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Terjadi kesalahan saat memproses pesanan.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#362029]/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="Keranjang Belanja MiePetShop"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md bg-[#F6E2E9] h-full flex flex-col border-l border-[#E4C3CF] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Drawer */}
        <div className="px-6 py-4 bg-[#FCF4F7] border-b border-[#E4C3CF] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#BA3360]" aria-hidden="true" />
            <h2 className="font-display text-lg font-bold text-[#362029]">
              {step === 'cart' && 'Keranjang Belanja'}
              {step === 'checkout' && 'Detail Pengiriman & Bayar'}
              {step === 'confirmed' && 'Pesanan Terkonfirmasi'}
            </h2>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Tutup keranjang"
            className="w-10 h-10 flex items-center justify-center rounded-xl text-[#5F424E] hover:bg-[#EED2DC] hover:text-[#362029] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Isi Drawer */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 'confirmed' && confirmation ? (
            <div className="py-4 text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-[#BA3360] mx-auto" />
              <div>
                <p className="text-xs font-medium text-[#9D254E]">
                  Terima kasih, {confirmation.customerName}
                </p>
                <h3 className="mt-1 font-display text-2xl font-bold text-[#362029]">
                  Pesanan #{confirmation.orderCode}
                </h3>
                <p className="mt-2 text-sm text-[#5F424E]">
                  Pesananmu sedang kami siapkan dengan segel kesegaran terbaik untuk anabul.
                </p>
              </div>

              <div className="rounded-2xl bg-[#FCF4F7] border border-[#E4C3CF] p-4 text-left space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#5F424E]">Jumlah Produk</span>
                  <span className="tabular-nums font-medium text-[#362029]">
                    {confirmation.itemCount} item
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5F424E]">Metode Pembayaran</span>
                  <span className="font-medium text-[#362029]">
                    {confirmation.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#EED2DC]">
                  <span className="font-semibold text-[#362029]">Total Pembayaran</span>
                  <span className="tabular-nums font-bold text-[#BA3360]">
                    {formatIDR(confirmation.total)}
                  </span>
                </div>
              </div>

              {confirmation.paymentMethod === 'QRIS' && (
                <QrisCodeCard
                  total={confirmation.total}
                  orderCode={confirmation.orderCode}
                />
              )}

              {confirmation.paymentMethod === 'E-Wallet' && (
                <div className="rounded-2xl bg-[#FCF4F7] border border-[#E4C3CF] p-4 text-left space-y-2 text-sm">
                  <p className="font-display font-bold text-[#362029]">
                    Instruksi Pembayaran E-Wallet
                  </p>
                  <p className="text-xs text-[#5F424E]">
                    Kirim saldo melalui DANA / GoPay / OVO / ShopeePay ke nomor berikut:
                  </p>
                  <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-white border border-[#E4C3CF]">
                    <div>
                      <p className="tabular-nums font-bold text-[#362029] text-base">
                        {EWALLET_NUMBER}
                      </p>
                      <p className="text-xs text-[#5F424E]">a/n {EWALLET_OWNER}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyEwallet}
                      className="h-9 px-3 inline-flex items-center gap-1.5 rounded-lg bg-[#F6E2E9] text-[#362029] text-xs font-semibold hover:bg-[#EED2DC] cursor-pointer"
                    >
                      {copiedWallet ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#BA3360]" />
                          <span>Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleClose}
                className="w-full h-11 rounded-xl bg-[#BA3360] text-white text-sm font-semibold hover:bg-[#9D254E] cursor-pointer"
              >
                Kembali Belanja
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <ShoppingBag className="w-10 h-10 text-[#BA3360]/60 mx-auto" />
              <h3 className="font-display text-lg font-bold text-[#362029]">
                Keranjang masih kosong
              </h3>
              <p className="text-sm text-[#5F424E]">
                Pilih makanan kucing favoritmu dari katalog untuk mulai berbelanja.
              </p>
              <button
                type="button"
                onClick={handleClose}
                className="mt-2 h-10 px-5 rounded-xl bg-[#BA3360] text-white text-sm font-semibold hover:bg-[#9D254E] cursor-pointer"
              >
                Lihat Katalog
              </button>
            </div>
          ) : step === 'cart' ? (
            <div className="space-y-4">
              {/* Info Gratis Ongkir */}
              <div className="rounded-2xl bg-[#FCF4F7] border border-[#E4C3CF] p-3.5 text-xs sm:text-sm text-[#362029]">
                {remainingForFreeShipping > 0 ? (
                  <span>
                    Tambah{' '}
                    <strong className="tabular-nums text-[#BA3360]">
                      {formatIDR(remainingForFreeShipping)}
                    </strong>{' '}
                    lagi untuk menikmati gratis ongkir Jabodetabek.
                  </span>
                ) : (
                  <span className="font-medium text-[#9D254E]">
                    Pesananmu memenuhi syarat gratis ongkir Jabodetabek.
                  </span>
                )}
              </div>

              {/* Daftar Item */}
              <ul className="space-y-3">
                {items.map(({ product, quantity }) => (
                  <li
                    key={product.id}
                    className="flex gap-3.5 p-3.5 rounded-2xl bg-[#FCF4F7] border border-[#E4C3CF]"
                  >
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-white border border-[#E4C3CF] p-1.5 shrink-0">
                      <ResilientImage
                        src={product.imageUrl}
                        fallbackSrc={product.fallbackImageUrl}
                        alt={product.name}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-display text-sm font-bold text-[#362029] line-clamp-1">
                            {product.name}
                          </h4>
                          <p className="text-xs text-[#5F424E]">
                            {product.weight} · {formatIDR(product.price)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(product.id)}
                          aria-label={`Hapus ${product.name}`}
                          className="p-1.5 text-[#5F424E] hover:text-[#9D254E] cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <div className="inline-flex items-center border border-[#E4C3CF] rounded-lg bg-white">
                          <button
                            type="button"
                            onClick={() => onUpdateQty(product.id, quantity - 1)}
                            aria-label="Kurangi jumlah"
                            className="w-8 h-8 flex items-center justify-center text-[#362029] hover:text-[#BA3360] cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="tabular-nums w-7 text-center text-xs font-bold text-[#362029]">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateQty(product.id, Math.min(product.stock, quantity + 1))
                            }
                            aria-label="Tambah jumlah"
                            className="w-8 h-8 flex items-center justify-center text-[#362029] hover:text-[#BA3360] cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <span className="tabular-nums text-sm font-bold text-[#362029]">
                          {formatIDR(product.price * quantity)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-[#FCF4F7] border border-[#BA3360] text-xs text-[#9D254E] font-medium">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#362029] mb-1.5">
                  Nama Penerima
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Contoh: Nadia Putri"
                  className="w-full h-11 px-3.5 rounded-xl bg-[#FCF4F7] border border-[#E4C3CF] text-sm text-[#362029] focus:outline-none focus:bg-white focus:border-[#BA3360]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#362029] mb-1.5">
                  Nomor WhatsApp
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0812-3456-7890"
                  className="w-full h-11 px-3.5 rounded-xl bg-[#FCF4F7] border border-[#E4C3CF] text-sm text-[#362029] focus:outline-none focus:bg-white focus:border-[#BA3360]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#362029] mb-1.5">
                  Alamat Lengkap Pengiriman
                </label>
                <textarea
                  rows={3}
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Nama jalan, nomor rumah, kecamatan, kota, dan kode pos"
                  className="w-full p-3.5 rounded-xl bg-[#FCF4F7] border border-[#E4C3CF] text-sm text-[#362029] focus:outline-none focus:bg-white focus:border-[#BA3360]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#362029] mb-1.5">
                  Metode Pembayaran
                </label>
                <div className="space-y-2">
                  {(
                    [
                      {
                        value: 'QRIS',
                        label: 'QRIS (Semua E-Wallet & Mobile Banking)',
                      },
                      {
                        value: 'E-Wallet',
                        label: 'E-Wallet (DANA / GoPay / OVO / ShopeePay)',
                      },
                      {
                        value: 'COD (Bayar di Tempat)',
                        label: 'COD (Bayar di Tempat)',
                      },
                    ] as const
                  ).map((method) => (
                    <label
                      key={method.value}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer text-sm ${
                        paymentMethod === method.value
                          ? 'bg-white border-[#BA3360] font-medium text-[#362029]'
                          : 'bg-[#FCF4F7] border-[#E4C3CF] text-[#5F424E]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === method.value}
                        onChange={() => setPaymentMethod(method.value)}
                        className="accent-[#BA3360]"
                      />
                      <span>{method.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Detail Kode QRIS atau Nomor E-Wallet */}
              {paymentMethod === 'QRIS' && <QrisCodeCard total={total} />}

              {paymentMethod === 'E-Wallet' && (
                <div className="rounded-2xl bg-white border border-[#E4C3CF] p-4 space-y-2 text-sm">
                  <p className="text-xs font-semibold text-[#362029]">
                    Nomor Tujuan E-Wallet
                  </p>
                  <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-[#FCF4F7] border border-[#E4C3CF]">
                    <div>
                      <p className="tabular-nums font-bold text-[#362029] text-base">
                        {EWALLET_NUMBER}
                      </p>
                      <p className="text-xs text-[#5F424E]">
                        a/n {EWALLET_OWNER}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyEwallet}
                      className="h-9 px-3 inline-flex items-center gap-1.5 rounded-lg bg-[#EED2DC] text-[#362029] text-xs font-semibold hover:bg-[#E4C3CF] cursor-pointer"
                    >
                      {copiedWallet ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#BA3360]" />
                          <span>Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-[#5F424E]">
                    Mendukung DANA, GoPay, OVO, dan ShopeePay sebesar{' '}
                    <strong className="tabular-nums text-[#BA3360]">
                      {formatIDR(total)}
                    </strong>
                    .
                  </p>
                </div>
              )}
            </form>
          )}
        </div>

        {/* Footer Ringkasan & Tombol Checkout */}
        {items.length > 0 && step !== 'confirmed' && (
          <div className="p-6 bg-[#FCF4F7] border-t border-[#E4C3CF] space-y-4">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-[#5F424E]">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatIDR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#5F424E]">
                <span>Ongkos Kirim</span>
                <span className="tabular-nums">
                  {shippingCost === 0 ? 'Gratis' : formatIDR(shippingCost)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#E4C3CF] font-bold text-[#362029] text-base">
                <span>Total</span>
                <span className="tabular-nums text-[#BA3360]">{formatIDR(total)}</span>
              </div>
            </div>

            {step === 'cart' ? (
              <button
                type="button"
                onClick={() => setStep('checkout')}
                className="w-full h-12 rounded-xl bg-[#BA3360] text-white text-sm font-semibold hover:bg-[#9D254E] transition-colors cursor-pointer"
              >
                Lanjut ke Pembayaran
              </button>
            ) : (
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setStep('cart')}
                  className="h-12 px-4 rounded-xl border border-[#E4C3CF] bg-white text-sm font-medium text-[#362029] hover:bg-[#F6E2E9] cursor-pointer"
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={submitting}
                  className="flex-1 h-12 rounded-xl bg-[#BA3360] text-white text-sm font-semibold hover:bg-[#9D254E] disabled:opacity-60 transition-colors cursor-pointer"
                >
                  {submitting ? 'Memproses...' : 'Konfirmasi Pesanan'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
