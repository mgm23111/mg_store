import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { productService } from '../../api/productService';
import { categoryService } from '../../api/categoryService';
import { Product, Category } from '../../types';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { ProductCardSkeleton } from '../../components/common/Skeleton';
import { EmptySearch } from '../../components/common/EmptyState';
import { DiscountBadge, FeaturedBadge, Badge } from '../../components/common/Badge';
import { useUIStore } from '../../stores/uiStore';

export const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('categoria') || ''
  );
  const [sortBy, setSortBy] = useState(searchParams.get('orden') || 'newest');
  const [priceRange, setPriceRange] = useState({
    min: searchParams.get('precioMin') || '',
    max: searchParams.get('precioMax') || '',
  });
  const { addToast } = useUIStore();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryService.getAll();
        setCategories(data);
      } catch (error) {
        addToast('error', 'Error al cargar categorías');
      }
    };
    fetchCategories();
  }, [addToast]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let data = await productService.getAll();

        // Filter by search term
        if (searchTerm) {
          data = data.filter(
            (p) =>
              p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              p.description?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

        // Filter by category
        if (selectedCategory) {
          data = data.filter(
            (p) => {
              const category = categories.find(c => c.id === p.categoryId);
              return category?.slug === selectedCategory;
            }
          );
        }

        // Filter by price range
        if (priceRange.min) {
          data = data.filter((p) => p.retailPrice >= parseFloat(priceRange.min));
        }
        if (priceRange.max) {
          data = data.filter((p) => p.retailPrice <= parseFloat(priceRange.max));
        }

        // Sort products
        switch (sortBy) {
          case 'price-asc':
            data.sort((a, b) => a.retailPrice - b.retailPrice);
            break;
          case 'price-desc':
            data.sort((a, b) => b.retailPrice - a.retailPrice);
            break;
          case 'name':
            data.sort((a, b) => a.name.localeCompare(b.name));
            break;
          case 'newest':
          default:
            data.sort((a, b) => b.id - a.id);
            break;
        }

        setProducts(data);
      } catch (error) {
        addToast('error', 'Error al cargar productos');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchTerm, selectedCategory, sortBy, priceRange, addToast]);

  const handleApplyFilters = () => {
    const params: Record<string, string> = {};
    if (searchTerm) params.q = searchTerm;
    if (selectedCategory) params.categoria = selectedCategory;
    if (sortBy !== 'newest') params.orden = sortBy;
    if (priceRange.min) params.precioMin = priceRange.min;
    if (priceRange.max) params.precioMax = priceRange.max;
    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSortBy('newest');
    setPriceRange({ min: '', max: '' });
    setSearchParams({});
  };

  const hasActiveFilters = searchTerm || selectedCategory || priceRange.min || priceRange.max || sortBy !== 'newest';

  return (
    <div className="container-custom py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 animate-slide-up">Catálogo de Productos</h1>
        <p className="text-gray-600 animate-slide-up">Encuentra las mejores prendas para tu estilo</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Filtros</h2>
              {hasActiveFilters && (
                <Badge variant="purple" size="sm">{
                  [searchTerm, selectedCategory, priceRange.min, priceRange.max, sortBy !== 'newest'].filter(Boolean).length
                }</Badge>
              )}
            </div>

            {/* Search */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Buscar</label>
              <Input
                type="text"
                placeholder="Nombre del producto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Categoría</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Todas las categorías</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Rango de Precio
              </label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Mín"
                  value={priceRange.min}
                  onChange={(e) =>
                    setPriceRange({ ...priceRange, min: e.target.value })
                  }
                />
                <Input
                  type="number"
                  placeholder="Máx"
                  value={priceRange.max}
                  onChange={(e) =>
                    setPriceRange({ ...priceRange, max: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Sort */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Ordenar por</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Más recientes</option>
                <option value="price-asc">Precio: menor a mayor</option>
                <option value="price-desc">Precio: mayor a menor</option>
                <option value="name">Nombre A-Z</option>
              </select>
            </div>

            <Button
              onClick={handleApplyFilters}
              className="w-full mb-2"
            >
              🔍 Aplicar Filtros
            </Button>
            <Button
              onClick={handleClearFilters}
              variant="ghost"
              className="w-full"
              disabled={!hasActiveFilters}
            >
              ✕ Limpiar Filtros
            </Button>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div>
              <div className="mb-6 animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-48"></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 9 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            </div>
          ) : products.length === 0 ? (
            <EmptySearch onClear={handleClearFilters} />
          ) : (
            <>
              <div className="mb-6 flex items-center justify-between flex-wrap gap-4 animate-slide-up">
                <div className="flex items-center gap-3">
                  <span className="text-gray-900 font-semibold">
                    {products.length} producto{products.length !== 1 ? 's' : ''}
                  </span>
                  {hasActiveFilters && (
                    <Badge variant="info" size="sm">
                      Filtrados
                    </Badge>
                  )}
                </div>
                {selectedCategory && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Categoría:</span>
                    <Badge variant="purple">{categories.find(c => c.slug === selectedCategory)?.name}</Badge>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Product Card Component (enhanced version)
const ProductCard = ({ product, index = 0 }: { product: Product; index?: number }) => {
  const mainImage = product.images?.[0]?.url || `https://picsum.photos/seed/${product.slug}/600/800`;
  const hasDiscount = product.discountPercentage && product.discountPercentage > 0;
  const hasWholesaleTier = !!product.wholesalePrice && (product.wholesaleMinQuantity || 6) > 1;
  const finalPrice = hasDiscount
    ? product.retailPrice * (1 - product.discountPercentage! / 100)
    : product.retailPrice;

  return (
    <Link
      to={`/productos/${product.slug}`}
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all overflow-hidden group hover-lift animate-slide-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="relative overflow-hidden aspect-square bg-gray-100">
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `https://picsum.photos/seed/${product.id}/600/800`;
          }}
        />
        <div className="absolute top-2 left-2 flex flex-col gap-2">
          {product.isFeatured && <FeaturedBadge />}
          {hasDiscount && <DiscountBadge percentage={product.discountPercentage!} />}
        </div>
        {!product.isActive && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
            <span className="text-white font-semibold bg-gray-900 px-4 py-2 rounded-lg">
              No disponible
            </span>
          </div>
        )}
        {product.isActive && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 flex-wrap">
          {hasDiscount ? (
            <>
              <span className="text-xl font-bold text-purple-600">
                S/ {finalPrice.toFixed(2)}
              </span>
              <span className="text-sm text-gray-400 line-through">
                S/ {product.retailPrice.toFixed(2)}
              </span>
            </>
          ) : (
            <span className="text-xl font-bold text-purple-600">
              S/ {product.retailPrice.toFixed(2)}
            </span>
          )}
        </div>
        {hasWholesaleTier && (
          <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">MAYORISTA</span>
            S/ {(product.wholesalePrice ?? 0).toFixed(2)}
          </p>
        )}
        {product.totalStock !== undefined && product.totalStock > 0 && product.totalStock < 10 && (
          <p className="text-xs text-orange-600 mt-2 font-medium">
            ¡Solo {product.totalStock} disponibles!
          </p>
        )}
      </div>
    </Link>
  );
};
