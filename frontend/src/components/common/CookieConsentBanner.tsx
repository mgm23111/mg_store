import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const CONSENT_KEY = 'mgstore_cookie_consent';
const CONSENT_DATE_KEY = 'mgstore_cookie_consent_date';

type ConsentStatus = 'granted' | 'denied';

export const CookieConsentBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    setVisible(!consent);
  }, []);

  const saveConsent = (status: ConsentStatus) => {
    localStorage.setItem(CONSENT_KEY, status);
    localStorage.setItem(CONSENT_DATE_KEY, new Date().toISOString());
    setVisible(false);
  };

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white shadow-2xl">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-gray-700">
            Usamos cookies para mejorar tu experiencia y analizar el uso del sitio.
            Consulta nuestra{' '}
            <Link to="/politica-cookies" className="font-semibold text-blue-600 hover:text-blue-700">
              Politica de Cookies
            </Link>
            .
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => saveConsent('denied')}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Rechazar
            </button>
            <button
              onClick={() => saveConsent('granted')}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
