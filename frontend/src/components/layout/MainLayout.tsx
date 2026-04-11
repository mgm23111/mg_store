import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { CartDrawer } from '../common/CartDrawer';
import { ToastContainer } from '../common/Toast';
import { CookieConsentBanner } from '../common/CookieConsentBanner';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
      <CartDrawer />
      <ToastContainer />
      <CookieConsentBanner />
    </div>
  );
};
