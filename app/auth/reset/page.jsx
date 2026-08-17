'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/store/AppStore';

export default function ResetPage() {
  const router = useRouter();
  const { show } = useToast();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const submit = async () => {
    const e = {};
    if (password.length < 6) e.password = 'Minimum 6 characters';
    if (password !== confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    if (Object.keys(e).length) return;

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setErrors({ password: error.message });
    } else {
      show('Password updated successfully! ✦', 'success');
      router.push('/');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page" style={{ position: 'relative', zIndex: 1 }}>
      <div className="bg-aura" />
      <div className="auth-card glass-strong anim-scale-in">
        <div className="auth-logo">
          <Image src="/logos/logo-white.png" alt="BuyCoon!" width={180} height={60} style={{ objectFit: 'contain', filter: 'drop-shadow(0 0 20px rgba(113,107,201,0.4))' }} />
        </div>

        <h1 className="auth-title">New Password</h1>
        <p className="auth-subtitle">Choose a strong password</p>

        <div className="auth-form">
          <div>
            <label className="input-label">New Password</label>
            <div className="input-wrapper">
              <Lock size={16} className="input-icon-left" />
              <input
                type={showPwd ? 'text' : 'password'}
                className={`input-field has-left has-right${errors.password ? ' error' : ''}`}
                placeholder="••••••••"
                value={password}
                onChange={e => { setPassword(e.target.value); setErrors(ev => ({ ...ev, password: '' })); }}
              />
              <button className="input-icon-right" onClick={() => setShowPwd(!showPwd)}>
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.password && <p className="input-error">{errors.password}</p>}
          </div>

          <div>
            <label className="input-label">Confirm Password</label>
            <div className="input-wrapper">
              <Lock size={16} className="input-icon-left" />
              <input
                type={showPwd ? 'text' : 'password'}
                className={`input-field has-left${errors.confirm ? ' error' : ''}`}
                placeholder="••••••••"
                value={confirm}
                onChange={e => { setConfirm(e.target.value); setErrors(ev => ({ ...ev, confirm: '' })); }}
                onKeyDown={e => e.key === 'Enter' && submit()}
              />
            </div>
            {errors.confirm && <p className="input-error">{errors.confirm}</p>}
          </div>

          <button className="btn btn-primary btn-lg w-full" onClick={submit} disabled={loading}>
            {loading
              ? <span className="loader" style={{ width: 20, height: 20, borderWidth: 2 }} />
              : <><span>Save Password</span> <ArrowRight size={16} /></>
            }
          </button>
        </div>
      </div>
    </div>
  );
}