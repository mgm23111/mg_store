import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { categoryService } from '../../api/categoryService';
import { Category } from '../../types';
import { Loading } from '../../components/common/Loading';
import { EmptyState } from '../../components/common/EmptyState';
import { useUIStore } from '../../stores/uiStore';

export const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useUIStore();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await categoryService.getAll();
        setCategories(data.filter((c) => c.isActive));
      } catch (error) {
        addToast('error', 'Error al cargar categorías');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [addToast]);

  if (loading) {
    return (
      <div className="container-custom py-12">
        <Loading />
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="container-custom py-12">
        <EmptyState
          icon="📂"
          title="No hay categorías disponibles"
          description="Pronto agregaremos nuevas categorías de productos"
          action={{
            label: 'Ver todos los productos',
            onClick: () => window.location.href = '/productos',
          }}
        />
      </div>
    );
  }

  return (
    <div className="container-custom py-12">
      {/* Header */}
      <div className="text-center mb-12 animate-slide-up">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Explora nuestras Categorías
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Encuentra exactamente lo que buscas navegando por nuestras categorías cuidadosamente organizadas
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categories.map((category, index) => (
          <CategoryCard key={category.id} category={category} index={index} />
        ))}
      </div>

      {/* Call to Action */}
      <div className="mt-16 text-center bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 animate-slide-up">
        <h2 className="text-2xl font-bold mb-4">¿No encuentras lo que buscas?</h2>
        <p className="text-gray-600 mb-6">
          Explora nuestro catálogo completo con todos los productos disponibles
        </p>
        <Link
          to="/productos"
          className="inline-block bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors shadow-md hover:shadow-lg"
        >
          Ver Catálogo Completo →
        </Link>
      </div>
    </div>
  );
};

// Category Card Component
interface CategoryCardProps {
  category: Category;
  index: number;
}

const CategoryCard = ({ category, index }: CategoryCardProps) => {
  // Category emoji mapping (you can customize this)
  const categoryIcons: Record<string, string> = {
    camisas: '👔',
    pantalones: '👖',
    vestidos: '👗',
    zapatos: '👞',
    accesorios: '👜',
    ropa: '👕',
    deportes: '⚽',
    casual: '👕',
    formal: '🎩',
    verano: '🌞',
    invierno: '❄️',
  };

  // Get icon based on category name or slug
  const getIcon = () => {
    const name = category.name.toLowerCase();
    const slug = category.slug.toLowerCase();

    for (const [key, icon] of Object.entries(categoryIcons)) {
      if (name.includes(key) || slug.includes(key)) {
        return icon;
      }
    }

    return '📦'; // Default icon
  };

  return (
    <Link
      to={`/productos?categoria=${category.slug}`}
      className="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all overflow-hidden hover-lift animate-slide-up"
      style={{ animationDelay: `${index * 75}ms` }}
    >
      {/* Icon Section */}
      <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-8 flex items-center justify-center group-hover:from-purple-200 group-hover:to-pink-200 transition-colors">
        <div className="text-7xl group-hover:scale-110 transition-transform duration-300">
          {getIcon()}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
          {category.name}
        </h3>
        {category.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-4">
            {category.description}
          </p>
        )}
        <div className="flex items-center text-purple-600 font-semibold group-hover:gap-2 transition-all">
          <span>Ver productos</span>
          <span className="transform group-hover:translate-x-1 transition-transform">→</span>
        </div>
      </div>
    </Link>
  );
};
