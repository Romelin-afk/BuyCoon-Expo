'use client';
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  User,
  Calendar
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};

    if (!name.trim()) e.name = 'Enter your name';

    if (!email.includes('@')) e.email = 'Invalid email';

    if (!age || isNaN(age)) {
      e.age = 'Enter your age';
    } else if (Number(age) < 18) {
      e.age = 'You must be 18 or older';
    } else if (Number(age) > 120) {
      e.age = 'Invalid age';
    }

    if (password.length < 6) {
      e.password = 'Minimum 6 characters';
    }

    if (password !== confirm) {
      e.confirm = 'Passwords do not match';
    }

    if (!acceptedTerms) {
      e.terms = 'You must accept the terms and conditions';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          age: Number(age),
          accepted_terms: true,
          accepted_terms_at: new Date().toISOString(),
        },
      },
    });

    if (error) {
      setErrors({ email: error.message });
    } else {
      router.push('/auth/face-id-setup');
    }

    setLoading(false);
  };

  return (
    <div
      className="auth-page"
      style={{ position: 'relative', zIndex: 1 }}
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
          onClick={() => router.push('/')}
        >
          <ArrowLeft size={14} /> Home
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

        <h1 className="auth-title">Create your account</h1>

        <p className="auth-subtitle">
          Join BuyCoon! for free · 18+ only
        </p>

        <div className="auth-form">

          {/* Full Name */}
          <div>
            <label className="input-label">
              Full name
            </label>

            <div className="input-wrapper">
              <User
                size={16}
                className="input-icon-left"
              />

              <input
                type="text"
                className={`input-field has-left${errors.name ? ' error' : ''}`}
                placeholder="John Doe"
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  setErrors(ev => ({
                    ...ev,
                    name: ''
                  }));
                }}
              />
            </div>

            {errors.name && (
              <p className="input-error">
                {errors.name}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="input-label">
              Email address
            </label>

            <div className="input-wrapper">
              <Mail
                size={16}
                className="input-icon-left"
              />

              <input
                type="email"
                className={`input-field has-left${errors.email ? ' error' : ''}`}
                placeholder="you@email.com"
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  setErrors(ev => ({
                    ...ev,
                    email: ''
                  }));
                }}
              />
            </div>

            {errors.email && (
              <p className="input-error">
                {errors.email}
              </p>
            )}
          </div>

          {/* Age */}
          <div>
            <label className="input-label">
              Age
            </label>

            <div className="input-wrapper">
              <Calendar
                size={16}
                className="input-icon-left"
              />

              <input
                type="number"
                min={18}
                max={120}
                className={`input-field has-left${errors.age ? ' error' : ''}`}
                placeholder="18"
                value={age}
                onChange={e => {
                  setAge(e.target.value);
                  setErrors(ev => ({
                    ...ev,
                    age: ''
                  }));
                }}
              />
            </div>

            {errors.age && (
              <p className="input-error">
                {errors.age}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="input-label">
              Password
            </label>

            <div className="input-wrapper">
              <Lock
                size={16}
                className="input-icon-left"
              />

              <input
                type={showPwd ? 'text' : 'password'}
                className={`input-field has-left has-right${errors.password ? ' error' : ''}`}
                placeholder="••••••••"
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  setErrors(ev => ({
                    ...ev,
                    password: ''
                  }));
                }}
              />

              <button
                className="input-icon-right"
                onClick={() => setShowPwd(!showPwd)}
                type="button"
                aria-label={showPwd ? 'Hide password' : 'Show password'}
              >
                {showPwd
                  ? <EyeOff size={15} />
                  : <Eye size={15} />
                }
              </button>
            </div>

            {errors.password && (
              <p className="input-error">
                {errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="input-label">
              Confirm password
            </label>

            <div className="input-wrapper">
              <Lock
                size={16}
                className="input-icon-left"
              />

              <input
                type={showPwd ? 'text' : 'password'}
                className={`input-field has-left${errors.confirm ? ' error' : ''}`}
                placeholder="••••••••"
                value={confirm}
                onChange={e => {
                  setConfirm(e.target.value);
                  setErrors(ev => ({
                    ...ev,
                    confirm: ''
                  }));
                }}
                onKeyDown={e =>
                  e.key === 'Enter' && submit()
                }
              />
            </div>

            {errors.confirm && (
              <p className="input-error">
                {errors.confirm}
              </p>
            )}
          </div>

          {/* Terms */}
          <div>
            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
                cursor: 'pointer',
                fontSize: 13,
                color: 'var(--tx-2, #8B416F)',
                lineHeight: 1.4
              }}
            >
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={e => {
                  setAcceptedTerms(e.target.checked);
                  setErrors(ev => ({
                    ...ev,
                    terms: ''
                  }));
                }}
                style={{
                  marginTop: 2,
                  flexShrink: 0
                }}
              />

              <span>
                I confirm that I am 18 or older and agree to the{' '}
                <a
                  href="/terms"
                  target="_blank"
                  style={{
                    color: 'var(--brand, #716BC9)',
                    textDecoration: 'underline'
                  }}
                >
                  Terms and Conditions
                </a>
              </span>
            </label>

            {errors.terms && (
              <p className="input-error">
                {errors.terms}
              </p>
            )}
          </div>

          {/* Create Account */}
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
              <>
                <span>Create account</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>

        </div>

        {/* Footer */}
        <div className="auth-footer">
          Already have an account?{' '}
          <a
            onClick={() => router.push('/auth/login')}
            style={{ cursor: 'pointer' }}
          >
            Log in
          </a>
        </div>

      </div>
    </div>
  );
}