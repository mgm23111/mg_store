import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../../api/productService';
import { categoryService } from '../../api/categoryService';
import { Product, Category } from '../../types';
import { Button } from '../../components/common/Button';
import { ProductCardSkeleton } from '../../components/common/Skeleton';
import { TrustBadges } from '../../components/common/TrustBadges';
import { DiscountBadge, FeaturedBadge } from '../../components/common/Badge';
import { useUIStore } from '../../stores/uiStore';

// Iconos para categorías
const categoryIcons: Record<string, string> = {
  'polos': '👕',
  'camisas': '👔',
  'pantalones': '👖',
  'vestidos': '👗',
  'faldas': '🩱',
  'chaquetas': '🧥',
  'buzos': '🧣',
  'accesorios': '👜',
  'calzado': '👟',
  'deportiva': '⚽',
  'formal': '🤵',
  'casual': '👕',
};

export const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useUIStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsData, categoriesData] = await Promise.all([
          productService.getFeatured(),
          categoryService.getAll(),
        ]);
        setFeaturedProducts(productsData);
        setCategories(categoriesData);
      } catch (error) {
        addToast('error', 'Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [addToast]);

  return (
    <div>
      {/* Hero Section */}
      <section className="gradient-primary text-white py-24 md:py-32 overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-300 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-300 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        <div className="container-custom relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="max-w-xl animate-slide-up">
              <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <span className="text-sm font-semibold">✨ Nueva Temporada 2026</span>
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                Moda que inspira tu{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-200 to-white">
                  estilo único
                </span>
              </h1>
              <p className="text-xl mb-8 text-pink-100 leading-relaxed">
                Descubre nuestra colección exclusiva de prendas de alta calidad.
                Desde ropa casual hasta elegante, tenemos todo lo que necesitas para expresar tu personalidad.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/productos">
                  <Button variant="light" size="lg" className="hover-lift shadow-xl w-full sm:w-auto">
                    Explorar Colección →
                  </Button>
                </Link>
                <Link to="/categorias">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white/10 w-full sm:w-auto"
                  >
                    Ver Categorías
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden md:block animate-slide-up" style={{ animationDelay: '200ms' }}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-300/30 to-purple-300/30 rounded-3xl blur-2xl"></div>
                <div className="relative grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="aspect-[3/4] bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-4 hover-lift">
                      <div className="w-full h-full bg-gradient-to-br from-pink-400/40 to-purple-400/40 rounded-xl flex items-center justify-center text-6xl">
                        👗
                      </div>
                    </div>
                    <div className="aspect-square bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-4 hover-lift">
                      <div className="w-full h-full bg-gradient-to-br from-purple-400/40 to-blue-400/40 rounded-xl flex items-center justify-center text-5xl">
                        👔
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4 pt-8">
                    <div className="aspect-square bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-4 hover-lift">
                      <div className="w-full h-full bg-gradient-to-br from-blue-400/40 to-cyan-400/40 rounded-xl flex items-center justify-center text-5xl">
                        👕
                      </div>
                    </div>
                    <div className="aspect-[3/4] bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-4 hover-lift">
                      <div className="w-full h-full bg-gradient-to-br from-cyan-400/40 to-pink-400/40 rounded-xl flex items-center justify-center text-6xl">
                        🧥
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 bg-gradient-to-b from-white to-gray-50">
        <div className="container-custom">
          <TrustBadges />
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 animate-slide-up">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg hover-lift">
                🎨
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Diseños Exclusivos</h3>
              <p className="text-gray-600">
                Colecciones únicas diseñadas para resaltar tu estilo personal
              </p>
            </div>
            <div className="text-center p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg hover-lift">
                ⚡
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Envío Rápido</h3>
              <p className="text-gray-600">
                Recibe tus productos en tiempo récord con nuestro servicio express
              </p>
            </div>
            <div className="text-center p-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg hover-lift">
                ✓
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Calidad Garantizada</h3>
              <p className="text-gray-600">
                Materiales premium y acabados perfectos en cada prenda
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="py-20 bg-white">
          <div className="container-custom">
            <div className="text-center mb-12 animate-slide-up">
              <h2 className="text-4xl font-bold mb-4 text-gray-900">
                Compra por Categoría
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Encuentra exactamente lo que buscas navegando por nuestras categorías
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categories.map((category, index) => {
                const icon = categoryIcons[category.slug] || '📦';
                return (
                  <Link
                    key={category.id}
                    to={`/productos?categoria=${category.slug}`}
                    className="group relative bg-gradient-to-br from-gray-50 to-gray-100 hover:from-purple-50 hover:to-pink-50 rounded-2xl p-8 text-center shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden animate-slide-up border border-gray-200 hover:border-purple-200"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/5 group-hover:to-pink-500/5 transition-all duration-300"></div>
                    <div className="relative">
                      <div className="text-5xl mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                        {icon}
                      </div>
                      <h3 className="font-bold text-lg text-gray-900 group-hover:text-purple-600 transition-colors">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container-custom">
          <div className="text-center mb-12 animate-slide-up">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">
              Lo Más Destacado
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
              Nuestras prendas más populares y con mejor valoración
            </p>
            <Link to="/productos">
              <Button variant="outline" size="lg" className="hover-lift">
                Ver Catálogo Completo →
              </Button>
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 8).map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No hay productos destacados disponibles
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <div className="text-5xl mb-6">📬</div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              ¡Únete a Nuestra Comunidad!
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Suscríbete y recibe ofertas exclusivas, lanzamientos y tips de moda
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="tu@email.com"
                className="flex-1 px-6 py-4 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:outline-none transition-colors text-gray-900"
              />
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover-lift whitespace-nowrap">
                Suscribirme
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              🔒 Tus datos están seguros. No compartimos información personal.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-pink-300 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        <div className="container-custom relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full mb-6 text-lg font-semibold">
              <span className="animate-pulse">🟢</span>
              <span>Estamos en línea</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              ¿Necesitas ayuda con tu pedido?
            </h2>
            <p className="text-xl mb-10 text-purple-100 leading-relaxed">
              Nuestro equipo está listo para asistirte. Escríbenos por WhatsApp y
              te responderemos de inmediato para resolver todas tus dudas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://wa.me/51999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <Button variant="light" size="lg" className="shadow-xl hover-lift text-lg px-8">
                  <span className="flex items-center gap-2">
                    <span className="text-2xl">💬</span>
                    <span>Chatear por WhatsApp</span>
                  </span>
                </Button>
              </a>
              <Link to="/productos">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white/10 text-lg px-8"
                >
                  Seguir Comprando
                </Button>
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⚡</span>
                <span>Respuesta inmediata</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                <span>Asesoría personalizada</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">📦</span>
                <span>Seguimiento de pedidos</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// Product Card Component
const ProductCard = ({ product, index = 0 }: { product: Product; index?: number }) => {
  const mainImage = product.images?.[0]?.url || `https://picsum.photos/seed/${product.slug}/600/800`;
  const hasDiscount = product.discountPercentage && product.discountPercentage > 0;
  const finalPrice = hasDiscount
    ? product.retailPrice * (1 - product.discountPercentage! / 100)
    : product.retailPrice;

  return (
    <Link
      to={`/productos/${product.slug}`}
      className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all overflow-hidden group hover-lift animate-slide-up border border-gray-100"
      style={{ animationDelay: `${index * 75}ms` }}
    >
      <div className="relative overflow-hidden aspect-square bg-gradient-to-br from-gray-50 to-gray-100">
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `https://picsum.photos/seed/${product.id}/600/800`;
          }}
        />
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {product.isFeatured && <FeaturedBadge />}
          {hasDiscount && <DiscountBadge percentage={product.discountPercentage!} />}
        </div>
        {!product.isActive && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center backdrop-blur-sm">
            <span className="text-white font-bold bg-gray-900 px-6 py-3 rounded-xl shadow-lg">
              No disponible
            </span>
          </div>
        )}
        {product.isActive && (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
              <span className="bg-white text-purple-600 font-bold px-6 py-2 rounded-full shadow-lg text-sm">
                Ver Detalles →
              </span>
            </div>
          </>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-bold text-lg mb-3 line-clamp-2 text-gray-900 group-hover:text-purple-600 transition-colors leading-tight">
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2 flex-wrap mb-2">
          {hasDiscount ? (
            <>
              <span className="text-2xl font-bold text-purple-600">
                S/ {finalPrice.toFixed(2)}
              </span>
              <span className="text-sm text-gray-400 line-through">
                S/ {product.retailPrice.toFixed(2)}
              </span>
            </>
          ) : (
            <span className="text-2xl font-bold text-purple-600">
              S/ {product.retailPrice.toFixed(2)}
            </span>
          )}
        </div>
        {product.wholesalePrice && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 py-1 rounded-full font-bold shadow-sm">
              MAYORISTA
            </span>
            <span className="text-sm font-semibold text-gray-700">
              S/ {product.wholesalePrice.toFixed(2)}
            </span>
          </div>
        )}
        {product.totalStock !== undefined && product.totalStock > 0 && product.totalStock < 10 && (
          <div className="flex items-center gap-2 mt-3 bg-orange-50 px-3 py-2 rounded-lg border border-orange-100">
            <span className="text-orange-500">🔥</span>
            <p className="text-xs text-orange-600 font-bold">
              ¡Solo {product.totalStock} disponibles!
            </p>
          </div>
        )}
      </div>
    </Link>
  );
};
