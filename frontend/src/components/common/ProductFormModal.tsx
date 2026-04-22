import { useEffect, useState } from 'react';
import { Product, Category } from '../../types';
import { Button } from './Button';
import { Input } from './Input';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => Promise<void>;
  product?: Product | null;
  categories: Category[];
}

export interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  categoryId?: number;
  retailPrice: number;
  wholesalePrice?: number;
  wholesaleMinQuantity?: number;
  isActive: boolean;
  isFeatured: boolean;
  offerStartAt?: string;
  offerEndAt?: string;
}

export const ProductFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  product,
  categories,
}: ProductFormModalProps) => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    slug: '',
    description: '',
    categoryId: undefined,
    retailPrice: 0,
    wholesalePrice: 0,
    wholesaleMinQuantity: 6,
    isActive: true,
    isFeatured: false,
    offerStartAt: undefined,
    offerEndAt: undefined,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        slug: product.slug,
        description: product.description || '',
        categoryId: product.categoryId,
        retailPrice: product.retailPrice,
        wholesalePrice: product.wholesalePrice || 0,
        wholesaleMinQuantity: product.wholesaleMinQuantity || 6,
        isActive: product.isActive ?? true,
        isFeatured: product.isFeatured ?? false,
        offerStartAt: product.offerStartAt,
        offerEndAt: product.offerEndAt,
      });
    } else {
      // Reset form when creating new product
      setFormData({
        name: '',
        slug: '',
        description: '',
        categoryId: undefined,
        retailPrice: 0,
        wholesalePrice: 0,
        wholesaleMinQuantity: 6,
        isActive: true,
        isFeatured: false,
        offerStartAt: undefined,
        offerEndAt: undefined,
      });
    }
  }, [product, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
          : type === 'number'
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');

    setFormData((prev) => ({
      ...prev,
      name,
      slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {product ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <Input
                label="Nombre del Producto"
                name="name"
                value={formData.name}
                onChange={handleNameChange}
                required
                placeholder="Ej: Camiseta Básica"
              />
            </div>

            {/* Slug */}
            <div>
              <Input
                label="Slug (URL amigable)"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                required
                placeholder="Ej: camiseta-basica"
                helperText="Se genera automáticamente del nombre"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Descripción del producto..."
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría
              </label>
              <select
                name="categoryId"
                value={formData.categoryId || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Selecciona una categoría</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Prices */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  label="Precio al por Menor (S/)"
                  name="retailPrice"
                  type="number"
                  step="0.01"
                  value={formData.retailPrice}
                  onChange={handleChange}
                  required
                  placeholder="0.00"
                />
              </div>
              <div>
                <Input
                  label="Precio al por Mayor (S/)"
                  name="wholesalePrice"
                  type="number"
                  step="0.01"
                  value={formData.wholesalePrice || ''}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Wholesale Min Quantity */}
            <div>
              <Input
                label="Cantidad Mínima para Precio Mayor"
                name="wholesaleMinQuantity"
                type="number"
                value={formData.wholesaleMinQuantity || 6}
                onChange={handleChange}
                placeholder="6"
                helperText="Cantidad mínima de unidades para aplicar precio mayorista"
              />
            </div>

            {/* Checkboxes */}
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                  Producto activo (visible en tienda)
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isFeatured"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleChange}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="isFeatured" className="ml-2 text-sm text-gray-700">
                  Producto destacado (aparece en home)
                </label>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" isLoading={loading}>
                {product ? 'Actualizar' : 'Crear'} Producto
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
