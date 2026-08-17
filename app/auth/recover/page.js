'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Mail, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/store/AppStore';

export default function RecoverPage() {
  const router = useRouter();
  const { show } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!email.includes('@')) return setError('Invalid email');
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:3000/auth/reset',
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
      show('Email sent ✦', 'success');
    }

    setLoading(false);
  };

  return (
    <div
      className="auth-page"
      style={{
        position: 'relative',
        zIndex: 1
      }}
    >
      <div className="bg-aura" />

      <div className="auth-card glass-strong anim-scale-in">

        <button
          className="btn btn-ghost btn-sm"
          style={{
            position: 'absolute',
            top: 20,
            left: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 5
          }}
          onClick={() => router.push('/auth/login')}
        >
          <ArrowLeft size={14} />
          Return
        </button>

        <div className="auth-logo">
          <Image
            src="/logos/logo-white.png"
            alt="BuyCoon!"
            width={180}
            height={60}
            style={{
              objectFit: 'contain',
              filter: 'drop-shadow(0 0 20px rgba(113,107,201,0.4))'
            }}
          />
        </div>

        {sent ? (
          <>
            <div
              style={{
                fontSize: 40,
                textAlign: 'center',
                marginBottom: 12
              }}
            >
              📬
            </div>

            <h1 className="auth-title">
              Check your email
            </h1>

            <p className="auth-subtitle">
              We've sent you a link to reset your password.
            </p>
          </>
        ) : (
          <>
            <h1 className="auth-title">
              Recover password
            </h1>

            <p className="auth-subtitle">
              We'll send you a link to reset your password.
            </p>

            <div className="auth-form">
              <div>
                <label className="input-label">
                  Email
                </label>

                <div className="input-wrapper">
                  <Mail
                    size={16}
                    className="input-icon-left"
                  />

                  <input
                    type="email"
                    className={`input-field has-left${
                      error ? ' error' : ''
                    }`}
                    placeholder="you@email.com"
                    value={email}
                    onChange={e => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    onKeyDown={e =>
                      e.key === 'Enter' && submit()
                    }
                  />
                </div>

                {error && (
                  <p className="input-error">
                    {error}
                  </p>
                )}
              </div>

              <button
                className="btn btn-primary btn-lg w-full"
                onClick={submit}
                disabled={loading}
              >
                {loading ? (
                  <span
                    className="loader"
                    style={{
                      width: 20,
                      height: 20,
                      borderWidth: 2
                    }}
                  />
                ) : (
                  'Send reset link'
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}