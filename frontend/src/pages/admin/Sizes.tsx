import { useState, useEffect } from 'react';
import { Button } from '../../components/common/Button';
import { Loading } from '../../components/common/Loading';
import { Input } from '../../components/common/Input';
import { useUIStore } from '../../stores/uiStore';
import { Size } from '../../types';
import { sizeService } from '../../api/sizeService';

interface SizeFormData {
  name: string;
  sortOrder: number;
}

export const AdminSizes = () => {
  const [sizes, setSizes] = useState<Size[]>([]);
  const [filteredSizes, setFilteredSizes] = useState<Size[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSize, setEditingSize] = useState<Size | null>(null);
  const { addToast } = useUIStore();

  const fetchSizes = async () => {
    try {
      setLoading(true);
      const data = await sizeService.getAll();
      setSizes(data);
      setFilteredSizes(data);
    } catch (error: any) {
      addToast('error', 'Error al cargar tallas');
      setSizes([]);
      setFilteredSizes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSizes();
  }, []);

  useEffect(() => {
    let filtered = sizes;

    if (searchTerm) {
      filtered = filtered.filter((s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredSizes(filtered);
  }, [searchTerm, sizes]);

  const handleCreateSize = () => {
    setEditingSize(null);
    setIsModalOpen(true);
  };

  const handleEditSize = (size: Size) => {
    setEditingSize(size);
    setIsModalOpen(true);
  };

  const handleDelete = async (sizeId: number) => {
    if (!confirm('¿Estás seguro de eliminar esta talla?')) return;

    try {
      await sizeService.deleteSize(sizeId);
      addToast('success', 'Talla eliminada correctamente');
      fetchSizes();
    } catch (error: any) {
      addToast('error', error.response?.data?.message || 'Error al eliminar talla');
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gestión de Tallas</h1>
        <Button onClick={handleCreateSize}>+ Crear Talla</Button>
      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm text-gray-600 mb-2">Total Tallas</div>
          <div className="text-3xl font-bold text-gray-900">{sizes.length}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button
            variant="outline"
            onClick={() => setSearchTerm('')}
          >
            Limpiar Filtros
          </Button>
        </div>
      </div>

      {/* Sizes Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredSizes.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No se encontraron tallas</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4">Nombre</th>
                  <th className="text-left py-3 px-4">Orden</th>
                  <th className="text-left py-3 px-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredSizes.map((size) => (
                  <tr key={size.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 flex items-center justify-center bg-blue-100 text-blue-800 font-bold rounded-lg">
                          {size.name}
                        </div>
                        <span className="font-semibold text-gray-900">{size.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-semibold">
                        {size.sortOrder}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditSize(size)}
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(size.id)}
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
        Mostrando {filteredSizes.length} de {sizes.length} tallas
      </div>

      {/* Size Form Modal */}
      {isModalOpen && (
        <SizeFormModal
          size={editingSize}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchSizes}
        />
      )}
    </div>
  );
};

// Size Form Modal Component
interface SizeFormModalProps {
  size: Size | null;
  onClose: () => void;
  onSuccess: () => void;
}

const SizeFormModal = ({
  size,
  onClose,
  onSuccess,
}: SizeFormModalProps) => {
  const { addToast } = useUIStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<SizeFormData>({
    name: size?.name || '',
    sortOrder: size?.sortOrder || 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      addToast('error', 'El nombre es requerido');
      return;
    }

    if (formData.sortOrder < 0) {
      addToast('error', 'El orden debe ser un número positivo');
      return;
    }

    try {
      setLoading(true);

      if (size) {
        await sizeService.updateSize(size.id, formData);
        addToast('success', 'Talla actualizada correctamente');
      } else {
        await sizeService.createSize(formData);
        addToast('success', 'Talla creada correctamente');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        `Error al ${size ? 'actualizar' : 'crear'} talla`;
      addToast('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Common sizes with suggested sort orders
  const commonSizes = [
    { name: 'XXS', order: 10 },
    { name: 'XS', order: 20 },
    { name: 'S', order: 30 },
    { name: 'M', order: 40 },
    { name: 'L', order: 50 },
    { name: 'XL', order: 60 },
    { name: 'XXL', order: 70 },
    { name: 'XXXL', order: 80 },
  ];

  const handleSelectCommonSize = (name: string, order: number) => {
    setFormData({ name, sortOrder: order });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">
            {size ? 'Editar Talla' : 'Crear Nueva Talla'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Nombre <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value.toUpperCase() })
                }
                placeholder="M"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Ejemplo: XS, S, M, L, XL, 38, 40, etc.
              </p>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Orden de Clasificación <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                min="0"
                step="1"
                value={formData.sortOrder}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sortOrder: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="0"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Las tallas se ordenarán de menor a mayor valor. Por ejemplo: XS=10, S=20, M=30
              </p>
            </div>

            {/* Common Sizes Quick Select */}
            {!size && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tallas Comunes
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {commonSizes.map((commonSize) => (
                    <button
                      key={commonSize.name}
                      type="button"
                      onClick={() => handleSelectCommonSize(commonSize.name, commonSize.order)}
                      className={`px-4 py-2 rounded border-2 font-semibold transition-colors ${
                        formData.name === commonSize.name && formData.sortOrder === commonSize.order
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      {commonSize.name}
                      <div className="text-xs text-gray-500">({commonSize.order})</div>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Haz clic en una talla común para rellenar automáticamente el formulario
                </p>
              </div>
            )}

            {/* Preview */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Vista Previa</h3>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 flex items-center justify-center bg-blue-100 text-blue-800 font-bold text-xl rounded-lg">
                  {formData.name || '?'}
                </div>
                <div>
                  <div className="text-lg font-bold text-blue-900">
                    {formData.name || 'Nombre de la talla'}
                  </div>
                  <div className="text-sm text-blue-700">
                    Orden: {formData.sortOrder}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" isLoading={loading} className="flex-1">
                {size ? 'Actualizar' : 'Crear'} Talla
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
