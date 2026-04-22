import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { useCartStore } from './stores/cartStore';
import { useStoreSettingsStore } from './stores/storeSettingsStore';
import { cartService } from './api/cartService';

// Storefront Pages
import { Home } from './pages/storefront/Home';
import { Catalog } from './pages/storefront/Catalog';
import { Categories } from './pages/storefront/Categories';
import { ProductDetail } from './pages/storefront/ProductDetail';
import { Checkout } from './pages/storefront/Checkout';
import { OrderConfirmation } from './pages/storefront/OrderConfirmation';
import { OrderTracking } from './pages/storefront/OrderTracking';
import { TermsAndConditions } from './pages/legal/TermsAndConditions';
import { PrivacyPolicy } from './pages/legal/PrivacyPolicy';
import { CookiePolicy } from './pages/legal/CookiePolicy';

// Admin Pages
import { AdminLogin } from './pages/admin/Login';
import { AdminDashboard } from './pages/admin/Dashboard';
import { AdminProducts } from './pages/admin/Products';
import { AdminOrders } from './pages/admin/Orders';
import { AdminYapeConsole } from './pages/admin/YapeConsole';
import { AdminCoupons } from './pages/admin/Coupons';
import { AdminGiftCards } from './pages/admin/GiftCards';
import { AdminShippings } from './pages/admin/Shippings';
import { AdminCategories } from './pages/admin/Categories';
import { AdminColors } from './pages/admin/Colors';
import { AdminSizes } from './pages/admin/Sizes';
import { AdminCompanySettings } from './pages/admin/CompanySettings';
import { AdminOffers } from './pages/admin/Offers';

function App() {
  const { sessionId, setCart } = useCartStore();
  const { fetchSettings } = useStoreSettingsStore();

  // Load cart on app initialization
  useEffect(() => {
    const loadCart = async () => {
      try {
        const cart = await cartService.getCart(sessionId);
        setCart(cart);
      } catch (error) {
        console.error('Failed to load cart:', error);
      }
    };

    loadCart();
  }, [sessionId, setCart]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);
  return (
    <BrowserRouter>
      <Routes>
        {/* Storefront Routes */}
        <Route
          path="/"
          element={
            <MainLayout>
              <Home />
            </MainLayout>
          }
        />
        <Route
          path="/productos"
          element={
            <MainLayout>
              <Catalog />
            </MainLayout>
          }
        />
        <Route
          path="/categorias"
          element={
            <MainLayout>
              <Categories />
            </MainLayout>
          }
        />
        <Route
          path="/productos/:slug"
          element={
            <MainLayout>
              <ProductDetail />
            </MainLayout>
          }
        />
        <Route
          path="/checkout"
          element={
            <MainLayout>
              <Checkout />
            </MainLayout>
          }
        />
        <Route
          path="/orden-confirmada/:orderNumber"
          element={
            <MainLayout>
              <OrderConfirmation />
            </MainLayout>
          }
        />
        <Route
          path="/seguimiento-pedido"
          element={
            <MainLayout>
              <OrderTracking />
            </MainLayout>
          }
        />
        <Route
          path="/terminos-condiciones"
          element={
            <MainLayout>
              <TermsAndConditions />
            </MainLayout>
          }
        />
        <Route
          path="/politica-privacidad"
          element={
            <MainLayout>
              <PrivacyPolicy />
            </MainLayout>
          }
        />
        <Route
          path="/politica-cookies"
          element={
            <MainLayout>
              <CookiePolicy />
            </MainLayout>
          }
        />

        {/* Admin Login (No Layout) */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminProducts />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminOrders />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/yape"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminYapeConsole />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/coupons"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminCoupons />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/gift-cards"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminGiftCards />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/shippings"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminShippings />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminCategories />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/colors"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminColors />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/sizes"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminSizes />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/offers"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminOffers />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/company-settings"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminCompanySettings />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* Redirect /admin to dashboard */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

        {/* 404 Not Found */}
        <Route
          path="*"
          element={
            <MainLayout>
              <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-4xl font-bold mb-4">404 - Página no encontrada</h1>
                <p className="text-gray-600">La página que buscas no existe.</p>
              </div>
            </MainLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
