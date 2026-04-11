import { useEffect, useState } from 'react';
import { Button } from '../common/Button';
import { useUIStore } from '../../stores/uiStore';

interface CulqiCheckoutProps {
  amount: number;
  description?: string;
  orderNumber?: string;
  onSuccess: (token: string) => void;
  onError: (error: string) => void;
}

export const CulqiCheckout = ({
  amount,
  description,
  orderNumber,
  onSuccess,
  onError,
}: CulqiCheckoutProps) => {
  const { addToast } = useUIStore();
  const [culqiReady, setCulqiReady] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Wait for Culqi to be available
    const checkCulqi = () => {
      if (window.Culqi) {
        try {
          // Set public key
          window.Culqi.publicKey = import.meta.env.VITE_CULQI_PUBLIC_KEY || 'pk_test_your_public_key';

          // Configure Culqi options
          if (window.Culqi.options) {
            window.Culqi.options({
              lang: 'es',
              modal: true,
              installments: false,
              style: {
                // Use a data URI or remove logo if you don't have one
                logo: 'https://m2lconsulting.net/img/m2l-logo-112x26.png',
                maincolor: '#9333ea',
                buttontext: '#ffffff',
                maintext: '#4b5563',
                desctext: '#6b7280',
              },
            });
          }

          setCulqiReady(true);
          return true;
        } catch (error) {
          console.error('Error initializing Culqi:', error);
          return false;
        }
      }
      return false;
    };

    // Try immediately
    if (checkCulqi()) {
      return;
    }

    // Poll for Culqi availability
    const interval = setInterval(() => {
      if (checkCulqi()) {
        clearInterval(interval);
      }
    }, 100);

    // Timeout after 10 seconds
    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (!window.Culqi) {
        addToast('error', 'Error al cargar el sistema de pagos. Por favor, recarga la página.');
      }
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [addToast]);

  useEffect(() => {
    if (!culqiReady) return;

    // Define global culqi function (required by Culqi v4)
    window.culqi = function() {
      if (window.Culqi.token) {
        // Success - token was generated
        const tokenId = window.Culqi.token.id;

        // Close Culqi modal
        if (window.Culqi.close) {
          window.Culqi.close();
        }

        setLoading(false);
        onSuccess(tokenId);
      } else if (window.Culqi.error) {
        // Error occurred
        const error = window.Culqi.error;
        const errorMessage =
          error?.user_message || error?.merchant_message || 'Error al procesar el pago';
        console.error('Culqi error:', error);

        // Close Culqi modal
        if (window.Culqi.close) {
          window.Culqi.close();
        }

        setLoading(false);
        onError(errorMessage);
      }
    };

    // Cleanup
    return () => {
      if (window.culqi) delete window.culqi;
    };
  }, [culqiReady, onSuccess, onError]);

  const handleOpenCheckout = () => {
    if (!window.Culqi || !culqiReady) {
      addToast('error', 'Culqi no está disponible. Por favor, recarga la página.');
      return;
    }

    setLoading(true);

    try {
      // Configure Culqi settings
      window.Culqi.settings({
        title: 'MG Store',
        currency: 'PEN',
        amount: Math.round(amount * 100), // Convert to cents
        order: orderNumber || `ORDER-${Date.now()}`,
        description: description || 'Compra en MG Store',
      });

      // Open Culqi Checkout modal
      window.Culqi.open();
    } catch (error: any) {
      console.error('Culqi error:', error);
      setLoading(false);
      addToast('error', error.message || 'Error al abrir el sistema de pagos');
    }
  };

  // Show loading state while Culqi is initializing
  if (!culqiReady) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600">Cargando sistema de pagos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold mb-4">Pagar con Tarjeta</h3>

      <div className="space-y-4">
        {/* Payment Info */}
        <div className="bg-gray-50 rounded-md p-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total a Pagar:</span>
              <span className="text-2xl font-bold text-purple-600">
                S/ {amount.toFixed(2)}
              </span>
            </div>
            {orderNumber && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Orden:</span>
                <span className="font-mono text-gray-900">#{orderNumber}</span>
              </div>
            )}
          </div>
        </div>

        {/* Security Note */}
        <div className="flex items-start gap-2 text-xs text-gray-500">
          <svg
            className="w-4 h-4 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
          <p>
            Tu información está protegida con encriptación de 256 bits. Procesado de
            forma segura por Culqi.
          </p>
        </div>

        {/* Payment Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <p className="text-sm text-blue-900">
            <span className="font-semibold">💳 Proceso de pago:</span>
          </p>
          <ol className="text-xs text-blue-800 mt-2 space-y-1 ml-4 list-decimal">
            <li>Haz clic en "Proceder al Pago"</li>
            <li>Se abrirá el formulario seguro de Culqi</li>
            <li>Ingresa los datos de tu tarjeta</li>
            <li>Confirma el pago</li>
          </ol>
        </div>

        {/* Pay Button */}
        <Button
          onClick={handleOpenCheckout}
          disabled={loading || !culqiReady}
          className="w-full"
          size="lg"
        >
          {loading ? 'Procesando...' : `Proceder al Pago (S/ ${amount.toFixed(2)})`}
        </Button>

        {/* Accepted Cards */}
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <span>Aceptamos:</span>
          <div className="flex gap-2">
            <div className="px-2 py-1 bg-gray-100 rounded text-xs font-semibold">
              VISA
            </div>
            <div className="px-2 py-1 bg-gray-100 rounded text-xs font-semibold">
              Mastercard
            </div>
            <div className="px-2 py-1 bg-gray-100 rounded text-xs font-semibold">
              AMEX
            </div>
          </div>
        </div>

        {/* Test Cards Info (only in development) */}
        {import.meta.env.DEV && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-xs">
            <p className="font-semibold text-yellow-900 mb-1">🧪 Modo de Prueba - Tarjetas de Prueba:</p>
            <ul className="text-yellow-800 space-y-1">
              <li>• Visa: 4111 1111 1111 1111</li>
              <li>• Mastercard: 5111 1111 1111 1118</li>
              <li>• CVV: 123 | Vencimiento: 09/2025</li>
              <li>• Email: cualquier email válido</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
