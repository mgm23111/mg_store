import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderService } from '../../api/orderService';
import { shippingService, Shipping } from '../../api/shippingService';
import { Order } from '../../types';
import { Loading } from '../../components/common/Loading';
import { Button } from '../../components/common/Button';
import { useUIStore } from '../../stores/uiStore';

export const OrderConfirmation = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const { addToast } = useUIStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [shipping, setShipping] = useState<Shipping | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const fetchOrderDetails = async () => {
      if (!orderNumber) return;

      try {
        setLoading(true);
        const orderData = await orderService.getOrderByNumber(orderNumber);
        setOrder(orderData);

        // Try to fetch shipping info (might not exist yet)
        try {
          const shippingData = await shippingService.getShippingByOrderNumber(orderNumber);
          setShipping(shippingData);
        } catch (error) {
          // Shipping might not exist yet, that's ok
        }
      } catch (error) {
        addToast('error', 'Error al cargar la orden');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderNumber, addToast]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'text-green-600 bg-green-100';
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100';
      case 'REJECTED':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'text-green-600 bg-green-100';
      case 'SHIPPED':
        return 'text-blue-600 bg-blue-100';
      case 'PROCESSING':
        return 'text-purple-600 bg-purple-100';
      case 'CONFIRMED':
        return 'text-indigo-600 bg-indigo-100';
      case 'CANCELLED':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-yellow-600 bg-yellow-100';
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!order) {
    return (
      <div className="container-custom py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Orden no encontrada</h1>
        <Link to="/productos">
          <Button>Ir a la tienda</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2">¡Orden Confirmada!</h1>
          <p className="text-gray-600 mb-4">
            Tu orden ha sido creada exitosamente
          </p>
          <div className="text-2xl font-mono font-bold text-purple-600">
            Orden #{order.orderNumber}
          </div>
        </div>

        {/* Yape Payment Instructions (if applicable) */}
        {order.paymentMethod === 'YAPE' && order.paymentStatus === 'PENDING' && (
          <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 text-purple-900">
              Instrucciones de Pago - Yape
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">1. Escanea el código QR</h3>
                <div className="bg-white p-4 rounded-lg inline-block">
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=951234567"
                    alt="Yape QR"
                    className="w-48 h-48"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">2. O transfiere al número</h3>
                  <div className="bg-white rounded-lg p-4 border-2 border-purple-300">
                    <div className="text-sm text-gray-600">Número de Yape:</div>
                    <div className="text-2xl font-bold text-purple-600">951 234 567</div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">3. Monto a pagar</h3>
                  <div className="bg-white rounded-lg p-4 border-2 border-purple-300">
                    <div className="text-sm text-gray-600">Total:</div>
                    <div className="text-3xl font-bold text-purple-600">
                      S/ {order.totalAmount.toFixed(2)}
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 rounded-md p-3 text-sm">
                  <p className="font-semibold text-purple-900 mb-1">
                    Importante:
                  </p>
                  <ul className="text-purple-800 space-y-1">
                    <li>• Envía tu comprobante de pago al WhatsApp</li>
                    <li>• Incluye el numero de orden: #{order.orderNumber}</li>
                    <li>• Procesaremos tu pedido en las próximas horas</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Order Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Estado de la Orden</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">Estado de Pago</div>
              <div
                className={`inline-block px-4 py-2 rounded-full font-semibold ${getStatusColor(
                  order.paymentStatus
                )}`}
              >
                {order.paymentStatus === 'APPROVED'
                  ? 'Aprobado'
                  : order.paymentStatus === 'PENDING'
                  ? 'Pendiente'
                  : 'Rechazado'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Estado de Orden</div>
              <div
                className={`inline-block px-4 py-2 rounded-full font-semibold ${getOrderStatusColor(
                  order.status
                )}`}
              >
                {order.status === 'PENDING'
                  ? 'Pendiente'
                  : order.status === 'CONFIRMED'
                  ? 'Confirmada'
                  : order.status === 'PROCESSING'
                  ? 'En Proceso'
                  : order.status === 'SHIPPED'
                  ? 'Enviada'
                  : order.status === 'DELIVERED'
                  ? 'Entregada'
                  : 'Cancelada'}
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Information */}
        {shipping && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Información de Envío</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Método de Envío</div>
                <div className="font-semibold">{shipping.shippingMethodName}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Costo de Envío</div>
                <div className="font-semibold">S/ {shipping.shippingCost.toFixed(2)}</div>
              </div>
              {shipping.courierName && (
                <div>
                  <div className="text-sm text-gray-600">Courier</div>
                  <div className="font-semibold">{shipping.courierName}</div>
                </div>
              )}
              {shipping.trackingNumber && (
                <div>
                  <div className="text-sm text-gray-600">Número de Seguimiento</div>
                  <div className="font-mono bg-gray-100 px-3 py-1 rounded inline-block">
                    {shipping.trackingNumber}
                  </div>
                </div>
              )}
              <div className="md:col-span-2">
                <div className="text-sm text-gray-600">Dirección de Entrega</div>
                <div className="font-medium">{shipping.address}</div>
              </div>
            </div>
          </div>
        )}

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Detalles de la Orden</h2>

          {/* Customer Info */}
          <div className="mb-6 pb-6 border-b">
            <h3 className="font-semibold mb-3">Información del Cliente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Nombre:</span>{' '}
                <span className="font-medium">{order.customerName}</span>
              </div>
              <div>
                <span className="text-gray-600">Email:</span>{' '}
                <span className="font-medium">{order.customerEmail}</span>
              </div>
              <div>
                <span className="text-gray-600">Teléfono:</span>{' '}
                <span className="font-medium">{order.customerPhone}</span>
              </div>
              <div>
                <span className="text-gray-600">Documento:</span>{' '}
                <span className="font-medium">
                  {order.customerDocumentType} {order.customerDocumentNumber}
                </span>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Productos</h3>
            <div className="space-y-3">
              {order.items?.map((item, index) => (
                <div key={index} className="flex gap-4 pb-3 border-b last:border-b-0">
                  <img
                    src={`https://picsum.photos/seed/${item.sku}/80/80`}
                    alt={item.productName}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <div className="font-semibold">{item.productName}</div>
                    {item.variantInfo && (
                      <div className="text-sm text-gray-500">{item.variantInfo}</div>
                    )}
                    <div className="text-sm text-gray-600">
                      Cantidad: {item.quantity} x S/ {item.unitPrice.toFixed(2)}
                    </div>
                  </div>
                  <div className="font-semibold">S/ {item.subtotal.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Totals */}
          <div className="space-y-2 pt-4 border-t">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>S/ {order.subtotal.toFixed(2)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Descuento:</span>
                <span>- S/ {order.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Total:</span>
              <span>S/ {order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Link to={`/seguimiento-pedido?orden=${order.orderNumber}`}>
            <Button variant="outline">Seguir Pedido</Button>
          </Link>
          <Link to="/productos">
            <Button variant="outline">Seguir Comprando</Button>
          </Link>
          <Link to="/">
            <Button>Volver al Inicio</Button>
          </Link>
        </div>

        {/* Contact Info */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6 text-center text-sm text-gray-600">
          <p className="mb-2">
            ¿Tienes alguna pregunta sobre tu pedido? Contáctanos:
          </p>
          <p className="font-semibold">
            WhatsApp: +51 951 234 567 | Email: pedidos@mgstore.pe
          </p>
        </div>
      </div>
    </div>
  );
};


