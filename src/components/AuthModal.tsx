import React, { useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { UserProfile } from '../types/shop';
import { registerAccount, signInAccount } from '../services/shopService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const user = await signInAccount({ email, password });
        onSuccess(user);
        onClose();
      } else {
        const result = await registerAccount({ fullName, email, password });
        if (result.needsEmailConfirmation) {
          setInfoMsg(
            result.message ||
              'Pendaftaran berhasil! Silakan cek emailmu untuk verifikasi akun sebelum masuk.'
          );
          setMode('login');
          setPassword('');
        } else if (result.user) {
          onSuccess(result.user);
          onClose();
        }
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Autentikasi gagal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#362029]/45 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#FCF4F7] border border-[#E4C3CF] rounded-3xl p-6 sm:p-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup jendela login"
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-xl text-[#5F424E] hover:bg-[#EED2DC] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <p className="text-xs font-medium text-[#9D254E]">
            Akun MiePetShop
          </p>
          <h2
            id="auth-modal-title"
            className="mt-1 font-display text-2xl font-bold text-[#362029]"
          >
            {mode === 'login' ? 'Masuk ke Akunmu' : 'Daftar Akun Baru'}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[#5F424E]">
            {mode === 'login'
              ? 'Masuk menggunakan email dan kata sandi yang sudah terdaftar.'
              : 'Buat akun untuk mulai berbelanja kebutuhan anabul kesayanganmu.'}
          </p>
        </div>

        {/* Switch Masuk / Daftar */}
        <div
          className="grid grid-cols-2 gap-1.5 p-1 bg-[#EED2DC] border border-[#DFB9C7] rounded-2xl mb-5"
          role="tablist"
          aria-label="Pilih mode autentikasi"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'login'}
            onClick={() => {
              setMode('login');
              setErrorMsg('');
              setInfoMsg('');
            }}
            className={`h-10 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
              mode === 'login'
                ? 'bg-[#FCF4F7] text-[#BA3360] shadow-xs'
                : 'text-[#5F424E] hover:text-[#362029]'
            }`}
          >
            Masuk
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={mode === 'register'}
            onClick={() => {
              setMode('register');
              setErrorMsg('');
              setInfoMsg('');
            }}
            className={`h-10 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
              mode === 'register'
                ? 'bg-[#FCF4F7] text-[#BA3360] shadow-xs'
                : 'text-[#5F424E] hover:text-[#362029]'
            }`}
          >
            Daftar Akun
          </button>
        </div>

        {infoMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-[#EED2DC] border border-[#DFB9C7] text-xs font-medium text-[#362029] flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#BA3360] shrink-0 mt-0.5" />
            <span>{infoMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-[#EED2DC] border border-[#BA3360] text-xs font-medium text-[#9D254E]">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-[#362029] mb-1.5">
                Nama Lengkap
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nama lengkapmu"
                className="w-full h-11 px-3.5 rounded-xl bg-[#F6E2E9]/70 border border-[#DFB9C7] text-sm text-[#362029] focus:outline-none focus:bg-white focus:border-[#BA3360]"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#362029] mb-1.5">
              Alamat Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="w-full h-11 px-3.5 rounded-xl bg-[#F6E2E9]/70 border border-[#DFB9C7] text-sm text-[#362029] focus:outline-none focus:bg-white focus:border-[#BA3360]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#362029] mb-1.5">
              Kata Sandi
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              className="w-full h-11 px-3.5 rounded-xl bg-[#F6E2E9]/70 border border-[#DFB9C7] text-sm text-[#362029] focus:outline-none focus:bg-white focus:border-[#BA3360]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-[#BA3360] hover:bg-[#9D254E] text-white text-sm font-semibold transition-colors cursor-pointer disabled:opacity-60"
          >
            {loading
              ? 'Memproses...'
              : mode === 'login'
              ? 'Masuk'
              : 'Daftar Sekarang'}
          </button>
        </form>
      </div>
    </div>
  );
}
