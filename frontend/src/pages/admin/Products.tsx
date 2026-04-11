import { useEffect, useState } from 'react';
import { productService } from '../../api/productService';
import { categoryService } from '../../api/categoryService';
import { Product, Category } from '../../types';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Loading } from '../../components/common/Loading';
import { ProductFormModal, ProductFormData } from '../../components/common/ProductFormModal';
import { ProductDetailModal } from '../../components/admin/ProductDetailModal';
import { useUIStore } from '../../stores/uiStore';

export const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { addToast } = useUIStore();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAll();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      addToast('error', 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      addToast('error', 'Error al cargar categorías');
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((p) => p.categoryName === selectedCategory);
    }

    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, products]);

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleManageProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailModalOpen(true);
  };

  const handleSubmitProduct = async (data: ProductFormData) => {
    try {
      if (editingProduct) {
        await productService.update(editingProduct.id, data);
        addToast('success', 'Producto actualizado correctamente');
      } else {
        await productService.create(data);
        addToast('success', 'Producto creado correctamente');
      }
      fetchProducts();
      setIsModalOpen(false);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message ||
        `Error al ${editingProduct ? 'actualizar' : 'crear'} producto`;
      addToast('error', errorMessage);
      throw error; // Re-throw to let modal handle loading state
    }
  };

  const handleToggleActive = async (productId: number, currentStatus: boolean) => {
    try {
      await productService.updateStatus(productId, !currentStatus);
      addToast('success', `Producto ${!currentStatus ? 'activado' : 'desactivado'} correctamente`);
      fetchProducts();
    } catch (error) {
      addToast('error', 'Error al actualizar estado del producto');
    }
  };

  const handleDelete = async (productId: number) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;

    try {
      await productService.delete(productId);
      addToast('success', 'Producto eliminado correctamente');
      fetchProducts();
    } catch (error) {
      addToast('error', 'Error al eliminar producto');
    }
  };

  const uniqueCategories = Array.from(
    new Set(products.map((p) => p.categoryName).filter(Boolean))
  ) as string[];

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gestión de Productos</h1>
        <Button onClick={handleCreateProduct}>
          + Nuevo Producto
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {uniqueCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('');
            }}
          >
            Limpiar Filtros
          </Button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredProducts.length === 0 ? (
          <p className="text-gray-500 text-center py-12">
            No se encontraron productos
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4">Imagen</th>
                  <th className="text-left py-3 px-4">Nombre</th>
                  <th className="text-left py-3 px-4">Categoría</th>
                  <th className="text-left py-3 px-4">Precio</th>
                  <th className="text-left py-3 px-4">Stock</th>
                  <th className="text-left py-3 px-4">Estado</th>
                  <th className="text-left py-3 px-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <img
                        src={product.images?.[0]?.url || '/placeholder.jpg'}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium">{product.name}</div>
                    </td>
                    <td className="py-3 px-4">{product.categoryName || '-'}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold">S/ {product.retailPrice.toFixed(2)}</div>
                      {product.wholesalePrice && (
                        <div className="text-sm text-gray-500">
                          Mayor: S/ {product.wholesalePrice.toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`${
                          (product.totalStock || 0) === 0
                            ? 'text-red-600'
                            : (product.totalStock || 0) <= 5
                            ? 'text-orange-600'
                            : 'text-green-600'
                        } font-semibold`}
                      >
                        {product.totalStock || 0}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleActive(product.id, product.isActive)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          product.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {product.isActive ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          size="sm"
                          onClick={() => handleManageProduct(product)}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          Gestionar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditProduct(product)}
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(product.id)}
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
        Mostrando {filteredProducts.length} de {products.length} productos
      </div>

      {/* Product Form Modal */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitProduct}
        product={editingProduct}
        categories={categories}
      />

      {selectedProduct && (
        <ProductDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedProduct(null);
            fetchProducts(); // Refresh products after managing details
          }}
          product={selectedProduct}
        />
      )}
    </div>
  );
};
