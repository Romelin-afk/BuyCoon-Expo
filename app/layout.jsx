import { AuthProvider, FavoritesProvider, ToastProvider } from '@/store/AppStore';
import { ThemeProvider } from '@/store/ThemeStore';
import Navbar from '@/components/layout/Navbar';
import '@/styles/globals.css';

export const metadata = {
  title: 'BuyCoon!',
  description: 'Premium secondhand marketplace in Panama',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <ThemeProvider>
          <AuthProvider>
            <FavoritesProvider>
              <ToastProvider>
                <Navbar />
                {children}
              </ToastProvider>
            </FavoritesProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}