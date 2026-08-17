# BuyCoon! — Plan de Acción Completo
> Versión actual: base sólida construida. Usa este documento como hoja de ruta para continuar el desarrollo.

---

## ✅ Ya está hecho (esta sesión)

- Arquitectura Next.js 14 App Router limpia desde cero
- Design system completo: dark mode + liquid glass mejorado
- Paleta exacta de marca: `#716BC9 / #E01A4F / #8686B8 / #8B416F / #FDE4D8`
- Tipografía premium: Syne (display) + DM Sans (body)
- Navbar top + bottom con estados activos
- Announcement bar con anuncios rotativos + dropdown de productos featured
- Todas las páginas en inglés
- Fotos reales de Unsplash en los productos
- 12 productos de ejemplo con datos reales
- Auth completo: login, registro, recuperar contraseña
- Favoritos con persistencia en localStorage
- Swipe deck con drag real
- Grid con búsqueda + filtros
- Mapa SVG interactivo con pins
- Detalle de producto con galería
- Publicar producto (4 pasos)
- Perfil de usuario con tabs
- Modal de denuncia con 6 motivos
- Toast notifications globales
- Liquid glass ultra-mejorado en todas las superficies

---

## 🔥 PRIORIDAD ALTA — Haz esto primero

### 1. Base de Datos con Supabase (GRATIS)
**Por qué Supabase:** PostgreSQL, auth real, storage de imágenes, todo gratis hasta 500MB.

**Pasos:**
```bash
# 1. Ve a https://supabase.com y crea una cuenta gratis
# 2. Crea un nuevo proyecto (guarda la URL y la anon key)
# 3. En tu proyecto BuyCoon, instala el cliente:
npm install @supabase/supabase-js

# 4. Crea el archivo de configuración:
```

Crea `/lib/supabase.js`:
```js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
```

Crea `.env.local` en la raíz del proyecto:
```
NEXT_PUBLIC_SUPABASE_URL=tu_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_key_aqui
```

**Tablas que necesitas crear en Supabase (SQL Editor):**
```sql
-- Productos
create table products (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  price numeric not null,
  currency text default 'USD',
  category text,
  condition text,
  location text,
  lat numeric,
  lng numeric,
  images text[],
  seller_id uuid references auth.users(id),
  tags text[],
  views integer default 0,
  favorites integer default 0,
  available boolean default true,
  created_at timestamp default now()
);

-- Favoritos
create table favorites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  product_id uuid references products(id),
  created_at timestamp default now(),
  unique(user_id, product_id)
);

-- Denuncias
create table reports (
  id uuid default gen_random_uuid() primary key,
  reporter_id uuid references auth.users(id),
  product_id uuid references products(id),
  reason text not null,
  details text,
  created_at timestamp default now()
);

-- Mensajes (contacto vendedor)
create table messages (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references auth.users(id),
  receiver_id uuid references auth.users(id),
  product_id uuid references products(id),
  content text not null,
  read boolean default false,
  created_at timestamp default now()
);
```

**Reemplazar el auth simulado por Supabase Auth:**
En `store/AppStore.js`, cambia las funciones `login` y `register`:
```js
import { supabase } from '@/lib/supabase'

// Login real:
const login = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(error.message)
  return data.user
}

// Register real:
const register = async (name, email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: { data: { name } }
  })
  if (error) throw new Error(error.message)
  return data.user
}

// Logout real:
const logout = async () => {
  await supabase.auth.signOut()
  setUser(null)
}
```

---

### 2. Storage de Imágenes Real (Supabase Storage)
**Por qué:** Las imágenes actuales son de Unsplash. Necesitas subir fotos reales.

En Supabase, crea un bucket llamado `product-images` (público).

En el formulario de publicación (`app/publish/page.js`), reemplaza `addMockImage` por:
```js
const uploadImage = async (file) => {
  const filename = `${Date.now()}-${file.name}`
  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(filename, file)
  
  if (error) throw error
  
  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(filename)
  
  return publicUrl
}

// En el input:
<input type="file" accept="image/*" onChange={async (e) => {
  const file = e.target.files[0]
  const url = await uploadImage(file)
  setPreviewImgs(imgs => [...imgs, url])
}} />
```

---

### 3. Mapa Real con Mapbox (GRATIS hasta 50K cargas/mes)

```bash
npm install mapbox-gl react-map-gl
```

Ve a https://mapbox.com → crea cuenta → copia tu `access token`.

Reemplaza el SVG en `app/map/page.js` por:
```js
import Map, { Marker, Popup } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

// En el componente:
<Map
  mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
  initialViewState={{ longitude: -79.52, latitude: 8.99, zoom: 12 }}
  style={{ width: '100%', height: '100%' }}
  mapStyle="mapbox://styles/mapbox/dark-v11"
>
  {MOCK_PRODUCTS.map(p => (
    <Marker key={p.id} longitude={p.lng} latitude={p.lat}>
      <div className="map-pin-bubble" onClick={() => setSelected(p.id)}>
        {formatPrice(p.price)}
      </div>
    </Marker>
  ))}
</Map>
```

Agrega a `.env.local`:
```
NEXT_PUBLIC_MAPBOX_TOKEN=tu_token_aqui
```

---

## 🎨 PRIORIDAD MEDIA — Mejoras visuales

