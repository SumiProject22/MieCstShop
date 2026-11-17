import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { CatBrandMark } from '../components/CatIcons';
import { registerAccount, signInAccount } from '../services/shopService';
import { UserProfile } from '../types/shop';

interface LoginPageProps {
  currentUser: UserProfile | null;
  onSuccess: (user: UserProfile) => void;
}

export function LoginPage({ currentUser, onSuccess }: LoginPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectFrom = (location.state as { from?: string } | null)?.from;

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const user = await signInAccount({ email, password });
        onSuccess(user);
        if (redirectFrom === '/admin') {
          navigate('/admin', { replace: true });
        } else if (user.role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
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
          navigate(redirectFrom === '/admin' ? '/admin' : '/', { replace: true });
        }
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Autentikasi gagal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6E2E9] text-[#362029] flex flex-col justify-between p-4 sm:p-6">
      <div className="max-w-md w-full mx-auto pt-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#5F424E] hover:text-[#BA3360] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Kembali ke Beranda Toko</span>
        </Link>
      </div>

      <div className="max-w-md w-full mx-auto my-8 bg-[#FCF4F7] border border-[#E4C3CF] rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-2.5 mb-5">
          <CatBrandMark className="w-8 h-8 shrink-0" />
          <span className="font-display text-xl font-bold tracking-tight text-[#362029]">
            MiePetShop
          </span>
        </div>

        <div className="mb-6">
          <p className="text-xs font-medium text-[#9D254E]">Akun MiePetShop</p>
          <h1 className="mt-1 font-display text-2xl font-bold text-[#362029]">
            {mode === 'login' ? 'Masuk ke Akunmu' : 'Daftar Akun Baru'}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#5F424E]">
            {mode === 'login'
              ? 'Masuk menggunakan email dan kata sandi yang sudah terdaftar.'
              : 'Buat akun untuk mulai berbelanja kebutuhan anabul kesayanganmu.'}
          </p>
        </div>

        {currentUser && (
          <div className="mb-5 p-3.5 rounded-2xl bg-[#EED2DC] border border-[#DFB9C7] text-xs text-[#362029] flex items-center justify-between gap-3">
            <div>
              Kamu sudah masuk sebagai <strong>{currentUser.fullName}</strong>.
            </div>
            <Link
              to={currentUser.role === 'admin' ? '/admin' : '/'}
              className="font-semibold text-[#BA3360] hover:underline whitespace-nowrap"
            >
              {currentUser.role === 'admin' ? 'Ke Admin' : 'Ke Toko'}
            </Link>
          </div>
        )}

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

      <p className="text-center text-xs text-[#5F424E] pb-2">
        © {new Date().getFullYear()} MiePetShop
      </p>
    </div>
  );
}
