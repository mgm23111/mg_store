import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService } from '../../api/productService';
import { cartService } from '../../api/cartService';
import { Product, ProductVariant } from '../../types';
import { Button } from '../../components/common/Button';
import { Loading } from '../../components/common/Loading';
import { useUIStore } from '../../stores/uiStore';
import { useCartStore } from '../../stores/cartStore';

export const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const { addToast } = useUIStore();
  const { sessionId, setCart, openCartDrawer } = useCartStore();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        const data = await productService.getBySlug(slug);
        setProduct(data);

        // Auto-select first variant if available
        if (data.variants && data.variants.length > 0) {
          setSelectedVariant(data.variants[0]);
        }
      } catch (error) {
        addToast('error', 'Producto no encontrado');
        navigate('/productos');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug, navigate, addToast]);

  const handleAddToCart = async () => {
    if (!product) return;

    // Validate variant selection if product has variants
    if (product.variants && product.variants.length > 0 && !selectedVariant) {
      addToast('error', 'Por favor selecciona una variante');
      return;
    }

    try {
      setAddingToCart(true);
      // Use addToCart instead of addItem
      const updatedCart = await cartService.addToCart({
        sessionId,
        productVariantId: selectedVariant!.id,
        quantity,
      });
      // Update cart in store
      setCart(updatedCart);
      addToast('success', 'Producto agregado al carrito');
      openCartDrawer();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al agregar al carrito';
      addToast('error', errorMessage);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    const maxStock = selectedVariant?.stockQuantity || product?.totalStock || 0;

    if (newQuantity >= 1 && newQuantity <= maxStock) {
      setQuantity(newQuantity);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!product) {
    return null;
  }

  const allImages = product.images || [];
  const selectedColorId = selectedVariant?.color?.id;
  const colorImages = selectedColorId
    ? allImages.filter((image) => image.colorId === selectedColorId)
    : [];
  const generalImages = allImages.filter((image) => !image.colorId);
  const images = colorImages.length > 0
    ? colorImages
    : (generalImages.length > 0 ? generalImages : allImages);
  const hasDiscount = product.discountPercentage && product.discountPercentage > 0;
  const finalPrice = hasDiscount
    ? product.retailPrice * (1 - product.discountPercentage! / 100)
    : product.retailPrice;
  const currentStock = selectedVariant?.stockQuantity || product.totalStock || 0;
  const isOutOfStock = currentStock === 0;

  return (
    <div className="container-custom py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div>
          {/* Main Image */}
          <div className="bg-gray-100 rounded-lg overflow-hidden mb-4 aspect-square">
            <img
              src={images[selectedImage]?.url || `https://picsum.photos/seed/${product.slug}/600/800`}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://picsum.photos/seed/${product.id}/600/800`;
              }}
            />
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === index
                      ? 'border-purple-600'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={image.url}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

          {/* Price */}
          <div className="mb-6">
            <div className="flex items-center gap-3">
              {hasDiscount ? (
                <>
                  <span className="text-3xl font-bold text-purple-600">
                    S/ {finalPrice.toFixed(2)}
                  </span>
                  <span className="text-xl text-gray-400 line-through">
                    S/ {product.retailPrice.toFixed(2)}
                  </span>
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    -{product.discountPercentage}%
                  </span>
                </>
              ) : (
                <span className="text-3xl font-bold text-purple-600">
                  S/ {product.retailPrice.toFixed(2)}
                </span>
              )}
            </div>
            {product.wholesalePrice && (
              <p className="text-gray-600 mt-2">
                Precio por mayor: S/ {product.wholesalePrice.toFixed(2)}
              </p>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Descripción</h3>
              <p className="text-gray-700 whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Selecciona una opción</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => {
                      setSelectedVariant(variant);
                      setSelectedImage(0);
                      setQuantity(1);
                    }}
                    disabled={!variant.isActive || variant.stockQuantity === 0}
                    className={`p-3 border-2 rounded-lg transition-colors ${
                      selectedVariant?.id === variant.id
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${
                      !variant.isActive || variant.stockQuantity === 0
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`}
                  >
                    <div className="text-sm font-medium">
                      {variant.size && <span>{variant.size.name}</span>}
                      {variant.size && variant.color && <span> - </span>}
                      {variant.color && <span>{variant.color.name}</span>}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {variant.stockQuantity > 0
                        ? `Stock: ${variant.stockQuantity}`
                        : 'Agotado'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock Info */}
          <div className="mb-6">
            {isOutOfStock ? (
              <p className="text-red-600 font-semibold">Producto agotado</p>
            ) : (
              <p className="text-gray-600">
                {currentStock <= 5 && (
                  <span className="text-orange-600 font-semibold">
                    ¡Solo quedan {currentStock} unidades!
                  </span>
                )}
                {currentStock > 5 && <span>Stock disponible: {currentStock}</span>}
              </p>
            )}
          </div>

          {/* Quantity Selector */}
          {!isOutOfStock && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Cantidad</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-gray-300 rounded-lg">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="px-4 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    -
                  </button>
                  <span className="px-6 py-2 font-semibold">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= currentStock}
                    className="px-4 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={!product.isActive || isOutOfStock || addingToCart}
            size="lg"
            className="w-full mb-4"
          >
            {addingToCart ? 'Agregando...' : 'Agregar al carrito'}
          </Button>

          {/* Additional Info */}
          <div className="border-t pt-6 mt-6 space-y-3 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span>✓</span>
              <span>Envío a todo el Perú</span>
            </div>
            <div className="flex items-center gap-2">
              <span>✓</span>
              <span>Pago seguro con Culqi o Yape</span>
            </div>
            <div className="flex items-center gap-2">
              <span>✓</span>
              <span>Atención por WhatsApp</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {product.categoryName && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Productos relacionados</h2>
          <p className="text-gray-500">
            Más productos de {product.categoryName}
          </p>
        </div>
      )}
    </div>
  );
};
