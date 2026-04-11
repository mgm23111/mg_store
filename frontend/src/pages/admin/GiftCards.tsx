import { useState, useEffect } from 'react';
import { Button } from '../../components/common/Button';
import { Loading } from '../../components/common/Loading';
import { Input } from '../../components/common/Input';
import { useUIStore } from '../../stores/uiStore';
import { GiftCard } from '../../types';
import api from '../../api/axios';

interface GiftCardFormData {
  code: string;
  initialBalance: number;
  validUntil: string | null;
  isActive: boolean;
}

export const AdminGiftCards = () => {
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [filteredGiftCards, setFilteredGiftCards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGiftCard, setEditingGiftCard] = useState<GiftCard | null>(null);
  const { addToast } = useUIStore();

  const fetchGiftCards = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/gift-cards');
      const data = response.data.data || response.data;
      setGiftCards(Array.isArray(data) ? data : []);
      setFilteredGiftCards(Array.isArray(data) ? data : []);
    } catch (error: any) {
      addToast('error', 'Error al cargar gift cards');
      setGiftCards([]);
      setFilteredGiftCards([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGiftCards();
  }, []);

  useEffect(() => {
    let filtered = giftCards;

    if (searchTerm) {
      filtered = filtered.filter((g) =>
        g.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter((g) =>
        statusFilter === 'active' ? g.isActive : !g.isActive
      );
    }

    setFilteredGiftCards(filtered);
  }, [searchTerm, statusFilter, giftCards]);

  const handleCreateGiftCard = () => {
    setEditingGiftCard(null);
    setIsModalOpen(true);
  };

  const handleEditGiftCard = (giftCard: GiftCard) => {
    setEditingGiftCard(giftCard);
    setIsModalOpen(true);
  };

  const handleToggleActive = async (giftCardId: number, currentStatus: boolean) => {
    try {
      if (currentStatus) {
        await api.put(`/admin/gift-cards/${giftCardId}/deactivate`);
        addToast('success', 'Gift card desactivada correctamente');
      } else {
        await api.put(`/admin/gift-cards/${giftCardId}`, { isActive: true });
        addToast('success', 'Gift card activada correctamente');
      }
      fetchGiftCards();
    } catch (error: any) {
      addToast('error', error.response?.data?.message || 'Error al actualizar estado de la gift card');
    }
  };

  const handleDelete = async (giftCardId: number) => {
    if (!confirm('¿Estás seguro de eliminar esta gift card?')) return;

    try {
      await api.delete(`/admin/gift-cards/${giftCardId}`);
      addToast('success', 'Gift card eliminada correctamente');
      fetchGiftCards();
    } catch (error: any) {
      addToast('error', error.response?.data?.message || 'Error al eliminar gift card');
    }
  };

  const stats = {
    total: giftCards.length,
    active: giftCards.filter((g) => g.isActive).length,
    expired: giftCards.filter((g) => !g.isValid).length,
    totalBalance: giftCards.reduce((sum, g) => sum + g.currentBalance, 0),
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gestión de Gift Cards</h1>
        <Button onClick={handleCreateGiftCard}>+ Crear Gift Card</Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm text-gray-600 mb-2">Total Gift Cards</div>
          <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm text-gray-600 mb-2">Activas</div>
          <div className="text-3xl font-bold text-green-600">{stats.active}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm text-gray-600 mb-2">Expiradas</div>
          <div className="text-3xl font-bold text-red-600">{stats.expired}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm text-gray-600 mb-2">Balance Total</div>
          <div className="text-3xl font-bold text-purple-600">
            S/ {stats.totalBalance.toFixed(2)}
          </div>
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
            <option value="active">Activas</option>
            <option value="inactive">Inactivas</option>
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

      {/* Gift Cards Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredGiftCards.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No se encontraron gift cards</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4">Código</th>
                  <th className="text-left py-3 px-4">Balance Inicial</th>
                  <th className="text-left py-3 px-4">Balance Actual</th>
                  <th className="text-left py-3 px-4">Utilizado</th>
                  <th className="text-left py-3 px-4">Fecha de Expiración</th>
                  <th className="text-left py-3 px-4">Estado</th>
                  <th className="text-left py-3 px-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredGiftCards.map((giftCard) => {
                  const usedAmount = giftCard.initialBalance - giftCard.currentBalance;
                  const usedPercentage =
                    (usedAmount / giftCard.initialBalance) * 100;

                  return (
                    <tr key={giftCard.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-mono font-semibold text-purple-600">
                          {giftCard.code}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold">
                        S/ {giftCard.initialBalance.toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-semibold ${
                              giftCard.currentBalance === 0
                                ? 'text-red-600'
                                : giftCard.currentBalance < giftCard.initialBalance * 0.2
                                ? 'text-orange-600'
                                : 'text-green-600'
                            }`}
                          >
                            S/ {giftCard.currentBalance.toFixed(2)}
                          </span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className={`h-2 rounded-full ${
                              giftCard.currentBalance === 0
                                ? 'bg-red-500'
                                : giftCard.currentBalance < giftCard.initialBalance * 0.2
                                ? 'bg-orange-500'
                                : 'bg-green-500'
                            }`}
                            style={{
                              width: `${
                                (giftCard.currentBalance / giftCard.initialBalance) * 100
                              }%`,
                            }}
                          ></div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          <div className="font-semibold">S/ {usedAmount.toFixed(2)}</div>
                          <div className="text-gray-500">{usedPercentage.toFixed(1)}%</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {giftCard.validUntil ? (
                          <>
                            {new Date(giftCard.validUntil).toLocaleDateString('es-PE')}
                            {new Date(giftCard.validUntil) < new Date() && (
                              <div className="text-xs text-red-600">Expirada</div>
                            )}
                          </>
                        ) : (
                          <span className="text-gray-500">Sin expiración</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() =>
                              handleToggleActive(giftCard.id, giftCard.isActive)
                            }
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              giftCard.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {giftCard.isActive ? 'Activa' : 'Inactiva'}
                          </button>
                          {!giftCard.isValid && (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                              Inválida
                            </span>
                          )}
                          {giftCard.currentBalance === 0 && (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">
                              Sin saldo
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditGiftCard(giftCard)}
                          >
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(giftCard.id)}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            Eliminar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="mt-4 text-sm text-gray-600">
        Mostrando {filteredGiftCards.length} de {giftCards.length} gift cards
      </div>

      {/* Gift Card Form Modal */}
      {isModalOpen && (
        <GiftCardFormModal
          giftCard={editingGiftCard}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchGiftCards}
        />
      )}
    </div>
  );
};

