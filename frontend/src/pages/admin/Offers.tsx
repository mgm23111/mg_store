import { useEffect, useMemo, useState } from 'react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Loading } from '../../components/common/Loading';
import { categoryService } from '../../api/categoryService';
import { productService } from '../../api/productService';
import { Category, Product } from '../../types';
import { useUIStore } from '../../stores/uiStore';

const MIN_DISCOUNT = 1;
const MAX_DISCOUNT = 90;

interface ProductUpdatePayload {
  name: string;
  slug: string;
  description?: string;
  categoryId?: number;
  retailPrice: number;
  wholesalePrice?: number;
  wholesaleMinQuantity?: number;
  isActive: boolean;
  isFeatured: boolean;
  offerStartAt?: string;
  offerEndAt?: string;
}

const buildUpdatePayload = (
  product: Product,
  discountPercentage?: number,
  offerStartAt?: string,
  offerEndAt?: string
): ProductUpdatePayload => {
  const payload: ProductUpdatePayload = {
    name: product.name,
    slug: product.slug,
    description: product.description || '',
    categoryId: product.categoryId,
    retailPrice: product.retailPrice,
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    offerStartAt: product.offerStartAt,
    offerEndAt: product.offerEndAt,
  };

  if (typeof discountPercentage === 'number') {
    const factor = 1 - discountPercentage / 100;
    const discountedPrice = Math.max(0.01, Number((product.retailPrice * factor).toFixed(2)));
    payload.wholesalePrice = discountedPrice;
    payload.wholesaleMinQuantity = 1;
    payload.offerStartAt = offerStartAt || undefined;
    payload.offerEndAt = offerEndAt || undefined;
  } else {
    payload.wholesalePrice = undefined;
    payload.wholesaleMinQuantity = 6;
    payload.offerStartAt = undefined;
    payload.offerEndAt = undefined;
  }

  return payload;
};

