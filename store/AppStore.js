'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

const SIM_KEY = 'buycoon_sim_user';
const SIM_EVENT = 'buycoon-sim-auth';

// Convierte el usuario simulado guardado en localStorage al mismo
// "shape" que usa el resto de la app (user.name, user.avatar, etc.)
function readSimUser() {
  try {
    const raw = localStorage.getItem(SIM_KEY);
    if (!raw) return null;
    const u = JSON.parse(raw);
    if (!u?.loggedIn) return null;
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      avatar: u.avatar,
      faceIdEnrolled: !!u.faceIdEnrolled,
      simulated: true,
    };
  } catch {
    return null;
  }
}

// Convierte el usuario REAL de Supabase Auth al mismo "shape" que
// usa el resto de la app (user.name, user.avatar, etc.) — el objeto
// de sesión de Supabase no trae esos campos de forma nativa.
function normalizeRealUser(authUser) {
  if (!authUser) return null;
  const meta = authUser.user_metadata || {};
  const name = meta.full_name || meta.name || authUser.email?.split('@')[0] || 'User';
  return {
    id: authUser.id,
    name,
    email: authUser.email,
    avatar: meta.avatar_url || `https://i.pravatar.cc/150?u=${encodeURIComponent(authUser.email || authUser.id)}`,
    handle: `@${(authUser.email || 'user').split('@')[0]}`,
    verified: !!authUser.email_confirmed_at,
    faceIdEnrolled: !!meta.face_id_enrolled,
    simulated: false,
  };
}

export function useUser() {
  return useContext(AuthContext);
}

// ─── Auth Context ────────────────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sesión real de Supabase al cargar
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(normalizeRealUser(session.user));
      } else {
        setUser(readSimUser());
      }
      setLoading(false);
    });

    // Escucha cambios de sesión real (login, logout, refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(normalizeRealUser(session.user));
      } else {
        setUser(readSimUser());
      }
    });

    // Escucha el "login" simulado (se dispara justo después de guardar en localStorage)
    const onSimAuth = () => setUser(prev => {
      // Si ya hay sesión real de Supabase, esa manda
      return prev && !prev.simulated ? prev : readSimUser();
    });
    window.addEventListener(SIM_EVENT, onSimAuth);
    window.addEventListener('storage', onSimAuth);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener(SIM_EVENT, onSimAuth);
      window.removeEventListener('storage', onSimAuth);
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error('Email o contraseña incorrectos');
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    if (error) throw new Error(error.message);
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    localStorage.removeItem(SIM_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
// ─── Favorites Context ───────────────────────────────────────────────
const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const { user } = useUser();
  const [favorites, setFavorites] = useState([]);
  const [favProducts, setFavProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = useCallback(async () => {
    if (!user || user.simulated) {
      setFavorites([]);
      setFavProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('favorites')
      .select('product_id, products(*)')
      .eq('user_id', user.id);

    if (!error && data) {
      setFavorites(data.map(f => f.product_id));
      setFavProducts(data.map(f => f.products).filter(Boolean));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { loadFavorites(); }, [loadFavorites]);

  const toggle = useCallback(async (productId) => {
    if (!user || user.simulated) return; // sin sesión real, no hace nada

    const isCurrentlyFav = favorites.includes(productId);

    setFavorites(prev =>
      isCurrentlyFav ? prev.filter(id => id !== productId) : [...prev, productId]
    );

    if (isCurrentlyFav) {
      setFavProducts(prev => prev.filter(p => p.id !== productId));
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);
      if (error) loadFavorites();
    } else {
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: user.id, product_id: productId });
      if (error) {
        loadFavorites();
      } else {
        const { data: prod } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();
        if (prod) setFavProducts(prev => [...prev, prod]);
      }
    }
  }, [user, favorites, loadFavorites]);

  const isFav = useCallback((productId) => favorites.includes(productId), [favorites]);

  return (
    <FavoritesContext.Provider value={{ favorites, toggle, isFav, favProducts, loading }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export const useFavorites = () => {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used inside FavoritesProvider');
  return ctx;
};

// ─── Toast Context ───────────────────────────────────────────────────
const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((message, type = 'default', duration = 2500) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <ToastContainer toasts={toasts} />
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
};

function ToastContainer({ toasts }) {
  if (!toasts.length) return null;
  const icons = { success: '✓', error: '✕', default: '•' };
  const colors = { success: '#34d399', error: '#E01A4F', default: '#716BC9' };
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className="toast anim-fade-up">
          <span style={{ color: colors[t.type] || colors.default, fontWeight: 700 }}>
            {icons[t.type] || icons.default}
          </span>
          {t.message}
        </div>
      ))}
    </div>
  );
}