### 4. Animaciones con Framer Motion
Ya está instalado. Úsalo en las cards y transiciones de página:

```bash
# Ya instalado, solo importa:
import { motion } from 'framer-motion'

# Reemplaza divs de cards por:
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  whileHover={{ y: -6, scale: 1.02 }}
  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
>
  ...card content
</motion.div>
```

### 5. Transiciones de Página
Crea `components/layout/PageTransition.js`:
```js
'use client'
import { motion } from 'framer-motion'
export default function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}
```

### 6. Glassmorphism más profundo en móvil
En `styles/globals.css`, agrega:
```css
@supports (backdrop-filter: blur(1px)) {
  .liquid-card, .glass-card, .top-nav, .bottom-nav {
    backdrop-filter: blur(40px) saturate(250%) brightness(1.08);
  }
}
```

---

## 🚀 PRIORIDAD MEDIA — Funciones reales

### 7. Sistema de Mensajería Real
Instala socket.io o usa Supabase Realtime:
```js
// En Supabase, activa Realtime para la tabla messages
// Suscripción en tiempo real:
const subscription = supabase
  .channel('messages')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, 
    payload => { setMessages(m => [...m, payload.new]) }
  )
  .subscribe()
```

### 8. Búsqueda con Algolia (GRATIS 10K/mes)
```bash
npm install algoliasearch instantsearch.js react-instantsearch
```
- Ve a https://algolia.com → crea app gratis
- Sube los productos al índice
- Reemplaza el filtrado manual en `app/grid/page.js` por InstantSearch

### 9. Pagos con Stripe (opcional / premium feature)
```bash
npm install stripe @stripe/stripe-js @stripe/react-stripe-js
```
- Para pagos seguros entre usuarios
- Comisión de Stripe: 2.9% + $0.30 por transacción
- Crea webhook para confirmar pagos

---

## 📱 PRIORIDAD BAJA — Expansión

### 10. Push Notifications
```bash
npm install web-push
```
Notifica cuando alguien contacta al vendedor o hay un nuevo match.

### 11. PWA (Progressive Web App)
```bash
npm install next-pwa
```
En `next.config.js`:
```js
const withPWA = require('next-pwa')({ dest: 'public' })
module.exports = withPWA({ /* tu config actual */ })
```
Esto permite instalar BuyCoon! como app nativa en Android/iOS.

### 12. SEO y Open Graph
En cada página de producto, agrega metadata dinámica:
```js
export async function generateMetadata({ params }) {
  const product = getProductById(params.id)
  return {
    title: `${product.title} — BuyCoon!`,
    description: product.description,
    openGraph: {
      images: [product.images[0]],
    },
  }
}
```

### 13. Analytics
```bash
npm install @vercel/analytics
```
O integra Google Analytics 4 directamente en el layout.

### 14. Deployment en Vercel (GRATIS)
```bash
npm install -g vercel
vercel login
vercel --prod
```
- Ve a https://vercel.com
- Importa desde GitHub
- Agrega las variables de entorno (Supabase, Mapbox)
- Deploy automático en cada push

---

## 🗂️ Estructura de archivos actual

```
buycoon/
├── app/
│   ├── layout.js              ← Root layout con providers + Navbar + AnnouncementBar
│   ├── page.js                ← Home
│   ├── grid/page.js           ← Explorar con filtros
│   ├── swipe/page.js          ← Swipe deck
│   ├── map/page.js            ← Mapa interactivo
│   ├── favorites/page.js      ← Guardados
│   ├── publish/page.js        ← Publicar (4 pasos)
│   ├── profile/page.js        ← Perfil con tabs
│   ├── product/[id]/page.js   ← Detalle de producto
│   └── auth/
│       ├── login/page.js
│       ├── register/page.js
│       └── recover/page.js
├── components/
│   ├── layout/
│   │   ├── Navbar.js          ← Top + bottom nav
│   │   └── AnnouncementBar.js ← Barra de anuncios + featured dropdown
│   ├── products/
│   │   └── ProductCard.js     ← Card reutilizable
│   └── modals/
│       └── ReportModal.js     ← Modal de denuncia
├── lib/
│   └── data.js                ← Mock data + helpers
├── store/
│   └── AppStore.js            ← Auth + Favorites + Toast contexts
└── styles/
    └── globals.css            ← Design system completo
```

---

## 💡 Orden recomendado de implementación

1. **Supabase** → base de datos + auth real (1 día)
2. **Storage de imágenes** → subir fotos reales (2 horas)
3. **Mapbox** → mapa real de Panamá (2 horas)
4. **Framer Motion** → animaciones de página (1 hora)
5. **Mensajería** → contacto vendedor real (2 días)
6. **Algolia** → búsqueda potente (3 horas)
7. **Vercel** → deploy público (30 minutos)
8. **PWA** → instalar como app (1 hora)

---

## 🎯 Para la próxima conversación con Claude

Puedes pegar este contexto al inicio:

> "Estoy desarrollando BuyCoon!, un marketplace premium de segunda mano en Next.js 14 App Router. Ya tengo la base construida con design system glassmorphism, auth simulado, favorites, swipe, grid, mapa SVG, announcement bar y todos los archivos organizados. Necesito ayuda para [lo que quieras implementar]."

---

*BuyCoon! — Built to win. 🦝*
