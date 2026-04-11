import { FormEvent, useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { orderService } from '../../api/orderService';
import { shippingService, Shipping } from '../../api/shippingService';
import { Order } from '../../types';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Loading } from '../../components/common/Loading';
import { useUIStore } from '../../stores/uiStore';

export const OrderTracking = () => {
  const { addToast } = useUIStore();
  const [searchParams] = useSearchParams();

  const [orderNumber, setOrderNumber] = useState(searchParams.get('orden') || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [shipping, setShipping] = useState<Shipping | null>(null);
  const [loading, setLoading] = useState(false);

  type TimelineStep = {
    key: string;
    label: string;
    completed: boolean;
    current: boolean;
  };

  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'Aprobado';
      case 'PENDING':
        return 'Pendiente';
      case 'REJECTED':
        return 'Rechazado';
      default:
        return status;
    }
  };

  const getOrderStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pendiente';
      case 'CONFIRMED':
        return 'Confirmada';
      case 'PROCESSING':
        return 'En proceso';
      case 'SHIPPED':
        return 'Enviada';
      case 'DELIVERED':
        return 'Entregada';
      case 'CANCELLED':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const getStatusBadge = (status: string, type: 'payment' | 'order' | 'shipping') => {
    if (status === 'APPROVED' || status === 'DELIVERED') return 'text-green-700 bg-green-100';
    if (status === 'REJECTED' || status === 'CANCELLED') return 'text-red-700 bg-red-100';
    if (status === 'SHIPPED' || (type === 'shipping' && status === 'IN_TRANSIT')) return 'text-blue-700 bg-blue-100';
    if (status === 'PROCESSING' || status === 'CONFIRMED') return 'text-indigo-700 bg-indigo-100';
    return 'text-yellow-700 bg-yellow-100';
  };

  const getTimelineSteps = (orderStatus: string, shippingStatus?: string): TimelineStep[] => {
    const cancelOrReject = orderStatus === 'CANCELLED';
    const progressByOrder: Record<string, number> = {
      PENDING: 1,
      CONFIRMED: 2,
      PROCESSING: 3,
      SHIPPED: 4,
      DELIVERED: 5,
      CANCELLED: 0,
    };
    const progressByShipping: Record<string, number> = {
      PENDING: 2,
      PROCESSING: 3,
      IN_TRANSIT: 4,
      SHIPPED: 4,
      DELIVERED: 5,
      CANCELLED: 0,
    };

    const progress = Math.max(
      progressByOrder[orderStatus] ?? 1,
      shippingStatus ? (progressByShipping[shippingStatus] ?? 1) : 1
    );

    const labels = ['Orden creada', 'Confirmada', 'Preparando', 'En ruta', 'Entregada'];
    return labels.map((label, index) => {
      const step = index + 1;
      return {
        key: label,
        label: cancelOrReject ? (step === 1 ? 'Orden creada' : 'Cancelada') : label,
        completed: !cancelOrReject && step < progress,
        current: cancelOrReject ? step === 2 : step === progress,
      };
    });
  };

  const trackOrder = async (numberToTrack: string) => {
    const normalized = numberToTrack.trim().toUpperCase();
    if (!normalized) return;

    try {
      setLoading(true);
      setOrder(null);
      setShipping(null);

      const orderData = await orderService.trackOrder(normalized);
      setOrder(orderData);

      try {
        const shippingData = await shippingService.getShippingByOrderNumber(normalized);
        setShipping(shippingData);
      } catch {
        // Shipping can be unavailable in early order stages.
      }
    } catch (error: any) {
      setOrder(null);
      setShipping(null);
      const message = error.response?.data?.message || 'No se encontro la orden';
      addToast('error', message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await trackOrder(orderNumber);
  };

  useEffect(() => {
    const prefillOrderNumber = searchParams.get('orden');
    if (prefillOrderNumber) {
      setOrderNumber(prefillOrderNumber);
      trackOrder(prefillOrderNumber);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container-custom py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold mb-2">Seguimiento de Pedido</h1>
          <p className="text-gray-600 mb-4">
            Ingresa tu numero de orden para consultar el estado actual.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3">
            <Input
              placeholder="Ejemplo: ORD-20260101-1234"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
              className="md:flex-1"
              required
            />
            <Button type="submit" disabled={loading}>
              {loading ? 'Consultando...' : 'Consultar'}
            </Button>
          </form>
        </div>

        {loading && <Loading />}

        {order && !loading && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <div className="text-sm text-gray-500">Orden</div>
                  <div className="font-mono text-xl font-bold text-blue-700">#{order.orderNumber}</div>
                </div>
                <div className="text-sm text-gray-500">
                  Creada el {new Date(order.createdAt).toLocaleString('es-PE')}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Estado de pago</div>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(order.paymentStatus, 'payment')}`}>
                    {getPaymentStatusLabel(order.paymentStatus)}
                  </span>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Estado de orden</div>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(order.status, 'order')}`}>
                    {getOrderStatusLabel(order.status)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Linea de tiempo</h2>
              <div className="space-y-4">
                {getTimelineSteps(order.status, shipping?.status).map((step) => (
                  <div key={step.key} className="flex items-center gap-3">
                    <div
                      className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        step.completed
                          ? 'bg-green-600 text-white'
                          : step.current
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {step.completed ? '✓' : ''}
                    </div>
                    <div className={`${step.current ? 'font-semibold text-blue-700' : 'text-gray-700'}`}>
                      {step.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {shipping ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Informacion de envio</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Metodo</div>
                    <div className="font-semibold">{shipping.shippingMethodName}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Estado de envio</div>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(shipping.status, 'shipping')}`}>
                      {getOrderStatusLabel(shipping.status)}
                    </span>
                  </div>
                  <div>
                    <div className="text-gray-600">Courier</div>
                    <div className="font-semibold">{shipping.courierName || 'Pendiente'}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Tracking</div>
                    <div className="font-mono">{shipping.trackingNumber || 'Pendiente'}</div>
                  </div>
                  <div className="md:col-span-2">
                    <div className="text-gray-600">Direccion</div>
                    <div className="font-medium">{shipping.address}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                Aun no hay datos de envio. Cuando el pedido avance, veras courier y tracking aqui.
              </div>
            )}

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Resumen</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>S/ {order.subtotal.toFixed(2)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>Descuento</span>
                    <span>- S/ {order.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Envio</span>
                  <span>S/ {order.shippingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span>S/ {order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {!order && !loading && (
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center">
            <p className="text-gray-600 mb-4">
              Si acabas de comprar, usa el numero que recibiste en la pantalla de confirmacion.
            </p>
            <Link to="/productos">
              <Button variant="outline">Volver al catalogo</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
