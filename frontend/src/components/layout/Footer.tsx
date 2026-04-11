import { Link } from 'react-router-dom';
import { useStoreSettingsStore } from '../../stores/storeSettingsStore';

export const Footer = () => {
  const { settings } = useStoreSettingsStore();

  return (
    <footer className="mt-auto bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <div className="mb-4 flex items-center gap-3">
              {settings.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={settings.companyName}
                  className="h-10 w-auto object-contain bg-white rounded p-1"
                />
              ) : null}
              <h3 className="text-xl font-bold">{settings.companyName}</h3>
            </div>
            <p className="text-gray-300">
              Tu tienda de confianza para prendas de vestir de calidad.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Enlaces Rapidos</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/productos" className="text-gray-300 transition-colors hover:text-white">
                  Productos
                </Link>
              </li>
              <li>
                <Link to="/categorias" className="text-gray-300 transition-colors hover:text-white">
                  Categorias
                </Link>
              </li>
              <li>
                <Link to="/seguimiento-pedido" className="text-gray-300 transition-colors hover:text-white">
                  Seguimiento de pedido
                </Link>
              </li>
              <li>
                <Link to="/terminos-condiciones" className="text-gray-300 transition-colors hover:text-white">
                  Terminos
                </Link>
              </li>
              <li>
                <Link to="/politica-privacidad" className="text-gray-300 transition-colors hover:text-white">
                  Privacidad
                </Link>
              </li>
              <li>
                <Link to="/politica-cookies" className="text-gray-300 transition-colors hover:text-white">
                  Cookies
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="text-gray-300 transition-colors hover:text-white">
                  Admin
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Contacto</h3>
            <ul className="space-y-2 text-gray-300">
              <li>info@mgstore.com</li>
              <li>+51 999 999 999</li>
              <li>Lima, Peru</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-700 pt-6 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} {settings.companyName}. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};
