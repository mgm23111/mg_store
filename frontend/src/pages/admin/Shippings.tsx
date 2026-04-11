import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { shippingService, Shipping } from '../../api/shippingService';
import { Button } from '../../components/common/Button';
import { Loading } from '../../components/common/Loading';
import { Input } from '../../components/common/Input';
import { useUIStore } from '../../stores/uiStore';

export const AdminShippings = () => {
  const [shippings, setShippings] = useState<Shipping[]>([]);
  const [filteredShippings, setFilteredShippings] = useState<Shipping[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editingShipping, setEditingShipping] = useState<Shipping | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToast } = useUIStore();

  const fetchShippings = async () => {
    try {
      setLoading(true);
      const data = await shippingService.getAllShippings();
      setShippings(data);
      setFilteredShippings(data);
    } catch (error: any) {
      addToast('error', 'Error al cargar envíos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShippings();
  }, []);

  useEffect(() => {
    let filtered = shippings;

    if (searchTerm) {
      filtered = filtered.filter(
        (s) =>
          s.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.recipientName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter((s) => s.status === statusFilter);
    }

    setFilteredShippings(filtered);
  }, [searchTerm, statusFilter, shippings]);

  const handleEditShipping = (shipping: Shipping) => {
    setEditingShipping(shipping);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingShipping(null);
  };

  const handleUpdateSuccess = () => {
    fetchShippings();
    handleCloseModal();
  };

  const getStatusBadge = (status: string) => {
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

  const stats = {
    total: shippings.length,
    pending: shippings.filter((s) => s.status === 'PENDING').length,
    preparing: shippings.filter((s) => s.status === 'PREPARING').length,
    shipped: shippings.filter((s) => s.status === 'SHIPPED').length,
    delivered: shippings.filter((s) => s.status === 'DELIVERED').length,
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gestión de Envíos</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-sm text-gray-600 mb-1">Total</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-sm text-gray-600 mb-1">Pendientes</div>
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-sm text-gray-600 mb-1">Preparando</div>
          <div className="text-2xl font-bold text-blue-600">{stats.preparing}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-sm text-gray-600 mb-1">Enviados</div>
          <div className="text-2xl font-bold text-purple-600">{stats.shipped}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-sm text-gray-600 mb-1">Entregados</div>
          <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Buscar por orden, tracking o destinatario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="PENDING">Pendiente</option>
            <option value="PREPARING">Preparando</option>
            <option value="SHIPPED">Enviado</option>
            <option value="DELIVERED">Entregado</option>
            <option value="CANCELLED">Cancelado</option>
          </select>
        </div>
      </div>

      {/* Shippings Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Orden
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Destinatario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Método
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Courier
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tracking
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredShippings.map((shipping) => (
              <tr key={shipping.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link
                    to={`/admin/orders`}
                    className="text-purple-600 hover:text-purple-900 font-medium"
                  >
                    #{shipping.orderNumber}
                  </Link>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {shipping.recipientName}
                  </div>
                  <div className="text-sm text-gray-500">{shipping.recipientPhone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {shipping.shippingMethodName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {shipping.courierName || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {shipping.trackingNumber ? (
                    <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                      {shipping.trackingNumber}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">Sin tracking</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(shipping.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Button
                    onClick={() => handleEditShipping(shipping)}
                    variant="outline"
                    size="sm"
                  >
                    Gestionar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredShippings.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No se encontraron envíos
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isModalOpen && editingShipping && (
        <ShippingModal
          shipping={editingShipping}
          onClose={handleCloseModal}
          onSuccess={handleUpdateSuccess}
        />
      )}
    </div>
  );
};

// Shipping Modal Component
interface ShippingModalProps {
  shipping: Shipping;
  onClose: () => void;
  onSuccess: () => void;
}

const ShippingModal = ({ shipping, onClose, onSuccess }: ShippingModalProps) => {
  const [formData, setFormData] = useState({
    courierName: shipping.courierName || '',
    trackingNumber: shipping.trackingNumber || '',
    status: shipping.status,
    notes: shipping.notes || '',
  });
  const [saving, setSaving] = useState(false);
  const { addToast } = useUIStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      await shippingService.updateShipping(shipping.orderId, formData);
      addToast('success', 'Envío actualizado correctamente');
      onSuccess();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al actualizar envío';
      addToast('error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold">Gestionar Envío - #{shipping.orderNumber}</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Order Info */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-semibold mb-2">Información de la Orden</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Destinatario:</span>{' '}
                <span className="font-medium">{shipping.recipientName}</span>
              </div>
              <div>
                <span className="text-gray-600">Teléfono:</span>{' '}
                <span className="font-medium">{shipping.recipientPhone}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">Dirección:</span>{' '}
                <span className="font-medium">{shipping.address}</span>
              </div>
              <div>
                <span className="text-gray-600">Método:</span>{' '}
                <span className="font-medium">{shipping.shippingMethodName}</span>
              </div>
              <div>
                <span className="text-gray-600">Costo:</span>{' '}
                <span className="font-medium">S/ {shipping.shippingCost.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Courier Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Courier / Transportista
            </label>
            <Input
              value={formData.courierName}
              onChange={(e) =>
                setFormData({ ...formData, courierName: e.target.value })
              }
              placeholder="Ej: Olva Courier, Shalom, etc."
            />
          </div>

          {/* Tracking Number */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Número de Seguimiento / Guía
            </label>
            <Input
              value={formData.trackingNumber}
              onChange={(e) =>
                setFormData({ ...formData, trackingNumber: e.target.value })
              }
              placeholder="Ej: OLV123456789"
            />
            <p className="text-xs text-gray-500 mt-1">
              Se enviará notificación WhatsApp al cliente cuando agregues el tracking
            </p>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium mb-2">Estado del Envío</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="PENDING">Pendiente</option>
              <option value="PREPARING">Preparando</option>
              <option value="SHIPPED">Enviado</option>
              <option value="DELIVERED">Entregado</option>
              <option value="CANCELLED">Cancelado</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Se enviará notificación WhatsApp automática al cambiar a "Enviado" o
              "Entregado"
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Notas / Observaciones
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Agregar notas sobre el envío..."
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
