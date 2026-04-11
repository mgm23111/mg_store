import { useState, useEffect } from 'react';
import { Button } from '../../components/common/Button';
import { Loading } from '../../components/common/Loading';
import { Input } from '../../components/common/Input';
import { useUIStore } from '../../stores/uiStore';
import { Color } from '../../types';
import { colorService } from '../../api/colorService';

interface ColorFormData {
  name: string;
  hexCode: string;
}

export const AdminColors = () => {
  const [colors, setColors] = useState<Color[]>([]);
  const [filteredColors, setFilteredColors] = useState<Color[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingColor, setEditingColor] = useState<Color | null>(null);
  const { addToast } = useUIStore();

  const fetchColors = async () => {
    try {
      setLoading(true);
      const data = await colorService.getAll();
      setColors(data);
      setFilteredColors(data);
    } catch (error: any) {
      addToast('error', 'Error al cargar colores');
      setColors([]);
      setFilteredColors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColors();
  }, []);

  useEffect(() => {
    let filtered = colors;

    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.hexCode.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredColors(filtered);
  }, [searchTerm, colors]);

  const handleCreateColor = () => {
    setEditingColor(null);
    setIsModalOpen(true);
  };

  const handleEditColor = (color: Color) => {
    setEditingColor(color);
    setIsModalOpen(true);
  };

  const handleDelete = async (colorId: number) => {
    if (!confirm('¿Estás seguro de eliminar este color?')) return;

    try {
      await colorService.deleteColor(colorId);
      addToast('success', 'Color eliminado correctamente');
      fetchColors();
    } catch (error: any) {
      addToast('error', error.response?.data?.message || 'Error al eliminar color');
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gestión de Colores</h1>
        <Button onClick={handleCreateColor}>+ Crear Color</Button>
      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm text-gray-600 mb-2">Total Colores</div>
          <div className="text-3xl font-bold text-gray-900">{colors.length}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Buscar por nombre o código hex..."
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

      {/* Colors Grid */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {filteredColors.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No se encontraron colores</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredColors.map((color) => (
              <div
                key={color.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-12 h-12 rounded-lg border-2 border-gray-300 shadow-sm"
                    style={{ backgroundColor: color.hexCode }}
                  ></div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{color.name}</div>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {color.hexCode}
                    </code>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditColor(color)}
                    fullWidth
                  >
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(color.id)}
                    className="text-red-600 border-red-600 hover:bg-red-50"
                    fullWidth
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="mt-4 text-sm text-gray-600">
        Mostrando {filteredColors.length} de {colors.length} colores
      </div>

      {/* Color Form Modal */}
      {isModalOpen && (
        <ColorFormModal
          color={editingColor}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchColors}
        />
      )}
    </div>
  );
};

// Color Form Modal Component
interface ColorFormModalProps {
  color: Color | null;
  onClose: () => void;
  onSuccess: () => void;
}

const ColorFormModal = ({
  color,
  onClose,
  onSuccess,
}: ColorFormModalProps) => {
  const { addToast } = useUIStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ColorFormData>({
    name: color?.name || '',
    hexCode: color?.hexCode || '#000000',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      addToast('error', 'El nombre es requerido');
      return;
    }

    if (!formData.hexCode.match(/^#[0-9A-Fa-f]{6}$/)) {
      addToast('error', 'El código hex debe tener el formato #RRGGBB');
      return;
    }

    try {
      setLoading(true);

      if (color) {
        await colorService.updateColor(color.id, formData);
        addToast('success', 'Color actualizado correctamente');
      } else {
        await colorService.createColor(formData);
        addToast('success', 'Color creado correctamente');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        `Error al ${color ? 'actualizar' : 'crear'} color`;
      addToast('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Predefined color palette
  const presetColors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
    '#FFC0CB', '#A52A2A', '#808080', '#C0C0C0', '#FFD700',
    '#4B0082', '#008080', '#FF69B4', '#8B4513', '#00CED1',
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">
            {color ? 'Editar Color' : 'Crear Nuevo Color'}
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
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Rojo"
                required
              />
            </div>

            {/* Color Preview */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Vista Previa
              </label>
              <div className="flex items-center gap-4">
                <div
                  className="w-24 h-24 rounded-lg border-2 border-gray-300 shadow-md"
                  style={{ backgroundColor: formData.hexCode }}
                ></div>
                <div>
                  <div className="text-2xl font-bold" style={{ color: formData.hexCode }}>
                    {formData.name || 'Color'}
                  </div>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                    {formData.hexCode}
                  </code>
                </div>
              </div>
            </div>

            {/* Hex Code Input */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Código Hexadecimal <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={formData.hexCode}
                  onChange={(e) =>
                    setFormData({ ...formData, hexCode: e.target.value.toUpperCase() })
                  }
                  placeholder="#FF0000"
                  pattern="^#[0-9A-Fa-f]{6}$"
                  required
                  className="flex-1"
                />
                <input
                  type="color"
                  value={formData.hexCode}
                  onChange={(e) =>
                    setFormData({ ...formData, hexCode: e.target.value.toUpperCase() })
                  }
                  className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Formato: #RRGGBB (ejemplo: #FF0000 para rojo)
              </p>
            </div>

            {/* Preset Colors */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Colores Predefinidos
              </label>
              <div className="grid grid-cols-10 gap-2">
                {presetColors.map((presetColor) => (
                  <button
                    key={presetColor}
                    type="button"
                    onClick={() => setFormData({ ...formData, hexCode: presetColor })}
                    className={`w-10 h-10 rounded border-2 cursor-pointer hover:scale-110 transition-transform ${
                      formData.hexCode === presetColor
                        ? 'border-blue-500 ring-2 ring-blue-300'
                        : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: presetColor }}
                    title={presetColor}
                  />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" isLoading={loading} className="flex-1">
                {color ? 'Actualizar' : 'Crear'} Color
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
