'use client';
export const dynamic = 'force-dynamic';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/store/AppStore';

function ConfirmInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { show } = useToast();

  useEffect(() => {
    const code = searchParams.get('code');

    const confirm = async () => {
      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          show('Failed to confirm your account. Please try again.', 'error', 4000);
          router.push('/auth/login');
          return;
        }
        if (data?.session) {
          show('Email confirmed! Welcome to BuyCoon! ✦', 'success', 4000);
          router.push('/auth/face-id-setup');
          return;
        }
      }
      const { data: { session } } = await supabase.auth.getSession();
      router.push(session ? '/' : '/auth/login');
    };

    confirm();
  }, [searchParams]);

  return (
    <div className="auth-page" style={{ position: 'relative', zIndex: 1 }}>
      <div className="bg-aura" />
      <div className="auth-card glass-strong" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>✦</div>
        <h2 className="auth-title">Confirming your account...</h2>
        <p className="auth-subtitle">Please wait a moment</p>
      </div>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={null}>
      <ConfirmInner />
    </Suspense>
  );
}