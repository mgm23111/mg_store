import { ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useStoreSettingsStore } from '../../stores/storeSettingsStore';
import { ToastContainer } from '../common/Toast';

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, logout } = useAuthStore();
  const { settings } = useStoreSettingsStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: 'DB' },
    { path: '/admin/products', label: 'Productos', icon: 'PR' },
    { path: '/admin/categories', label: 'Categorias', icon: 'CA' },
    { path: '/admin/colors', label: 'Colores', icon: 'CO' },
    { path: '/admin/sizes', label: 'Tallas', icon: 'TA' },
    { path: '/admin/offers', label: 'Ofertas', icon: 'OF' },
    { path: '/admin/orders', label: 'Pedidos', icon: 'PE' },
    { path: '/admin/yape', label: 'Consola Yape', icon: 'YA' },
    { path: '/admin/coupons', label: 'Cupones', icon: 'CP' },
    { path: '/admin/gift-cards', label: 'Gift Cards', icon: 'GC' },
    { path: '/admin/company-settings', label: 'Empresa', icon: 'EM' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <Link to="/admin/dashboard" className="text-xl font-bold flex items-center gap-2">
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={settings.companyName}
                className="h-8 w-auto object-contain bg-white rounded p-1"
              />
            ) : null}
            <span>{settings.companyName} Admin</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span className="text-xs font-bold w-6 text-center">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Cerrar Sesion
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm">
          <div className="px-8 py-4">
            <h1 className="text-2xl font-semibold text-gray-800">Panel de Administracion</h1>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-auto">{children}</main>
      </div>

      <ToastContainer />
    </div>
  );
};
