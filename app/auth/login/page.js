'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth, useToast } from '@/store/AppStore';
import { supabase } from '@/lib/supabase';
export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { show } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!email.includes('@')) e.email = 'Invalid email';
    if (password.length < 6) e.password = 'Minimum 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

const submit = async () => {
  if (!validate()) return;
  setLoading(true);
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    setErrors({ password: 'Invalid email or password' });
  } else {
    show('Welcome back! ✦', 'success');
    router.push('/');
  }
  setLoading(false);
};

  return (
    <div className="auth-page" style={{ position: 'relative', zIndex: 1 }}>
      <div className="bg-aura" />

      <div className="auth-card glass-strong anim-scale-in">
        {/* Back */}
        <button
          className="btn btn-ghost btn-sm"
          style={{ position: 'absolute', top: 20, left: 20, display: 'flex', alignItems: 'center', gap: 5 }}
          onClick={() => router.push('/')}
        >
          <ArrowLeft size={14} /> Home
        </button>

        {/* Logo */}
        <div className="auth-logo">
          <Image src="/logos/logo-white.png" alt="BuyCoon!" width={180} height={60} style={{ objectFit: 'contain', filter: 'drop-shadow(0 0 20px rgba(113,107,201,0.4))' }} />
        </div>

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your account to continue</p>

        <div className="auth-form">
          {/* Email */}
          <div>
            <label className="input-label">Email</label>
            <div className="input-wrapper">
              <Mail size={16} className="input-icon-left" />
              <input
                type="email"
                className={`input-field has-left${errors.email ? ' error' : ''}`}
                placeholder="tu@email.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setErrors(ev => ({ ...ev, email: '' })); }}
                onKeyDown={e => e.key === 'Enter' && submit()}
              />
            </div>
            {errors.email && <p className="input-error">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label className="input-label" style={{ margin: 0 }}>Password</label>
              <button
                style={{ fontSize: 12, color: 'var(--brand-primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => router.push('/auth/recover')}
              >
                Forgot your password?
              </button>
            </div>
            <div className="input-wrapper">
              <Lock size={16} className="input-icon-left" />
              <input
                type={showPwd ? 'text' : 'password'}
                className={`input-field has-left has-right${errors.password ? ' error' : ''}`}
                placeholder="••••••••"
                value={password}
                onChange={e => { setPassword(e.target.value); setErrors(ev => ({ ...ev, password: '' })); }}
                onKeyDown={e => e.key === 'Enter' && submit()}
              />
              <button className="input-icon-right" onClick={() => setShowPwd(!showPwd)}>
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.password && <p className="input-error">{errors.password}</p>}
          </div>

          {/* Remember */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={remember}
              onChange={e => setRemember(e.target.checked)}
              style={{ accentColor: 'var(--brand-primary)', width: 15, height: 15 }}
            />
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Remember me</span>
          </label>

          {/* Submit */}
          <button className="btn btn-primary btn-lg w-full" onClick={submit} disabled={loading}>
            {loading
              ? <span className="loader" style={{ width: 20, height: 20, borderWidth: 2 }} />
              : <><span>Sign In</span> <ArrowRight size={16} /></>
            }
          </button>
        </div>

        <div className="auth-footer">
          Don't have an account? <a onClick={() => router.push('/auth/register')} style={{ cursor: 'pointer' }}>Sign up for free</a>
        </div>
      </div>
    </div>
  );
}
