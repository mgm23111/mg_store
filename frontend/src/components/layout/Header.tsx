import { Link } from 'react-router-dom';
import { useCartStore } from '../../stores/cartStore';
import { useStoreSettingsStore } from '../../stores/storeSettingsStore';

export const Header = () => {
  const { cart, toggleCart } = useCartStore();
  const { settings } = useStoreSettingsStore();
  const totalItems = cart?.totalItems || 0;

  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 text-2xl font-bold text-blue-600">
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={settings.companyName}
                className="h-10 w-auto object-contain"
              />
            ) : null}
            <span>{settings.companyName}</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors">
              Inicio
            </Link>
            <Link to="/productos" className="text-gray-700 hover:text-blue-600 transition-colors">
              Productos
            </Link>
            <Link to="/categorias" className="text-gray-700 hover:text-blue-600 transition-colors">
              Categorias
            </Link>
            <Link to="/seguimiento-pedido" className="text-gray-700 hover:text-blue-600 transition-colors">
              Seguir pedido
            </Link>
          </nav>

          {/* Cart Icon */}
          <button
            onClick={toggleCart}
            className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