export const AdminOffers = () => {
  const { addToast } = useUIStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<number | 0>(0);
  const [discountPercentage, setDiscountPercentage] = useState<number>(15);
  const [offerStartAt, setOfferStartAt] = useState<string>('');
  const [offerEndAt, setOfferEndAt] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        productService.getAll(),
        categoryService.getAll(),
      ]);
      setProducts(productsData);
      setSelectedIds((prev) => {
        const validIds = new Set(productsData.map((p) => p.id));
        return new Set(Array.from(prev).filter((id) => validIds.has(id)));
      });
      setCategories(categoriesData);
    } catch (error: any) {
      addToast('error', 'No se pudo cargar la informacion de ofertas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const byCategory = categoryFilter === 0 || product.categoryId === categoryFilter;
      const bySearch =
        !searchTerm ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.slug.toLowerCase().includes(searchTerm.toLowerCase());
      return byCategory && bySearch;
    });
  }, [products, categoryFilter, searchTerm]);

  const allFilteredSelected =
    filteredProducts.length > 0 && filteredProducts.every((p) => selectedIds.has(p.id));

  const toggleSelected = (productId: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  const toggleSelectAllFiltered = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) {
        filteredProducts.forEach((p) => next.delete(p.id));
      } else {
        filteredProducts.forEach((p) => next.add(p.id));
      }
      return next;
    });
  };

  const validateDiscount = () => {
    if (discountPercentage < MIN_DISCOUNT || discountPercentage > MAX_DISCOUNT) {
      addToast('error', `El descuento debe estar entre ${MIN_DISCOUNT}% y ${MAX_DISCOUNT}%`);
      return false;
    }

    if (offerStartAt && offerEndAt && offerEndAt < offerStartAt) {
      addToast('error', 'La fecha fin debe ser mayor o igual a la fecha inicio');
      return false;
    }
    return true;
  };

  const applyDiscountToProducts = async (targetProducts: Product[]) => {
    if (!validateDiscount()) return;
    if (targetProducts.length === 0) {
      addToast('warning', 'No hay productos para aplicar la oferta');
      return;
    }

    setProcessing(true);
    try {
      for (const product of targetProducts) {
        const payload = buildUpdatePayload(product, discountPercentage, offerStartAt, offerEndAt);
        await productService.update(product.id, payload);
      }
      addToast('success', `Oferta aplicada a ${targetProducts.length} productos`);
      await fetchData();
    } catch (error: any) {
      addToast('error', 'Ocurrio un error aplicando la oferta');
    } finally {
      setProcessing(false);
    }
  };

  const clearDiscountFromProducts = async (targetProducts: Product[]) => {
    if (targetProducts.length === 0) {
      addToast('warning', 'No hay productos para quitar oferta');
      return;
    }

    setProcessing(true);
    try {
      for (const product of targetProducts) {
        const payload = buildUpdatePayload(product);
        await productService.update(product.id, payload);
      }
      addToast('success', `Oferta removida de ${targetProducts.length} productos`);
      await fetchData();
    } catch (error: any) {
      addToast('error', 'Ocurrio un error quitando la oferta');
    } finally {
      setProcessing(false);
    }
  };

  const selectedProducts = filteredProducts.filter((p) => selectedIds.has(p.id));

  if (loading) return <Loading />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Ofertas y Rebajas</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            label="Buscar producto"
            placeholder="Nombre o slug"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div>
            <label className="block text-sm font-medium mb-2">Categoria</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(parseInt(e.target.value, 10))}
            >
              <option value={0}>Todas</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Descuento (%)"
            type="number"
            min={MIN_DISCOUNT}
            max={MAX_DISCOUNT}
            value={discountPercentage}
            onChange={(e) => setDiscountPercentage(parseInt(e.target.value, 10) || 0)}
          />

          <div className="grid grid-cols-1 gap-2">
            <Input
              label="Inicio oferta (opcional)"
              type="datetime-local"
              value={offerStartAt}
              onChange={(e) => setOfferStartAt(e.target.value)}
            />
            <Input
              label="Fin oferta (opcional)"
              type="datetime-local"
              value={offerEndAt}
              onChange={(e) => setOfferEndAt(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <div>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter(0);
              }}
            >
              Limpiar filtros
            </Button>
          </div>
          <div>
            <Button
              variant="outline"
              onClick={() => {
                setOfferStartAt('');
                setOfferEndAt('');
              }}
            >
              Limpiar fechas
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => applyDiscountToProducts(selectedProducts)}
            isLoading={processing}
            disabled={selectedProducts.length === 0}
          >
            Aplicar a seleccionados ({selectedProducts.length})
          </Button>
          <Button
            variant="outline"
            onClick={() => applyDiscountToProducts(filteredProducts)}
            isLoading={processing}
            disabled={filteredProducts.length === 0}
          >
            Aplicar a filtrados ({filteredProducts.length})
          </Button>
          <Button
            variant="outline"
            className="text-red-600 border-red-600 hover:bg-red-50"
            onClick={() => clearDiscountFromProducts(selectedProducts)}
            isLoading={processing}
            disabled={selectedProducts.length === 0}
          >
            Quitar oferta seleccionados
          </Button>
          <Button
            variant="outline"
            className="text-red-600 border-red-600 hover:bg-red-50"
            onClick={() => clearDiscountFromProducts(filteredProducts)}
            isLoading={processing}
            disabled={filteredProducts.length === 0}
          >
            Quitar oferta filtrados
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4">
                  <input
                    type="checkbox"
                    checked={allFilteredSelected}
                    onChange={toggleSelectAllFiltered}
                  />
                </th>
                <th className="text-left py-3 px-4">Producto</th>
                <th className="text-left py-3 px-4">Categoria</th>
                <th className="text-left py-3 px-4">Precio Regular</th>
                <th className="text-left py-3 px-4">Precio Oferta</th>
                <th className="text-left py-3 px-4">Descuento</th>
                <th className="text-left py-3 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const hasOffer = !!product.discountPercentage && product.discountPercentage > 0;
                return (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(product.id)}
                        onChange={() => toggleSelected(product.id)}
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold">{product.name}</div>
                      <div className="text-xs text-gray-500">{product.slug}</div>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {categories.find((c) => c.id === product.categoryId)?.name || '-'}
                    </td>
                    <td className="py-3 px-4 font-semibold">S/ {product.retailPrice.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      {product.wholesalePrice ? `S/ ${product.wholesalePrice.toFixed(2)}` : '-'}
                    </td>
                    <td className="py-3 px-4">
                      {hasOffer ? (
                        <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-semibold">
                          -{Number(product.discountPercentage).toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">Sin oferta</span>
                      )}
                      {product.offerStartAt || product.offerEndAt ? (
                        <div className="text-xs text-gray-500 mt-1">
                          {product.offerStartAt ? `Inicio: ${new Date(product.offerStartAt).toLocaleString('es-PE')}` : 'Inicio: inmediato'}
                          <br />
                          {product.offerEndAt ? `Fin: ${new Date(product.offerEndAt).toLocaleString('es-PE')}` : 'Fin: sin limite'}
                        </div>
                      ) : null}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => applyDiscountToProducts([product])}
                          isLoading={processing}
                        >
                          Aplicar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-600 hover:bg-red-50"
                          onClick={() => clearDiscountFromProducts([product])}
                          isLoading={processing}
                        >
                          Quitar
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
