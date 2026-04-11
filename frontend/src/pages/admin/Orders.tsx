import React, { useEffect, useState } from 'react';
import { orderService } from '../../api/orderService';
import { shippingService, Shipping } from '../../api/shippingService';
import { Order } from '../../types';
import { Button } from '../../components/common/Button';
import { Loading } from '../../components/common/Loading';
import { useUIStore } from '../../stores/uiStore';
import { Link } from 'react-router-dom';

export const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [shippingInfo, setShippingInfo] = useState<{ [orderId: number]: Shipping }>({});
  const [loadingShipping, setLoadingShipping] = useState<{ [orderId: number]: boolean }>({});
  const { addToast } = useUIStore();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getAll();
      setOrders(data);
      setFilteredOrders(data);
    } catch (error) {
      addToast('error', 'Error al cargar órdenes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    let filtered = orders;

    if (selectedStatus) {
      filtered = filtered.filter((o) => o.paymentStatus === selectedStatus);
    }

    if (selectedMethod) {
      filtered = filtered.filter((o) => o.paymentMethod === selectedMethod);
    }

    setFilteredOrders(filtered);
  }, [selectedStatus, selectedMethod, orders]);

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      await orderService.updateStatus(orderId, newStatus);
      addToast('success', 'Estado actualizado correctamente');
      fetchOrders();
    } catch (error) {
      addToast('error', 'Error al actualizar estado');
    }
  };

  const fetchShippingInfo = async (orderId: number) => {
    if (shippingInfo[orderId]) {
      return; // Already loaded
    }

    try {
      setLoadingShipping((prev) => ({ ...prev, [orderId]: true }));
      const shipping = await shippingService.getAdminShippingByOrderId(orderId);
      setShippingInfo((prev) => ({ ...prev, [orderId]: shipping }));
    } catch (error: any) {
      // It's ok if shipping doesn't exist yet
      if (error.response?.status !== 404) {
        addToast('error', 'Error al cargar información de envío');
      }
    } finally {
      setLoadingShipping((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const toggleOrderDetails = async (orderId: number) => {
    const isExpanding = expandedOrderId !== orderId;
    setExpandedOrderId(isExpanding ? orderId : null);

    if (isExpanding) {
      await fetchShippingInfo(orderId);
    }
  };

  const handleUpdateShippingStatus = async (orderId: number, newStatus: string) => {
    try {
      const updated = await shippingService.updateShippingStatus(orderId, newStatus);
      setShippingInfo((prev) => ({ ...prev, [orderId]: updated }));
      addToast('success', 'Estado de envío actualizado');
      fetchOrders(); // Refresh order list
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al actualizar estado de envío';
      addToast('error', errorMessage);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Gestión de Pedidos</h1>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Estado de Pago</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="PENDING">Pendiente</option>
              <option value="APPROVED">Aprobado</option>
              <option value="REJECTED">Rechazado</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Método de Pago</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="CULQI">Culqi</option>
              <option value="YAPE">Yape</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setSelectedStatus('');
                setSelectedMethod('');
              }}
            >
              Limpiar Filtros
            </Button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredOrders.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No se encontraron órdenes</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4">ID</th>
                  <th className="text-left py-3 px-4">Cliente</th>
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Total</th>
                  <th className="text-left py-3 px-4">Método</th>
                  <th className="text-left py-3 px-4">Estado Pago</th>
                  <th className="text-left py-3 px-4">Estado Orden</th>
                  <th className="text-left py-3 px-4">Fecha</th>
                  <th className="text-left py-3 px-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <React.Fragment key={order.id}>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-sm">#{order.id}</td>
                      <td className="py-3 px-4">{order.customerName}</td>
                      <td className="py-3 px-4 text-sm">{order.customerEmail}</td>
                      <td className="py-3 px-4 font-semibold">
                        S/ {order.totalAmount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {order.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <PaymentStatusBadge status={order.paymentStatus} />
                      </td>
                      <td className="py-3 px-4">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString('es-PE')}
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleOrderDetails(order.id)}
                        >
                          {expandedOrderId === order.id ? 'Ocultar' : 'Detalles'}
                        </Button>
                      </td>
                    </tr>
                    {/* Order Details Row */}
                    {expandedOrderId === order.id && (
                      <tr className="bg-gray-50">
                        <td colSpan={9} className="p-6">
                          <OrderDetails
                            order={order}
                            onUpdateStatus={handleUpdateStatus}
                            shipping={shippingInfo[order.id]}
                            loadingShipping={loadingShipping[order.id]}
                            onUpdateShippingStatus={handleUpdateShippingStatus}
                          />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="mt-4 text-sm text-gray-600">
        Mostrando {filteredOrders.length} de {orders.length} órdenes
      </div>
    </div>
  );
};

// Order Details Component
const OrderDetails = ({
  order,
  onUpdateStatus,
  shipping,
  loadingShipping,
  onUpdateShippingStatus,
}: {
  order: Order;
  onUpdateStatus: (orderId: number, newStatus: string) => void;
  shipping?: Shipping;
  loadingShipping?: boolean;
  onUpdateShippingStatus: (orderId: number, status: string) => void;
}) => {
  const getShippingStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendiente' },
      PREPARING: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Preparando' },
      SHIPPED: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Enviado' },
      DELIVERED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Entregado' },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelado' },
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Customer & Shipping Info */}
      <div>
        <h3 className="font-semibold text-lg mb-4">Información del Cliente</h3>
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-medium">Nombre:</span> {order.customerName}
          </div>
          <div>
            <span className="font-medium">Email:</span> {order.customerEmail}
          </div>
          <div>
            <span className="font-medium">Teléfono:</span> {order.customerPhone}
          </div>
          <div>
            <span className="font-medium">Documento:</span> {order.customerDocumentType}{' '}
            {order.customerDocumentNumber}
          </div>
          {order.shippingAddress && (
            <div>
              <span className="font-medium">Dirección:</span>{' '}
              {order.shippingAddress.addressLine1}
              {order.shippingAddress.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
              , {order.shippingAddress.city}, {order.shippingAddress.state || ''}{' '}
              {order.shippingAddress.postalCode || ''}, {order.shippingAddress.country}
            </div>
          )}
        </div>

        {/* Shipping Information Section */}
        <h3 className="font-semibold text-lg mt-6 mb-4">Información de Envío</h3>
        {loadingShipping ? (
          <div className="text-sm text-gray-500">Cargando información de envío...</div>
        ) : shipping ? (
          <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Estado de Envío</div>
                <div className="mt-1">{getShippingStatusBadge(shipping.status)}</div>
              </div>
              <Link
                to="/admin/shippings"
                className="text-purple-600 hover:text-purple-800 text-sm font-medium"
              >
                Ver en Envíos →
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Método:</span>
                <div className="font-medium">{shipping.shippingMethodName}</div>
              </div>
              <div>
                <span className="text-gray-600">Costo:</span>
                <div className="font-medium">S/ {shipping.shippingCost.toFixed(2)}</div>
              </div>
              {shipping.courierName && (
                <div>
                  <span className="text-gray-600">Courier:</span>
                  <div className="font-medium">{shipping.courierName}</div>
                </div>
              )}
              {shipping.trackingNumber && (
                <div>
                  <span className="text-gray-600">Tracking:</span>
                  <div className="font-mono text-xs bg-gray-100 px-2 py-1 rounded mt-1">
                    {shipping.trackingNumber}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Status Update */}
            <div className="pt-3 border-t">
              <label className="block text-sm font-medium mb-2">Actualizar Estado Envío</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                value={shipping.status}
                onChange={(e) => onUpdateShippingStatus(order.id, e.target.value)}
              >
                <option value="PENDING">Pendiente</option>
                <option value="PREPARING">Preparando</option>
                <option value="SHIPPED">Enviado</option>
                <option value="DELIVERED">Entregado</option>
                <option value="CANCELLED">Cancelado</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Se enviará notificación automática al cliente
              </p>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500 italic">
            No hay información de envío disponible para esta orden
          </div>
        )}

        <h3 className="font-semibold text-lg mt-6 mb-4">Actualizar Estado Orden</h3>
        <div className="space-y-2">
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            defaultValue={order.status}
            onChange={(e) => onUpdateStatus(order.id, e.target.value)}
          >
            <option value="PENDING">Pendiente</option>
            <option value="CONFIRMED">Confirmada</option>
            <option value="PROCESSING">En proceso</option>
            <option value="SHIPPED">Enviada</option>
            <option value="DELIVERED">Entregada</option>
            <option value="CANCELLED">Cancelada</option>
          </select>
        </div>
      </div>

      {/* Order Items */}
      <div>
        <h3 className="font-semibold text-lg mb-4">Productos</h3>
        <div className="space-y-3">
          {order.items?.map((item) => (
            <div key={item.id} className="flex gap-3 pb-3 border-b">
              <div className="flex-1">
                <div className="font-medium">{item.productName}</div>
                {item.variantInfo && (
                  <div className="text-xs text-gray-500">{item.variantInfo}</div>
                )}
                <div className="text-sm text-gray-600">
                  {item.quantity} x S/ {item.unitPrice.toFixed(2)}
                </div>
              </div>
              <div className="font-semibold">S/ {item.subtotal.toFixed(2)}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t space-y-2">
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
    </div>
  );
};

// Payment Status Badge
const PaymentStatusBadge = ({ status }: { status: string }) => {
  const getConfig = () => {
    switch (status) {
      case 'APPROVED':
        return { text: 'Aprobado', bg: 'bg-green-100', color: 'text-green-800' };
      case 'PENDING':
        return { text: 'Pendiente', bg: 'bg-yellow-100', color: 'text-yellow-800' };
      case 'REJECTED':
        return { text: 'Rechazado', bg: 'bg-red-100', color: 'text-red-800' };
      default:
        return { text: status, bg: 'bg-gray-100', color: 'text-gray-800' };
    }
  };

  const config = getConfig();
  return (
    <span className={`${config.bg} ${config.color} px-3 py-1 rounded-full text-xs font-semibold`}>
      {config.text}
    </span>
  );
};

// Order Status Badge
const OrderStatusBadge = ({ status }: { status: string }) => {
  const getConfig = () => {
    switch (status) {
      case 'PENDING':
        return { text: 'Pendiente', bg: 'bg-gray-100', color: 'text-gray-800' };
      case 'CONFIRMED':
        return { text: 'Confirmada', bg: 'bg-blue-100', color: 'text-blue-800' };
      case 'PROCESSING':
        return { text: 'En proceso', bg: 'bg-purple-100', color: 'text-purple-800' };
      case 'SHIPPED':
        return { text: 'Enviada', bg: 'bg-indigo-100', color: 'text-indigo-800' };
      case 'DELIVERED':
        return { text: 'Entregada', bg: 'bg-green-100', color: 'text-green-800' };
      case 'CANCELLED':
        return { text: 'Cancelada', bg: 'bg-red-100', color: 'text-red-800' };
      default:
        return { text: status, bg: 'bg-gray-100', color: 'text-gray-800' };
    }
  };

  const config = getConfig();
  return (
    <span className={`${config.bg} ${config.color} px-3 py-1 rounded-full text-xs font-semibold`}>
      {config.text}
    </span>
  );
};
