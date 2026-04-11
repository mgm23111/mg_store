import { useState, useEffect } from 'react';
import { Button } from '../../components/common/Button';
import { Loading } from '../../components/common/Loading';
import { Input } from '../../components/common/Input';
import { useUIStore } from '../../stores/uiStore';
import { Coupon } from '../../types';
import api from '../../api/axios';

interface CouponFormData {
  code: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number;
  minPurchaseAmount: number;
  maxUses: number | null;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

export const AdminCoupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [filteredCoupons, setFilteredCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const { addToast } = useUIStore();

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/coupons');
      const data = response.data.data || response.data;
      setCoupons(Array.isArray(data) ? data : []);
      setFilteredCoupons(Array.isArray(data) ? data : []);
    } catch (error: any) {
      addToast('error', 'Error al cargar cupones');
      setCoupons([]);
      setFilteredCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  useEffect(() => {
    let filtered = coupons;

    if (searchTerm) {
      filtered = filtered.filter((c) =>
        c.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter((c) =>
        statusFilter === 'active' ? c.isActive : !c.isActive
      );
    }

    setFilteredCoupons(filtered);
  }, [searchTerm, statusFilter, coupons]);

  const handleCreateCoupon = () => {
    setEditingCoupon(null);
    setIsModalOpen(true);
  };

  const handleEditCoupon = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setIsModalOpen(true);
  };

  const handleToggleActive = async (couponId: number, currentStatus: boolean) => {
    try {
      if (currentStatus) {
        await api.put(`/admin/coupons/${couponId}/deactivate`);
        addToast('success', 'Cupón desactivado correctamente');
      } else {
        await api.put(`/admin/coupons/${couponId}`, { isActive: true });
        addToast('success', 'Cupón activado correctamente');
      }
      fetchCoupons();
    } catch (error: any) {
      addToast('error', error.response?.data?.message || 'Error al actualizar estado del cupón');
    }
  };

  const handleDelete = async (couponId: number) => {
    if (!confirm('¿Estás seguro de eliminar este cupón?')) return;

    try {
      await api.delete(`/admin/coupons/${couponId}`);
      addToast('success', 'Cupón eliminado correctamente');
      fetchCoupons();
    } catch (error: any) {
      addToast('error', error.response?.data?.message || 'Error al eliminar cupón');
    }
  };

  const stats = {
    total: coupons.length,
    active: coupons.filter((c) => c.isActive).length,
    expired: coupons.filter((c) => !c.isValid).length,
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gestión de Cupones</h1>
        <Button onClick={handleCreateCoupon}>+ Crear Cupón</Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm text-gray-600 mb-2">Total Cupones</div>
          <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm text-gray-600 mb-2">Activos</div>
          <div className="text-3xl font-bold text-green-600">{stats.active}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm text-gray-600 mb-2">Expirados</div>
          <div className="text-3xl font-bold text-red-600">{stats.expired}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Buscar por código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('');
            }}
          >
            Limpiar Filtros
          </Button>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredCoupons.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No se encontraron cupones</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4">Código</th>
                  <th className="text-left py-3 px-4">Tipo</th>
                  <th className="text-left py-3 px-4">Valor</th>
                  <th className="text-left py-3 px-4">Compra Mínima</th>
                  <th className="text-left py-3 px-4">Usos</th>
                  <th className="text-left py-3 px-4">Válido Desde</th>
                  <th className="text-left py-3 px-4">Válido Hasta</th>
                  <th className="text-left py-3 px-4">Estado</th>
                  <th className="text-left py-3 px-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredCoupons.map((coupon) => (
                  <tr key={coupon.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-mono font-semibold text-blue-600">{coupon.code}</div>
                    </td>
                    <td className="py-3 px-4">
                      <TypeBadge type={coupon.type} />
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold">
                        {coupon.type === 'PERCENTAGE'
                          ? `${coupon.value}%`
                          : `S/ ${coupon.value.toFixed(2)}`}
                      </div>
                    </td>
                    <td className="py-3 px-4">S/ {coupon.minPurchaseAmount.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        {coupon.currentUses} / {coupon.maxUses || '∞'}
                      </div>
                      {coupon.maxUses && coupon.currentUses >= coupon.maxUses && (
                        <span className="text-xs text-red-600">Límite alcanzado</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {new Date(coupon.validFrom).toLocaleDateString('es-PE')}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {new Date(coupon.validUntil).toLocaleDateString('es-PE')}
                      {new Date(coupon.validUntil) < new Date() && (
                        <div className="text-xs text-red-600">Expirado</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => handleToggleActive(coupon.id, coupon.isActive)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            coupon.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {coupon.isActive ? 'Activo' : 'Inactivo'}
                        </button>
                        {!coupon.isValid && (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                            Inválido
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditCoupon(coupon)}
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(coupon.id)}
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          Eliminar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="mt-4 text-sm text-gray-600">
        Mostrando {filteredCoupons.length} de {coupons.length} cupones
      </div>

      {/* Coupon Form Modal */}
      {isModalOpen && (
        <CouponFormModal
          coupon={editingCoupon}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchCoupons}
        />
      )}
    </div>
  );
};

// Type Badge Component
const TypeBadge = ({ type }: { type: 'PERCENTAGE' | 'FIXED_AMOUNT' }) => {
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${
        type === 'PERCENTAGE'
          ? 'bg-blue-100 text-blue-800'
          : 'bg-purple-100 text-purple-800'
      }`}
    >
      {type === 'PERCENTAGE' ? 'Porcentaje' : 'Monto Fijo'}
    </span>
  );
};

// Coupon Form Modal Component
interface CouponFormModalProps {
  coupon: Coupon | null;
  onClose: () => void;
  onSuccess: () => void;
}

const CouponFormModal = ({ coupon, onClose, onSuccess }: CouponFormModalProps) => {
  const { addToast } = useUIStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CouponFormData>({
    code: coupon?.code || '',
    type: coupon?.type || 'PERCENTAGE',
    value: coupon?.value || 0,
    minPurchaseAmount: coupon?.minPurchaseAmount || 0,
    maxUses: coupon?.maxUses || null,
    validFrom: coupon?.validFrom.split('T')[0] || new Date().toISOString().split('T')[0],
    validUntil: coupon?.validUntil.split('T')[0] || '',
    isActive: coupon?.isActive ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!formData.code.trim()) {
      addToast('error', 'El código es requerido');
      return;
    }

    if (formData.value <= 0) {
      addToast('error', 'El valor debe ser mayor a 0');
      return;
    }

    if (formData.type === 'PERCENTAGE' && formData.value > 100) {
      addToast('error', 'El porcentaje no puede ser mayor a 100%');
      return;
    }

    if (formData.minPurchaseAmount < 0) {
      addToast('error', 'El monto mínimo no puede ser negativo');
      return;
    }

    if (formData.minPurchaseAmount >= 9999999) {
      addToast('error', 'El monto mínimo es demasiado grande');
      return;
    }

    if (formData.maxUses !== null && formData.maxUses <= 0) {
      addToast('error', 'Los usos máximos deben ser mayores a 0');
      return;
    }

    if (!formData.validFrom || !formData.validUntil) {
      addToast('error', 'Las fechas de validez son requeridas');
      return;
    }

    if (new Date(formData.validFrom) >= new Date(formData.validUntil)) {
      addToast('error', 'La fecha de fin debe ser posterior a la fecha de inicio');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        validFrom: new Date(formData.validFrom).toISOString(),
        validUntil: new Date(formData.validUntil).toISOString(),
      };

      if (coupon) {
        await api.put(`/admin/coupons/${coupon.id}`, payload);
        addToast('success', 'Cupón actualizado correctamente');
      } else {
        await api.post('/admin/coupons', payload);
        addToast('success', 'Cupón creado correctamente');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        `Error al ${coupon ? 'actualizar' : 'crear'} cupón`;
      addToast('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">
            {coupon ? 'Editar Cupón' : 'Crear Nuevo Cupón'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Code */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Código del Cupón <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value.toUpperCase() })
                }
                placeholder="VERANO2024"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                El código debe ser único y en mayúsculas
              </p>
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Tipo de Descuento <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as 'PERCENTAGE' | 'FIXED_AMOUNT',
                  })
                }
                required
              >
                <option value="PERCENTAGE">Porcentaje</option>
                <option value="FIXED_AMOUNT">Monto Fijo</option>
              </select>
            </div>

            {/* Value */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Valor del Descuento <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max={formData.type === 'PERCENTAGE' ? 100 : 9999999}
                value={formData.value}
                onChange={(e) =>
                  setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })
                }
                placeholder={formData.type === 'PERCENTAGE' ? '15' : '50.00'}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.type === 'PERCENTAGE'
                  ? 'Porcentaje de descuento (0-100)'
                  : 'Monto fijo en soles'}
              </p>
            </div>

            {/* Min Purchase Amount */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Monto Mínimo de Compra <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="9999999"
                value={formData.minPurchaseAmount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minPurchaseAmount: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="100.00"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Monto mínimo requerido para aplicar el cupón
              </p>
            </div>

            {/* Max Uses */}
            <div>
              <label className="block text-sm font-medium mb-2">Usos Máximos</label>
              <Input
                type="number"
                min="1"
                value={formData.maxUses || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxUses: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
                placeholder="Dejar vacío para ilimitado"
              />
              <p className="text-xs text-gray-500 mt-1">
                Cantidad máxima de veces que se puede usar (vacío = ilimitado)
              </p>
            </div>

            {/* Valid From */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Válido Desde <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={formData.validFrom}
                onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                required
              />
            </div>

            {/* Valid Until */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Válido Hasta <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                required
              />
            </div>

            {/* Is Active */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium">
                Cupón Activo
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" isLoading={loading} className="flex-1">
                {coupon ? 'Actualizar' : 'Crear'} Cupón
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
