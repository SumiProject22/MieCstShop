import React, { useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { CatPawIcon } from './CatIcons';

type AuthDecision = 'checking' | 'unauthenticated' | 'forbidden' | 'authorized';

interface AdminRouteProps {
  children: React.ReactNode;
  onAccessDenied: (message: string) => void;
}

export function AdminRoute({ children, onAccessDenied }: AdminRouteProps) {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [authDecision, setAuthDecision] = useState<AuthDecision>('checking');
  const onAccessDeniedRef = useRef(onAccessDenied);

  useEffect(() => {
    onAccessDeniedRef.current = onAccessDenied;
  }, [onAccessDenied]);

  useEffect(() => {
    let active = true;

    async function verifyAdminAccess() {
      setIsCheckingAuth(true);

      try {
        if (!supabase || !isSupabaseConfigured) {
          if (active) {
            setAuthDecision('unauthenticated');
            setIsCheckingAuth(false);
          }
          return;
        }

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (!active) return;

        if (sessionError || !session?.user) {
          setAuthDecision('unauthenticated');
          setIsCheckingAuth(false);
          return;
        }

        const user = session.user;

        // Wajib ambil role langsung dari tabel public.profiles (bukan dari user_metadata/local state)
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (!active) return;

        if (profileError || profile?.role !== 'admin') {
          onAccessDeniedRef.current('Akses Ditolak! Halaman ini khusus untuk Admin.');
          setAuthDecision('forbidden');
          setIsCheckingAuth(false);
          return;
        }

        setAuthDecision('authorized');
        setIsCheckingAuth(false);
      } catch {
        if (!active) return;
        onAccessDeniedRef.current('Akses Ditolak! Halaman ini khusus untuk Admin.');
        setAuthDecision('forbidden');
        setIsCheckingAuth(false);
      }
    }

    verifyAdminAccess();

    if (!supabase || !isSupabaseConfigured) {
      return () => {
        active = false;
      };
    }

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (!active) return;
      if (event === 'SIGNED_OUT') {
        setAuthDecision('unauthenticated');
        setIsCheckingAuth(false);
      }
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#F6E2E9] flex items-center justify-center p-6">
        <div className="w-full max-w-sm rounded-3xl bg-[#FCF4F7] border border-[#E4C3CF] p-8 text-center shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#EED2DC] border border-[#DFB9C7] flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6 text-[#BA3360]" aria-hidden="true" />
          </div>
          <div className="space-y-1.5">
            <h1 className="font-display text-lg font-bold text-[#362029]">
              Memverifikasi Akses Admin
            </h1>
            <p className="text-sm text-[#5F424E]">
              Mohon tunggu sebentar, kami sedang memeriksa sesi dan izin akunmu...
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs font-medium text-[#9D254E]">
            <CatPawIcon className="w-4 h-4 animate-bounce" aria-hidden="true" />
            <span>Memuat data profil dari Supabase</span>
          </div>
        </div>
      </div>
    );
  }

  if (authDecision === 'unauthenticated') {
    return <Navigate to="/login" replace state={{ from: '/admin' }} />;
  }

  if (authDecision === 'forbidden') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