// Gift Card Form Modal Component
interface GiftCardFormModalProps {
  giftCard: GiftCard | null;
  onClose: () => void;
  onSuccess: () => void;
}

const GiftCardFormModal = ({
  giftCard,
  onClose,
  onSuccess,
}: GiftCardFormModalProps) => {
  const { addToast } = useUIStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<GiftCardFormData>({
    code: giftCard?.code || '',
    initialBalance: giftCard?.initialBalance || 0,
    validUntil: giftCard?.validUntil?.split('T')[0] || null,
    isActive: giftCard?.isActive ?? true,
  });

  const generateCode = () => {
    const prefix = 'GC';
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substring(2, 10).toUpperCase();
    return `${prefix}-${year}-${random}`;
  };

  const handleGenerateCode = () => {
    setFormData({ ...formData, code: generateCode() });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!formData.code.trim()) {
      addToast('error', 'El código es requerido');
      return;
    }

    if (formData.initialBalance <= 0) {
      addToast('error', 'El balance inicial debe ser mayor a 0');
      return;
    }

    if (formData.initialBalance >= 9999999) {
      addToast('error', 'El balance inicial es demasiado grande');
      return;
    }

    if (formData.validUntil) {
      const expirationDate = new Date(formData.validUntil);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (expirationDate < today) {
        addToast('error', 'La fecha de expiración debe ser futura');
        return;
      }
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        validUntil: formData.validUntil
          ? new Date(formData.validUntil).toISOString()
          : null,
      };

      if (giftCard) {
        await api.put(`/admin/gift-cards/${giftCard.id}`, payload);
        addToast('success', 'Gift card actualizada correctamente');
      } else {
        await api.post('/admin/gift-cards', payload);
        addToast('success', 'Gift card creada correctamente');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        `Error al ${giftCard ? 'actualizar' : 'crear'} gift card`;
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
            {giftCard ? 'Editar Gift Card' : 'Crear Nueva Gift Card'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Code */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Código de la Gift Card <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <Input
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                  placeholder="GC-2024-XXXXX"
                  required
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGenerateCode}
                  disabled={!!giftCard}
                >
                  Generar
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                El código debe ser único. Puedes generar uno automáticamente.
              </p>
            </div>

            {/* Initial Balance */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Balance Inicial <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                max="9999999"
                value={formData.initialBalance}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    initialBalance: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="100.00"
                required
                disabled={!!giftCard}
              />
              <p className="text-xs text-gray-500 mt-1">
                Monto inicial de la gift card en soles
                {giftCard && ' (no se puede modificar después de crear)'}
              </p>
            </div>

            {/* Valid Until */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Fecha de Expiración
              </label>
              <Input
                type="date"
                value={formData.validUntil || ''}
                onChange={(e) =>
                  setFormData({ ...formData, validUntil: e.target.value || null })
                }
                min={new Date().toISOString().split('T')[0]}
              />
              <p className="text-xs text-gray-500 mt-1">
                Dejar vacío para que no expire
              </p>
            </div>

            {/* Is Active */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium">
                Gift Card Activa
              </label>
            </div>

            {/* Current Balance Info (Edit mode only) */}
            {giftCard && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 mb-2">
                  Información Actual
                </h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-purple-700">Balance Inicial:</span>
                    <span className="font-semibold text-purple-900">
                      S/ {giftCard.initialBalance.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-700">Balance Actual:</span>
                    <span className="font-semibold text-purple-900">
                      S/ {giftCard.currentBalance.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-700">Utilizado:</span>
                    <span className="font-semibold text-purple-900">
                      S/ {(giftCard.initialBalance - giftCard.currentBalance).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" isLoading={loading} className="flex-1">
                {giftCard ? 'Actualizar' : 'Crear'} Gift Card
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
