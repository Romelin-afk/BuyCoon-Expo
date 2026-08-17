'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, ArrowLeft, ArrowRight, CheckCircle2, Camera, X, Tag, MapPin, DollarSign, FileText, Package } from 'lucide-react';

import { CATEGORIES, CONDITIONS } from '@/lib/data';
import { useAuth, useToast } from '@/store/AppStore';
import { uploadProductImage } from '@/lib/uploadImage';
import { supabase } from '@/lib/supabase';

const STEPS = ['Fotos', 'Información', 'Precio y estado', 'Confirmar'];

export default function PublishPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { show } = useToast();

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [published, setPublished] = useState(false);

  const [imageFiles, setImageFiles] = useState([]);
  const [previewImgs, setPreviewImgs] = useState([]);

  const [form, setForm] = useState({
    title: '', description: '', price: '', category: '', condition: '',
    location: '', tags: '',
  });
  const [errors, setErrors] = useState({});

  if (authLoading) {
    return (
      <main className="page-content">
        <div className="empty-state">
          <span className="loader" style={{ width: 32, height: 32, borderWidth: 3 }} />
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="page-content">
        <div className="empty-state">
          <div className="empty-icon" style={{ fontSize: 32 }}>🔒</div>
          <div className="empty-title">Log in to post</div>
          <p className="empty-desc">You need an account to publish items on BuyCoon!</p>
          <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={() => router.push('/auth/login')}>
            Log in
          </button>
        </div>
      </main>
    );
  }

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const remaining = 5 - imageFiles.length;
    const toAdd = files.slice(0, remaining);
    setImageFiles(prev => [...prev, ...toAdd]);
    setPreviewImgs(prev => [...prev, ...toAdd.map(f => URL.createObjectURL(f))]);
    setErrors(er => ({ ...er, images: '' }));
  };

  const removeImg = (i) => {
    setImageFiles(prev => prev.filter((_, idx) => idx !== i));
    setPreviewImgs(prev => prev.filter((_, idx) => idx !== i));
  };

  const validateStep = () => {
    const e = {};
    if (step === 0 && previewImgs.length === 0) e.images = 'Add at least one photo';
    if (step === 1) {
      if (!form.title.trim()) e.title = 'Title is required';
      if (!form.description.trim()) e.description = 'Description is required';
      if (!form.category) e.category = 'Select a category';
    }
    if (step === 2) {
      if (!form.price || isNaN(form.price) || Number(form.price) <= 0) e.price = 'Invalid price';
      if (!form.condition) e.condition = 'Select the product condition';
      if (!form.location.trim()) e.location = 'Enter the location';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => { if (validateStep()) setStep(s => Math.min(s + 1, 3)); };
  const prevStep = () => setStep(s => Math.max(s - 1, 0));

  const publish = async () => {
    setSubmitting(true);
    try {
      const imageUrls = await Promise.all(imageFiles.map(f => uploadProductImage(f)));

      const { error } = await supabase.from('products').insert({
        seller_id: user.id,
        title: form.title,
        description: form.description,
        price: Number(form.price),
        category: form.category,
        condition: form.condition,
        location: form.location,
        images: imageUrls,
      });

      if (error) throw error;

      setPublished(true);
      show('post successfully created!', 'success', 3500);
    } catch (err) {
      console.error(err);
      show('Error posting. try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (published) {
    return (
      <main className="page-content">
        <div className="empty-state">
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(113,107,201,0.12)', border: '2px solid rgba(113,107,201,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)', fontSize: 36, marginBottom: 8 }}>
            <CheckCircle2 size={36} />
          </div>
          <div className="empty-title">Post successfully created!</div>
          <p className="empty-desc">Your product is now visible on BuyCoon! for buyers near you.</p>
          <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => router.push('/grid')}>View in catalog</button>
            <button className="btn btn-ghost" onClick={() => { setPublished(false); setStep(0); setForm({ title: '', description: '', price: '', category: '', condition: '', location: '', tags: '' }); setPreviewImgs([]); setImageFiles([]); }}>
              Post another
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page-content" style={{ position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '20px 20px 0' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => step === 0 ? router.back() : prevStep()}>
            <ArrowLeft size={16} />
          </button>
          <div style={{ flex: 1 }}>
            <h1 className="section-title">Publish Product</h1>
            <p className="section-subtitle">Step {step + 1} of {STEPS.length} — {STEPS[step]}</p>
          </div>
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
          {STEPS.map((s, i) => (
            <div
              key={i}
              style={{
                flex: 1, height: 4, borderRadius: 'var(--r-full)',
                background: i <= step ? 'var(--brand-primary)' : 'var(--surface-2)',
                transition: 'background 0.3s',
                cursor: i < step ? 'pointer' : 'default',
              }}
              onClick={() => i < step && setStep(i)}
            />
          ))}
        </div>

        {/* STEP 0: Photos */}
        {step === 0 && (
          <div className="anim-fade-up">
            <div className="publish-section">
              <div className="publish-section-title"><Camera size={16} style={{ color: 'var(--brand-primary)' }} /> Product Photos</div>

              {previewImgs.length < 5 && (
                <label className="image-upload-area" style={{ cursor: 'pointer' }}>
                  <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFileChange} />
                  <Upload size={28} style={{ color: 'var(--brand-primary)', opacity: 0.7 }} />
                  <p>Tap to add photos</p>
                  <span>JPG, PNG — Maximum 5 photos</span>
                </label>
              )}
              {errors.images && <p className="input-error" style={{ marginTop: 8 }}>{errors.images}</p>}

              {previewImgs.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 10, marginTop: 14 }}>
                  {previewImgs.map((src, i) => (
                    <div key={i} style={{ position: 'relative', borderRadius: 'var(--r-md)', overflow: 'hidden', aspectRatio: '1/1' }}>
                      <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        onClick={() => removeImg(i)}
                        style={{ position: 'absolute', top: 5, right: 5, width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}
                      >
                        <X size={12} />
                      </button>
                      {i === 0 && <div style={{ position: 'absolute', bottom: 4, left: 4 }}><span className="badge badge-primary" style={{ fontSize: 9 }}>Principal</span></div>}
                    </div>
                  ))}
                  {previewImgs.length < 5 && (
                    <label style={{ borderRadius: 'var(--r-md)', border: '2px dashed var(--border-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', aspectRatio: '1/1', color: 'var(--brand-primary)' }}>
                      <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFileChange} />
                      <Upload size={20} />
                    </label>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 1: Info */}
        {step === 1 && (
          <div className="anim-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="input-label"><FileText size={12} style={{ display: 'inline', marginRight: 4 }} />Title</label>
              <input className={`input-field${errors.title ? ' error' : ''}`} placeholder="e.g., MacBook Pro 14 inches M3" value={form.title} onChange={e => set('title', e.target.value)} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                {errors.title ? <p className="input-error">{errors.title}</p> : <span />}
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{form.title.length}/80</span>
              </div>
            </div>

            <div>
              <label className="input-label">Description</label>
              <textarea
                className={`input-field${errors.description ? ' error' : ''}`}
                placeholder="Describe the product: condition, included accessories, usage time..."
                rows={5}
                value={form.description}
                onChange={e => set('description', e.target.value)}
                style={{ resize: 'none' }}
              />
              {errors.description && <p className="input-error">{errors.description}</p>}
            </div>

            <div>
              <label className="input-label"><Package size={12} style={{ display: 'inline', marginRight: 4 }} />Category</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                  <button key={cat.id} className={`filter-chip${form.category === cat.id ? ' active' : ''}`} onClick={() => set('category', cat.id)}>
                    {cat.icon} {cat.label}
                  </button>
                ))}
              </div>
              {errors.category && <p className="input-error" style={{ marginTop: 4 }}>{errors.category}</p>}
            </div>

            <div>
              <label className="input-label"><Tag size={12} style={{ display: 'inline', marginRight: 4 }} />Tags (comma-separated)</label>
              <input className="input-field" placeholder="e.g., apple, laptop, programming" value={form.tags} onChange={e => set('tags', e.target.value)} />
            </div>
          </div>
        )}

        {/* STEP 2: Price & condition */}
        {step === 2 && (
          <div className="anim-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label className="input-label"><DollarSign size={12} style={{ display: 'inline', marginRight: 4 }} />Price (USD)</label>
              <div className="input-wrapper">
                <span className="input-icon-left" style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-secondary)' }}>$</span>
                <input
                  type="number"
                  className={`input-field has-left${errors.price ? ' error' : ''}`}
                  placeholder="0.00"
                  value={form.price}
                  onChange={e => set('price', e.target.value)}
                  min={1}
                />
              </div>
              {errors.price && <p className="input-error">{errors.price}</p>}
            </div>

            <div>
              <label className="input-label">Product Condition</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {CONDITIONS.map(c => (
                  <label key={c.id} className={`radio-option${form.condition === c.id ? ' selected' : ''}`} onClick={() => set('condition', c.id)}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{c.label}</span>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${form.condition === c.id ? 'var(--brand-primary)' : 'var(--border-normal)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {form.condition === c.id && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--brand-primary)' }} />}
                    </div>
                  </label>
                ))}
              </div>
              {errors.condition && <p className="input-error">{errors.condition}</p>}
            </div>

            <div>
              <label className="input-label"><MapPin size={12} style={{ display: 'inline', marginRight: 4 }} />Location</label>
              <input
                className={`input-field${errors.location ? ' error' : ''}`}
                placeholder="e.g., Marbella, Panama city"
                value={form.location}
                onChange={e => set('location', e.target.value)}
              />
              {errors.location && <p className="input-error">{errors.location}</p>}
            </div>
          </div>
        )}

        {/* STEP 3: Preview */}
        {step === 3 && (
          <div className="anim-fade-up">
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>Review your post before submitting</p>
            <div className="glass-card" style={{ borderRadius: 'var(--r-xl)', overflow: 'hidden' }}>
              {previewImgs[0] && (
                <img src={previewImgs[0]} alt="" style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover' }} />
              )}
              <div style={{ padding: 20 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
                  ${Number(form.price).toLocaleString('es-PA')}
                </div>
                <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>{form.title}</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                  {form.category && <span className="badge badge-primary">{CATEGORIES.find(c => c.id === form.category)?.label}</span>}
                  {form.condition && <span className="badge badge-success">{CONDITIONS.find(c => c.id === form.condition)?.label}</span>}
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>{form.description}</p>
                <div style={{ display: 'flex', gap: 5, fontSize: 12, color: 'var(--text-muted)' }}>
                  <MapPin size={12} /> {form.location}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', gap: 10, marginTop: 28, paddingBottom: 16 }}>
          {step > 0 && (
            <button className="btn btn-ghost w-full" onClick={prevStep}>
              <ArrowLeft size={15} /> Previous
            </button>
          )}
          {step < 3 ? (
            <button className="btn btn-primary w-full" onClick={nextStep}>
              Next <ArrowRight size={15} />
            </button>
          ) : (
            <button className="btn btn-primary w-full btn-lg" onClick={publish} disabled={submitting}>
              {submitting
                ? <span className="loader" style={{ width: 20, height: 20, borderWidth: 2 }} />
                : 'Publish Now'
              }
            </button>
          )}
        </div>
      </div>
    </main>
  );
}