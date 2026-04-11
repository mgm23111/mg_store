import { useState, useEffect } from 'react';
import { Button } from '../../components/common/Button';
import { Loading } from '../../components/common/Loading';
import { Input } from '../../components/common/Input';
import { useUIStore } from '../../stores/uiStore';
import { Category } from '../../types';
import { categoryService } from '../../api/categoryService';

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
}

export const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const { addToast } = useUIStore();

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getAll();
      setCategories(data);
      setFilteredCategories(data);
    } catch (error: any) {
      addToast('error', 'Error al cargar categorías');
      setCategories([]);
      setFilteredCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    let filtered = categories;

    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.slug.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter((c) =>
        statusFilter === 'active' ? c.isActive : !c.isActive
      );
    }

    setFilteredCategories(filtered);
  }, [searchTerm, statusFilter, categories]);

  const handleCreateCategory = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDelete = async (categoryId: number) => {
    if (!confirm('¿Estás seguro de eliminar esta categoría? Se desactivará en lugar de eliminarse permanentemente.')) return;

    try {
      await categoryService.deleteCategory(categoryId);
      addToast('success', 'Categoría desactivada correctamente');
      fetchCategories();
    } catch (error: any) {
      addToast('error', error.response?.data?.message || 'Error al desactivar categoría');
    }
  };

  const stats = {
    total: categories.length,
    active: categories.filter((c) => c.isActive).length,
    inactive: categories.filter((c) => !c.isActive).length,
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gestión de Categorías</h1>
        <Button onClick={handleCreateCategory}>+ Crear Categoría</Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm text-gray-600 mb-2">Total Categorías</div>
          <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm text-gray-600 mb-2">Activas</div>
          <div className="text-3xl font-bold text-green-600">{stats.active}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm text-gray-600 mb-2">Inactivas</div>
          <div className="text-3xl font-bold text-red-600">{stats.inactive}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Buscar por nombre o slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

      {/* Categories Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredCategories.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No se encontraron categorías</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4">Nombre</th>
                  <th className="text-left py-3 px-4">Slug</th>
                  <th className="text-left py-3 px-4">Descripción</th>
                  <th className="text-left py-3 px-4">Estado</th>
                  <th className="text-left py-3 px-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((category) => (
                  <tr key={category.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-semibold">{category.name}</td>
                    <td className="py-3 px-4">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {category.slug}
                      </code>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {category.description || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          category.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {category.isActive ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditCategory(category)}
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(category.id)}
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          Desactivar
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
        Mostrando {filteredCategories.length} de {categories.length} categorías
      </div>

      {/* Category Form Modal */}
      {isModalOpen && (
        <CategoryFormModal
          category={editingCategory}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchCategories}
        />
      )}
    </div>
  );
};

// Category Form Modal Component
interface CategoryFormModalProps {
  category: Category | null;
  onClose: () => void;
  onSuccess: () => void;
}

const CategoryFormModal = ({
  category,
  onClose,
  onSuccess,
}: CategoryFormModalProps) => {
  const { addToast } = useUIStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: category?.name || '',
    slug: category?.slug || '',
    description: category?.description || '',
    isActive: category?.isActive ?? true,
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[áàäâ]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöô]/g, 'o')
      .replace(/[úùüû]/g, 'u')
      .replace(/ñ/g, 'n')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData({
      ...formData,
      name,
      slug: category ? formData.slug : generateSlug(name),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      addToast('error', 'El nombre es requerido');
      return;
    }

    if (!formData.slug.trim()) {
      addToast('error', 'El slug es requerido');
      return;
    }

    try {
      setLoading(true);

      if (category) {
        await categoryService.updateCategory(category.id, formData);
        addToast('success', 'Categoría actualizada correctamente');
      } else {
        await categoryService.createCategory(formData);
        addToast('success', 'Categoría creada correctamente');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        `Error al ${category ? 'actualizar' : 'crear'} categoría`;
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
            {category ? 'Editar Categoría' : 'Crear Nueva Categoría'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Nombre <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.name}
                onChange={handleNameChange}
                placeholder="Camisas"
                required
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Slug <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value.toLowerCase() })
                }
                placeholder="camisas"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                URL amigable generada automáticamente. Puede editarse manualmente.
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">Descripción</label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Descripción de la categoría"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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
                Categoría Activa
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" isLoading={loading} className="flex-1">
                {category ? 'Actualizar' : 'Crear'} Categoría
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
